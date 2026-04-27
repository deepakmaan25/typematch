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

// Base catalogue — always available (pre-loaded in HTML head via Google Fonts)
const ALL_PREVIEW_FONTS = [
  { name:'Playfair Display', family:"'Playfair Display',serif",       type:'Serif' },
  { name:'DM Sans',          family:"'DM Sans',sans-serif",           type:'Sans' },
  { name:'Fraunces',         family:"'Fraunces',serif",               type:'Serif' },
  { name:'Space Grotesk',    family:"'Space Grotesk',sans-serif",     type:'Sans' },
  { name:'Cormorant Garamond',family:"'Cormorant Garamond',serif",    type:'Serif' },
  { name:'Syne',             family:"'Syne',sans-serif",              type:'Display' },
];

// Convert a results/inspector font object → preview catalogue entry
function toPreviewEntry(font) {
  return {
    name: font.name,
    // Results fonts carry fontFamily as a CSS string; fall back to a safe default
    family: font.fontFamily || `'${font.name}', sans-serif`,
    type: font.classification || 'Custom',
    injected: true,   // mark so the sidebar can show a visual hint
  };
}

// Ensure a Google Font is loaded; safe to call repeatedly (idempotent)
function ensureFontLoaded(name) {
  const id = `gf-inject-${name.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Build the initial working catalogue: base + injected font if not already present
function buildCatalogue(font) {
  if (!font?.name) return ALL_PREVIEW_FONTS;
  if (ALL_PREVIEW_FONTS.some(f => f.name === font.name)) return ALL_PREVIEW_FONTS;
  return [toPreviewEntry(font), ...ALL_PREVIEW_FONTS];
}

function PreviewLab({ initialFont }) {
  // fontCatalogue = base list + any fonts injected from Results / Inspector.
  // Stored in state so new injections trigger a re-render of the sidebar.
  const [fontCatalogue, setFontCatalogue] = useState(() => buildCatalogue(initialFont));

  const [selectedFonts, setSelectedFonts] = useState(() => {
    if (!initialFont?.name) return ['Playfair Display', 'DM Sans'];
    // initialFont is guaranteed to be in the catalogue we just built
    return [initialFont.name];
  });

  // When initialFont changes (user opens a different font in Preview from the
  // Inspector), inject the font if missing and auto-select it immediately.
  useEffect(() => {
    if (!initialFont?.name) return;
    const name = initialFont.name;
    setFontCatalogue(prev => {
      if (prev.some(f => f.name === name)) return prev;
      ensureFontLoaded(name);
      return [toPreviewEntry(initialFont), ...prev];
    });
    setSelectedFonts([name]);
  }, [initialFont?.name]);
  const [template,     setTemplate]     = useState('article');
  const [darkBg,       setDarkBg]       = useState(false);
  const [fontSize,     setFontSize]     = useState(48);
  const [fontWeight,   setFontWeight]   = useState(700);
  const [lineHeight,   setLineHeight]   = useState(120);
  const [letterSpacing,setLetterSpacing]= useState(0);
  const [customText,   setCustomText]   = useState('The craft of beautiful typography starts here.');
  const [saved,        setSaved]        = useState([]);
  const [showSaved,    setShowSaved]    = useState(false);

  function toggleFont(name) {
    setSelectedFonts(prev => prev.includes(name)
      ? prev.filter(n=>n!==name)
      : prev.length < 3 ? [...prev,name] : [prev[1],prev[2]||name,name].slice(-3));
  }

  function saveComparison() {
    setSaved(s => [...s, { fonts:selectedFonts, template, text:customText, time:new Date().toLocaleTimeString() }]);
  }

  // Canvas-level bg/text colors — controlled by the darkBg canvas toggle,
  // independent of the app shell theme. UI chrome uses CSS custom properties.
  const bgColor   = darkBg ? '#0f0f16'              : '#ffffff';
  const textColor = darkBg ? 'rgba(255,255,255,0.92)' : '#111118';
  const subColor  = darkBg ? 'rgba(255,255,255,0.45)' : '#666680';
  const cardBg    = darkBg ? '#1a1a26'              : '#f5f5f8';

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
                const sel = selectedFonts.includes(f.name);
                return (
                  <button key={f.name} onClick={()=>toggleFont(f.name)}
                    style={{
                      display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:6,
                      border:`1px solid ${sel ? 'color-mix(in srgb, var(--primary) 40%, transparent)' : 'var(--b1)'}`,
                      background: sel ? 'color-mix(in srgb, var(--primary) 9%, transparent)' : 'transparent',
                      cursor:'pointer', transition:'all 0.15s', color:'inherit',
                    }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: sel ? 'var(--primary)' : 'var(--t4)', flexShrink:0 }} />
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontSize:12, color: sel ? 'var(--t1)' : 'var(--t2)', fontWeight: sel ? 500 : 400 }}>{f.name}</div>
                      <div style={{ fontSize:10, color:'var(--t4)' }}>
                        {f.type}
                        {f.injected && <span style={{ marginLeft:5, color:'var(--primary)', opacity:.7 }}>· from results</span>}
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
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {[300,400,500,700].map(w => {
                  const active = fontWeight === w;
                  return (
                    <button key={w} onClick={()=>setFontWeight(w)}
                      style={{
                        padding:'4px 10px', borderRadius:3,
                        border:`1px solid ${active ? 'color-mix(in srgb, var(--primary) 50%, transparent)' : 'var(--b1)'}`,
                        background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                        color: active ? 'var(--primary)' : 'var(--t3)',
                        fontSize:11, cursor:'pointer', fontFamily:'Roboto,sans-serif', fontWeight:w,
                      }}>
                      {w}
                    </button>
                  );
                })}
              </div>
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
              <div key={i} style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:6, marginBottom:8, cursor:'pointer' }} onClick={()=>{setSelectedFonts(s.fonts);setTemplate(s.template);setCustomText(s.text);}}>
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

function PreviewCard({ font, template, text, fontSize, fontWeight, lineHeight, letterSpacing, darkBg, bgColor, textColor, subColor, cardBg }) {
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
