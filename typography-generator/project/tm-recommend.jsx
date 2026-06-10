// tm-recommend.jsx v3 — Multi-dimensional scorer + library matching + explainability
const { useState, useEffect, useMemo } = React;

/* ── Scoring engine ─────────────────────────────────────────────────
   Inputs (query):
     projectType   — free-form string
     contextKey    — direct context key (overrides projectType lookup)
     moods[]       — mood adjectives the user picked
     useCases[]    — use case tags the user picked
     familiarity   — 0 (safe) → 100 (distinctive)
     readFirst     — boolean, prioritise screen readability
     freeOnly      — boolean, OFL/Apache only
     query         — free-form text the user typed (lightly heuristic-matched)

   Each font is scored across 8 dimensions, each 0-100. A weighted sum yields the
   final 0-99 score. Dimensions are returned for explainability.
 ─────────────────────────────────────────────────────────────────── */
function resolveContextKey(query) {
  if (query.contextKey) return query.contextKey;
  const map = window.PROJECT_TO_CONTEXT || {};
  return map[query.projectType] || null;
}

function moodAlignment(font, moods) {
  if (!moods.length) return 70;
  const fm = (font.mood||[]).map(m=>m.toLowerCase());
  const hits = moods.filter(m=>fm.includes(m.toLowerCase())).length;
  // Reward exact hits + near-misses via personality vocabulary
  const personalityHits = (font.personality||[]).filter(p=>moods.some(m=>p.toLowerCase().includes(m.toLowerCase()))).length;
  const ratio = (hits + personalityHits*0.5) / moods.length;
  return Math.round(Math.min(100, ratio * 100 + (hits>=2?10:0)));
}

function useCaseFit(font, useCases) {
  if (!useCases.length) return 70;
  const fu = (font.useCases||[]).map(u=>u.toLowerCase()).join(' | ');
  const fg = (font.goodFor||[]).map(u=>u.toLowerCase()).join(' | ');
  const haystack = fu + ' | ' + fg;
  const hits = useCases.filter(u => haystack.includes(u.toLowerCase().split('&')[0].trim().split(' ')[0])).length;
  return Math.round(Math.min(100, (hits / useCases.length) * 100 + 6));
}

function brandContextFit(font, ctxKey) {
  if (!ctxKey || !font.contextScore) return 60;
  return font.contextScore[ctxKey] || 55;
}

function distinctivenessScore(font, familiarity) {
  // Heuristic: classify font as familiar (Inter, DM Sans, Libre Baskerville)
  // vs distinctive (Syne, Fraunces WONK, Bricolage)
  const distinctiveTags = ['display','distinctive','creative','high-contrast'];
  const tags = (font.tags||[]).map(t=>t.toLowerCase());
  const isDistinctive = tags.some(t=>distinctiveTags.some(d=>t.includes(d))) ||
                        font.subtype?.toLowerCase().includes('display');
  // If user wants distinctive (familiarity > 50) and font is distinctive → boost
  // If user wants familiar (familiarity < 50) and font is neutral → boost
  if (familiarity > 50) return isDistinctive ? Math.min(100, 70 + (familiarity-50)/2) : Math.max(35, 80 - (familiarity-50));
  return isDistinctive ? Math.max(35, 70 - (50-familiarity)) : Math.min(100, 75 + (50-familiarity)/2);
}

function readabilityScore(font, readFirst) {
  const base = font.readability || 70;
  if (!readFirst) return base;
  // Boost weight if user prioritised readability AND font scores high
  return Math.min(100, base + (base > 88 ? 8 : 0));
}

function pairingHarmonyScore(font, collection) {
  const pw = font.pairingWith || [];
  if (!pw.length) return 60;
  const inCollection = (collection||[]).filter(c=>pw.includes(c.name)).length;
  return Math.min(100, 65 + inCollection * 12);
}

function licenseScore(font, freeOnly) {
  const isFree = (font.license||'').match(/OFL|Apache|SIL/i);
  if (freeOnly) return isFree ? 100 : 20;
  return isFree ? 95 : 70;
}

function freeFormBoost(font, query) {
  if (!query || !query.trim()) return 0;
  const q = query.toLowerCase();
  let b = 0;
  const haystack = [
    ...(font.goodFor||[]), ...(font.tags||[]), ...(font.mood||[]),
    ...(font.personality||[]), ...(font.useCases||[]), ...(font.brandFit||[]),
    font.notes||'', font.subtype||'', font.name||'',
  ].join(' | ').toLowerCase();

  // Intent clusters — each cluster fires at most once (+5), total cap 20
  const clusters = [
    { triggers:['small size','small text','tiny','dense ui','data table','compact','11px','12px','13px'], match:/ui|small|table|data|compact|tabular/, pts:5 },
    { triggers:['premium','luxury','high-end','upscale','exclusive'], match:/luxury|premium|editorial|elegant|refined/, pts:5 },
    { triggers:['editorial','magazine','article','longread','journalism','publish'], match:/editorial|reading|publishing|journal|literary/, pts:5 },
    { triggers:['tech','startup','saas','developer','devtool','software','b2b'], match:/tech|saas|developer|engineered|startup|systematic/, pts:5 },
    { triggers:['print','book','reading','long-form','longform','body text'], match:/print|reading|long|body|book/, pts:5 },
    { triggers:['warm','friendly','approachable','welcoming','soft','gentle'], match:/warm|friendly|approachable|soft|rounded|gentle/, pts:5 },
    { triggers:['minimal','clean','simple','restrained','quiet','neutral'], match:/minimal|clean|neutral|simple|restrained/, pts:5 },
    { triggers:['bold','strong','impactful','powerful','statement'], match:/bold|strong|display|impactful|powerful/, pts:5 },
    { triggers:['modern','contemporary','current','fresh'], match:/modern|contemporary|current|fresh|geometric/, pts:4 },
    { triggers:['code','programming','terminal','monospace','cli'], match:/code|mono|terminal|programm|developer/, pts:5 },
    { triggers:['accessible','a11y','inclusive','legible'], match:/accessible|legible|inclusive|high.*x-height/, pts:5 },
    { triggers:['variable','responsive type','optical','adaptable'], match:/variable|optical|adaptable/, pts:5 },
    { triggers:['wedding','event','celebration','festive','occasion'], match:/wedding|celebrat|festive|elegant|flowing/, pts:5 },
    { triggers:['gaming','esport','game','sci-fi','futurist'], match:/gaming|sci-fi|futuristic|esport|tech-forward/, pts:5 },
    { triggers:['humanist','warmth','organic','natural'], match:/humanist|warm|organic|natural|calligraphic/, pts:4 },
    { triggers:['condensed','narrow','tight','compact headlines'], match:/condensed|narrow|condensed/, pts:5 },
  ];
  for (const cl of clusters) {
    if (cl.triggers.some(t => q.includes(t)) && haystack.match(cl.match)) {
      b += cl.pts;
    }
  }
  // Direct name mention — user explicitly names a font or its foundry
  const familyLc = (font.name||font.family||'').toLowerCase();
  if (q.includes(familyLc) && familyLc.length > 3) b += 12;

  return Math.min(20, b);
}

// Penalty for fonts whose explicit avoidFor list conflicts with what the user
// actually asked for. Keeps obviously wrong fonts from appearing in top results.
function avoidForPenalty(font, useCases, queryText) {
  if (!font.avoidFor || !font.avoidFor.length) return 0;
  const avoidLc = font.avoidFor.map(a => a.toLowerCase());
  let penalty = 0;
  // Use-case mismatch — score against the use-case tokens the scorer already uses
  const ucHaystack = (useCases || []).join(' ').toLowerCase();
  avoidLc.forEach(a => {
    const aWords = a.split(/\W+/).filter(w => w.length > 2);
    if (aWords.some(w => ucHaystack.includes(w))) penalty += 10;
  });
  // Free-text query match
  const q = (queryText || '').toLowerCase();
  if (q) {
    avoidLc.forEach(a => {
      if (a.split(/\W+/).filter(w=>w.length>3).some(w => q.includes(w))) penalty += 6;
    });
  }
  return Math.min(28, penalty);
}

