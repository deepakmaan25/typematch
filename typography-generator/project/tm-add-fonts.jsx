// tm-add-fonts.jsx — Add Fonts flow (upload, Google Fonts, local)
const { useState, useRef, useEffect } = React;

const GOOGLE_FONT_CATALOG = [
  { name:'Fraunces',          category:'Serif',      tags:['variable','optical','display','editorial'], license:'OFL' },
  { name:'Playfair Display',  category:'Serif',      tags:['elegant','editorial','high-contrast'],     license:'OFL' },
  { name:'Cormorant Garamond',category:'Serif',      tags:['luxury','refined','old-style'],            license:'OFL' },
  { name:'Libre Baskerville', category:'Serif',      tags:['classic','readable','workhorse'],          license:'OFL' },
  { name:'DM Serif Display',  category:'Serif',      tags:['editorial','display','contemporary'],      license:'OFL' },
  { name:'DM Sans',           category:'Sans-serif', tags:['variable','geometric','UI','product'],     license:'OFL' },
  { name:'Space Grotesk',     category:'Sans-serif', tags:['tech','grotesque','distinctive'],          license:'OFL' },
  { name:'Syne',              category:'Display',    tags:['avant-garde','creative','display'],        license:'OFL' },
  { name:'Inter',             category:'Sans-serif', tags:['UI','neutral','legible','variable'],       license:'OFL' },
  { name:'Plus Jakarta Sans', category:'Sans-serif', tags:['modern','friendly','geometric'],           license:'OFL' },
  { name:'Outfit',            category:'Sans-serif', tags:['clean','modern','startup'],                license:'OFL' },
  { name:'Cabinet Grotesk',   category:'Sans-serif', tags:['editorial','grotesque','fashion'],         license:'OFL' },
  { name:'Clash Display',     category:'Display',    tags:['bold','contemporary','brand'],             license:'OFL' },
  { name:'Neue Haas Grotesk', category:'Sans-serif', tags:['classic','neutral','swiss'],               license:'Commercial' },
  { name:'Canela',            category:'Serif',      tags:['soft','luxury','editorial'],               license:'Commercial' },
  { name:'GT Walsheim',       category:'Sans-serif', tags:['friendly','geometric','brand'],            license:'Commercial' },
];

