// tm-pairing-studio.jsx — Full pairing workspace
const { useState, useRef, useEffect } = React;

const STUDIO_MODES = [
  { id:'single',    label:'Single',       icon:'title',            slots:['Display'] },
  { id:'pairing',   label:'Pairing',      icon:'compare',          slots:['Headline','Body'] },
  { id:'ui',        label:'UI System',    icon:'web_asset',        slots:['Interface','Content'] },
  { id:'brand',     label:'Brand',        icon:'workspace_premium',slots:['Display','Supporting','Accent'] },
  { id:'editorial', label:'Editorial',    icon:'article',          slots:['Title','Deck','Body','Caption'] },
  { id:'typesystem',label:'Type System',  icon:'format_size',      slots:['H1','H2','Body','Button','Label'] },
];

const SLOT_DEFAULTS = {
  Display:    { size:64, weight:700, lineHeight:105, tracking:-2, color:'var(--t1)' },
  Headline:   { size:48, weight:700, lineHeight:110, tracking:-1, color:'var(--t1)' },
  Body:       { size:16, weight:400, lineHeight:170, tracking:0,  color:'var(--t2)' },
  Interface:  { size:14, weight:500, lineHeight:150, tracking:0,  color:'var(--t1)' },
  Content:    { size:15, weight:400, lineHeight:165, tracking:0,  color:'var(--t2)' },
  Supporting: { size:18, weight:400, lineHeight:150, tracking:0,  color:'var(--t2)' },
  Accent:     { size:12, weight:600, lineHeight:150, tracking:8,  color:'var(--primary)' },
  Title:      { size:52, weight:700, lineHeight:105, tracking:-2, color:'var(--t1)' },
  Deck:       { size:20, weight:400, lineHeight:155, tracking:0,  color:'var(--t2)' },
  Caption:    { size:11, weight:400, lineHeight:155, tracking:2,  color:'var(--t3)' },
  H1:         { size:48, weight:700, lineHeight:110, tracking:-1, color:'var(--t1)' },
  H2:         { size:32, weight:600, lineHeight:120, tracking:-1, color:'var(--t1)' },
  Button:     { size:13, weight:600, lineHeight:150, tracking:4,  color:'#09090F' },
  Label:      { size:11, weight:500, lineHeight:150, tracking:6,  color:'var(--t3)' },
};

const CANVAS_BG = [
  { id:'dark',      label:'Dark',       bg:'#09090F', text:'rgba(255,255,255,0.92)' },
  { id:'surface',   label:'Surface',    bg:'#16171F', text:'rgba(255,255,255,0.90)' },
  { id:'light',     label:'Light',      bg:'#F5F4F0', text:'rgba(10,10,18,0.90)' },
  { id:'white',     label:'White',      bg:'#FFFFFF', text:'rgba(10,10,18,0.90)' },
  { id:'warm',      label:'Warm',       bg:'#FAF6EF', text:'rgba(30,20,10,0.85)' },
  { id:'brand',     label:'Brand',      bg:'#0D1829', text:'rgba(123,168,255,0.92)' },
];

const ALL_FONTS = [
  { name:'Playfair Display',  family:"'Playfair Display',serif",        type:'Serif',   suggestion:['DM Sans','Space Grotesk'] },
  { name:'DM Sans',           family:"'DM Sans',sans-serif",            type:'Sans',    suggestion:['Playfair Display','Fraunces','DM Serif Display'] },
  { name:'Fraunces',          family:"'Fraunces',serif",                type:'Serif',   suggestion:['DM Sans','Space Grotesk'] },
  { name:'Space Grotesk',     family:"'Space Grotesk',sans-serif",      type:'Sans',    suggestion:['Libre Baskerville','Playfair Display'] },
  { name:'Cormorant Garamond',family:"'Cormorant Garamond',serif",      type:'Serif',   suggestion:['DM Sans','Syne'] },
  { name:'Syne',              family:"'Syne',sans-serif",               type:'Display', suggestion:['DM Sans','Cormorant Garamond'] },
  { name:'Libre Baskerville', family:"'Libre Baskerville',serif",       type:'Serif',   suggestion:['Space Grotesk','DM Sans'] },
  { name:'DM Serif Display',  family:"'DM Serif Display',serif",        type:'Serif',   suggestion:['DM Sans','Inter'] },
  { name:'Inter',             family:"'Inter',sans-serif",              type:'Sans',    suggestion:['Fraunces','DM Serif Display'] },
];