// Enforces category diversity so results don't collapse to 5 near-identical fonts.
// Applies to the open-library pool only (collection results reflect what the user owns).
// maxSameCategory=2 means at most 2 serifs, 2 sans-serifs, etc. in the top 5.
// If the pool is too narrow to fill 5 diverse results, remaining slots fill without constraint.
function enforceVariety(ranked, limit=5, maxSameCategory=2) {
  const catCount = {};
  const picked = [];
  const spill   = [];
  for (const font of ranked) {
    const cat = (font.category || font.classification || 'unknown').toLowerCase();
    const n   = catCount[cat] || 0;
    if (n < maxSameCategory) { picked.push(font); catCount[cat] = n + 1; }
    else spill.push(font);
    if (picked.length >= limit) break;
  }
  // Fill remaining slots if diversity couldn't be satisfied
  if (picked.length < limit) {
    const inPicked = new Set(picked.map(f => f.id));
    for (const font of spill) {
      if (!inPicked.has(font.id)) { picked.push(font); if (picked.length >= limit) break; }
    }
  }
  return picked;
}

// Temporary enrichment gate (Step 4 / Phase 1).
// Curated + open-library fonts always pass — they have rich metadata.
// GF entries must have at least one enrichment field before joining results,
// otherwise bare catalog entries (score ~46–70) would pollute rankings.
// Remove / loosen this gate once a GF metadata enrichment pass lands.
function passesEnrichmentGate(font) {
  if (font.source !== 'google-fonts') return true;
  return (
    (Array.isArray(font.mood)        && font.mood.length        > 0) ||
    (Array.isArray(font.personality) && font.personality.length > 0) ||
    (font.contextScore && typeof font.contextScore === 'object')      ||
    (Array.isArray(font.useCases)    && font.useCases.length    > 0) ||
    (Array.isArray(font.goodFor)     && font.goodFor.length     > 0)
  );
}

function scoreFont(font, query, collection=[]) {
  const ctxKey = resolveContextKey(query);
  // Metadata quality factor — how much to trust the mood alignment score.
  //
  // Curated and open-library fonts (completeness ≥ 80, or field absent — treated
  // as 100 via `|| 100`) carry hand-curated, per-font mood arrays: full trust.
  //
  // Heuristic GF entries (completeness ≈ 45, set by enrichGFEntry) carry
  // category-level arrays shared by every font in that category × weight-bucket.
  // They match common brief terms by design, which can produce moodFit=100 on
  // generic briefs even when a richer curated alternative is a better real fit.
  //
  // Formula: completeness/80 for completeness < 80, clamped to [0.5, 1.0].
  //   completeness=45 (GF heuristic) → factor ≈ 0.56
  //   completeness=80+ (curated/open-library) → factor = 1.0
  //   floor 0.5 prevents extreme suppression if future completeness values go low.
  //
  // To revert: replace `Math.round(... * moodQuality)` with `moodAlignment(...)`.
  const completeness = font.completeness || 100;
  const moodQuality  = completeness >= 80 ? 1.0 : Math.max(0.5, completeness / 80);

  const dims = {
    moodFit:        Math.round(moodAlignment(font, query.moods||[]) * moodQuality),
    useCaseFit:     useCaseFit(font, query.useCases||[]),
    brandContext:   brandContextFit(font, ctxKey),
    readability:    readabilityScore(font, query.readFirst),
    screenSuit:     font.screenSuitability || 70,
    distinctiveness:distinctivenessScore(font, query.familiarity ?? 50),
    pairingHarmony: pairingHarmonyScore(font, collection),
    licenseConf:    licenseScore(font, query.freeOnly),
  };
  const W = { moodFit:.20, useCaseFit:.16, brandContext:.18, readability:.13,
              screenSuit:.10, distinctiveness:.09, pairingHarmony:.07, licenseConf:.07 };
  let raw = 0;
  Object.keys(W).forEach(k => raw += dims[k] * W[k]);
  raw += freeFormBoost(font, query.query);
  raw -= avoidForPenalty(font, query.useCases || [], query.query || '');
  return { dims, score: Math.min(99, Math.max(28, Math.round(raw))) };
}