function AddFonts({ collection, onFontAdded, onClose }) {
  const [tab,      setTab]      = useState('upload');
  const [uploadState, setUploadState] = useState('idle'); // idle|dragging|processing|preview|error|success
  const [uploadedFont, setUploadedFont] = useState(null);
  const [gfSearch, setGfSearch] = useState('');
  const [gfFilter, setGfFilter] = useState('All');
  const [gfSelected, setGfSelected] = useState([]);
  const [gfAdding,   setGfAdding]   = useState(false);
  const [localState, setLocalState] = useState('idle'); // idle|requesting|granted|denied
  const [localFonts, setLocalFonts] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [metadataFont, setMetadataFont] = useState(null);
  const [snack, setSnack] = useState({ show:false, msg:'', type:'success' });
  const fileInputRef = useRef();

  function showSnack(msg, type='success') {
    setSnack({ show:true, msg, type });
    setTimeout(() => setSnack(s=>({...s,show:false})), 2600);
  }

  // ── File upload ──────────────────────────────────────────────
  function handleFileDrop(e) {
    e.preventDefault();
    setUploadState('idle');
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['otf','ttf','woff','woff2'];
    if (!allowed.includes(ext)) {
      setUploadState('error');
      setUploadedFont({ error:'Unsupported file type. Please upload OTF, TTF, WOFF, or WOFF2.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadState('error');
      setUploadedFont({ error:'File too large. Maximum size is 10 MB.' });
      return;
    }
    setUploadState('processing');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g,' ');
      try {
        const fontFace = new FontFace(fontName, ev.target.result);
        fontFace.load().then(ff => {
          document.fonts.add(ff);
          setUploadedFont({ name:fontName, file:file.name, size:(file.size/1024).toFixed(0)+'KB', format:ext.toUpperCase(), fontFamily:`'${fontName}', sans-serif` });
          setUploadState('preview');
        }).catch(() => {
          setUploadState('error');
          setUploadedFont({ error:'Could not parse font file. It may be corrupted or invalid.' });
        });
      } catch(e) {
        setUploadState('processing');
        setTimeout(() => {
          setUploadedFont({ name:fontName, file:file.name, size:(file.size/1024).toFixed(0)+'KB', format:ext.toUpperCase(), fontFamily:`'${fontName}', sans-serif` });
          setUploadState('preview');
        }, 900);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleAddUploaded() {
    if (!uploadedFont || uploadedFont.error) return;
    setMetadataFont({ ...uploadedFont, source:'upload' });
  }

  // ── Google Fonts ─────────────────────────────────────────────
  const gfFiltered = GOOGLE_FONT_CATALOG
    .filter(f => gfFilter==='All' || f.category===gfFilter)
    .filter(f => !gfSearch || f.name.toLowerCase().includes(gfSearch.toLowerCase()) || f.tags.some(t=>t.includes(gfSearch.toLowerCase())));

  function toggleGfFont(name) {
    setGfSelected(s => s.includes(name) ? s.filter(n=>n!==name) : [...s, name]);
  }

  function addGoogleFonts() {
    setGfAdding(true);
    setTimeout(() => {
      gfSelected.forEach(name => {
        const font = GOOGLE_FONT_CATALOG.find(f=>f.name===name);
        onFontAdded && onFontAdded({ name, classification:font?.category||'Sans-serif', license:font?.license||'OFL', source:'google', tags:font?.tags||[] });
      });
      showSnack(`${gfSelected.length} font${gfSelected.length>1?'s':''} added to your collection`);
      setGfSelected([]);
      setGfAdding(false);
    }, 1200);
  }

  // ── Local fonts ───────────────────────────────────────────────
  async function requestLocalFonts() {
    setLocalState('requesting');
    try {
      if ('queryLocalFonts' in window) {
        const fonts = await window.queryLocalFonts();
        const unique = [...new Map(fonts.map(f=>[f.family,f])).values()];
        setLocalFonts(unique.map(f=>({ name:f.family, style:f.style, source:'local' })));
        setLocalState('granted');
      } else {
        setLocalState('denied');
      }
    } catch(e) {
      setLocalState('denied');
    }
  }

  // ── Metadata form ─────────────────────────────────────────────
  if (metadataFont) {
    return <MetadataForm font={metadataFont} onSave={f=>{ onFontAdded&&onFontAdded(f); showSnack(`${f.name} added to collection`); setMetadataFont(null); setUploadState('idle'); setUploadedFont(null); }} onBack={()=>setMetadataFont(null)} />;
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px 0', borderBottom:'1px solid var(--b1)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', letterSpacing:'-.02em', marginBottom:4 }}>Add Fonts</h2>
            <p style={{ fontSize:13, color:'var(--t3)' }}>Import from a file, discover via open libraries, or access local fonts.</p>
          </div>
          {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', padding:4 }}><Icon name="close" size={20} /></button>}
        </div>
        <TabBar tabs={[
          { id:'upload', label:'Upload file', icon:'upload_file' },
          { id:'google', label:'Open libraries', icon:'public' },
          { id:'local',  label:'Local fonts',   icon:'computer' },
        ]} active={tab} onChange={setTab} style={{ borderBottom:'none' }} />
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>

        {/* ── Upload tab ── */}
        {tab === 'upload' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:600, margin:'0 auto' }}>
            {/* Drop zone */}
            <div
              onDragOver={e=>{e.preventDefault();setUploadState('dragging');}}
              onDragLeave={()=>setUploadState('idle')}
              onDrop={handleFileDrop}
              onClick={()=>fileInputRef.current?.click()}
              className={uploadState==='dragging' ? 'drop-active' : ''}
              style={{ border:`2px dashed ${uploadState==='error' ? '#F87171' : uploadState==='dragging' ? 'var(--primary)' : 'var(--b3)'}`, borderRadius:'var(--r-xl)', padding:'48px 32px', textAlign:'center', cursor:'pointer', background: uploadState==='error' ? 'rgba(248,113,113,0.05)' : uploadState==='dragging' ? 'var(--primary-dim)' : 'var(--s2)', transition:'all .2s' }}>
              <input ref={fileInputRef} type="file" accept=".otf,.ttf,.woff,.woff2" style={{ display:'none' }} onChange={handleFileDrop} />
              {uploadState === 'processing' ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                  <div style={{ width:40, height:40, border:'3px solid var(--b2)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
                  <p style={{ fontSize:14, color:'var(--t2)' }}>Processing font file…</p>
                </div>
              ) : uploadState === 'error' ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                  <Icon name="error_outline" size={36} style={{ color:'#F87171' }} />
                  <p style={{ fontSize:14, color:'#F87171', fontWeight:500 }}>{uploadedFont?.error}</p>
                  <Btn variant="ghost" size="sm" onClick={e=>{e.stopPropagation();setUploadState('idle');setUploadedFont(null);}}>Try again</Btn>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                  <div style={{ width:56, height:56, borderRadius:'var(--r-xl)', background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="upload_file" size={28} style={{ color:'var(--primary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:600, color:'var(--t1)', marginBottom:6 }}>Drop a font file here</p>
                    <p style={{ fontSize:13, color:'var(--t3)' }}>or click to browse</p>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {['OTF','TTF','WOFF','WOFF2'].map(f=><Badge key={f} label={f} color="neutral" />)}
                  </div>
                  <p style={{ fontSize:11, color:'var(--t4)' }}>Max 10 MB · Locally processed · Never uploaded</p>
                </div>
              )}
            </div>

            {/* Preview after upload */}
            {uploadState === 'preview' && uploadedFont && !uploadedFont.error && (
              <Card level={2} style={{ padding:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <SectionLabel style={{ marginBottom:6 }}>Detected font</SectionLabel>
                    <h3 style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)' }}>{uploadedFont.name}</h3>
                    <p style={{ fontSize:12, color:'var(--t3)', marginTop:4 }}>{uploadedFont.file} · {uploadedFont.size} · {uploadedFont.format}</p>
                  </div>
                  <Badge label="Loaded" color="success" dot />
                </div>
                {/* Live preview */}
                <div style={{ padding:'24px 20px', background:'var(--bg)', borderRadius:'var(--r-lg)', marginBottom:20, fontFamily:uploadedFont.fontFamily, fontSize:32, fontWeight:700, color:'var(--t1)', lineHeight:1.2 }}>
                  Typography in motion
                </div>
                <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'rgba(255,144,112,0.07)', border:'1px solid rgba(255,144,112,0.2)', borderRadius:'var(--r-md)', marginBottom:20 }}>
                  <Icon name="info" size={15} style={{ color:'var(--warm)', flexShrink:0, marginTop:1 }} />
                  <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.55 }}>Please verify you have the correct license to use this font commercially. TypeMatch does not verify font licenses.</p>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <Btn variant="ghost" size="sm" onClick={()=>{setUploadState('idle');setUploadedFont(null);}}>Discard</Btn>
                  <Btn size="sm" onClick={handleAddUploaded} startIcon="add">Add to collection</Btn>
                </div>
              </Card>
            )}

            {/* Tips */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { icon:'lock', title:'Private by default', desc:'Font files are processed locally. Nothing is sent to our servers.' },
                { icon:'verified', title:'License reminder', desc:'Ensure you hold the appropriate license before using commercial fonts.' },
                { icon:'tune', title:'Metadata enrichment', desc:'After upload, you can add mood, use-case, and readability data.' },
                { icon:'layers', title:'Variable font support', desc:'Variable fonts load with all their axes available.' },
              ].map(t => (
                <div key={t.title} style={{ display:'flex', gap:12, padding:'14px 16px', background:'var(--s2)', borderRadius:'var(--r-lg)', border:'1px solid var(--b1)' }}>
                  <Icon name={t.icon} size={18} style={{ color:'var(--primary)', flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--t2)', marginBottom:3 }}>{t.title}</p>
                    <p style={{ fontSize:11, color:'var(--t3)', lineHeight:1.5 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Google Fonts / open libraries tab ── */}
        {tab === 'google' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ position:'relative', flex:1, minWidth:200 }}>
                <Icon name="search" size={15} style={{ color:'var(--t3)', position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
                <input type="search" placeholder="Search typefaces, tags, uses…" value={gfSearch} onChange={e=>setGfSearch(e.target.value)} style={{ paddingLeft:34 }} />
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['All','Serif','Sans-serif','Display'].map(f=>
                  <Chip key={f} label={f} selected={gfFilter===f} onClick={()=>setGfFilter(f)} size="sm" color="neutral" />
                )}
              </div>
            </div>
            {gfSelected.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'var(--primary-dim)', border:'1px solid rgba(123,168,255,0.25)', borderRadius:'var(--r-md)' }}>
                <span style={{ fontSize:13, color:'var(--primary)', fontWeight:500, flex:1 }}>{gfSelected.length} font{gfSelected.length>1?'s':''} selected</span>
                <Btn size="sm" loading={gfAdding} onClick={addGoogleFonts} startIcon="add">Add to collection</Btn>
                <Btn variant="text" size="sm" onClick={()=>setGfSelected([])}>Clear</Btn>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:12 }}>
              {gfFiltered.map(f => {
                const sel = gfSelected.includes(f.name);
                const inCollection = collection.some(c=>c.name===f.name);
                return (
                  <div key={f.name} onClick={()=>!inCollection&&toggleGfFont(f.name)}
                    style={{ padding:'16px 18px', background:'var(--s2)', borderRadius:'var(--r-lg)', border:`1px solid ${sel?'rgba(123,168,255,0.45)':inCollection?'rgba(45,212,160,0.2)':'var(--b1)'}`, cursor:inCollection?'default':'pointer', transition:'all .15s', opacity:inCollection?.7:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <Badge label={f.category} color="neutral" />
                        {f.license==='OFL' ? <Badge label="Free" color="success" /> : <Badge label="Commercial" color="warning" />}
                      </div>
                      {inCollection ? <Icon name="check_circle" size={17} style={{ color:'var(--teal)' }} /> : sel ? <Icon name="check_circle" size={17} style={{ color:'var(--primary)' }} /> : null}
                    </div>
                    <div style={{ fontFamily:`'${f.name}', serif`, fontSize:20, fontWeight:700, color:'var(--t1)', marginBottom:6, lineHeight:1.2 }}>{f.name}</div>
                    <div style={{ fontFamily:`'${f.name}', sans-serif`, fontSize:13, fontWeight:400, color:'var(--t3)', lineHeight:1.5, marginBottom:10 }}>The quick brown fox jumps</div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {f.tags.slice(0,3).map(t=><Chip key={t} label={t} size="sm" color="neutral" />)}
                    </div>
                    {inCollection && <p style={{ fontSize:11, color:'var(--teal)', marginTop:8 }}>Already in your collection</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Local fonts tab ── */}
        {tab === 'local' && (
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            {localState === 'idle' && (
              <div style={{ textAlign:'center', padding:'48px 32px', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(123,168,255,0.2)' }}>
                  <Icon name="computer" size={32} style={{ color:'var(--primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', marginBottom:10 }}>Access your local fonts</h3>
                  <p style={{ fontSize:14, color:'var(--t3)', lineHeight:1.7, maxWidth:400 }}>TypeMatch can read fonts installed on your computer. Your browser will ask for permission — no fonts are ever uploaded.</p>
                </div>
                <div style={{ padding:'14px 18px', background:'rgba(123,168,255,0.06)', border:'1px solid rgba(123,168,255,0.15)', borderRadius:'var(--r-lg)', textAlign:'left', maxWidth:400, width:'100%' }}>
                  <p style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6 }}>⚠️ Local Font Access API is supported in <strong>Chrome 103+</strong> on desktop. Safari and Firefox do not yet support this feature.</p>
                </div>
                <Btn onClick={requestLocalFonts} startIcon="lock_open">Allow access to local fonts</Btn>
              </div>
            )}
            {localState === 'requesting' && (
              <div style={{ textAlign:'center', padding:64 }}>
                <div style={{ width:40, height:40, border:'3px solid var(--b2)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 20px' }} />
                <p style={{ fontSize:14, color:'var(--t2)' }}>Waiting for browser permission…</p>
              </div>
            )}
            {localState === 'denied' && (
              <div style={{ textAlign:'center', padding:48, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                <Icon name="block" size={40} style={{ color:'#F87171' }} />
                <div>
                  <h3 style={{ fontSize:17, fontWeight:600, color:'var(--t1)', marginBottom:8 }}>Local font access unavailable</h3>
                  <p style={{ fontSize:13, color:'var(--t3)', lineHeight:1.65, maxWidth:360 }}>This browser doesn't support Local Font Access, or permission was denied. Try Chrome 103+ on desktop, or upload fonts manually.</p>
                </div>
                <Btn variant="tonal" onClick={()=>setTab('upload')} startIcon="upload_file">Upload a font instead</Btn>
              </div>
            )}
            {localState === 'granted' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <p style={{ fontSize:13, color:'var(--teal)', display:'flex', alignItems:'center', gap:6 }}><Icon name="check_circle" size={15} />Found {localFonts.length} local fonts</p>
                  <div style={{ marginLeft:'auto' }}>
                    {localSelected.length > 0 && <Btn size="sm" onClick={()=>{localSelected.forEach(n=>onFontAdded&&onFontAdded({name:n,source:'local'}));setLocalSelected([]);showSnack(`${localSelected.length} fonts added`);}} startIcon="add">Add {localSelected.length} selected</Btn>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:480, overflowY:'auto' }}>
                  {localFonts.slice(0,60).map(f => {
                    const sel = localSelected.includes(f.name);
                    return (
                      <div key={f.name} onClick={()=>setLocalSelected(s=>s.includes(f.name)?s.filter(n=>n!==f.name):[...s,f.name])}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:'var(--r-md)', border:`1px solid ${sel?'rgba(123,168,255,0.35)':'var(--b1)'}`, background:sel?'var(--primary-dim)':'var(--s2)', cursor:'pointer', transition:'all .15s' }}>
                        <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${sel?'var(--primary)':'var(--b3)'}`, background:sel?'var(--primary)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                          {sel && <Icon name="check" size={11} style={{ color:'#09090F' }} />}
                        </div>
                        <div style={{ fontFamily:`'${f.name}', sans-serif`, fontSize:16, color:'var(--t1)', flex:1 }}>{f.name}</div>
                        <span style={{ fontSize:11, color:'var(--t3)' }}>{f.style||'Regular'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Snackbar message={snack.msg} show={snack.show} type={snack.type} />
    </div>
  );
}

/* ── Metadata enrichment form ────────────────────────────── */
function MetadataForm({ font, onSave, onBack }) {
  const [form, setForm] = useState({
    name: font.name || '',
    classification: 'Sans-serif',
    subtype: '',
    moods: [],
    useCases: [],
    readability: 80,
    screenSuitability: 80,
    printSuitability: 75,
    license: font.license || (font.source==='google'?'OFL (Free)':'Unknown — verify before use'),
    variable: false,
    notes: '',
  });
  const moodOptions = ['elegant','modern','bold','minimal','playful','authoritative','warm','refined','technical','expressive','friendly','luxury','quirky'];
  const ucOptions   = ['UI & Product','Editorial','Brand identity','Headlines','Body copy','Packaging','Marketing','Mobile app'];

  function toggle(arr, key, val) {
    setForm(f=>({ ...f, [key]: f[arr].includes(val) ? f[arr].filter(x=>x!==val) : [...f[arr], val] }));
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:28, maxWidth:640, margin:'0 auto' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--t3)', fontSize:13, marginBottom:20, fontFamily:'var(--font-ui)' }}>
        <Icon name="arrow_back" size={15} /> Back
      </button>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--t1)', letterSpacing:'-.02em', marginBottom:6 }}>Enrich font metadata</h2>
      <p style={{ fontSize:13, color:'var(--t3)', marginBottom:28 }}>The more you add, the better TypeMatch can recommend this font. All fields are optional.</p>

      {/* Preview */}
      <div style={{ padding:'24px 20px', background:'var(--bg)', borderRadius:'var(--r-lg)', border:'1px solid var(--b1)', marginBottom:24, fontFamily:font.fontFamily||`'${font.name}',sans-serif`, fontSize:28, fontWeight:700, color:'var(--t1)', lineHeight:1.2 }}>
        {form.name || 'Font Preview'}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <SectionLabel style={{ marginBottom:7 }}>Font name</SectionLabel>
            <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div>
            <SectionLabel style={{ marginBottom:7 }}>Classification</SectionLabel>
            <select value={form.classification} onChange={e=>setForm(f=>({...f,classification:e.target.value}))} style={{ width:'100%', padding:'10px 12px' }}>
              {['Serif','Sans-serif','Monospace','Display','Script','Handwriting'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <SectionLabel style={{ marginBottom:8 }}>Mood & personality (select all that fit)</SectionLabel>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {moodOptions.map(m=><Chip key={m} label={m} selected={form.moods.includes(m)} onClick={()=>toggle('moods','moods',m)} size="sm" color="primary" />)}
          </div>
        </div>

        <div>
          <SectionLabel style={{ marginBottom:8 }}>Best use cases</SectionLabel>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {ucOptions.map(u=><Chip key={u} label={u} selected={form.useCases.includes(u)} onClick={()=>toggle('useCases','useCases',u)} size="sm" color="collection" />)}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          <RangeSlider label="Readability" value={form.readability} onChange={v=>setForm(f=>({...f,readability:v}))} leftLabel="Low" rightLabel="High" />
          <RangeSlider label="Screen" value={form.screenSuitability} onChange={v=>setForm(f=>({...f,screenSuitability:v}))} leftLabel="Poor" rightLabel="Excellent" />
          <RangeSlider label="Print" value={form.printSuitability} onChange={v=>setForm(f=>({...f,printSuitability:v}))} leftLabel="Poor" rightLabel="Excellent" />
        </div>

        <div>
          <SectionLabel style={{ marginBottom:7 }}>License</SectionLabel>
          <input type="text" value={form.license} onChange={e=>setForm(f=>({...f,license:e.target.value}))} placeholder="e.g. OFL, Apache 2.0, Commercial — Grilli Type" />
        </div>

        <div>
          <SectionLabel style={{ marginBottom:7 }}>Notes (optional)</SectionLabel>
          <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Best sizes, quirks, pairing suggestions…" />
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:8 }}>
          <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
          <Btn onClick={()=>onSave(form)} startIcon="add" fullWidth>Add to collection</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddFonts });
