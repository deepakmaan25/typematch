// tm-recommend.jsx v3 — Multi-dimensional scorer + AI library matching + explainability
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
    font.notes||'', font.subtype||'',
  ].join(' | ').toLowerCase();
  ['small sizes','small','tiny','dense','data','table'].forEach(k=>{ if(q.includes(k) && haystack.match(/ui|small|table|data/)) b += 4; });
  ['premium','luxury','editorial','elegant'].forEach(k=>{ if(q.includes(k) && haystack.match(/luxury|editorial|premium|elegant/)) b += 4; });
  ['tech','startup','saas','developer'].forEach(k=>{ if(q.includes(k) && haystack.match(/tech|saas|developer|engineered/)) b += 4; });
  ['print','book','reading','long'].forEach(k=>{ if(q.includes(k) && haystack.match(/print|reading|long|body/)) b += 4; });
  return Math.min(15, b);
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
  return { dims, score: Math.min(99, Math.max(40, Math.round(raw))) };
}

function buildWhyText(font, dims, query) {
  const moods = query.moods||[], useCases = query.useCases||[];
  const moodHits = moods.filter(m => (font.mood||[]).map(x=>x.toLowerCase()).includes(m.toLowerCase()));
  const ucHits = useCases.filter(u => (font.useCases||[]).some(uc=>uc.toLowerCase().includes(u.toLowerCase().split(' ')[0])));
  const parts = [];
  if (moodHits.length) parts.push(`Aligns with ${moodHits.slice(0,3).join(', ')}`);
  if (ucHits.length)   parts.push(`fits use case ${ucHits[0]}`);
  if (dims.brandContext > 80) parts.push('strong context match for the project type');
  if (dims.readability > 88 && query.readFirst) parts.push(`high readability (${dims.readability})`);
  if (dims.screenSuit > 92)  parts.push('exceptional screen performance');
  if (dims.licenseConf >= 95 && query.freeOnly) parts.push('open-source licensed');
  const sentence = parts.length ? parts.join('. ').replace(/^./,c=>c.toUpperCase())+'.' : '';
  const note = (font.notes||'').split('.')[0];
  return [sentence, note ? note + '.' : ''].filter(Boolean).join(' ');
}

function buildCautionText(font, dims, query) {
  const cautions = [];
  if (font.avoidFor && font.avoidFor.length) cautions.push(font.avoidFor[0]);
  if (dims.licenseConf < 70 && query.freeOnly) cautions.push('not in your free-only filter');
  if (dims.readability < 75 && (query.useCases||[]).some(u=>u.toLowerCase().includes('body'))) cautions.push('weaker for body copy');
  if (dims.brandContext < 50) cautions.push('not a typical fit for this project context');
  return cautions.slice(0,2).join(' · ');
}

