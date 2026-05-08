// tm-preview.jsx — Preview Lab, exported to window
const { useState, useRef, useEffect } = React;

const PREVIEW_TEMPLATES = [
  { id:'article',   label:'Article',         icon:'menu_book' },   // Phase 3 — real-context
  { id:'hero',      label:'Hero headline',   icon:'title' },
  { id:'body',      label:'Body copy',       icon:'subject' },
  { id:'editorial', label:'Editorial',       icon:'article' },
  { id:'brand',     label:'Brand lockup',    icon:'workspace_premium' },
  { id:'mobile',    label:'Mobile card',     icon:'smartphone' },
  { id:'ui',        label:'UI interface',    icon:'web_asset' },
];

// Fonts guaranteed loaded at app start (pre-loaded in TypeMatch.html <head>).
// These never need injection — resolve immediately in loadFont().
const PRELOADED_FONT_NAMES = new Set([
  'Playfair Display', 'DM Sans', 'Fraunces', 'Space Grotesk',
  'Cormorant Garamond', 'Syne', 'Libre Baskerville', 'DM Serif Display', 'Inter',
]);

// Base catalogue — always available (pre-loaded in HTML head via Google Fonts).
// weightMin/weightMax sourced from tm-data.jsx + GF spec for each family.
const ALL_PREVIEW_FONTS = [
  { name:'Playfair Display',  family:"'Playfair Display',serif",    type:'Serif',   weightMin:400, weightMax:900  },
  { name:'DM Sans',           family:"'DM Sans',sans-serif",        type:'Sans',    weightMin:100, weightMax:1000 },
  { name:'Fraunces',          family:"'Fraunces',serif",            type:'Serif',   weightMin:100, weightMax:900  },
  { name:'Space Grotesk',     family:"'Space Grotesk',sans-serif",  type:'Sans',    weightMin:300, weightMax:700  },
  { name:'Cormorant Garamond',family:"'Cormorant Garamond',serif",  type:'Serif',   weightMin:300, weightMax:700  },
  { name:'Syne',              family:"'Syne',sans-serif",           type:'Display', weightMin:400, weightMax:800  },
];

// Convert a results/inspector font object → preview catalogue entry.
// Forwards weightMin/weightMax from the canonical schema (set by normalizeFont
// via parseWeightRange). These drive both buildGFUrl and the weight button UI.
function toPreviewEntry(font) {
  return {
    name:      font.name,
    family:    font.fontFamily || font.cssFamily || `'${font.name}', sans-serif`,
    type:      font.classification || font.category || 'Custom',
    injected:  true,
    loaded:    font.loaded || false,
    weightMin: Number.isFinite(font.weightMin) ? font.weightMin : 400,
    weightMax: Number.isFinite(font.weightMax) ? font.weightMax : 700,
  };
}

// Build the initial working catalogue: base + injected font if not already present
function buildCatalogue(font) {
  if (!font?.name) return ALL_PREVIEW_FONTS;
  if (ALL_PREVIEW_FONTS.some(f => f.name === font.name)) return ALL_PREVIEW_FONTS;
  return [toPreviewEntry(font), ...ALL_PREVIEW_FONTS];
}

// Build a Google Fonts API URL for the given font.
// Requests only the UI-exposed weights (300, 400, 500, 700) that fall within
// the font's declared weight range (font.weightMin–font.weightMax). This
// prevents requesting weights a font doesn't have, and keeps the URL honest.
// GF returns whatever is actually available; requesting within-range extras is safe.
function buildGFUrl(name, font) {
  const min = Number.isFinite(font?.weightMin) ? font.weightMin : 400;
  const max = Number.isFinite(font?.weightMax) ? font.weightMax : 700;
  const weights = [300, 400, 500, 700].filter(w => w >= min && w <= max);
  if (weights.length === 0) weights.push(400); // safety: every GF font has 400
  return `https://fonts.googleapis.com/css2?family=${name.replace(/ /g,'+')}:wght@${weights.join(';')}&display=swap`;
}

