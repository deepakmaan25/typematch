// tm-app.jsx v2 — Redesigned shell, home dashboard, updated nav
const { useState, useEffect } = React;

// Nav labels aligned to audit IA (Brief / Library / Pairings) — route IDs unchanged
// so every existing flow still resolves. New IA names live in `label`; legacy names
// remain reachable via the same `id` keys for graceful fallback.
const NAV_ITEMS = [
  { id:'home',       icon:'home',                 label:'Home' },
  { id:'recommend',  icon:'auto_awesome',         label:'Brief' },
  { id:'pairing',    icon:'tune',                 label:'Pairings' },
  { id:'preview',    icon:'menu_book',            label:'Preview' },
  { id:'collection', icon:'collections_bookmark', label:'Library' },
  { id:'addfonts',   icon:'add_circle',           label:'Add Fonts' },
  { id:'saved',      icon:'bookmark',             label:'Saved' },
  { id:'settings',   icon:'settings',             label:'Settings' },
];

/* ── Home dashboard ─────────────────────────────────────── */
function HomeView({ collection, onNavigate }) {
  const [specimenIdx, setSpecimenIdx] = useState(0);
  const [specFading,  setSpecFading]  = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSpecFading(true);
      setTimeout(() => { setSpecimenIdx(i=>(i+1)%collection.length); setSpecFading(false); }, 300);
    }, 3200);
    return () => clearInterval(t);
  }, [collection.length]);

  const sf = collection[specimenIdx];
  const avgRead = Math.round(collection.reduce((s,f)=>s+(f.readability||0),0)/collection.length);

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'24px 28px' }}>

      {/* Hero specimen block */}
      <div style={{ background:'var(--s2)', borderRadius:'var(--r-xl)', border:'1px solid var(--b1)', overflow:'hidden', marginBottom:22, position:'relative' }}>
        <div style={{ padding:'36px 40px 28px', display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'end' }}>
          <div>
            <SectionLabel style={{ marginBottom:14 }}>Collection specimen</SectionLabel>
            <div style={{ opacity:specFading?0:1, transition:'opacity .3s ease' }}>
              <div style={{ fontFamily:sf?.fontFamily, fontSize:'clamp(36px,4vw,60px)', fontWeight:sf?.classification==='Sans-serif'?500:700, color:'var(--t1)', lineHeight:1.05, letterSpacing:'-.02em', marginBottom:10 }}>
                {sf?.previewText || 'The art of type'}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:13, color:'var(--t3)', fontFamily:'var(--font-ui)' }}>{sf?.name}</span>
                <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--t4)', display:'inline-block' }} />
                <Badge label={sf?.classification||'Font'} color="neutral" />
                {sf?.variable && <Badge label="Variable" color="primary" dot />}
                <span style={{ fontSize:12, color:'var(--t4)' }}>Readability {sf?.readability}/100</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'flex-end' }}>
            <Btn onClick={()=>onNavigate('recommend')} endIcon="auto_awesome">Find a match</Btn>
            <Btn variant="tonal" size="sm" onClick={()=>onNavigate('pairing')} startIcon="tune">Open in Studio</Btn>
          </div>
        </div>
        {/* Font dots */}
        <div style={{ padding:'0 40px 18px', display:'flex', gap:5 }}>
          {collection.map((_,i)=>(
            <div key={i} onClick={()=>{setSpecimenIdx(i);}} style={{ width:i===specimenIdx?20:5, height:5, borderRadius:'var(--r-pill)', background:i===specimenIdx?'var(--primary)':'var(--b2)', transition:'all .3s', cursor:'pointer' }} />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
        {[
          { v:collection.length,  l:'fonts curated',    c:'var(--purple)', icon:'collections_bookmark' },
          { v:`${avgRead}`,        l:'avg readability',  c:'var(--primary)', icon:'visibility' },
          { v:collection.filter(f=>f.variable).length, l:'variable fonts', c:'var(--teal)', icon:'tune' },
          { v:collection.filter(f=>f.license?.includes('OFL')).length, l:'open source', c:'var(--warm)', icon:'open_in_new' },
        ].map((s,i)=>(
          <div key={s.l} className="fade-up md3-elevation"
            style={{ animationDelay:`${i*.06}s`, padding:'18px 20px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', cursor:'default', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle, color-mix(in srgb,${s.c} 18%,transparent) 0%, transparent 70%)`, pointerEvents:'none' }} />
            <Icon name={s.icon} size={18} style={{ color:s.c, marginBottom:8, display:'block', position:'relative' }} />
            <div style={{ fontSize:28, fontWeight:800, color:s.c, fontFamily:'var(--font-accent)', marginBottom:3, lineHeight:1, position:'relative' }}>{s.v}</div>
            <div style={{ fontSize:11, color:'var(--t4)', lineHeight:1.4, position:'relative' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Two-column: quick actions + recent */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        {/* Quick actions */}
        <div>
          <SectionLabel style={{ marginBottom:12 }}>Quick actions</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { icon:'auto_awesome',         color:'var(--primary)', bg:'var(--primary-dim)',  label:'New recommendation',   sub:'Describe your need, get matches.',       action:'recommend' },
              { icon:'tune',                  color:'var(--teal)',    bg:'var(--teal-dim)',     label:'Open Pairing Studio',  sub:'Test and compose font combinations.',    action:'pairing' },
              { icon:'add_circle',            color:'var(--purple)',  bg:'var(--purple-dim)',   label:'Add fonts',            sub:'Upload, import, or detect local fonts.', action:'addfonts' },
            ].map(a=>(
              <div key={a.action} onClick={()=>onNavigate(a.action)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-lg)', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--s3)';e.currentTarget.style.borderColor='var(--b2)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.borderColor='var(--b1)';}}>
                <div style={{ width:36, height:36, borderRadius:'var(--r-lg)', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={a.icon} size={18} style={{ color:a.color }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', marginBottom:2 }}>{a.label}</div>
                  <div style={{ fontSize:11, color:'var(--t3)' }}>{a.sub}</div>
                </div>
                <Icon name="chevron_right" size={16} style={{ color:'var(--t4)', marginLeft:'auto' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent additions */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <SectionLabel>Recent additions</SectionLabel>
            <button onClick={()=>onNavigate('collection')} style={{ fontSize:11, color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-ui)', fontWeight:500 }}>View all</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {collection.slice(0,4).map(f=>(
              <div key={f.id} onClick={()=>onNavigate('collection')}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-lg)', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--s3)';e.currentTarget.style.borderColor='var(--b2)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.borderColor='var(--b1)';}}>
                <div style={{ fontFamily:f.fontFamily, fontSize:17, fontWeight:600, color:'var(--t1)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                <Badge label={f.classification} color="neutral" />
                <span style={{ fontSize:12, fontWeight:600, color:'var(--primary)' }}>{f.readability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Starter presets */}
      <div>
        <SectionLabel style={{ marginBottom:12 }}>Jump in with a starter context</SectionLabel>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {window.RECOMMENDATION_PRESETS.map(p=>(
            <button key={p.id} onClick={()=>onNavigate('recommend')}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-lg)', cursor:'pointer', transition:'all .15s', fontFamily:'var(--font-ui)', color:'inherit' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--primary-dim)';e.currentTarget.style.borderColor='rgba(123,168,255,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.borderColor='var(--b1)';}}>
              <Icon name={p.icon} size={15} style={{ color:'var(--t3)' }} />
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--t2)' }}>{p.label}</div>
                <div style={{ fontSize:10, color:'var(--t4)' }}>{p.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Saved / Settings views ─────────────────────────────── */
function SavedView({ onNavigate }) {
  return <EmptyState icon="bookmark_border" title="No saved items yet" description="Save recommendation results and pairing combinations to revisit later." action={<Btn onClick={()=>onNavigate('recommend')} startIcon="auto_awesome">Start a recommendation</Btn>} />;
}

function SettingsView() {
  const [ai,    setAi]    = useState(true);
  const [web,   setWeb]   = useState(true);
  const [open,  setOpen]  = useState(false);
  const toggle = (v,s) => <div onClick={()=>s(x=>!x)} style={{ width:42,height:22,borderRadius:'var(--r-pill)',background:v?'var(--primary)':'var(--b2)',position:'relative',transition:'background .2s',cursor:'pointer',flexShrink:0 }}>
    <div style={{ position:'absolute',width:16,height:16,borderRadius:'50%',background:'#fff',top:3,left:v?23:3,transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)' }} />
  </div>;
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'28px 28px', maxWidth:600 }}>
      <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', marginBottom:24, letterSpacing:'-.02em' }}>Settings</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[['Library suggestions','Surface scored matches from the open-font library alongside fonts in your collection.',ai,setAi],['Context-aware matching','Use project-context affinity scores to refine ranking.',web,setWeb],['Open source fonts only','Limit all suggestions to freely licensed typefaces.',open,setOpen]].map(([l,d,v,s])=>(
          <div key={l} onClick={()=>s(x=>!x)}
            style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', background:'var(--s2)', border:`1px solid ${v?'rgba(123,168,255,0.25)':'var(--b1)'}`, borderRadius:'var(--r-lg)', cursor:'pointer', transition:'all .15s' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--t1)', marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:12, color:'var(--t3)' }}>{d}</div>
            </div>
            {toggle(v,s)}
          </div>
        ))}
      </div>
      <div style={{ marginTop:24, padding:'18px 20px', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-lg)' }}>
        <SectionLabel style={{ marginBottom:12 }}>Data sources</SectionLabel>
        {['Google Fonts catalog (1,938 families)','Curated open-source library','8-dimension scoring engine','License confidence layer'].map(s=>(
          <div key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Icon name="check_circle" size={13} style={{ color:'var(--teal)' }} />
            <span style={{ fontSize:12, color:'var(--t2)' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tweaks panel ────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#7BA8FF",
  "showAI": true,
  "defaultMode": "pairing",
  "compactNav": false
}/*EDITMODE-END*/;

function TweaksWrapper({ children }) {
  const result = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : { tweaks:TWEAK_DEFAULTS };
  const { TweaksPanel, TweakSection, TweakColor, TweakToggle, TweakSelect } = result;
  return (
    <>
      {children}
      {TweaksPanel && (
        <TweaksPanel>
          <TweakSection label="Brand">
            <TweakColor id="accentColor" label="Accent colour" />
          </TweakSection>
          <TweakSection label="Defaults">
            <TweakSelect id="defaultMode" label="Studio default mode" options={['single','pairing','ui','brand','editorial','typesystem']} />
          </TweakSection>
          <TweakSection label="Features">
            <TweakToggle id="showAI" label="Library suggestions" />
            <TweakToggle id="compactNav" label="Compact navigation" />
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

/* ── App root ────────────────────────────────────────────── */
function App() {
  const [screen,   setScreen]   = useState('landing');
  const [appView,  setAppView]  = useState('home');
  const [collection,setCollection]=useState(window.SAMPLE_COLLECTION);
  const [results,  setResults]  = useState(null);
  const [navHov,   setNavHov]   = useState(null);
  const [snack,    setSnack]    = useState({ show:false, msg:'', type:'success' });
  const [isDark,   setIsDark]   = useState(() => document.documentElement.dataset.theme !== 'light');
  // Phase 2: persistent inspector + collapsible left rail
  const [inspectorTarget, setInspectorTarget] = useState(null);
  // Phase 3 wiring: font carried into Preview view. Separate from inspectorTarget
  // so navigating away from Results doesn't lose the preview context.
  const [previewFont, setPreviewFont] = useState(null);
  const [railExpanded, setRailExpanded] = useState(() => {
    try { return localStorage.getItem('tm-rail-expanded') === '1'; } catch { return false; }
  });
  function toggleRail() {
    setRailExpanded(v => {
      const next = !v;
      try { localStorage.setItem('tm-rail-expanded', next ? '1' : '0'); } catch {}
      return next;
    });
  }
  function openInspector(target)  { setInspectorTarget(target); }
  function closeInspector()       { setInspectorTarget(null); }
  // Navigate to Preview, carrying a font context. Closes inspector so the
  // drawer does not overlap the preview canvas.
  function handleOpenPreview(font) {
    if (font) setPreviewFont(font);
    setInspectorTarget(null);
    setAppView('preview');
    if (font?.name) showSnack(`Previewing ${font.name}`);
  }

  // Phase 3: if the underlying font for the open inspector is no longer
  // present in the current results set (or results were cleared), close the
  // drawer instead of leaving stale data on screen.
  useEffect(() => {
    if (!inspectorTarget) return;
    if (!results) { setInspectorTarget(null); return; }
    const all = [...(results.collection||[]), ...(results.ai||[])];
    const stillThere = all.some(f => f.id === inspectorTarget.id);
    if (!stillThere) setInspectorTarget(null);
  }, [results, inspectorTarget]);

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('tm-theme', next);
    setIsDark(!isDark);
  }

  function showSnack(msg, type='success') {
    setSnack({ show:true, msg, type });
    setTimeout(()=>setSnack(s=>({...s,show:false})), 2800);
  }
  function navigate(view) { setAppView(view); }
  function handleOnboardComplete(dest) { setScreen('app'); setAppView(dest); showSnack('Welcome to TypeMatch!'); }
  function handleResults(r) { setResults(r); setAppView('results'); showSnack(`Found ${r.collection.length + r.ai.length} matches`, 'success'); }
  function handleNewSearch() { setResults(null); setAppView('recommend'); }
  function handlePreview(font) { setAppView('pairing'); if (font?.name) showSnack(`Loaded ${font.name} in Pairing Studio`); }
  function handleFontAdded(f) {
    const newFont = { id:Date.now(), name:f.name, classification:f.classification||'Sans-serif', subtype:f.subtype||'', fontFamily:`'${f.name}',sans-serif`, mood:f.tags||[], personality:[], useCases:f.useCases||[], readability:f.readability||75, screenSuitability:f.screenSuitability||75, printSuitability:f.printSuitability||70, brandFit:[], contrast:'Medium', variable:false, license:f.license||'Unknown', languages:'Latin', pairingWith:[], notes:f.notes||'', completeness:f.completeness||60, addedDate:new Date().toISOString().split('T')[0], previewText:f.name };
    setCollection(c=>[...c, newFont]);
    showSnack(`${f.name} added to your collection`);
  }

  if (screen==='landing')    return <TweaksWrapper><Landing onStart={()=>setScreen('onboarding')} /></TweaksWrapper>;
  if (screen==='onboarding') return <TweaksWrapper><Onboarding onComplete={handleOnboardComplete} /></TweaksWrapper>;

  // Fallback font for Preview: explicitly chosen → inspector target → top result → nothing
  const resolvedPreviewFont = previewFont || inspectorTarget
    || results?.collection?.[0] || results?.ai?.[0] || null;

  const viewMap = {
    home:       <HomeView collection={collection} onNavigate={navigate} />,
    collection: <Collection collection={collection} setCollection={setCollection} onNavigate={navigate} />,
    addfonts:   <AddFonts collection={collection} onFontAdded={handleFontAdded} />,
    recommend:  <RecommendWizard collection={collection} onResults={handleResults} />,
    results:    results ? <Results results={results} onNewSearch={handleNewSearch} onPreview={handlePreview} onSelectFont={openInspector} selectedFontId={inspectorTarget?.id} /> : <RecommendWizard collection={collection} onResults={handleResults} />,
    pairing:    <PairingStudio />,
    // Preview route — uses PreviewLab with best available font context.
    // Falls back to a friendly empty state if the module somehow didn't load.
    preview:    window.PreviewLab
                  ? <window.PreviewLab initialFont={resolvedPreviewFont} />
                  : <EmptyState icon="menu_book" title="Preview not available"
                      description="Reload the app to load the preview module." />,
    saved:      <SavedView onNavigate={navigate} />,
    settings:   <SettingsView />,
  };

  // Breadcrumb labels — aligned to audit IA (Brief / Library / Pairings / Preview).
  const labels = { home:'Home', collection:'Library', addfonts:'Add Fonts', recommend:'Brief', results:'Results', pairing:'Pairings', preview:'Preview', saved:'Saved', settings:'Settings' };

  return (
    <TweaksWrapper>
      <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ height:50, display:'flex', alignItems:'center', padding:'0 18px', background:'var(--s1)', borderBottom:'1px solid var(--b1)', flexShrink:0, zIndex:100, gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:26, height:26, borderRadius:6, background:'linear-gradient(135deg,var(--primary),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:12, fontWeight:800, color:'var(--on-primary)', fontFamily:'var(--font-accent)' }}>T</span>
            </div>
            <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)', letterSpacing:'-.01em' }}>TypeMatch</span>
          </div>
          <Icon name="chevron_right" size={14} style={{ color:'var(--t4)' }} />
          <span style={{ fontSize:13, color:'var(--t2)', fontWeight:500 }}>{labels[appView]||'Home'}</span>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            {appView!=='recommend'&&appView!=='results' && (
              <Btn size="sm" startIcon="auto_awesome" onClick={()=>navigate('recommend')}>Recommend</Btn>
            )}
            <Tooltip text="Pairing Studio">
              <button onClick={()=>navigate('pairing')} style={{ width:30, height:30, borderRadius:'var(--r-md)', background:'var(--s2)', border:'1px solid var(--b1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--t3)' }}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--t1)';e.currentTarget.style.borderColor='var(--b2)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--t3)';e.currentTarget.style.borderColor='var(--b1)';}}>
                <Icon name="tune" size={15} />
              </button>
            </Tooltip>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--purple),var(--primary))', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight:800, color:'var(--on-primary)', fontFamily:'var(--font-accent)' }}>D</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:'flex', minHeight:0, position:'relative' }}>
          {/* Side nav (Phase 2: collapsible) */}
          <nav
            aria-label="Primary"
            style={{
              width: railExpanded ? 200 : 54,
              display:'flex', flexDirection:'column',
              padding:'10px 0', background:'var(--s1)',
              borderRight:'1px solid var(--b1)', gap:2, flexShrink:0,
              transition:'width .22s var(--ease-emphasized-decel)',
            }}
          >
            {NAV_ITEMS.map(item=>{
              const isActive = appView===item.id||(item.id==='recommend'&&appView==='results');
              return (
                <div key={item.id} style={{ position:'relative', padding:'0 8px' }} onMouseEnter={()=>setNavHov(item.id)} onMouseLeave={()=>setNavHov(null)}>
                  <button
                    onClick={()=>navigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    style={{
                      width:'100%', height:38, borderRadius:'var(--r-lg)', border:'none',
                      background:isActive?'var(--primary-dim)':navHov===item.id?'rgba(255,255,255,0.04)':'transparent',
                      display:'flex', alignItems:'center', justifyContent: railExpanded ? 'flex-start' : 'center',
                      gap: railExpanded ? 12 : 0, paddingLeft: railExpanded ? 10 : 0,
                      cursor:'pointer', transition:'all .15s', position:'relative',
                      fontFamily:'var(--font-ui)', color:'inherit',
                    }}
                  >
                    <Icon name={item.icon} size={19} style={{ color:isActive?'var(--primary)':navHov===item.id?'var(--t1)':'var(--t3)', transition:'color .15s' }} />
                    {railExpanded && (
                      <span style={{ fontSize:13, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--t1)' : 'var(--t2)', whiteSpace:'nowrap', overflow:'hidden' }}>{item.label}</span>
                    )}
                    {isActive && <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:2, height:20, background:'var(--primary)', borderRadius:'0 2px 2px 0' }} />}
                  </button>
                  {!railExpanded && navHov===item.id && (
                    <div style={{ position:'absolute', left:46, top:'50%', transform:'translateY(-50%)', background:'var(--s4)', border:'1px solid var(--b3)', borderRadius:'var(--r-md)', padding:'5px 10px', fontSize:11, color:'var(--t1)', whiteSpace:'nowrap', zIndex:1000, pointerEvents:'none', boxShadow:'var(--shadow-md)', fontFamily:'var(--font-ui)', fontWeight:500, animation:'fadeIn .15s ease' }}>
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Rail expand/collapse toggle, anchored at the bottom */}
            <div style={{ marginTop:'auto', padding:'0 8px 4px' }}>
              <button
                onClick={toggleRail}
                aria-label={railExpanded ? 'Collapse navigation' : 'Expand navigation'}
                aria-expanded={railExpanded}
                style={{
                  width:'100%', height:34, borderRadius:'var(--r-md)', border:'none',
                  background:'transparent', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent: railExpanded ? 'flex-start' : 'center',
                  gap: railExpanded ? 12 : 0, paddingLeft: railExpanded ? 10 : 0,
                  color:'var(--t3)', fontFamily:'var(--font-ui)', fontSize:12,
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='var(--t1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--t3)'; }}
              >
                <Icon name={railExpanded ? 'chevron_left' : 'chevron_right'} size={16} />
                {railExpanded && <span>Collapse</span>}
              </button>
            </div>
          </nav>

          {/* Main content */}
          <main style={{ flex:1, minWidth:0, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative' }}>
            <div key={appView} style={{ flex:1, animation:'fadeIn .22s ease', minHeight:0, overflow:'hidden' }}>
              {viewMap[appView] || viewMap.home}
            </div>

            {/* Phase 2: Shell-level Inspector. Renders DetailPanel content for any
                view that calls openInspector(font). Currently driven by Results;
                other views remain unchanged. */}
            <Inspector
              open={!!inspectorTarget}
              onClose={closeInspector}
              title={inspectorTarget?.name || 'Details'}
              width={400}
            >
              {inspectorTarget && window.DetailPanel
                ? <window.DetailPanel font={inspectorTarget} onClose={closeInspector} onPreview={handlePreview} onOpenPreview={handleOpenPreview} embedded />
                : null}
            </Inspector>
          </main>
        </div>
        <Snackbar message={snack.msg} show={snack.show} type={snack.type} />
      </div>
    </TweaksWrapper>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