/* ── Wizard ──────────────────────────────────────────────── */
function RecommendWizard({ collection, onResults }) {
  const [step,        setStep]        = useState(0);
  const [projectType, setProjectType] = useState('');
  const [contextKey,  setContextKey]  = useState(null);
  const [moods,       setMoods]       = useState([]);
  const [useCases,    setUseCases]    = useState([]);
  const [familiarity, setFamiliarity] = useState(40);
  const [readFirst,   setReadFirst]   = useState(true);
  const [freeOnly,    setFreeOnly]    = useState(false);
  const [query,       setQuery]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const totalSteps = 4;

  function go(dir) {
    setTransitioning(true);
    setTimeout(() => { setStep(s => s + dir); setTransitioning(false); }, 220);
  }
  function toggleMood(m) { setMoods(p=>p.includes(m)?p.filter(x=>x!==m):p.length<6?[...p,m]:p); }
  function toggleUC(u)   { setUseCases(p=>p.includes(u)?p.filter(x=>x!==u):[...p,u]); }

  function pickPreset(preset) {
    setProjectType(preset.label);
    setContextKey(preset.context);
  }

  // Phase 3: track scoring failures so we can show an inline retry instead of
  // dead-ending the user. We capture the last query so Retry can re-run it.
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

        // Score AI library, surface best new suggestions not already in collection.
        // Use ALL_FONTS when the GF catalog is ready, else fall back to OPEN_FONT_LIBRARY.
        // The enrichment gate keeps bare GF entries (no mood/contextScore/useCases) out
        // of results until a metadata enrichment pass promotes them.
        const collectionNames = new Set(collection.map(f=>f.name));
        const candidatePool = (window.__GF_CATALOG_READY && window.ALL_FONTS)
          ? window.ALL_FONTS
          : (window.OPEN_FONT_LIBRARY || []);
        const libRanked = candidatePool
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
            .sort((a,b)=>b.score-a.score)
            .slice(0, 5);

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
        const libRanked = candidatePool
          .filter(f => passesEnrichmentGate(f))
          .map(font => {
            const { dims, score } = scoreFont(font, q, collection);
            return { ...font, score, dims, source:'ai',
              whyFits: buildWhyText(font, dims, q), caution: buildCautionText(font, dims, q), confidence: score };
          }).filter(f => !collectionNames.has(f.name)).sort((a,b)=>b.score-a.score).slice(0, 5);
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

  const content = [
    /* 0 — Project type */
    <div key="pt">
      <WizardHead step={1} total={totalSteps} title="What's the project?" subtitle="We'll tailor suggestions to your context and industry." />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
        {window.PROJECT_TYPES.map(pt=>(
          <button key={pt} onClick={()=>{setProjectType(pt); setContextKey(null);}}
            style={{ padding:'13px 16px', borderRadius:'var(--r-lg)', border:`1px solid ${projectType===pt?'color-mix(in srgb,var(--primary) 50%,transparent)':'var(--b1)'}`, background:projectType===pt?'var(--primary-dim)':'var(--s2)', color:projectType===pt?'var(--t1)':'var(--t2)', fontSize:13, cursor:'pointer', textAlign:'left', fontFamily:'var(--font-ui)', display:'flex', alignItems:'center', gap:10 }}>
            {projectType===pt && <Icon name="check" size={14} style={{ color:'var(--primary)', flexShrink:0 }} />}
            {pt}
          </button>
        ))}
      </div>
      <div style={{ marginBottom:20 }}>
        <SectionLabel style={{ marginBottom:10 }}>Or pick a starter template</SectionLabel>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {window.RECOMMENDATION_PRESETS.map(p=>(
            <Chip key={p.id} label={p.label} icon={p.icon} selected={projectType===p.label} onClick={()=>pickPreset(p)} color="neutral" />
          ))}
        </div>
      </div>
      <WizardFoot canNext={!!projectType} onNext={()=>go(1)} onBack={null} />
    </div>,

    /* 1 — Mood */
    <div key="mood">
      <WizardHead step={2} total={totalSteps} title="What mood should it express?" subtitle="Pick up to 6 that resonate. These directly weight mood alignment scores." />
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {window.MOOD_OPTIONS.map(m=>(
          <Chip key={m} label={m} selected={moods.includes(m)} onClick={()=>toggleMood(m)} color="primary" />
        ))}
      </div>
      {moods.length>0 && <div style={{ padding:'8px 14px', background:'var(--primary-dim)', border:'1px solid color-mix(in srgb,var(--primary) 22%,transparent)', borderRadius:'var(--r-md)', marginBottom:16 }}>
        <span style={{ fontSize:12, color:'var(--primary)' }}>Selected: {moods.join(' · ')}</span>
      </div>}
      <div style={{ marginBottom:20 }}>
        <RangeSlider label="Familiarity vs. Distinctiveness" value={familiarity} onChange={setFamiliarity} leftLabel="Safe & recognisable" rightLabel="Bold & distinctive" />
      </div>
      <WizardFoot canNext={moods.length>0} onNext={()=>go(1)} onBack={()=>go(-1)} />
    </div>,

    /* 2 — Use cases */
    <div key="uc">
      <WizardHead step={3} total={totalSteps} title="Where will it be used?" subtitle="All selections feed into use-case fit scoring." />
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {window.USE_CASES.map(u=>(
          <Chip key={u} label={u} selected={useCases.includes(u)} onClick={()=>toggleUC(u)} color="collection" />
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        <ToggleRow label="Prioritise screen readability" value={readFirst} onChange={setReadFirst} />
        <ToggleRow label="Open-source / free fonts only" value={freeOnly} onChange={setFreeOnly} />
      </div>
      <WizardFoot canNext={useCases.length>0} onNext={()=>go(1)} onBack={()=>go(-1)} />
    </div>,

    /* 3 — Natural language + run */
    <div key="run">
      <WizardHead step={4} total={totalSteps} title="Anything to add?" subtitle="Optional context in your own words. Describe constraints, references, or feel." />
      <textarea value={query} onChange={e=>setQuery(e.target.value)} rows={4} placeholder="e.g. 'Should feel like Linear or Pitch — technical but refined. Works at tiny sizes in a data-dense UI.'" style={{ marginBottom:14 }} />
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:24 }}>
        {['Works at small sizes','Feels premium but approachable','Distinctive without being loud','Print-quality at display size','Reads well at body sizes'].map(s=>(
          <Chip key={s} label={s} onClick={()=>setQuery(s)} size="sm" color="neutral" />
        ))}
      </div>
      <div style={{ padding:'16px 18px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-lg)', marginBottom:24 }}>
        <SectionLabel style={{ marginBottom:8 }}>Summary</SectionLabel>
        <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.7 }}>
          Finding a typeface for a <strong style={{ color:'var(--primary)' }}>{projectType||'—'}</strong> that feels <strong style={{ color:'var(--primary)' }}>{moods.slice(0,3).join(', ')||'—'}</strong>, for use in <strong style={{ color:'var(--purple)' }}>{useCases.slice(0,2).join(', ')||'—'}</strong>.
          {familiarity > 60 ? ' Skewing distinctive.' : familiarity < 40 ? ' Skewing familiar.' : ''}
          {freeOnly ? ' Open-source only.' : ''}
          {readFirst ? ' Screen-first.' : ''}
        </p>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="ghost" onClick={()=>go(-1)}>Back</Btn>
        <Btn onClick={runRecommend} endIcon="auto_awesome" style={{ flex:1, justifyContent:'center' }}>Get recommendations</Btn>
      </div>
    </div>,
  ];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', flexShrink:0 }}>
        <div style={{ height:2, background:'var(--b1)', borderRadius:2, overflow:'hidden', marginBottom:12 }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,var(--primary),var(--purple))', width:`${((step+1)/totalSteps)*100}%`, transition:'width .5s var(--ease-emphasized,cubic-bezier(.2,0,0,1))' }} />
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['Project','Mood','Use cases','Details'].map((l,i)=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:i<step?'var(--teal)':i===step?'var(--primary)':'var(--b2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {i<step ? <Icon name="check" size={10} style={{ color:'var(--on-primary)' }} /> : <span style={{ fontSize:9, color:i===step?'var(--on-primary)':'var(--t3)', fontWeight:700 }}>{i+1}</span>}
              </div>
              <span style={{ fontSize:11, color:i===step?'var(--t1)':'var(--t3)', fontWeight:i===step?600:400 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'36px 24px', opacity:transitioning?0:1, transform:transitioning?'translateY(8px)':'none', transition:'all .22s var(--ease-emphasized,cubic-bezier(.2,0,0,1))', maxWidth:680 }}>
        {content[step]}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--s2)', border:`1px solid ${value?'color-mix(in srgb,var(--primary) 28%,transparent)':'var(--b1)'}`, borderRadius:'var(--r-lg)', cursor:'pointer' }}>
      <div style={{ width:32, height:18, borderRadius:'var(--r-pill)', background:value?'var(--primary)':'var(--b2)', position:'relative', flexShrink:0, transition:'background .2s' }}>
        <div style={{ position:'absolute', width:12, height:12, borderRadius:'50%', background:'#fff', top:3, left:value?17:3, transition:'left .2s' }} />
      </div>
      <span style={{ fontSize:12, color:'var(--t2)' }}>{label}</span>
    </div>
  );
}