// Async font loader — the single source of truth for getting a font ready to paint.
//
// Returns a Promise that:
//   resolves — font is in the browser FontFaceSet and ready to use
//   rejects  — network error, font not in GF catalog, or 12s timeout
//
// Strategy:
//   1. Pre-loaded fonts (PRELOADED_FONT_NAMES or font.loaded === true) → resolve instantly
//   2. Already in FontFaceSet (loaded earlier this session) → resolve instantly
//   3. Otherwise: inject GF stylesheet → wait for CSS parse → verify via Font Loading API
//
// Idempotent: calling it N times for the same font is safe.
function loadFont(name, font) {
  // Already guaranteed available — no network needed
  if (PRELOADED_FONT_NAMES.has(name) || font?.loaded === true) {
    return Promise.resolve();
  }

  const fontSpec = `400 1em "${name}"`;

  // Already in the browser's FontFaceSet (e.g., loaded earlier this session)
  if (document.fonts.check(fontSpec)) return Promise.resolve();

  const id = `gf-inject-${name.replace(/\s+/g, '-').toLowerCase()}`;
  let link = document.getElementById(id);

  if (!link) {
    link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = buildGFUrl(name, font);
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Font load timeout: ${name}`)),
      12000
    );

    const afterStylesheet = () => {
      // Font Loading API: resolves with matching FontFace objects once the
      // font file is downloaded. Empty array = font not found in the CSS.
      document.fonts.load(fontSpec)
        .then(faces => {
          clearTimeout(timeout);
          if (faces && faces.length > 0) resolve();
          else reject(new Error(`Font not available in Google Fonts: ${name}`));
        })
        .catch(err => { clearTimeout(timeout); reject(err); });
    };

    // link.sheet is non-null once the browser has parsed the CSS.
    // If it's already parsed (link injected by a prior call), go immediately;
    // otherwise wait for the load event.
    if (link.sheet != null) {
      afterStylesheet();
    } else {
      link.addEventListener('load',  afterStylesheet, { once: true });
      link.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to fetch font stylesheet: ${name}`));
      }, { once: true });
    }
  });
}

// UI-exposed weights. Must exactly match the weight buttons rendered in the
// sidebar so getSupportedWeights and the button list stay in sync automatically.
const UI_WEIGHTS = [300, 400, 500, 700];

// Returns weight support status for each UI weight across the current selection.
//   'ok'      — every selected font can render this weight (within declared range)
//   'partial' — some fonts support it, others will CSS-snap to their nearest weight
//   'none'    — no selected font supports it; rendering would be misleading
function getSupportedWeights(catalogue, selectedFontNames) {
  if (!selectedFontNames.length) {
    return UI_WEIGHTS.map(w => ({ weight: w, status: 'ok', blockingFonts: [] }));
  }
  const ranges = selectedFontNames
    .map(n => catalogue.find(f => f.name === n))
    .filter(Boolean)
    .map(f => ({ name: f.name, min: f.weightMin ?? 400, max: f.weightMax ?? 700 }));

  return UI_WEIGHTS.map(w => {
    const blocking   = ranges.filter(f => w < f.min || w > f.max);
    const supporting = ranges.filter(f => w >= f.min && w <= f.max);
    return {
      weight:       w,
      status:       blocking.length === 0   ? 'ok'
                  : supporting.length === 0 ? 'none'
                  :                           'partial',
      blockingFonts: blocking.map(f => f.name),
    };
  });
}

// Clamp fontWeight to the nearest weight supported by all selected fonts.
// Prefers universally-supported weights; falls back to partially-supported.
// Guarantees a usable weight even in worst-case single-weight font selections.
function clampToSupported(currentWeight, catalogue, selectedFontNames) {
  const support    = getSupportedWeights(catalogue, selectedFontNames);
  const ok         = support.filter(ws => ws.status === 'ok').map(ws => ws.weight);
  const any        = support.filter(ws => ws.status !== 'none').map(ws => ws.weight);
  const candidates = ok.length > 0 ? ok : any.length > 0 ? any : [400];
  if (candidates.includes(currentWeight)) return currentWeight;
  return candidates.reduce((best, w) =>
    Math.abs(w - currentWeight) < Math.abs(best - currentWeight) ? w : best
  );
}