const SAMPLE_TEXTS = {
  Display:    'The art of beautiful typography',
  Headline:   'Design thinking for the modern era',
  Body:       'Great typography communicates before a single word is processed. It shapes perception, guides attention, and earns trust through its precision and restraint.',
  Interface:  'Dashboard · Analytics · Settings',
  Content:    'Your subscription renews on March 1. All features included. No hidden fees.',
  Supporting: 'Est. 2024 · Crafted with intention',
  Accent:     'NEW FEATURE',
  Title:      'The New Standard in Typography',
  Deck:       'A deeper investigation into how type systems shape brand perception and reader trust.',
  Caption:    'Figure 1. Specimen demonstrating contrast ratios across optical sizes.',
  H1:         'Build something great',
  H2:         'Start with the right foundation',
  Button:     'Get started',
  Label:      'FIELD LABEL',
};

function PairingStudio({ initialFont }) {
  const [mode,      setMode]      = useState('pairing');
  const [slotFonts, setSlotFonts] = useState({});
  const [slotProps, setSlotProps] = useState({});
  const [lockedSlot,setLockedSlot]= useState(null);
  const [bgId,      setBgId]      = useState('dark');
  const [context,   setContext]   = useState('desktop');
  const [activeSlot,setActiveSlot]= useState(null);
  const [saved,     setSaved]     = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [savedSnack,setSavedSnack]= useState(false);
  const [customTexts,setCustomTexts]=useState({});

  const modeObj = STUDIO_MODES.find(m=>m.id===mode) || STUDIO_MODES[1];
  const slots = modeObj.slots;
  const bgObj = CANVAS_BG.find(b=>b.id===bgId) || CANVAS_BG[0];

  useEffect(() => {
    // Set defaults when mode changes
    const defaults = {};
    slots.forEach(s => { if (!slotFonts[s]) defaults[s] = getFontForSlot(s); });
    if (Object.keys(defaults).length) setSlotFonts(f=>({...f,...defaults}));
    setActiveSlot(slots[0]);
  }, [mode]);

  useEffect(() => {
    if (initialFont && slots[0] && !slotFonts[slots[0]]) {
      setSlotFonts(f=>({...f,[slots[0]]:initialFont.name||'Playfair Display'}));
    }
  }, [initialFont]);

  function getFontForSlot(slot) {
    const serifs = ['Headline','Title','H1','H2','Display'];
    return serifs.includes(slot) ? 'Playfair Display' : 'DM Sans';
  }

  function getSlotFont(slot) {
    return ALL_FONTS.find(f=>f.name===slotFonts[slot]) || ALL_FONTS[0];
  }

  function getSlotProp(slot, prop) {
    const def = SLOT_DEFAULTS[slot] || SLOT_DEFAULTS.Body;
    return (slotProps[slot]||{})[prop] ?? def[prop];
  }

  function setSlotProp(slot, prop, val) {
    setSlotProps(p=>({ ...p, [slot]:{ ...(p[slot]||{}), [prop]:val } }));
  }

  function suggestPair(slot) {
    const font = getSlotFont(slot);
    const suggestions = font.suggestion || [];
    if (suggestions.length === 0) return;
    const otherSlots = slots.filter(s=>s!==slot);
    if (otherSlots.length > 0) {
      setSlotFonts(f=>({ ...f, [otherSlots[0]]: suggestions[0] }));
    }
  }

  function swapSlots(a, b) {
    setSlotFonts(f=>({ ...f, [a]:f[b]||getFontForSlot(a), [b]:f[a]||getFontForSlot(b) }));
  }

  function saveCombination() {
    setSaved(s=>[...s, { mode, slots:{ ...slotFonts }, bg:bgId, time:new Date().toLocaleTimeString() }]);
    setSavedSnack(true);
    setTimeout(()=>setSavedSnack(false), 2200);
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Top toolbar */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', flexShrink:0 }}>
        <h2 style={{ fontSize:16, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)', marginRight:4 }}>Pairing Studio</h2>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {STUDIO_MODES.map(m=>(
            <Chip key={m.id} label={m.label} icon={m.icon} selected={mode===m.id} onClick={()=>setMode(m.id)} size="sm" color="neutral" />
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          {/* Background picker */}
          <div style={{ display:'flex', gap:4, padding:'4px 8px', background:'var(--s2)', borderRadius:'var(--r-md)', border:'1px solid var(--b1)' }}>
            {CANVAS_BG.map(bg=>(
              <Tooltip key={bg.id} text={bg.label}>
                <button onClick={()=>setBgId(bg.id)}
                  style={{ width:16, height:16, borderRadius:'50%', background:bg.bg, border:`2px solid ${bgId===bg.id ? 'var(--primary)' : 'var(--b2)'}`, cursor:'pointer', transition:'all .15s' }} />
              </Tooltip>
            ))}
          </div>
          {/* Context */}
          <div style={{ display:'flex', background:'var(--s2)', borderRadius:'var(--r-md)', border:'1px solid var(--b1)', padding:3, gap:2 }}>
            {[['desktop','desktop_windows'],['mobile','smartphone']].map(([c,ic])=>(
              <button key={c} onClick={()=>setContext(c)}
                style={{ padding:'3px 8px', borderRadius:'var(--r-sm)', border:'none', background:context===c?'var(--s4)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:4, color:context===c?'var(--t1)':'var(--t3)', transition:'all .15s' }}>
                <Icon name={ic} size={13} />
              </button>
            ))}
          </div>
          <Btn variant="ghost" size="sm" startIcon="bookmark" onClick={saveCombination}>Save</Btn>
          {saved.length>0 && <Btn variant="tonal" size="sm" onClick={()=>setShowSaved(s=>!s)}>{saved.length} saved</Btn>}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* LEFT: Font slot controls */}
        <div style={{ width:256, borderRight:'1px solid var(--b1)', overflowY:'auto', padding:'14px 14px', display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
          {slots.map((slot, idx) => {
            const fontObj  = getSlotFont(slot);
            const isActive = activeSlot === slot;
            const isLocked = lockedSlot === slot;
            return (
              <div key={slot}>
                <div onClick={()=>setActiveSlot(slot)}
                  style={{ padding:'12px 14px', borderRadius:'var(--r-lg)', border:`1px solid ${isActive?'rgba(123,168,255,0.4)':isLocked?'rgba(45,212,160,0.3)':'var(--b1)'}`, background:isActive?'var(--primary-dim)':isLocked?'var(--teal-dim)':'var(--s2)', cursor:'pointer', transition:'all .15s', marginBottom:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <SectionLabel>{slot}</SectionLabel>
                    <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
                      <Tooltip text={isLocked?'Unlock slot':'Lock this slot'}>
                        <button onClick={e=>{e.stopPropagation();setLockedSlot(isLocked?null:slot);}} style={{ width:24, height:24, borderRadius:'var(--r-sm)', border:'none', background:isLocked?'rgba(45,212,160,0.2)':'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:isLocked?'var(--teal)':'var(--t3)' }}>
                          <Icon name={isLocked?'lock':'lock_open'} size={12} />
                        </button>
                      </Tooltip>
                      {slots.length > 1 && idx < slots.length - 1 && (
                        <Tooltip text={`Swap with ${slots[idx+1]}`}>
                          <button onClick={e=>{e.stopPropagation();swapSlots(slot,slots[idx+1]);}} style={{ width:24, height:24, borderRadius:'var(--r-sm)', border:'none', background:'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)' }}>
                            <Icon name="swap_vert" size={12} />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  {/* Font select */}
                  <select value={slotFonts[slot]||'DM Sans'} onChange={e=>setSlotFonts(f=>({...f,[slot]:e.target.value}))}
                    onClick={e=>e.stopPropagation()}
                    style={{ width:'100%', marginBottom:6, fontSize:13, padding:'7px 10px', fontFamily:`'${slotFonts[slot]||'DM Sans'}',sans-serif`, background:'var(--bg)', border:'1px solid var(--b2)', borderRadius:'var(--r-sm)', color:'var(--t1)' }}>
                    {ALL_FONTS.map(f=><option key={f.name} value={f.name} style={{ fontFamily:f.family }}>{f.name}</option>)}
                  </select>
                  <p style={{ fontSize:11, color:'var(--t3)', fontFamily:fontObj.family, lineHeight:1.2 }}>{SAMPLE_TEXTS[slot]?.substring(0,28) || 'Preview text'}</p>
                </div>

                {/* Expanded controls when active */}
                {isActive && (
                  <div style={{ padding:'12px 14px', background:'var(--s3)', borderRadius:'0 0 var(--r-lg) var(--r-lg)', border:'1px solid var(--b1)', borderTop:'none', display:'flex', flexDirection:'column', gap:10, marginBottom:6 }}>
                    <RangeSlider label="Size" value={getSlotProp(slot,'size')} onChange={v=>setSlotProp(slot,'size',v)} min={8} max={120} unit="px" />
                    <div>
                      <SectionLabel style={{ marginBottom:6 }}>Weight</SectionLabel>
                      <div style={{ display:'flex', gap:4 }}>
                        {[300,400,500,600,700].map(w=>(
                          <button key={w} onClick={()=>setSlotProp(slot,'weight',w)}
                            style={{ flex:1, padding:'4px 0', fontSize:10, borderRadius:'var(--r-sm)', border:`1px solid ${getSlotProp(slot,'weight')===w?'rgba(123,168,255,0.5)':'var(--b1)'}`, background:getSlotProp(slot,'weight')===w?'var(--primary-dim)':'transparent', color:getSlotProp(slot,'weight')===w?'var(--primary)':'var(--t3)', cursor:'pointer', fontFamily:'var(--font-ui)', fontWeight:w }}>
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <RangeSlider label="Leading" value={getSlotProp(slot,'lineHeight')} onChange={v=>setSlotProp(slot,'lineHeight',v)} min={80} max={220} unit="%" />
                    <RangeSlider label="Tracking" value={getSlotProp(slot,'tracking')} onChange={v=>setSlotProp(slot,'tracking',v)} min={-10} max={50} unit="" />
                    {/* Auto-suggest */}
                    {slots.length > 1 && fontObj.suggestion?.length > 0 && (
                      <div>
                        <SectionLabel style={{ marginBottom:6 }}>Suggested pairs</SectionLabel>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                          {fontObj.suggestion.map(sug => (
                            <Chip key={sug} label={sug} size="sm" color="ai"
                              onClick={()=>{ const other = slots.find(s=>s!==slot&&s!==lockedSlot); if(other) setSlotFonts(f=>({...f,[other]:sug})); }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Divider style={{ margin:'6px 0' }} />

          {/* Custom preview text toggle */}
          <div style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)', border:'1px solid var(--b1)' }}>
            <SectionLabel style={{ marginBottom:7 }}>Custom preview text</SectionLabel>
            {activeSlot && (
              <textarea rows={2} value={customTexts[activeSlot]||''} onChange={e=>setCustomTexts(t=>({...t,[activeSlot]:e.target.value}))} placeholder={SAMPLE_TEXTS[activeSlot]||'Type here…'} style={{ fontSize:12, padding:'7px 10px' }} />
            )}
          </div>
        </div>

        {/* CENTER: Canvas */}
        <div style={{ flex:1, overflowY:'auto', padding:24, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth: context==='mobile' ? 375 : 900, transition:'max-width .3s cubic-bezier(.4,0,.2,1)' }}>
            <PairingCanvas mode={mode} slots={slots} slotFonts={slotFonts} slotProps={slotProps} getSlotProp={getSlotProp} bgObj={bgObj} context={context} customTexts={customTexts} />
          </div>
        </div>

        {/* RIGHT: Saved panel */}
        {showSaved && (
          <div style={{ width:240, borderLeft:'1px solid var(--b1)', overflowY:'auto', padding:16, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--t1)', fontFamily:'var(--font-accent)' }}>Saved</span>
              <button onClick={()=>setShowSaved(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--t3)' }}><Icon name="close" size={15} /></button>
            </div>
            {saved.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--t3)', padding:'20px 0', textAlign:'center' }}>No saves yet</p>
            ) : saved.map((s,i)=>(
              <div key={i} onClick={()=>{setMode(s.mode);setSlotFonts(s.slots);setBgId(s.bg);}}
                style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)', marginBottom:8, cursor:'pointer', border:'1px solid var(--b1)', transition:'all .15s' }}>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--t2)', marginBottom:3 }}>{s.mode}</p>
                <p style={{ fontSize:10, color:'var(--t3)', lineHeight:1.5 }}>{Object.values(s.slots).filter(Boolean).join(' + ')}</p>
                <p style={{ fontSize:9, color:'var(--t4)', marginTop:3 }}>{s.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Snackbar message="Combination saved!" show={savedSnack} type="success" />
    </div>
  );
}

/* ── Canvas renderer ────────────────────────────────────── */
function PairingCanvas({ mode, slots, slotFonts, slotProps, getSlotProp, bgObj, context, customTexts }) {
  const getFF  = slot => { const f=ALL_FONTS.find(x=>x.name===slotFonts[slot]); return f?f.family:"'DM Sans',sans-serif"; };
  const text   = slot => customTexts[slot] || SAMPLE_TEXTS[slot] || '';
  const sz     = slot => getSlotProp(slot,'size');
  const wt     = slot => getSlotProp(slot,'weight');
  const lh     = slot => `${getSlotProp(slot,'lineHeight')}%`;
  const ls     = slot => `${getSlotProp(slot,'tracking')/100}em`;
  const clr    = slot => { const c = getSlotProp(slot,'color'); return c && c!=='var(--t1)' && c!=='var(--t2)' && c!=='var(--t3)' ? c : bgObj.text; };

  const canvasStyle = { background:bgObj.bg, borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--shadow-lg)', minHeight:400, transition:'background .3s' };

  if (mode === 'single') return (
    <div style={{ ...canvasStyle, padding:'64px 56px' }}>
      <div style={{ fontFamily:getFF('Display'), fontSize:sz('Display'), fontWeight:wt('Display'), lineHeight:lh('Display'), letterSpacing:ls('Display'), color:clr('Display'), marginBottom:32 }}>{text('Display')}</div>
      <div style={{ width:48, height:2, background:'var(--primary)', marginBottom:28 }} />
      <div style={{ fontSize:18, fontFamily:getFF('Display'), fontWeight:300, color:bgObj.text+'80', lineHeight:1.7 }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 !@#$%&amp;*()</div>
    </div>
  );

  if (mode === 'pairing') return (
    <div style={{ ...canvasStyle, padding:'56px 52px' }}>
      <p style={{ fontFamily:'var(--font-accent)', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:bgObj.text+'55', marginBottom:20 }}>Feature · April 2025</p>
      <div style={{ fontFamily:getFF('Headline'), fontSize:sz('Headline'), fontWeight:wt('Headline'), lineHeight:lh('Headline'), letterSpacing:ls('Headline'), color:clr('Headline'), marginBottom:24 }}>{text('Headline')}</div>
      <div style={{ width:40, height:2, background:'var(--primary)', marginBottom:24 }} />
      <div style={{ fontFamily:getFF('Body'), fontSize:sz('Body'), fontWeight:wt('Body'), lineHeight:lh('Body'), letterSpacing:ls('Body'), color:bgObj.text+'90', marginBottom:18 }}>{text('Body')}</div>
      <div style={{ fontFamily:getFF('Body'), fontSize:sz('Body'), fontWeight:wt('Body'), lineHeight:lh('Body'), color:bgObj.text+'65' }}>Typography shapes the experience of reading long before meaning is extracted. The choice of typeface establishes trust, signals expertise, and defines the voice of the content before a single sentence is considered.</div>
      <div style={{ marginTop:32, display:'flex', gap:8 }}>
        <div style={{ padding:'10px 22px', background:'var(--primary)', borderRadius:4, fontFamily:getFF('Body'), fontSize:13, fontWeight:600, color:'#09090F', display:'inline-block' }}>Read more</div>
        <div style={{ padding:'10px 22px', border:'1px solid '+bgObj.text+'30', borderRadius:4, fontFamily:getFF('Body'), fontSize:13, color:bgObj.text+'70', display:'inline-block' }}>Share</div>
      </div>
    </div>
  );

  if (mode === 'ui') return (
    <div style={{ ...canvasStyle }}>
      <div style={{ padding:'12px 20px', background:bgObj.bg+'ee', borderBottom:'1px solid '+bgObj.text+'10', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontFamily:getFF('Interface'), fontSize:15, fontWeight:700, color:clr('Interface') }}>AppName</span>
        {['Home','Analytics','Settings'].map(n=><span key={n} style={{ fontSize:sz('Interface'), fontFamily:getFF('Interface'), fontWeight:wt('Interface'), color:bgObj.text+'55', marginLeft:14 }}>{n}</span>)}
      </div>
      <div style={{ padding:'32px 28px' }}>
        <div style={{ fontFamily:getFF('Interface'), fontSize:sz('Interface')*1.4, fontWeight:700, color:clr('Interface'), marginBottom:8 }}>Dashboard</div>
        <div style={{ fontFamily:getFF('Content'), fontSize:sz('Content'), fontWeight:wt('Content'), lineHeight:lh('Content'), color:bgObj.text+'70', marginBottom:28 }}>{text('Content')}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          {['Visitors','Conversions','Revenue'].map((k,i)=>(
            <div key={k} style={{ padding:'18px 16px', background:bgObj.text+'07', borderRadius:'var(--r-lg)', border:'1px solid '+bgObj.text+'0a' }}>
              <div style={{ fontFamily:getFF('Interface'), fontSize:11, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase', color:bgObj.text+'45', marginBottom:8 }}>{k}</div>
              <div style={{ fontFamily:getFF('Interface'), fontSize:24, fontWeight:700, color:clr('Interface') }}>{['12.4k','3.2%','$48k'][i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (mode === 'brand') return (
    <div style={{ ...canvasStyle, padding:'72px 56px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <div style={{ fontFamily:getFF('Display'), fontSize:sz('Display'), fontWeight:900, letterSpacing:'-0.04em', color:clr('Display'), lineHeight:1 }}>BRAND</div>
      <div style={{ width:'50%', height:1, background:bgObj.text+'25' }} />
      <div style={{ fontFamily:getFF('Supporting'), fontSize:sz('Supporting'), fontWeight:wt('Supporting'), color:bgObj.text+'70', letterSpacing:'0.04em' }}>{text('Supporting')}</div>
      <div style={{ fontFamily:getFF('Accent'), fontSize:sz('Accent'), fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--primary)', marginTop:12 }}>{text('Accent')}</div>
    </div>
  );

  if (mode === 'editorial') return (
    <div style={{ ...canvasStyle, padding:'52px 48px' }}>
      <p style={{ fontFamily:'var(--font-accent)', fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:bgObj.text+'45', marginBottom:18 }}>Cover Story</p>
      <div style={{ fontFamily:getFF('Title'), fontSize:Math.min(sz('Title'),48), fontWeight:wt('Title'), lineHeight:lh('Title'), letterSpacing:ls('Title'), color:clr('Title'), marginBottom:18 }}>{text('Title')}</div>
      <div style={{ fontFamily:getFF('Deck'), fontSize:sz('Deck'), fontWeight:wt('Deck'), lineHeight:lh('Deck'), color:bgObj.text+'75', marginBottom:24, maxWidth:'80%' }}>{text('Deck')}</div>
      <div style={{ height:1, background:bgObj.text+'15', marginBottom:24 }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div style={{ fontFamily:getFF('Body'), fontSize:sz('Body'), fontWeight:wt('Body'), lineHeight:lh('Body'), color:bgObj.text+'80' }}>{text('Body')}</div>
        <div style={{ fontFamily:getFF('Body'), fontSize:sz('Body'), fontWeight:wt('Body'), lineHeight:lh('Body'), color:bgObj.text+'80' }}>Typography is the craft of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, and line lengths.</div>
      </div>
      <p style={{ fontFamily:getFF('Caption'), fontSize:sz('Caption'), color:bgObj.text+'40', marginTop:20, fontStyle:'italic' }}>{text('Caption')}</p>
    </div>
  );

  if (mode === 'typesystem') return (
    <div style={{ ...canvasStyle, padding:'44px 48px', display:'flex', flexDirection:'column', gap:20 }}>
      <p style={{ fontFamily:'var(--font-accent)', fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:bgObj.text+'40', marginBottom:4 }}>Type System Preview</p>
      {['H1','H2','Body','Button','Label'].map(s => (
        <div key={s} style={{ display:'flex', alignItems:'baseline', gap:20, paddingBottom:16, borderBottom:'1px solid '+bgObj.text+'08' }}>
          <span style={{ width:56, fontSize:9, fontFamily:'var(--font-accent)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color:bgObj.text+'35', flexShrink:0 }}>{s}</span>
          <div style={{ fontFamily:getFF(s), fontSize:sz(s), fontWeight:wt(s), lineHeight:lh(s), letterSpacing:ls(s), color:s==='Button'?'var(--primary)':s==='Label'?bgObj.text+'45':clr(s), textTransform:s==='Button'||s==='Label'?'uppercase':undefined }}>
            {customTexts[s] || SAMPLE_TEXTS[s]}
          </div>
          <span style={{ marginLeft:'auto', fontSize:9, color:bgObj.text+'25', flexShrink:0, fontFamily:'var(--font-ui)' }}>{getFF(s).split("'")[1] || 'Font'} · {sz(s)}px · {wt(s)}</span>
        </div>
      ))}
    </div>
  );

  return null;
}

Object.assign(window, { PairingStudio });