function WizardHead({ step, total, title, subtitle }) {
  return (
    <div style={{ marginBottom:26 }}>
      <SectionLabel style={{ marginBottom:8 }}>Step {step} of {total}</SectionLabel>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, letterSpacing:'-.02em', color:'var(--t1)', marginBottom:7, lineHeight:1.15 }}>{title}</h2>
      <p style={{ fontSize:13, color:'var(--t3)', lineHeight:1.6 }}>{subtitle}</p>
    </div>
  );
}
function WizardFoot({ canNext, onNext, onBack }) {
  return (
    <div style={{ display:'flex', gap:10 }}>
      {onBack && <Btn variant="ghost" onClick={onBack}>Back</Btn>}
      <Btn onClick={onNext} disabled={!canNext} endIcon="arrow_forward">Continue</Btn>
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
          <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)' }}>Finding your matches</h2>
          <p style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{stages[stageIdx]}</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, color:'var(--t3)', fontSize:11 }}>
          <div style={{ width:14, height:14, border:'2px solid var(--b2)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
          <span>Scoring…</span>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', overflow:'hidden', marginBottom:10 }}>
            <div style={{ padding:'18px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
              <Skeleton width={50} height={50} radius={25} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:7, marginBottom:10 }}>
                  <Skeleton width={70} height={14} radius={3} />
                  <Skeleton width={60} height={14} radius={3} />
                  <Skeleton width={50} height={14} radius={3} />
                </div>
                <Skeleton width={'72%'} height={26} radius={4} style={{ marginBottom:8 }} />
                <Skeleton width={'40%'} height={11} radius={3} style={{ marginBottom:12 }} />
                <Skeleton width={'100%'} height={56} radius={6} />
              </div>
            </div>
            <div style={{ padding:'8px 20px', borderTop:'1px solid var(--b1)' }}>
              <Skeleton width={140} height={11} radius={3} />
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
  // collection and AI ranks are empty (e.g., a very narrow brief).
  const totalCount = results.collection.length + results.ai.length;
  if (totalCount === 0) {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)' }}>No matches yet</h2>
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
              <Btn startIcon="tune" onClick={onNewSearch}>Refine brief</Btn>
            </div>}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div>
          <h2 style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)' }}>Recommendations</h2>
          <p style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{(results.query.moods||[]).slice(0,3).join(' · ') || 'no mood'} · {results.query.projectType||'—'}</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <Btn variant="ghost" size="sm" startIcon="refresh" onClick={onNewSearch}>New search</Btn>
          <Btn variant="tonal" size="sm" startIcon="compare" onClick={()=>onPreview(activeFont || results.collection[0] || results.ai[0])}>Open in Studio</Btn>
        </div>
      </div>

      <div style={{ padding:'8px 24px', background:'var(--s1)', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:10 }}>
        <Icon name="text_fields" size={14} style={{ color:'var(--t3)', flexShrink:0 }} />
        <input type="text" value={previewText} onChange={e=>setPreviewText(e.target.value)} style={{ padding:'5px 10px', fontSize:12, background:'var(--s2)', border:'1px solid var(--b1)', width:340, borderRadius:'var(--r-sm)' }} placeholder="Live preview text…" />
        <span style={{ fontSize:11, color:'var(--t4)' }}>Click a result to expand details</span>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} style={{ padding:'0 24px' }} />

      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {/* Phase 2: Inspector lives in the shell. Results renders a single
            full-width column; clicking a card opens the shell-level inspector
            via onSelectFont. When mounted without a shell (no onSelectFont
            prop), falls back to inline DetailPanel beside the list. */}
        <div style={{ display:'grid', gridTemplateColumns: (!onSelectFont && activeFont) ? '1fr 360px' : '1fr', gap:16, alignItems:'start' }}>
          <div>
            {(tab==='all'||tab==='collection') && results.collection.length>0 && (
              <div style={{ marginBottom:tab==='all'?20:0 }}>
                {tab==='all' && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'var(--purple-dim)', border:'1px solid color-mix(in srgb,var(--purple) 22%,transparent)', borderRadius:'var(--r-md)' }}>
                      <Icon name="collections_bookmark" size={13} style={{ color:'var(--purple)' }} />
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--purple)', fontFamily:'var(--font-accent)' }}>From Your Library</span>
                    </div>
                    <Divider style={{ flex:1 }} />
                  </div>
                )}
                {results.collection.map((f,i)=>(
                  <ResultCard key={f.id} font={f} rank={i+1} previewText={previewText} active={activeFont?.id===f.id} onClick={()=>handleCardClick(f)} onPreview={onPreview} />
                ))}
              </div>
            )}
            {(tab==='all'||tab==='ai') && results.ai.length>0 && (
              <div>
                {tab==='all' && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, marginTop:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'var(--teal-dim)', border:'1px solid color-mix(in srgb,var(--teal) 20%,transparent)', borderRadius:'var(--r-md)' }}>
                      <Icon name="auto_awesome" size={13} style={{ color:'var(--teal)' }} />
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--teal)', fontFamily:'var(--font-accent)' }}>Library Suggestions</span>
                      <Tooltip text="Surfaced from a curated open-font knowledge library, scored against your brief"><Icon name="info" size={12} style={{ color:'color-mix(in srgb,var(--teal) 50%,transparent)', cursor:'help' }} /></Tooltip>
                    </div>
                    <Divider style={{ flex:1 }} />
                  </div>
                )}
                {results.ai.map((f,i)=>(
                  <ResultCard key={f.id} font={f} rank={i+1} previewText={previewText} active={activeFont?.id===f.id} onClick={()=>handleCardClick(f)} onPreview={onPreview} />
                ))}
              </div>
            )}
          </div>
          {!onSelectFont && activeFont && <DetailPanel font={activeFont} onClose={()=>setLocalActive(null)} onPreview={onPreview} />}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ font, rank, previewText, active, onClick, onPreview }) {
  const isAI  = font.source === 'ai';
  const color = isAI ? 'var(--teal)' : 'var(--purple)';
  const dims  = font.dims || {};

  return (
    <div onClick={onClick} className="fade-up md3-elevation"
      style={{ background:active?(isAI?'color-mix(in srgb,var(--teal) 4%,var(--s2))':'color-mix(in srgb,var(--purple) 4%,var(--s2))'):'var(--s2)', border:`1px solid ${active?(isAI?'color-mix(in srgb,var(--teal) 38%,transparent)':'color-mix(in srgb,var(--purple) 38%,transparent)'):'var(--b1)'}`, borderRadius:'var(--r-xl)', overflow:'hidden', marginBottom:10, cursor:'pointer', transition:'all .25s var(--ease-emphasized,cubic-bezier(.2,0,0,1))', boxShadow:active?`0 6px 24px color-mix(in srgb, ${color} 18%, transparent)`:'var(--shadow-sm)' }}>
      <div style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          <ScoreRing value={font.score} size={50} color={color} strokeWidth={3.5} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10, alignItems:'center' }}>
              <Badge label={isAI?'Library':'Your Collection'} color={isAI?'ai':'collection'} dot />
              <Badge label={font.classification||font.subtype||'Font'} color="neutral" />
              {font.variable && <Badge label="Variable" color="primary" />}
              {font.license?.match(/OFL|Apache/) && <Badge label="Free" color="success" />}
              <span style={{ marginLeft:'auto', fontSize:10, color:'var(--t4)', fontFamily:'var(--font-accent)', letterSpacing:'.08em', textTransform:'uppercase' }}>#{rank}</span>
            </div>
            <div style={{ fontFamily:font.fontFamily, fontSize:26, fontWeight:font.classification==='Sans-serif'?500:700, color:'var(--t1)', lineHeight:1.2, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {previewText.substring(0,42)||font.name}
            </div>
            <div style={{ fontSize:11, color:'var(--t3)', marginBottom:12 }}>{font.name} · {font.foundry}</div>

            {(font.whyFits || font.reason || font.caution) && (
              <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.65, padding:'10px 14px', background:'var(--s3)', borderRadius:'var(--r-md)', borderLeft:`3px solid ${color}` }}>
                {(font.whyFits || font.reason) && (
                  <><strong style={{ color, fontWeight:600 }}>Why it fits: </strong>{font.whyFits||font.reason}</>
                )}
                {font.caution && (
                  <div style={{ marginTop:(font.whyFits||font.reason)?6:0, fontSize:11, color:'var(--warning)' }}>
                    <Icon name="warning_amber" size={11} style={{ marginRight:4, verticalAlign:'middle' }} />
                    Caution: {font.caution}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phase 2: Score breakdown + Good/Avoid moved to the shell-level
            Inspector (DetailPanel embedded mode). The card stays compact;
            full breakdown opens on click. */}

        {isAI && font.tags && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
            {(font.tags||font.goodFor||[]).slice(0,4).map(t=><Chip key={t} label={t} size="sm" color="ai" />)}
          </div>
        )}
        {isAI && font.usedBy && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, color:'var(--t4)' }}>Seen at:</span>
            {font.usedBy.slice(0,3).map(u=><span key={u} style={{ fontSize:10, color:'var(--teal)', padding:'1px 6px', background:'color-mix(in srgb,var(--teal) 8%,transparent)', borderRadius:3 }}>{u}</span>)}
          </div>
        )}
      </div>
      <div style={{ padding:'8px 20px', borderTop:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={e=>{e.stopPropagation();onPreview(font);}} style={{ fontSize:11, color:'var(--t3)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-ui)' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}>
          <Icon name="tune" size={13} />Open in Pairing Studio
        </button>
        <span style={{ marginLeft:'auto', fontSize:10, color:'var(--t4)' }}>{active?'Collapse':'Expand details'}</span>
        <Icon name={active?'keyboard_arrow_up':'keyboard_arrow_down'} size={14} style={{ color:'var(--t4)' }} />
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
    <div style={{ fontFamily:font.fontFamily, fontSize:32, fontWeight:700, lineHeight:1.2, color:'var(--t1)', padding:'20px 16px', background:'var(--bg)', borderRadius:'var(--r-lg)' }}>
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
        {[['Read',font.readability,'var(--primary)'],['Screen',font.screenSuitability,'var(--purple)'],['Print',font.printSuitability,'var(--teal)']].map(([l,v,c2])=>(
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
        <Btn fullWidth onClick={()=>onPreview(font)} startIcon="tune" variant="tonal" size="sm">Open in Pairings</Btn>
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
            ['Mood fit',      dims.moodFit,         'var(--purple)'],
            ['Use-case fit',  dims.useCaseFit,      'var(--primary)'],
            ['Brand context', dims.brandContext,    'var(--warm)'],
            ['Readability',   dims.readability,     'var(--teal)'],
            ['Screen suit.',  dims.screenSuit,      'var(--primary)'],
            ['Distinctive',   dims.distinctiveness, 'var(--gold)'],
            ['Pairing',       dims.pairingHarmony,  'var(--purple)'],
            ['License',       dims.licenseConf,     'var(--teal)'],
          ].filter(([,v])=>v!=null).map(([l,v,c2])=>(
            <ScoreBar key={l} label={l} value={v||0} color={c2} />
          ))}
        </div>
      ) : (
        <InlineHint text="No score breakdown available — open this font through the Brief flow to compute dimension scores." />
      )}
      {font.whyFits && <div style={{ padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)' }}>
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
        <KV label="Variable" value={font.variable ? 'Yes' : 'No'} />
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
        <Btn fullWidth onClick={()=>onPreview(font)} startIcon="tune" variant="tonal" size="sm">Open in Pairings</Btn>
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
    <div style={{ padding:'8px 10px', background:'var(--bg)', border:'1px solid var(--b1)', borderRadius:'var(--r-md)' }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--t4)', fontFamily:'var(--font-accent)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:12, color:'var(--t1)', wordBreak:'break-word' }}>{value}</div>
    </div>
  );
}

// Expose DetailPanel on window so the shell-level Inspector in tm-app can render it.
Object.assign(window, { RecommendWizard, Results, scoreFont, DetailPanel });