// Composes the "why this fits" sentence shown on each result card.
//
// Mirrors the scorer's signals so users see the same evidence the score is
// computed from. Each clause maps to a real dimension that contributed to the
// score. For low-completeness fonts (GF heuristic-enriched), appends a quiet
// "based on category metadata" qualifier so users understand the confidence
// level without dropping the suggestion entirely.
//
// Always returns a substantive sentence when at least one signal hits — never
// an empty string for results that made it into the top 5.
function buildWhyText(font, dims, query) {
  const moods    = query.moods    || [];
  const useCases = query.useCases || [];
  // Mirror useCaseFit's haystack: useCases AND goodFor — same signal the scorer reads.
  const goodForLc = (font.goodFor||[]).map(g=>g.toLowerCase());
  const useCaseLc = (font.useCases||[]).map(u=>u.toLowerCase());
  const haystack  = [...goodForLc, ...useCaseLc].join(' | ');
  const moodHits  = moods.filter(m => (font.mood||[]).map(x=>x.toLowerCase()).includes(m.toLowerCase()));
  const ucHits    = useCases.filter(u => haystack.includes(u.toLowerCase().split('&')[0].trim().split(' ')[0]));

  const parts = [];
  if (moodHits.length === 1)        parts.push(`matches the "${moodHits[0]}" mood`);
  else if (moodHits.length >= 2)    parts.push(`matches ${moodHits.slice(0,3).map(m=>`"${m}"`).join(', ')}`);
  if (ucHits.length)                parts.push(`covers ${ucHits.slice(0,2).join(' and ')}`);
  if (dims.brandContext > 80)       parts.push('strong fit for this project context');
  if (dims.readability > 88 && query.readFirst) parts.push(`high readability (${dims.readability}/100)`);
  if (dims.screenSuit > 92)         parts.push('exceptional screen performance');
  if (dims.licenseConf >= 95 && query.freeOnly) parts.push('open-source licensed');

  // Capitalize first letter of the joined sentence cleanly.
  let sentence = '';
  if (parts.length) {
    sentence = parts.join(', ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }

  // Heuristic-confidence tag for GF entries without curated notes.
  // Curated/open-library fonts (completeness ≥ 80 or undefined) skip this tag.
  const isHeuristic = font.source === 'google-fonts' && (font.completeness || 100) < 80;
  const heuristicNote = isHeuristic ? ' Match drawn from category metadata.' : '';

  // First sentence of curated notes, when available — adds depth for curated fonts.
  const note = (font.notes||'').split('.')[0];
  const noteText = note ? ' ' + note + '.' : '';

  return [sentence, noteText, heuristicNote].join('').trim();
}

// Composes the "caution" line. Surfaces concrete tradeoffs only — never
// generic disclaimers. Joined with " · " and capped at 2 items so the line
// stays scannable on the card.
function buildCautionText(font, dims, query) {
  const cautions = [];
  if (font.avoidFor && font.avoidFor.length) cautions.push(font.avoidFor[0]);
  if (dims.licenseConf < 70 && query.freeOnly) cautions.push('not in your free-only filter');
  if (dims.readability < 75 && (query.useCases||[]).some(u=>u.toLowerCase().includes('body'))) cautions.push('weaker for body copy');
  if (dims.brandContext < 50) cautions.push('not a typical fit for this project context');
  return cautions.slice(0,2).join(' · ');
}

/* ── Fact-grounded result presentation ───────────────────────
   These derive presentation directly from the computed score and
   dimension breakdown — no guesswork. The same numbers the engine
   ranks on are the numbers the UI explains.
─────────────────────────────────────────────────────────────── */

// Match-strength tier derived from the final 0-99 score.
// Thresholds chosen so a typical complete brief yields a small
// number of "Excellent" results, a band of "Strong", then the tail.
function matchTier(score) {
  if (score >= 90) return { label:'Excellent match', short:'Excellent', color:'var(--teal)',    level:4 };
  if (score >= 76) return { label:'Strong match',    short:'Strong',    color:'var(--primary)', level:3 };
  if (score >= 60) return { label:'Good match',      short:'Good',      color:'var(--warm)',    level:2 };
  return                  { label:'Fair match',      short:'Fair',      color:'var(--t3)',      level:1 };
}

const DIM_LABELS = {
  moodFit:        'Mood match',
  useCaseFit:     'Use-case fit',
  brandContext:   'Context fit',
  readability:    'Readability',
  screenSuit:     'Screen performance',
  distinctiveness:'Distinctiveness',
  pairingHarmony: 'Pairing harmony',
  licenseConf:    'License confidence',
};

// The single strongest dimension — the fact the recommendation leans on most.
function strongestSignal(dims) {
  if (!dims) return null;
  let best=null, bestV=-1;
  Object.keys(DIM_LABELS).forEach(k => {
    const v = dims[k];
    if (typeof v === 'number' && v > bestV) { bestV = v; best = k; }
  });
  return best ? { key:best, label:DIM_LABELS[best], value:Math.round(bestV) } : null;
}

// Confidence reflects metadata provenance, stated honestly:
//   curated/open-library (completeness ≥ 80) → data-backed
//   heuristic GF entries  (completeness < 80) → inferred from category
function dataConfidence(font) {
  const c = font.completeness != null ? font.completeness : 100;
  if (c >= 80) return { label:'Curated data', icon:'verified', backed:true };
  return { label:'Inferred', icon:'help', backed:false };
}

// Concrete brief facts a font satisfied — used for "matched on" chips.
function matchedFacts(font, query) {
  const moods    = query?.moods    || [];
  const useCases = query?.useCases || [];
  const fontMoods = (font.mood||[]).map(m=>m.toLowerCase());
  const moodHits  = moods.filter(m => fontMoods.includes(m.toLowerCase()));
  const haystack  = [...(font.goodFor||[]), ...(font.useCases||[])].join(' | ').toLowerCase();
  const ucHits    = useCases.filter(u => haystack.includes(u.toLowerCase().split('&')[0].trim().split(' ')[0]));
  return { moodHits, ucHits };
}

/* ── Progressive step section for Brief wizard ───────────── */
function StepSection({ step, label, complete, active, locked, completedSummary, onReopen, children }) {
  if (locked) {
    return (
      <div style={{ marginBottom:10, padding:'14px 20px', background:'var(--s1)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', display:'flex', alignItems:'center', gap:12, opacity:0.45, userSelect:'none' }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--t4)', flexShrink:0 }}>{step}</div>
        <span style={{ fontSize:13, color:'var(--t4)' }}>{label}</span>
        <Icon name="lock" size={13} style={{ color:'var(--t4)', marginLeft:'auto' }} />
      </div>
    );
  }
  if (complete && !active) {
    return (
      <div onClick={onReopen}
        style={{ marginBottom:10, padding:'12px 20px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'all .15s' }}
        onMouseEnter={e=>{e.currentTarget.style.background='var(--s3)';e.currentTarget.style.borderColor='var(--b2)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.borderColor='var(--b1)';}}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon name="check" size={13} style={{ color:'var(--on-primary)' }} />
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{label}</span>
        {completedSummary && <span style={{ fontSize:12, color:'var(--primary)', fontWeight:500, marginLeft:4 }}>{completedSummary}</span>}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--t4)' }}>
          <Icon name="edit" size={12} />Edit
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom:16, padding:'22px 24px', background:'var(--s2)', border:'1px solid color-mix(in srgb,var(--primary) 30%,transparent)', borderRadius:'var(--r-xl)', animation:'fadeIn .18s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'var(--on-primary)' }}>{step}</span>
        </div>
        <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ── Brief composer (Phase 2) — progressive stepped form ─── */
function BriefComposer({ collection, onResults }) {
  const [projectType, setProjectType] = useState('');
  const [contextKey,  setContextKey]  = useState(null);
  const [moods,       setMoods]       = useState([]);
  const [useCases,    setUseCases]    = useState([]);
  const [familiarity, setFamiliarity] = useState(40);
  const [readFirst,   setReadFirst]   = useState(true);
  const [freeOnly,    setFreeOnly]    = useState(false);
  const [query,       setQuery]       = useState('');
  const [loading,     setLoading]     = useState(false);
  // Progressive step reveal: 1=project, 2=mood, 3=use-cases, 4=context
  const [activeStep,  setActiveStep]  = useState(1);

  function selectProjectType(pt) {
    setProjectType(pt); setContextKey(null);
    if (activeStep === 1) setActiveStep(2);
  }
  function pickPreset(preset) {
    setProjectType(preset.label); setContextKey(preset.context);
    if (activeStep === 1) setActiveStep(2);
  }
  function toggleMood(m) {
    setMoods(p => {
      const next = p.includes(m) ? p.filter(x=>x!==m) : p.length<6 ? [...p,m] : p;
      // Auto-advance to use cases on first mood selection
      if (!p.includes(m) && p.length===0 && activeStep===2) setActiveStep(3);
      return next;
    });
  }
  function toggleUC(u) { setUseCases(p=>p.includes(u)?p.filter(x=>x!==u):[...p,u]); }

  // Track scoring failures for inline retry.
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  function runRecommend() {
    setError(null);
    setLoading(true);
    const q = { projectType, contextKey, moods, useCases, familiarity, readFirst, freeOnly, query };
    setLastQuery(q);
    setTimeout(() => {
      try {
        // Score all collection fonts
        const collectionResults = collection.map(font => {
          const { dims, score } = scoreFont(font, q, collection);
          return {
            ...font, score, dims, source:'collection',
            whyFits: buildWhyText(font, dims, q),
            caution: buildCautionText(font, dims, q),
          };
        }).sort((a,b)=>b.score-a.score).slice(0, 5);

        // Score the open-font library, surface best new suggestions not already in collection.
        // Use ALL_FONTS when the GF catalog is ready, else fall back to OPEN_FONT_LIBRARY.
        // The enrichment gate keeps bare GF entries (no mood/contextScore/useCases) out
        // of results until a metadata enrichment pass promotes them.
        const collectionNames = new Set(collection.map(f=>f.name));
        const candidatePool = (window.__GF_CATALOG_READY && window.ALL_FONTS)
          ? window.ALL_FONTS
          : (window.OPEN_FONT_LIBRARY || []);
        const libScored = candidatePool
          .filter(f => passesEnrichmentGate(f))
          .map(font => {
            const { dims, score } = scoreFont(font, q, collection);
            return {
              ...font, score, dims, source:'ai',
              whyFits: buildWhyText(font, dims, q),
              caution: buildCautionText(font, dims, q),
              confidence: score,
            };
          }).filter(f => !collectionNames.has(f.name))
            .sort((a,b)=>b.score-a.score);
        // Enforce variety: max 2 fonts of the same category in top 5 library suggestions
        const libRanked = enforceVariety(libScored, 5, 2);

        onResults({ collection: collectionResults, ai: libRanked, query: q });
      } catch (err) {
        console.error('[TypeMatch] scoring failed', err);
        setError(err && err.message ? err.message : 'Scoring failed unexpectedly.');
      } finally {
        setLoading(false);
      }
    }, 2200);
  }

  function retryRecommend() {
    if (!lastQuery) { runRecommend(); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        const q = lastQuery;
        const collectionResults = collection.map(font => {
          const { dims, score } = scoreFont(font, q, collection);
          return { ...font, score, dims, source:'collection',
            whyFits: buildWhyText(font, dims, q), caution: buildCautionText(font, dims, q) };
        }).sort((a,b)=>b.score-a.score).slice(0, 5);
        const collectionNames = new Set(collection.map(f=>f.name));
        const candidatePool = (window.__GF_CATALOG_READY && window.ALL_FONTS)
          ? window.ALL_FONTS
          : (window.OPEN_FONT_LIBRARY || []);
        const libScored2 = candidatePool
          .filter(f => passesEnrichmentGate(f))
          .map(font => {
            const { dims, score } = scoreFont(font, q, collection);
            return { ...font, score, dims, source:'ai',
              whyFits: buildWhyText(font, dims, q), caution: buildCautionText(font, dims, q), confidence: score };
          }).filter(f => !collectionNames.has(f.name)).sort((a,b)=>b.score-a.score);
        const libRanked = enforceVariety(libScored2, 5, 2);
        onResults({ collection: collectionResults, ai: libRanked, query: q });
      } catch (err) {
        console.error('[TypeMatch] retry scoring failed', err);
        setError(err && err.message ? err.message : 'Scoring failed unexpectedly.');
      } finally {
        setLoading(false);
      }
    }, 1400);
  }

  if (loading) return <ResultsLoadingSkeleton />;
  if (error)   return <RecommendErrorState message={error} onRetry={retryRecommend} onBack={() => setError(null)} />;

  const canRun = !!projectType && moods.length > 0 && useCases.length > 0;
  const stepsComplete = [!!projectType, moods.length>0, useCases.length>0];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>

      {/* ── Header ── */}
      <div style={{ padding:'14px 28px', borderBottom:'1px solid var(--b1)', flexShrink:0, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:19, fontWeight:700, letterSpacing:'-.02em', color:'var(--t1)', lineHeight:1.2 }}>Brief</h1>
          <p style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>Answer 3 questions — get scored font matches instantly</p>
        </div>
        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {stepsComplete.map((done, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background: done?'var(--primary)': stepsComplete.slice(0,i).every(Boolean)?'var(--primary-dim)':'var(--b1)', border: (!done && stepsComplete.slice(0,i).every(Boolean))?'2px solid var(--primary)':'2px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 }}>
                {done ? <Icon name="check" size={11} style={{ color:'var(--on-primary)' }} /> : <span style={{ fontSize:10, fontWeight:700, color: stepsComplete.slice(0,i).every(Boolean)?'var(--primary)':'var(--t4)' }}>{i+1}</span>}
              </div>
              {i < 2 && <div style={{ width:14, height:2, background:done?'var(--primary)':'var(--b2)', borderRadius:1, transition:'background .2s' }} />}
            </div>
          ))}
        </div>
        <Btn onClick={runRecommend} disabled={!canRun} endIcon="auto_awesome">Find matches</Btn>
      </div>

      {/* ── Steps ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 28px 32px' }}>

        {/* Step 1 — Project */}
        <StepSection step={1} label="What are you building?" complete={!!projectType} active={activeStep===1} locked={false}
          completedSummary={projectType} onReopen={()=>setActiveStep(1)}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:16 }}>
            {(window.PROJECT_TYPES||[]).map(pt=>(
              <button key={pt} onClick={()=>selectProjectType(pt)}
                style={{ padding:'11px 14px', borderRadius:'var(--r-md)', border:`1px solid ${projectType===pt?'color-mix(in srgb,var(--primary) 50%,transparent)':'var(--b1)'}`, background:projectType===pt?'var(--primary-dim)':'transparent', color:projectType===pt?'var(--t1)':'var(--t2)', fontSize:12, fontWeight:projectType===pt?600:400, cursor:'pointer', textAlign:'left', fontFamily:'var(--font-ui)', display:'flex', alignItems:'center', gap:8, transition:'all .12s' }}
                onMouseEnter={e=>{ if(projectType!==pt){e.currentTarget.style.background='var(--s3)';e.currentTarget.style.borderColor='var(--b2)';} }}
                onMouseLeave={e=>{ if(projectType!==pt){e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='var(--b1)';} }}>
                {projectType===pt && <Icon name="check" size={12} style={{ color:'var(--primary)', flexShrink:0 }} />}
                {pt}
              </button>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--b1)', paddingTop:14 }}>
            <p style={{ fontSize:11, color:'var(--t4)', marginBottom:8 }}>Or pick a preset</p>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {(window.RECOMMENDATION_PRESETS||[]).map(p=>(
                <Chip key={p.id} label={p.label} icon={p.icon} selected={projectType===p.label} onClick={()=>pickPreset(p)} color="neutral" size="sm" />
              ))}
            </div>
          </div>
        </StepSection>

        {/* Step 2 — Mood */}
        <StepSection step={2} label="What's the mood & tone?" complete={moods.length>0} active={activeStep===2} locked={!projectType}
          completedSummary={moods.length ? moods.slice(0,4).join(', ')+(moods.length>4?` +${moods.length-4}`:'') : ''}
          onReopen={()=>setActiveStep(2)}>
          <p style={{ fontSize:12, color:'var(--t3)', marginBottom:12 }}>Pick up to 6 words that describe your brand's personality.</p>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
            {(window.MOOD_OPTIONS||[]).map(m=>(
              <Chip key={m} label={m} selected={moods.includes(m)} onClick={()=>toggleMood(m)} color="primary" size="sm" />
            ))}
          </div>
          <RangeSlider label="Familiarity vs. Distinctiveness" value={familiarity} onChange={setFamiliarity} leftLabel="Safe & familiar" rightLabel="Bold & distinctive" />
        </StepSection>

        {/* Step 3 — Use cases */}
        <StepSection step={3} label="Where will the type appear?" complete={useCases.length>0} active={activeStep===3} locked={moods.length===0}
          completedSummary={useCases.length ? useCases.slice(0,3).join(', ')+(useCases.length>3?` +${useCases.length-3}`:'') : ''}
          onReopen={()=>setActiveStep(3)}>
          <p style={{ fontSize:12, color:'var(--t3)', marginBottom:12 }}>Select every context this type needs to handle.</p>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
            {(window.USE_CASES||[]).map(u=>(
              <Chip key={u} label={u} selected={useCases.includes(u)} onClick={()=>toggleUC(u)} color="collection" size="sm" />
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <ToggleRow label="Prioritise screen readability" value={readFirst} onChange={setReadFirst} />
            <ToggleRow label="Open-source / free only" value={freeOnly} onChange={setFreeOnly} />
          </div>
        </StepSection>

        {/* Step 4 — Context (optional, only appears when steps 1-3 done) */}
        {canRun && (
          <div style={{ marginBottom:20, padding:'18px 22px', background:'var(--s2)', border:'1px dashed var(--b2)', borderRadius:'var(--r-xl)', animation:'fadeIn .2s ease' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Icon name="notes" size={14} style={{ color:'var(--t3)' }} />
              <span style={{ fontSize:13, fontWeight:600, color:'var(--t2)' }}>Any extra context?</span>
              <span style={{ fontSize:11, color:'var(--t4)' }}>optional</span>
            </div>
            <textarea value={query} onChange={e=>setQuery(e.target.value)} rows={2}
              placeholder="e.g. 'Should feel like Linear or Pitch — technical but refined. Works at tiny sizes in a data-dense UI.'"
              style={{ marginBottom:10 }} />
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {['Works at small sizes','Feels premium but approachable','Distinctive without being loud','Reads well at body sizes'].map(s=>(
                <Chip key={s} label={s} onClick={()=>setQuery(q=>q?q:s)} size="sm" color="neutral" />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, paddingTop:4 }}>
          <p style={{ fontSize:12, color:'var(--t3)', lineHeight:1.5 }}>
            {canRun
              ? <><strong style={{ color:'var(--t2)' }}>{projectType}</strong>{moods.length>0 && <> · {moods.slice(0,3).join(', ')}</>}{useCases.length>0 && <> · {useCases.slice(0,2).join(', ')}</>}</>
              : <span style={{ color:'var(--t4)' }}>Complete all 3 steps to find your matches</span>
            }
          </p>
          <Btn onClick={runRecommend} disabled={!canRun} endIcon="auto_awesome">Find matches</Btn>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--s2)', border:`1px solid ${value?'color-mix(in srgb,var(--primary) 28%,transparent)':'var(--b1)'}`, borderRadius:'var(--r-lg)', cursor:'pointer' }}>
      <div style={{ width:32, height:18, borderRadius:'var(--r-pill)', background:value?'var(--primary)':'var(--b2)', position:'relative', flexShrink:0, transition:'background .2s' }}>
        <div style={{ position:'absolute', width:12, height:12, borderRadius:'50%', background:'#fff', top:3, left:value?17:3, transition:'left .2s' }} />
      </div>
      <span style={{ fontSize:12, color:'var(--t2)' }}>{label}</span>
    </div>
  );
}

/* ── Results loading skeleton (Phase 3) ───────────────────
   Card-shaped skeleton matching ResultCard dimensions so the
   layout doesn't shift when real cards arrive. Replaces the
   spinner-based AnalysisLoader as the primary loading view.
─────────────────────────────────────────────────────────── */
function ResultsLoadingSkeleton() {
  const [stageIdx, setStageIdx] = useState(0);
  const stages = ['Analysing mood alignment…','Scoring your collection…','Consulting open-font library…','Ranking by fit dimensions…','Preparing explainability…'];
  useEffect(()=>{ const t=setInterval(()=>setStageIdx(i=>(i+1)%stages.length),700); return()=>clearInterval(t); },[]);
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div>
          <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)' }}>Finding your matches</h2>
          <p style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{stages[stageIdx]}</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:11 }}>
          <div style={{ width:14, height:14, border:'2px solid var(--b2)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
          <span>Scoring…</span>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', overflow:'hidden', marginBottom:12 }}>
            <div style={{ padding:'20px 24px' }}>
              {/* badges row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <Skeleton width={55} height={20} radius={10} />
                  <Skeleton width={70} height={20} radius={10} />
                </div>
                <Skeleton width={42} height={42} radius={21} />
              </div>
              {/* font name hero */}
              <Skeleton width={'55%'} height={38} radius={4} style={{ marginBottom:6 }} />
              <Skeleton width={'30%'} height={13} radius={3} style={{ marginBottom:16 }} />
              {/* specimen */}
              <Skeleton width={'100%'} height={22} radius={4} style={{ marginBottom:6 }} />
              <Skeleton width={'80%'} height={22} radius={4} style={{ marginBottom:14 }} />
              {/* why it fits */}
              <Skeleton width={'100%'} height={14} radius={3} style={{ marginBottom:5 }} />
              <Skeleton width={'70%'} height={14} radius={3} />
            </div>
            <div style={{ padding:'8px 20px', borderTop:'1px solid var(--b1)' }}>
              <Skeleton width={120} height={11} radius={3} />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only" style={{ position:'absolute', width:1, height:1, overflow:'hidden', clip:'rect(0 0 0 0)' }}>Loading recommendations</span>
    </div>
  );
}

/* ── Inline recoverable error (Phase 3) ──────────────────── */
function RecommendErrorState({ message, onRetry, onBack }) {
  return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div role="alert" aria-live="assertive"
        style={{ maxWidth:440, padding:'22px 24px', background:'var(--s2)', border:'1px solid color-mix(in srgb,var(--danger) 28%,transparent)', borderRadius:'var(--r-xl)', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'color-mix(in srgb,var(--danger) 14%,transparent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="error_outline" size={18} style={{ color:'var(--danger)' }} />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--t1)' }}>We couldn't score your matches</div>
            <div style={{ fontSize:12, color:'var(--t3)' }}>The brief is safe — we just need to try again.</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'var(--t3)', padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)', fontFamily:'var(--font-ui)' }}>
          {message || 'Unknown error'}
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <Btn variant="ghost" size="sm" onClick={onBack}>Edit brief</Btn>
          <Btn size="sm" startIcon="refresh" onClick={onRetry}>Retry</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Analysis loader (legacy spinner, retained for any direct callers) ── */
function AnalysisLoader() {
  const [stageIdx, setStageIdx] = useState(0);
  const stages = ['Analysing mood alignment…','Scoring your collection…','Consulting open-font library…','Ranking by fit dimensions…','Preparing explainability…'];
  useEffect(()=>{ const t=setInterval(()=>setStageIdx(i=>(i+1)%stages.length),600); return()=>clearInterval(t); },[]);
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32, padding:48 }}>
      <div style={{ position:'relative', width:80, height:80 }}>
        <div style={{ position:'absolute', inset:0, border:'2px solid var(--b1)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, border:'2px solid transparent', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .9s linear infinite' }} />
        <div style={{ position:'absolute', inset:12, border:'2px solid transparent', borderTopColor:'var(--purple)', borderRadius:'50%', animation:'spin 1.4s linear infinite reverse' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="auto_awesome" size={22} style={{ color:'var(--primary)', animation:'breathe 2s ease infinite' }} />
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <h3 style={{ fontSize:18, fontWeight:600, fontFamily:'var(--font-display)', color:'var(--t1)', marginBottom:8 }}>Finding your matches</h3>
        <p style={{ fontSize:13, color:'var(--t3)', minWidth:260 }}>{stages[stageIdx]}</p>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
        {['Collection scan','Mood matrix','Use-case fit','Ranked scoring','Open-font library','Context score'].map((l,i)=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-pill)', animation:`breathe 1.2s ease infinite`, animationDelay:`${i*.16}s` }}>
            <div className="skeleton" style={{ width:6, height:6, borderRadius:'50%', flexShrink:0 }} />
            <span style={{ fontSize:11, color:'var(--t3)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Results ─────────────────────────────────────────────── */
function Results({ results, onNewSearch, onPreview, onSelectFont, selectedFontId }) {
  const [previewText, setPreviewText] = useState('The art of beautiful typography.');
  // When the shell-level Inspector is wired (onSelectFont provided), use the
  // shell's selectedFontId for the active highlight. Fall back to local state
  // so the component still works in isolation if mounted without the shell.
  const [localActive, setLocalActive] = useState(null);
  const activeFont = onSelectFont
    ? (selectedFontId ? [...results.collection, ...results.ai].find(f => f.id === selectedFontId) : null)
    : localActive;
  const handleCardClick = (f) => {
    if (onSelectFont) {
      onSelectFont(activeFont?.id === f.id ? null : f);
    } else {
      setLocalActive(activeFont?.id === f.id ? null : f);
    }
  };
  const [tab,         setTab]         = useState('all');

  const tabs = [
    { id:'all',        label:'All results', count: results.collection.length + results.ai.length },
    { id:'collection', label:'Collection',  count: results.collection.length },
    { id:'ai',         label:'Suggestions',  count: results.ai.length },
  ];

  // Phase 3: explicit empty state with clear recovery CTA. Renders once both
  // collection and library ranks are empty (e.g., a very narrow brief).
  const totalCount = results.collection.length + results.ai.length;
  if (totalCount === 0) {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)' }}>No matches yet</h2>
            <p style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{(results.query.moods||[]).slice(0,3).join(' · ') || 'no mood'} · {results.query.projectType||'—'}</p>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <EmptyState
            icon="filter_alt_off"
            title="No fonts match this brief"
            description="Try widening the mood, removing the open-source filter, or adding a use case you'd accept."
            action={<div style={{ display:'flex', gap:8 }}>
              <Btn variant="ghost" onClick={onNewSearch}>Start over</Btn>
              <Btn startIcon="auto_awesome" onClick={onNewSearch}>Refine brief</Btn>
            </div>}
          />
        </div>
      </div>
    );
  }

  // Fact-based result summary — counts derived from the same tiers the cards show.
  const allResults = [...results.collection, ...results.ai];
  const excellentN = allResults.filter(f => matchTier(f.score).level === 4).length;
  const strongN    = allResults.filter(f => matchTier(f.score).level === 3).length;
  const topFont    = allResults.slice().sort((a,b)=>b.score-a.score)[0];
  const briefMoods = (results.query.moods||[]).slice(0,4);
  const SAMPLE_PRESETS = ['The art of beautiful typography.','Sphinx of black quartz, judge my vow','1234567890 — $€£¥'];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* ── Header: summary band ── */}
      <div style={{ padding:'16px 28px 14px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'flex-start', gap:16, flexShrink:0 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:7 }}>
            <h2 style={{ fontSize:19, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', letterSpacing:'-.02em' }}>Your matches</h2>
            <span style={{ fontSize:12, color:'var(--t3)' }}>
              {allResults.length} fonts
              {excellentN>0 && <> · <strong style={{ color:'var(--teal)', fontWeight:600 }}>{excellentN} excellent</strong></>}
              {strongN>0 && <> · <strong style={{ color:'var(--primary)', fontWeight:600 }}>{strongN} strong</strong></>}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'var(--t4)' }}>Scored for</span>
            {results.query.projectType && <Badge label={results.query.projectType} color="primary" />}
            {briefMoods.map(m=><span key={m} style={{ fontSize:11, color:'var(--t2)' }}>· {m}</span>)}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          <Btn variant="ghost" size="sm" startIcon="auto_awesome" onClick={onNewSearch}>New brief</Btn>
          <Btn variant="tonal" size="sm" startIcon="compare" onClick={()=>onPreview(activeFont || topFont)}>Open top in Pairings</Btn>
        </div>
      </div>

      {/* ── Live preview control ── */}
      <div style={{ padding:'10px 28px', background:'var(--s1)', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <Icon name="text_fields" size={15} style={{ color:'var(--t3)', flexShrink:0 }} />
        <input type="text" value={previewText} onChange={e=>setPreviewText(e.target.value)}
          aria-label="Preview text for all result cards"
          style={{ padding:'6px 12px', fontSize:12, flex:1, minWidth:200, borderRadius:'var(--r-md)' }} placeholder="Type to preview across all fonts…" />
        <div style={{ display:'flex', gap:5 }}>
          {SAMPLE_PRESETS.map((s,i)=>(
            <Tooltip key={i} text={s}>
              <button onClick={()=>setPreviewText(s)} aria-label={`Preview sample ${i+1}`}
                style={{ width:30, height:28, borderRadius:'var(--r-sm)', border:'1px solid var(--b1)', background:'var(--s2)', color:'var(--t3)', cursor:'pointer', fontSize:11, fontFamily:'var(--font-mono)' }}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--t1)';e.currentTarget.style.borderColor='var(--b2)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--t3)';e.currentTarget.style.borderColor='var(--b1)';}}>
                {i===0?'Aa':i===1?'Pg':'123'}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} style={{ padding:'0 28px' }} />

      <div style={{ flex:1, overflowY:'auto', padding:'18px 28px 28px' }}>
        {/* Phase 2: Inspector lives in the shell. Results renders a single
            full-width column; clicking a card opens the shell-level inspector
            via onSelectFont. When mounted without a shell (no onSelectFont
            prop), falls back to inline DetailPanel beside the list. */}
        <div style={{ display:'grid', gridTemplateColumns: (!onSelectFont && activeFont) ? '1fr 360px' : '1fr', gap:16, alignItems:'start' }}>
          <div>
            {(tab==='all'||tab==='collection') && results.collection.length>0 && (
              <div style={{ marginBottom:tab==='all'?20:0 }}>
                {tab==='all' && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <Icon name="collections_bookmark" size={13} style={{ color:'var(--purple)' }} />
                    <SectionLabel style={{ color:'var(--t2)' }}>From your library</SectionLabel>
                    <Divider style={{ flex:1, marginBottom:0 }} />
                    <span style={{ fontSize:11, color:'var(--t4)', fontFamily:'var(--font-ui)' }}>{results.collection.length}</span>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', columnGap:10, alignItems:'start' }}>
                  {results.collection.map((f,i)=>(
                    <ResultCard key={f.id} font={f} rank={i+1} previewText={previewText} active={activeFont?.id===f.id} onClick={()=>handleCardClick(f)} onPreview={onPreview} query={results.query} />
                  ))}
                </div>
              </div>
            )}
            {(tab==='all'||tab==='ai') && results.ai.length>0 && (
              <div>
                {tab==='all' && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, marginTop:4 }}>
                    <Icon name="auto_awesome" size={13} style={{ color:'var(--teal)' }} />
                    <SectionLabel style={{ color:'var(--t2)' }}>Open library suggestions</SectionLabel>
                    <Tooltip text="Surfaced from a curated open-font library, scored against your brief">
                      <Icon name="info" size={12} style={{ color:'var(--t4)', cursor:'help' }} />
                    </Tooltip>
                    <Divider style={{ flex:1, marginBottom:0 }} />
                    <span style={{ fontSize:11, color:'var(--t4)', fontFamily:'var(--font-ui)' }}>{results.ai.length}</span>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', columnGap:10, alignItems:'start' }}>
                  {results.ai.map((f,i)=>(
                    <ResultCard key={f.id} font={f} rank={i+1} previewText={previewText} active={activeFont?.id===f.id} onClick={()=>handleCardClick(f)} onPreview={onPreview} query={results.query} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {!onSelectFont && activeFont && <DetailPanel font={activeFont} onClose={()=>setLocalActive(null)} onPreview={onPreview} />}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ font, rank, previewText, active, onClick, onPreview, query }) {
  const isAI   = font.source === 'ai';
  const isSans = (font.classification||'').toLowerCase().includes('sans');
  const specimenWeight = isSans ? 500 : 700;
  const ff = font.fontFamily || font.cssFamily || 'inherit';

  const tier    = matchTier(font.score);
  const signal  = strongestSignal(font.dims);
  const conf    = dataConfidence(font);
  const facts   = matchedFacts(font, query);
  const isTop   = rank === 1;

  return (
    <div onClick={onClick} className="fade-up md3-elevation"
      style={{ position:'relative', background: active?'var(--s3)':'var(--s2)', border:`1px solid ${active?'color-mix(in srgb,var(--primary) 35%,transparent)':'var(--b1)'}`, borderRadius:'var(--r-lg)', overflow:'hidden', marginBottom:8, cursor:'pointer', transition:'border-color .15s, box-shadow .15s, background .15s', boxShadow: active?'var(--shadow-sm)':'none' }}>

      {/* Top-match accent rail */}
      {isTop && <div style={{ position:'absolute', top:0, left:0, bottom:0, width:3, background:tier.color }} />}

      <div style={{ padding:'12px 16px' }}>
        {/* ── Row 1: tier + badges · score ring ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', minWidth:0 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 9px', borderRadius:'var(--r-pill)', background:`color-mix(in srgb, ${tier.color} 14%, transparent)`, color:tier.color, fontSize:10, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', fontFamily:'var(--font-accent)', whiteSpace:'nowrap' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:tier.color }} />
              {isTop ? 'Top · '+tier.short : tier.short}
            </span>
            {font.variable && <Badge label="Variable" color="primary" />}
            {font.license?.match(/OFL|Apache/) && <Badge label="Free" color="success" />}
          </div>
          <ScoreRing value={font.score} size={36} color="var(--primary)" strokeWidth={2.8} />
        </div>

        {/* ── Font name — the hero ── */}
        <div style={{ fontFamily:ff, fontSize:26, fontWeight:specimenWeight, color:'var(--t1)', lineHeight:1.1, letterSpacing:'-.02em', marginBottom:3 }}>
          {font.name}
        </div>
        <div style={{ fontSize:11, color:'var(--t3)', marginBottom:10, display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
          {font.foundry && <span>{font.foundry}</span>}
          {font.foundry && font.classification && <span style={{ color:'var(--b3)' }}>·</span>}
          {font.classification && <span>{font.classification}{font.subtype ? ' · '+font.subtype : ''}</span>}
          <span style={{ color:'var(--b3)' }}>·</span>
          <span style={{ color:isAI?'var(--teal)':'var(--purple)' }}>{isAI?'open library':'your library'}</span>
        </div>

        {/* ── Specimen in the actual font ── */}
        <div style={{ height:1, background:'var(--b1)', marginBottom:9 }} />
        <div style={{ fontFamily:ff, fontSize:15, fontWeight:400, color:'var(--t2)', lineHeight:1.45, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginBottom:9 }}>
          {previewText || font.previewText || 'The art of beautiful typography.'}
        </div>
        <div style={{ height:1, background:'var(--b1)', marginBottom:9 }} />

        {/* ── Matched-on facts (from the brief) ── */}
        {(facts.moodHits.length>0 || facts.ucHits.length>0) && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
            {facts.moodHits.slice(0,3).map(m=>(
              <span key={'m'+m} style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, padding:'2px 7px', borderRadius:'var(--r-pill)', background:'var(--primary-dim)', color:'var(--primary)', fontWeight:500 }}>
                <Icon name="check" size={9} />{m}
              </span>
            ))}
            {facts.ucHits.slice(0,2).map(u=>(
              <span key={'u'+u} style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, padding:'2px 7px', borderRadius:'var(--r-pill)', background:'var(--purple-dim)', color:'var(--purple)', fontWeight:500 }}>
                <Icon name="check" size={9} />{u}
              </span>
            ))}
          </div>
        )}

        {/* ── Why it fits ── */}
        {(font.whyFits || font.reason) && (
          <p style={{ fontSize:11, color:'var(--t2)', lineHeight:1.55, marginBottom:font.caution?4:0 }}>
            <strong style={{ color:'var(--t1)', fontWeight:600 }}>Why: </strong>{font.whyFits||font.reason}
          </p>
        )}
        {font.caution && (
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--warning)', marginTop:3 }}>
            <Icon name="warning_amber" size={10} style={{ flexShrink:0 }} />
            {font.caution}
          </div>
        )}
      </div>

      {/* ── Footer: fact strip + actions ── */}
      <div style={{ padding:'7px 14px', borderTop:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:10, background:'color-mix(in srgb, var(--t1) 2%, transparent)' }}>
        {signal && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'var(--t3)', fontFamily:'var(--font-mono)' }}>
            <Icon name="trending_up" size={11} style={{ color:'var(--primary)' }} />
            {signal.label} {signal.value}
          </span>
        )}
        <Tooltip text={conf.backed ? 'Scored from hand-curated metadata' : 'Inferred from category — verify before committing'}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, color:conf.backed?'var(--teal)':'var(--t4)', cursor:'help' }}>
            <Icon name={conf.icon} size={11} fill={conf.backed?1:0} />{conf.label}
          </span>
        </Tooltip>
        <button onClick={e=>{e.stopPropagation();onPreview(font);}}
          style={{ marginLeft:'auto', fontSize:11, fontWeight:500, color:'var(--t2)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-ui)' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--primary)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--t2)'}>
          <Icon name="compare" size={12} />Pairings
        </button>
        <Icon name={active?'keyboard_arrow_up':'chevron_right'} size={14} style={{ color:'var(--t4)' }} />
      </div>
    </div>
  );
}

// DetailPanel renders the full font breakdown.
// `embedded` mode (used by shell-level Inspector) drops the panel's own
// header + outer card chrome since the Inspector already provides them.
//
// Phase 3: tabs (Overview / Score / License / Pairing) inside the panel.
// Each tab guarantees content — when a section has no data we show an
// inline empty hint with a next-action so the inspector never dead-ends.
function DetailPanel({ font, onClose, onPreview, onOpenPreview, embedded=false }) {
  const isAI = font.source==='ai';
  const c    = isAI?'var(--teal)':'var(--purple)';
  const dims = font.dims || {};
  const [tab, setTab] = useState('overview');
  const tablistRef = useRef(null);

  const TABS = [
    { id:'overview', label:'Overview' },
    { id:'score',    label:'Score' },
    { id:'license',  label:'License' },
    { id:'pairing',  label:'Pairing' },
  ];

  // Roving focus across tablist (Left/Right/Home/End)
  function onTablistKey(e) {
    const idx = TABS.findIndex(t => t.id === tab);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    const btns = tablistRef.current?.querySelectorAll('[role="tab"]');
    btns?.[next]?.focus();
  }

  const Specimen = (
    <div style={{ fontFamily:font.fontFamily, fontSize:32, fontWeight:700, lineHeight:1.2, color:'var(--t1)', padding:'20px 16px', background:'var(--s4)', borderRadius:'var(--r-lg)' }}>
      The art of<br />beautiful type.
    </div>
  );

  const BadgeRow = (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      <Badge label={isAI?'Library':'Your Collection'} color={isAI?'ai':'collection'} dot />
      <Badge label={font.classification||font.subtype||'Font'} color="neutral" />
      {font.variable && <Badge label="Variable" color="primary" />}
      {font.license?.match(/OFL|Apache/) && <Badge label="Free" color="success" />}
    </div>
  );

  const OverviewPanel = (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {Specimen}
      {BadgeRow}
      {!isAI && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {[['Read',font.readability,'var(--primary)'],['Screen',font.screenSuitability,'var(--primary)'],['Print',font.printSuitability,'var(--primary)']].map(([l,v,c2])=>(
          <div key={l} style={{ padding:10, background:'var(--bg)', borderRadius:'var(--r-md)', textAlign:'center' }}>
            <ScoreRing value={v||0} size={38} color={c2} />
            <div style={{ fontSize:9, color:'var(--t4)', marginTop:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</div>
          </div>
        ))}
      </div>}
      {(font.goodFor || font.avoidFor) ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {font.goodFor && <div>
            <SectionLabel style={{ marginBottom:6, color:'var(--success)' }}>Good for</SectionLabel>
            {font.goodFor.slice(0,4).map(g=>(<div key={g} style={{ fontSize:11, color:'var(--t2)', marginBottom:3, display:'flex', alignItems:'flex-start', gap:6 }}><Icon name="check" size={11} style={{ color:'var(--success)', marginTop:2 }} />{g}</div>))}
          </div>}
          {font.avoidFor && <div>
            <SectionLabel style={{ marginBottom:6, color:'var(--warning)' }}>Avoid for</SectionLabel>
            {font.avoidFor.slice(0,4).map(g=>(<div key={g} style={{ fontSize:11, color:'var(--t2)', marginBottom:3, display:'flex', alignItems:'flex-start', gap:6 }}><Icon name="close" size={11} style={{ color:'var(--warning)', marginTop:2 }} />{g}</div>))}
          </div>}
        </div>
      ) : (
        <InlineHint text="No good-for / avoid-for guidance yet for this font." />
      )}
      {font.notes && <p style={{ fontSize:12, color:'var(--t3)', lineHeight:1.6 }}>{font.notes}</p>}
      <div style={{ display:'flex', gap:8 }}>
        <Btn fullWidth onClick={()=>onPreview(font)} startIcon="compare" variant="tonal" size="sm">Open in Pairings</Btn>
        {onOpenPreview && (
          <Btn fullWidth onClick={()=>onOpenPreview(font)} startIcon="menu_book" variant="outlined" size="sm">Open in Preview</Btn>
        )}
      </div>
    </div>
  );

  const hasDims = dims && Object.keys(dims).length > 0;
  const ScorePanel = (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <ScoreRing value={font.score||0} size={56} color={c} strokeWidth={4} />
        <div>
          <div style={{ fontSize:12, color:'var(--t3)' }}>Overall match</div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--t1)', fontFamily:'var(--font-display)', lineHeight:1.1 }}>{font.score||'—'}/99</div>
          <div style={{ fontSize:11, color:'var(--t4)' }}>Weighted across 8 dimensions</div>
        </div>
      </div>
      {hasDims ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
          {[
            ['Mood fit',      dims.moodFit,         'var(--primary)'],
            ['Use-case fit',  dims.useCaseFit,      'var(--primary)'],
            ['Brand context', dims.brandContext,    'var(--primary)'],
            ['Readability',   dims.readability,     'var(--primary)'],
            ['Screen suit',   dims.screenSuit,      'var(--primary)'],
            ['Distinctive',   dims.distinctiveness, 'var(--primary)'],
            ['Pairing',       dims.pairingHarmony,  'var(--primary)'],
            ['License',       dims.licenseConf,     'var(--primary)'],
          ].filter(([,v])=>v!=null).map(([l,v,c2])=>(
            <ScoreBar key={l} label={l} value={v||0} color={c2} />
          ))}
        </div>
      ) : (
        <InlineHint text="No score breakdown available — open this font through the Brief flow to compute dimension scores." />
      )}
      {font.whyFits && <div style={{ padding:'10px 12px', background:'var(--s3)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)' }}>
        <SectionLabel style={{ marginBottom:5 }}>Why it fits</SectionLabel>
        <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{font.whyFits}</p>
      </div>}
      {font.caution && <div style={{ padding:'10px 12px', background:'color-mix(in srgb,var(--warning) 8%,transparent)', border:'1px solid color-mix(in srgb,var(--warning) 22%,transparent)', borderRadius:'var(--r-md)' }}>
        <SectionLabel style={{ color:'var(--warning)', marginBottom:5 }}>Caution</SectionLabel>
        <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{font.caution}</p>
      </div>}
    </div>
  );

  const isFree = (font.license||'').match(/OFL|Apache|SIL/i);
  const LicensePanel = (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ padding:'14px 16px', background:'var(--s3)', border:`1px solid ${isFree?'color-mix(in srgb,var(--success) 28%,transparent)':'var(--b2)'}`, borderRadius:'var(--r-lg)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background: isFree ? 'color-mix(in srgb,var(--success) 14%,transparent)' : 'var(--b1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name={isFree?'verified':'workspace_premium'} size={18} style={{ color: isFree ? 'var(--success)' : 'var(--t3)' }} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)' }}>{font.license || 'License unknown'}</div>
          <div style={{ fontSize:11, color:'var(--t3)' }}>
            {isFree ? 'Free for commercial use under this license.' : 'Check the foundry for commercial use terms.'}
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <KV label="Languages" value={font.languages || 'Latin'} />
        <KV label="Foundry" value={font.foundry || '—'} />
        <KV label="Variable" value={font.variable == null ? '—' : font.variable ? 'Yes' : 'No'} />
        <KV label="Source" value={isAI ? 'Open library' : 'Your library'} />
      </div>
      {font.availability ? (
        <div>
          <SectionLabel style={{ marginBottom:6 }}>Availability</SectionLabel>
          <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{font.availability}</p>
        </div>
      ) : (
        <InlineHint text="Distribution channels not catalogued for this font yet." />
      )}
    </div>
  );

  const pairs = font.pairingWith || [];
  const PairingPanel = (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {pairs.length > 0 ? (
        <div>
          <SectionLabel style={{ marginBottom:8 }}>Recommended pairings</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {pairs.slice(0,6).map(p => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)' }}>
                <Icon name="link" size={14} style={{ color:'var(--t3)' }} />
                <span style={{ fontSize:13, color:'var(--t1)', flex:1 }}>{p}</span>
                <Badge label="Pair" color="primary" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <InlineHint text="No pre-mapped pairings yet. Open this font in Pairings to compose a combination." />
      )}
      {font.pairingNote && <div style={{ padding:'10px 12px', background:'var(--primary-dim)', border:'1px solid color-mix(in srgb,var(--primary) 22%,transparent)', borderRadius:'var(--r-md)' }}>
        <SectionLabel style={{ color:'var(--primary)', marginBottom:5 }}>Pairing note</SectionLabel>
        <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{font.pairingNote}</p>
      </div>}
      {font.tradeoffs && <div style={{ padding:'10px 12px', background:'color-mix(in srgb,var(--warning) 8%,transparent)', border:'1px solid color-mix(in srgb,var(--warning) 22%,transparent)', borderRadius:'var(--r-md)' }}>
        <SectionLabel style={{ color:'var(--warning)', marginBottom:5 }}>Tradeoffs</SectionLabel>
        <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>{font.tradeoffs}</p>
      </div>}
      <div style={{ display:'flex', gap:8 }}>
        <Btn fullWidth onClick={()=>onPreview(font)} startIcon="compare" variant="tonal" size="sm">Open in Pairings</Btn>
        {onOpenPreview && (
          <Btn fullWidth onClick={()=>onOpenPreview(font)} startIcon="menu_book" variant="outlined" size="sm">Open in Preview</Btn>
        )}
      </div>
    </div>
  );

  const panelById = { overview:OverviewPanel, score:ScorePanel, license:LicensePanel, pairing:PairingPanel };

  const Body = (
    <div style={{ padding:'14px 18px 18px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Tablist */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Font detail sections"
        onKeyDown={onTablistKey}
        style={{ display:'flex', gap:0, borderBottom:'1px solid var(--b1)', marginBottom:4, overflowX:'auto' }}
      >
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              id={`detail-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`detail-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t.id)}
              style={{
                padding:'8px 14px', border:'none', background:'transparent',
                borderBottom:`2px solid ${active ? 'var(--primary)' : 'transparent'}`,
                color: active ? 'var(--t1)' : 'var(--t3)',
                fontSize:12, fontWeight: active ? 600 : 500, cursor:'pointer',
                fontFamily:'var(--font-ui)', whiteSpace:'nowrap',
              }}
            >{t.label}</button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`detail-panel-${tab}`}
        aria-labelledby={`detail-tab-${tab}`}
        tabIndex={0}
        style={{ outline:'none' }}
      >
        {panelById[tab] || OverviewPanel}
      </div>
    </div>
  );

  if (embedded) return Body;

  return (
    <div style={{ background:'var(--s3)', border:`1px solid color-mix(in srgb, ${c} 25%, transparent)`, borderRadius:'var(--r-xl)', overflow:'hidden', position:'sticky', top:0 }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:10 }}>
        <Badge label={isAI?'Library':'Your Collection'} color={isAI?'ai':'collection'} dot />
        <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', flex:1 }}>{font.name}</span>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)' }}><Icon name="close" size={16} /></button>
      </div>
      <div style={{ maxHeight:'65vh', overflowY:'auto' }}>
        {Body}
      </div>
    </div>
  );
}

// Phase 3 helpers: inline hint + key/value pair used by Inspector tabs
function InlineHint({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px', background:'var(--bg)', border:'1px dashed var(--b2)', borderRadius:'var(--r-md)' }}>
      <Icon name="info" size={14} style={{ color:'var(--t4)', marginTop:2 }} />
      <span style={{ fontSize:12, color:'var(--t3)', lineHeight:1.55 }}>{text}</span>
    </div>
  );
}
function KV({ label, value }) {
  return (
    <div style={{ padding:'8px 10px', background:'var(--s3)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)' }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--t4)', fontFamily:'var(--font-accent)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:12, color:'var(--t1)', wordBreak:'break-word' }}>{value}</div>
    </div>
  );
}

// Expose DetailPanel on window so the shell-level Inspector in tm-app can render it.
Object.assign(window, { RecommendWizard, Results, scoreFont, DetailPanel });