function PreviewLab({ initialFont }) {
  const [fontCatalogue, setFontCatalogue] = useState(() => buildCatalogue(initialFont));

  const [selectedFonts, setSelectedFonts] = useState(() => {
    if (!initialFont?.name) return ['Playfair Display', 'DM Sans'];
    return [initialFont.name];
  });

  // Per-font load status: 'loaded' | 'loading' | 'failed'
  // Pre-loaded fonts start as 'loaded'. Injected fonts start as 'loading'.
  const [fontStatus, setFontStatus] = useState(() => {
    const s = {};
    PRELOADED_FONT_NAMES.forEach(n => { s[n] = 'loaded'; });
    if (initialFont?.name) {
      const ready = PRELOADED_FONT_NAMES.has(initialFont.name) || initialFont.loaded === true;
      s[initialFont.name] = ready ? 'loaded' : 'loading';
    }
    return s;
  });

  // Trigger an async font load and update fontStatus when it settles.
  // Safe to call multiple times — loadFont is idempotent for the normal path.
  //
  // Retry path: if the font previously failed, its <link> is still in the DOM
  // but in an error state (link.sheet === null permanently). A new `load`
  // listener on a dead link never fires; the Promise would just time out at 12s.
  // We remove the stale link first so loadFont() creates a fresh stylesheet
  // request from scratch.
  function loadFontAndTrack(name, font) {
    if (fontStatus[name] === 'failed') {
      const staleId = `gf-inject-${name.replace(/\s+/g, '-').toLowerCase()}`;
      document.getElementById(staleId)?.remove();
    }
    setFontStatus(prev => {
      if (prev[name] === 'loaded') return prev;
      return { ...prev, [name]: 'loading' };
    });
    loadFont(name, font)
      .then(() => setFontStatus(prev => ({ ...prev, [name]: 'loaded' })))
      .catch(() => setFontStatus(prev => ({ ...prev, [name]: 'failed' })));
  }

  // When initialFont changes: inject into catalogue, load it, auto-select.
  useEffect(() => {
    if (!initialFont?.name) return;
    const name = initialFont.name;
    setFontCatalogue(prev => {
      if (prev.some(f => f.name === name)) return prev;
      return [toPreviewEntry(initialFont), ...prev];
    });
    if (fontStatus[name] !== 'loaded') {
      loadFontAndTrack(name, initialFont);
    }
    setSelectedFonts([name]);
  }, [initialFont?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount: start loading initialFont if it's not from the pre-loaded set.
  useEffect(() => {
    if (!initialFont?.name) return;
    if (!PRELOADED_FONT_NAMES.has(initialFont.name) && initialFont.loaded !== true) {
      loadFontAndTrack(initialFont.name, initialFont);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [template,      setTemplate]      = useState('article');
  const [darkBg,        setDarkBg]        = useState(false);
  const [fontSize,      setFontSize]      = useState(48);
  // Initialize fontWeight clamped to the initial selection's actual weight range,
  // so the active button is never disabled on first render.
  const [fontWeight, setFontWeight] = useState(() => {
    const initSelected = initialFont?.name ? [initialFont.name] : ['Playfair Display', 'DM Sans'];
    return clampToSupported(700, buildCatalogue(initialFont), initSelected);
  });
  const [lineHeight,    setLineHeight]    = useState(120);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [customText,    setCustomText]    = useState('The craft of beautiful typography starts here.');
  const [saved,         setSaved]         = useState([]);
  const [showSaved,     setShowSaved]     = useState(false);

  function toggleFont(name) {
    const status = fontStatus[name];
    // Kick off loading when font has never been attempted or previously failed.
    // A failed font can be retried by toggling it again.
    if (status !== 'loaded' && status !== 'loading') {
      const fontData = fontCatalogue.find(f => f.name === name);
      loadFontAndTrack(name, fontData);
    }
    // Compute next selection synchronously so we can clamp fontWeight in the
    // same event handler — before React re-renders the weight buttons.
    const next = selectedFonts.includes(name)
      ? selectedFonts.filter(n => n !== name)
      : selectedFonts.length < 3
        ? [...selectedFonts, name]
        : [selectedFonts[1], selectedFonts[2] || name, name].slice(-3);
    setSelectedFonts(next);
    // If the current fontWeight is outside the new selection's supported range,
    // snap to the nearest weight that all selected fonts can render correctly.
    const clamped = clampToSupported(fontWeight, fontCatalogue, next);
    if (clamped !== fontWeight) setFontWeight(clamped);
  }

  function saveComparison() {
    setSaved(s => [...s, { fonts:selectedFonts, template, text:customText, time:new Date().toLocaleTimeString() }]);
  }

  // Canvas-level bg/text colors — controlled by the darkBg canvas toggle,
  // independent of the app shell theme. UI chrome uses CSS custom properties.
  const bgColor   = darkBg ? '#0f0f16'               : '#ffffff';
  const textColor = darkBg ? 'rgba(255,255,255,0.92)' : '#111118';
  const subColor  = darkBg ? 'rgba(255,255,255,0.45)' : '#666680';
  const cardBg    = darkBg ? '#1a1a26'               : '#f5f5f8';

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Toolbar */}
      <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontSize:18, fontWeight:600, fontFamily:"'Syne',sans-serif", color:'var(--t1)', marginRight:8 }}>Preview Lab</h2>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {PREVIEW_TEMPLATES.map(t => (
            <Chip key={t.id} label={t.label} selected={template===t.id} onClick={()=>setTemplate(t.id)} color="neutral" size="sm" icon={t.icon} />
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={()=>setDarkBg(d=>!d)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:4, background:'var(--s3)', border:'1px solid var(--b2)', color:'var(--t2)', fontSize:12, cursor:'pointer', fontFamily:'Roboto,sans-serif' }}>
            <Icon name={darkBg ? 'light_mode' : 'dark_mode'} size={14} />
            {darkBg ? 'Light' : 'Dark'} bg
          </button>
          <Btn variant="ghost" size="sm" startIcon="bookmark" onClick={saveComparison}>Save</Btn>
          {saved.length > 0 && (
            <Btn variant="outlined" size="sm" onClick={()=>setShowSaved(s=>!s)}>{saved.length} saved</Btn>
          )}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Left sidebar — controls */}
        <div style={{ width:240, borderRight:'1px solid var(--b1)', overflowY:'auto', padding:'16px 16px', display:'flex', flexDirection:'column', gap:20, flexShrink:0 }}>
          {/* Font selection */}
          <div>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--t4)', marginBottom:10 }}>Fonts (up to 3)</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {fontCatalogue.map(f => {
                const sel    = selectedFonts.includes(f.name);
                const status = fontStatus[f.name] || 'loaded';
                // Status dot color: failed=red, loading=amber, selected=primary, idle=muted
                const dotColor = status === 'failed'  ? 'var(--error, #d32f2f)'
                               : status === 'loading' ? '#f59e0b'
                               : sel                  ? 'var(--primary)'
                               :                        'var(--t4)';
                return (
                  <button key={f.name} onClick={()=>toggleFont(f.name)}
                    style={{
                      display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:6,
                      border:`1px solid ${sel ? 'color-mix(in srgb, var(--primary) 40%, transparent)' : 'var(--b1)'}`,
                      background: sel ? 'color-mix(in srgb, var(--primary) 9%, transparent)' : 'transparent',
                      cursor:'pointer', transition:'all 0.15s', color:'inherit',
                      opacity: status === 'failed' ? 0.65 : 1,
                    }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:dotColor, flexShrink:0 }} />
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontSize:12, color: sel ? 'var(--t1)' : 'var(--t2)', fontWeight: sel ? 500 : 400 }}>{f.name}</div>
                      <div style={{ fontSize:10, color:'var(--t4)' }}>
                        {f.type}
                        {f.injected && status !== 'failed' && <span style={{ marginLeft:5, color:'var(--primary)', opacity:.7 }}>· from results</span>}
                        {status === 'loading' && <span style={{ marginLeft:5, color:'#f59e0b' }}>· loading…</span>}
                        {status === 'failed'  && <span style={{ marginLeft:5, color:'var(--error, #d32f2f)' }}>· unavailable</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Typography controls */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--t4)' }}>Typography</p>
            <RangeSlider label="Size" value={fontSize} onChange={setFontSize} min={12} max={120} leftLabel="12px" rightLabel="120px" />
            <div>
              <p style={{ fontSize:11, color:'var(--t3)', marginBottom:8 }}>Weight</p>
              {(() => {
                const support    = getSupportedWeights(fontCatalogue, selectedFonts);
                const restricted = support.filter(ws => ws.status !== 'ok');
                return (
                  <>
                    {/*
                      role="group" + aria-label groups the buttons semantically.
                      Each button's aria-label is "Weight {w}" only — restriction
                      detail lives in the visible note below, connected via
                      aria-describedby so AT reads the same text sighted users see.
                      No hidden text, no duplication.
                      aria-disabled keeps blocked buttons focusable (keyboard
                      users can tab to them and hear why they're unavailable);
                      the onClick guard already prevents activation.
                    */}
                    <div role="group" aria-label="Font weight" style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {support.map(({ weight:w, status, blockingFonts }) => {
                        const active   = fontWeight === w;
                        const disabled = status === 'none';
                        const partial  = status === 'partial';
                        const names    = blockingFonts.join(', ');
                        // aria-label: weight name only. Restriction detail is in the visible
                        // note below (aria-describedby) — not duplicated in hidden text.
                        // title is a secondary hover hint for sighted mouse users only.
                        const ariaLabel = `Weight ${w}`;
                        const tip = blockingFonts.length
                          ? `${names} ${blockingFonts.length > 1 ? "don't" : "doesn't"} support weight ${w}`
                          : undefined;
                        return (
                          <button key={w}
                            aria-disabled={disabled ? 'true' : undefined}
                            aria-pressed={disabled ? undefined : active}
                            aria-label={ariaLabel}
                            aria-describedby={status !== 'ok' ? `weight-note-${w}` : undefined}
                            onClick={() => !disabled && setFontWeight(w)}
                            title={tip}
                            style={{
                              padding:'4px 10px', borderRadius:3,
                              border:`1px solid ${active && !disabled ? 'color-mix(in srgb, var(--primary) 50%, transparent)' : 'var(--b1)'}`,
                              background: active && !disabled ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                              color: disabled ? 'var(--t4)' : active ? 'var(--primary)' : 'var(--t3)',
                              fontSize:11,
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              fontFamily:'Roboto,sans-serif', fontWeight:w,
                              // Opacity alone is not the primary signal — the footer notes
                              // carry the explanation. Opacity just reinforces the state.
                              opacity: disabled ? 0.45 : partial ? 0.85 : 1,
                              position:'relative',
                            }}>
                            {w}
                            {/* aria-hidden: the * is decorative; aria-label carries the meaning */}
                            {partial && <span aria-hidden="true" style={{ fontSize:8, color:'#f59e0b', marginLeft:1, verticalAlign:'super' }}>*</span>}
                          </button>
                        );
                      })}
                    </div>
                    {/* Per-weight notes — specific, always visible, no hover or tooltip needed.
                        Each line names the blocking font(s) so the user knows exactly what to do. */}
                    {restricted.length > 0 && (
                      <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:2 }}>
                        {restricted.map(({ weight:w, status, blockingFonts }) => {
                          const names = blockingFonts.join(', ');
                          return (
                            <p key={w} id={`weight-note-${w}`} style={{ fontSize:9, color:'var(--t4)', lineHeight:1.45, margin:0 }}>
                              {status === 'none'
                                ? <><strong style={{ fontWeight:500, color:'var(--t3)' }}>{w}</strong> — not supported by {names}</>
                                : <><strong style={{ fontWeight:500, color:'var(--t3)' }}>{w}*</strong> — {names} will use nearest weight</>
                              }
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <RangeSlider label="Line height" value={lineHeight} onChange={setLineHeight} min={80} max={200} leftLabel="Tight" rightLabel="Loose" />
            <RangeSlider label="Letter spacing" value={letterSpacing} onChange={setLetterSpacing} min={-50} max={200} leftLabel="Tight" rightLabel="Wide" />
          </div>

          <Divider />

          {/* Custom text */}
          <div>
            <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--t4)', marginBottom:8 }}>Preview text</p>
            <textarea value={customText} onChange={e=>setCustomText(e.target.value)} rows={3} style={{ width:'100%', fontSize:12 }} />
            <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
              {['The quick brown fox','Pack my box with five dozen liquor jugs','Typography is the craft of enduring'].map(t => (
                <Chip key={t} label={t.substring(0,20)+'…'} size="sm" color="neutral" onClick={()=>setCustomText(t)} />
              ))}
            </div>
          </div>
        </div>

        {/* Main preview area */}
        <div style={{ flex:1, overflowY:'auto', padding:24, background:'var(--bg)' }}>
          {selectedFonts.length === 0 ? (
            <EmptyState icon="text_fields" title="Select fonts to preview" description="Choose up to 3 fonts from the sidebar to compare them here." />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns: selectedFonts.length === 1 ? '1fr' : selectedFonts.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr', gap:16 }}>
              {selectedFonts.map(fontName => {
                const fontData = fontCatalogue.find(f=>f.name===fontName);
                if (!fontData) return null;
                return (
                  <PreviewCard
                    key={fontName}
                    font={fontData}
                    template={template}
                    text={customText}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    lineHeight={lineHeight / 100}
                    letterSpacing={letterSpacing / 100}
                    darkBg={darkBg}
                    bgColor={bgColor}
                    textColor={textColor}
                    subColor={subColor}
                    cardBg={cardBg}
                    loadStatus={fontStatus[fontName] || 'loaded'}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Saved panel */}
        {showSaved && (
          <div style={{ width:260, borderLeft:'1px solid var(--b1)', overflowY:'auto', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:500, color:'var(--t1)' }}>Saved comparisons</span>
              <button onClick={()=>setShowSaved(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)' }}>
                <Icon name="close" size={16} />
              </button>
            </div>
            {saved.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--t4)', textAlign:'center', padding:'24px 0' }}>No saves yet</p>
            ) : saved.map((s,i) => (
              <div key={i} style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:6, marginBottom:8, cursor:'pointer' }} onClick={() => {
                  setSelectedFonts(s.fonts);
                  setTemplate(s.template);
                  setCustomText(s.text);
                  // Clamp fontWeight to what the restored fonts actually support
                  const clamped = clampToSupported(fontWeight, fontCatalogue, s.fonts);
                  if (clamped !== fontWeight) setFontWeight(clamped);
                }}>
                <div style={{ fontSize:11, fontWeight:500, color:'var(--t2)', marginBottom:4 }}>{s.fonts.join(' + ')}</div>
                <div style={{ fontSize:10, color:'var(--t4)' }}>{s.template} · {s.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewCard({ font, template, text, fontSize, fontWeight, lineHeight, letterSpacing, darkBg, bgColor, textColor, subColor, cardBg, loadStatus }) {

  // ── Loading state ──────────────────────────────────────────────────────────
  // Render a skeleton instead of a fallback-font canvas. This prevents the
  // UI from silently showing system-ui while the real font downloads.
  if (loadStatus === 'loading') {
    return (
      <div style={{ display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'8px 14px', background:'var(--s2)', borderRadius:'8px 8px 0 0', border:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:8, borderBottom:'none' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b' }} />
          <span style={{ fontSize:12, fontWeight:500, color:'var(--t2)' }}>{font.name}</span>
          <Badge label="Loading…" color="neutral" />
        </div>
        <div style={{ border:'1px solid var(--b1)', borderRadius:'0 0 8px 8px', background:bgColor, minHeight:240, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
          <Icon name="hourglass_top" size={28} style={{ color:'var(--t4)' }} />
          <span style={{ fontSize:12, color:'var(--t4)' }}>Loading font…</span>
        </div>
      </div>
    );
  }

  // ── Failed state ───────────────────────────────────────────────────────────
  // Show an honest error: don't pretend the font applied when it didn't.
  // The user can retry by de-selecting and re-selecting the font in the sidebar.
  if (loadStatus === 'failed') {
    return (
      <div style={{ display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'8px 14px', background:'var(--s2)', borderRadius:'8px 8px 0 0', border:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:8, borderBottom:'none' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--error, #d32f2f)' }} />
          <span style={{ fontSize:12, fontWeight:500, color:'var(--t2)' }}>{font.name}</span>
          <Badge label="Unavailable" color="neutral" />
        </div>
        <div style={{ border:'1px solid var(--b1)', borderRadius:'0 0 8px 8px', background:bgColor, minHeight:240, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, padding:24, textAlign:'center' }}>
          <Icon name="font_download_off" size={32} style={{ color:'var(--t4)' }} />
          <span style={{ fontSize:13, fontWeight:500, color:'var(--t2)' }}>Preview unavailable</span>
          <span style={{ fontSize:11, color:'var(--t4)' }}>{font.name} could not be loaded from Google Fonts</span>
          <span style={{ fontSize:10, color:'var(--t4)', marginTop:4, opacity:.7 }}>Toggle the font in the sidebar to retry</span>
        </div>
      </div>
    );
  }

  // ── Loaded — normal render ─────────────────────────────────────────────────
  const ff = font.family;
  const mainStyle = { fontFamily:ff, fontSize, fontWeight, lineHeight, letterSpacing:`${letterSpacing}em`, color:textColor, wordBreak:'break-word', textWrap:'pretty' };
  const headlineText = text || 'Typography is a craft worth mastering.';
  const bodyText = 'Great typography is invisible to the reader and yet shapes everything they feel about the content. It communicates before a single word is processed.';

  // Phase 3: pick a complementary body family. If the headline font is a serif
  // or display family, use a sans for body; otherwise use a serif. This keeps
  // the article preview legible regardless of which font was selected.
  const isSerifLike = /serif|fraunces|playfair|cormorant|garamond/i.test(font.name) || /serif/i.test(font.family);
  const bodyFamily = isSerifLike ? "'DM Sans', sans-serif" : "'Fraunces', serif";

  const templates = {
    /* Phase 3 — real-context Article template
       Sections: kicker · headline · byline · deck · body (2-col) · pull quote.
       Headline uses the card's font (display/headline), body uses an
       inferred complementary family for readability. */
    article: (
      <div style={{ padding:'36px 36px 32px', background:bgColor, borderRadius:8, minHeight:240 }}>
        <div style={{ fontFamily:'Roboto,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color: darkBg ? '#A87FFF' : '#7BA8FF', marginBottom:14 }}>
          Feature · Typography
        </div>
        <div style={{ ...mainStyle, fontSize: Math.min(fontSize, 44), lineHeight:1.08, letterSpacing:'-.015em', marginBottom:14 }}>
          {headlineText}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, fontFamily:bodyFamily, fontSize:12, color:subColor }}>
          <span style={{ color:textColor, fontWeight:500 }}>By Sam Whitfield</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:subColor, opacity:.6 }} />
          <span>April 2026</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:subColor, opacity:.6 }} />
          <span>6 min read</span>
        </div>
        <div style={{ fontFamily:bodyFamily, fontSize:16, fontWeight:500, lineHeight:1.5, color:textColor, marginBottom:20 }}>
          The choices a typeface makes — its rhythm, its terminals, the way it sits on a page — say more
          about a brand than most logos. Here is how the best teams pick well.
        </div>
        <div style={{ fontFamily:bodyFamily, fontSize:14, fontWeight:400, lineHeight:1.75, color:subColor, columns:2, columnGap:24, marginBottom:18 }}>
          {bodyText} It carries voice without raising it. It earns trust over hundreds of small reading moments,
          most of which the reader will never consciously register. {bodyText.substring(0,120)}…
        </div>
        <div style={{
          borderLeft:`3px solid ${darkBg ? '#A87FFF' : '#7BA8FF'}`,
          paddingLeft:16, margin:'4px 0 4px',
        }}>
          <div style={{ ...mainStyle, fontSize:Math.min(fontSize*0.55, 22), fontWeight:Math.min(fontWeight, 600), lineHeight:1.35, fontStyle:'italic' }}>
            "Type isn't decoration. It's the voice of the writing — slowed down enough to be read."
          </div>
          <div style={{ marginTop:8, fontFamily:bodyFamily, fontSize:11, color:subColor, letterSpacing:'.04em', textTransform:'uppercase' }}>
            — Bryony Lake, Type Director
          </div>
        </div>
      </div>
    ),
    hero: (
      <div style={{ padding:'48px 36px', background:bgColor, borderRadius:8, minHeight:240 }}>
        <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:subColor, marginBottom:16, fontFamily:'Roboto,sans-serif' }}>Hero headline</div>
        <div style={{ ...mainStyle, fontSize: Math.min(fontSize, 56), lineHeight:1.05, marginBottom:20 }}>{headlineText}</div>
        <div style={{ width:40, height:2, background: darkBg ? '#6B9FFF' : '#1976d2', marginBottom:16 }} />
        <div style={{ fontFamily:'Roboto,sans-serif', fontSize:14, color:subColor, lineHeight:1.6 }}>Supporting copy that sits beneath the main headline and reinforces the message.</div>
      </div>
    ),
    body: (
      <div style={{ padding:'36px 32px', background:bgColor, borderRadius:8 }}>
        <div style={{ ...mainStyle, fontSize:Math.min(fontSize,22), fontWeight: Math.min(fontWeight, 500), marginBottom:20, lineHeight:1.35 }}>{headlineText}</div>
        <div style={{ fontFamily:ff, fontSize:Math.max(14, Math.min(18, fontSize*0.4)), fontWeight:400, lineHeight:1.7, color:subColor }}>
          {bodyText} {bodyText}
        </div>
      </div>
    ),
    editorial: (
      <div style={{ padding:'32px 28px', background:bgColor, borderRadius:8 }}>
        <div style={{ fontFamily:'Roboto,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:subColor, marginBottom:12 }}>Editorial · Issue 12</div>
        <div style={{ ...mainStyle, fontSize:Math.min(fontSize,42), lineHeight:1.1, marginBottom:16, fontStyle:'italic' }}>{headlineText}</div>
        <div style={{ height:1, background: darkBg ? 'rgba(255,255,255,0.1)' : '#ddd', marginBottom:16 }} />
        <div style={{ fontFamily:ff, fontSize:Math.max(13,Math.min(17, fontSize*0.38)), fontWeight:400, lineHeight:1.75, color:subColor, columns:2, gap:24 }}>
          {bodyText}
        </div>
      </div>
    ),
    brand: (
      <div style={{ padding:'40px 32px', background:bgColor, borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', minHeight:220, justifyContent:'center' }}>
        <div style={{ ...mainStyle, fontSize:Math.min(fontSize,52), fontWeight:700, letterSpacing:`${(letterSpacing-20)/100}em`, marginBottom:8 }}>BRAND</div>
        <div style={{ width:'60%', height:1, background: darkBg ? 'rgba(255,255,255,0.15)' : '#ccc', marginBottom:12 }} />
        <div style={{ fontFamily:ff, fontSize:Math.max(10,fontSize*0.2), fontWeight:300, letterSpacing:'0.35em', textTransform:'uppercase', color:subColor }}>Established 2024</div>
      </div>
    ),
    mobile: (
      <div style={{ background: darkBg ? '#0f0f18' : '#f0f0f5', borderRadius:12, padding:16, maxWidth:280, margin:'0 auto' }}>
        <div style={{ background:bgColor, borderRadius:10, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ height:120, background: darkBg ? '#252535' : '#e8e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="image" size={32} style={{ color:darkBg ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
          </div>
          <div style={{ padding:16 }}>
            <div style={{ ...mainStyle, fontSize:Math.min(fontSize*0.5, 20), marginBottom:8 }}>{headlineText.split(' ').slice(0,6).join(' ')}</div>
            <div style={{ fontFamily:ff, fontSize:12, color:subColor, lineHeight:1.6 }}>{bodyText.substring(0,100)}…</div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <div style={{ flex:1, padding:'8px 0', background: darkBg ? '#6B9FFF' : '#1976d2', borderRadius:4, textAlign:'center' }}>
                <span style={{ fontFamily:ff, fontSize:12, fontWeight:600, color:'#fff' }}>Read more</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ui: (
      <div style={{ background:bgColor, borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background: darkBg ? '#1a1a28' : '#f0f0f8', borderBottom:`1px solid ${darkBg?'rgba(255,255,255,0.06)':'#ddd'}`, display:'flex', gap:8, alignItems:'center' }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{ width:10,height:10,borderRadius:'50%',background:c }} />)}
        </div>
        <div style={{ padding:20 }}>
          <div style={{ ...mainStyle, fontSize:Math.min(fontSize*0.45,18), marginBottom:16 }}>Dashboard</div>
          {['Overview','Analytics','Settings'].map((item,i) => (
            <div key={item} style={{ display:'flex', alignItems:'center', padding:'10px 12px', borderRadius:6, background: i===0 ? (darkBg?'rgba(107,159,255,0.12)':'rgba(25,118,210,0.08)') : 'transparent', marginBottom:4 }}>
              <Icon name={['grid_view','bar_chart','settings'][i]} size={15} style={{ color: i===0 ? (darkBg?'#6B9FFF':'#1976d2') : subColor, marginRight:10 }} />
              <span style={{ fontFamily:ff, fontSize:Math.max(12,Math.min(16,fontSize*0.3)), color: i===0 ? textColor : subColor }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Card header — uses app chrome tokens, not canvas colors */}
      <div style={{ padding:'8px 14px', background:'var(--s2)', borderRadius:'8px 8px 0 0', border:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:8, borderBottom:'none' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)' }} />
        <span style={{ fontSize:12, fontWeight:500, color:'var(--t2)' }}>{font.name}</span>
        <Badge label={font.type} color="neutral" />
      </div>
      <div style={{ border:'1px solid var(--b1)', borderRadius:'0 0 8px 8px', overflow:'hidden' }}>
        {templates[template] || templates.hero}
      </div>
    </div>
  );
}

Object.assign(window, { PreviewLab });
