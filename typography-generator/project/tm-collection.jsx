// tm-collection.jsx v2 — Richer font cards
const { useState } = React;

function FontCard({ font, onSelect, selected, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const pct = font.completeness || 80;
  const pctColor = pct >= 90 ? 'var(--teal)' : pct >= 75 ? 'var(--primary)' : 'var(--warm)';

  return (
    <div style={{ background:'var(--s2)', borderRadius:'var(--r-xl)', border:`1px solid ${selected?'rgba(168,127,255,0.4)':'var(--b1)'}`, overflow:'hidden', transition:'all .2s cubic-bezier(.4,0,.2,1)', boxShadow:selected?'0 4px 20px rgba(168,127,255,0.12)':'var(--shadow-sm)' }}>
      {/* Font specimen header */}
      <div style={{ padding:'24px 22px 18px', cursor:'pointer' }} onClick={()=>setExpanded(e=>!e)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <Badge label={font.classification} color="neutral" />
            <Badge label={font.subtype} color="neutral" />
            {font.variable && <Badge label="Variable" color="primary" dot />}
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <Tooltip text="Preview in Pairing Studio">
              <button onClick={e=>{e.stopPropagation();onPreview&&onPreview(font);}} style={{ width:28, height:28, borderRadius:'var(--r-md)', border:'1px solid var(--b2)', background:'var(--s3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--b3)';e.currentTarget.style.color='var(--t1)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.color='var(--t3)';}}>
                <Icon name="tune" size={13} />
              </button>
            </Tooltip>
            <button onClick={e=>{e.stopPropagation();onSelect&&onSelect(font.id);}}
              style={{ padding:'3px 10px', borderRadius:'var(--r-sm)', border:`1px solid ${selected?'rgba(168,127,255,0.45)':'var(--b2)'}`, background:selected?'var(--purple-dim)':'transparent', color:selected?'var(--purple)':'var(--t3)', fontSize:10, cursor:'pointer', transition:'all .15s', fontFamily:'var(--font-ui)', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase' }}>
              {selected?'Selected':'Compare'}
            </button>
          </div>
        </div>

        {/* Large specimen text */}
        <div style={{ fontFamily:font.fontFamily, fontSize:32, fontWeight:font.classification==='Sans-serif'?500:700, color:'var(--t1)', lineHeight:1.15, marginBottom:6, letterSpacing:'-.01em', textWrap:'pretty' }}>
          {font.previewText}
        </div>
        <div style={{ fontFamily:font.fontFamily, fontSize:13, fontWeight:400, color:'var(--t3)', lineHeight:1.5, marginBottom:16 }}>
          {font.name} · {font.foundry}
        </div>

        {/* Alphabet sample */}
        <div style={{ fontFamily:font.fontFamily, fontSize:11, color:'var(--t4)', letterSpacing:'.04em', marginBottom:16, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
        </div>

        {/* Mood chips */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
          {font.mood.slice(0,4).map(m=><Chip key={m} label={m} size="sm" color="neutral" />)}
        </div>

        {/* Score bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {[['Readability',font.readability,'var(--primary)'],['Screen',font.screenSuitability,'var(--purple)'],['Print',font.printSuitability,'var(--teal)']].map(([l,v,c])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:10, color:'var(--t4)', width:64, flexShrink:0, fontFamily:'var(--font-accent)', letterSpacing:'.04em', textTransform:'uppercase' }}>{l}</span>
              <div style={{ flex:1 }}><ProgressBar value={v} color={c} height={3} /></div>
              <span style={{ fontSize:10, fontWeight:700, color:c, width:24, textAlign:'right' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Completeness */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, padding:'7px 10px', background:'var(--bg)', borderRadius:'var(--r-md)' }}>
          <ProgressBar value={pct} color={pctColor} />
          <span style={{ fontSize:10, color:pctColor, fontWeight:700, whiteSpace:'nowrap' }}>{pct}%</span>
          <Tooltip text="Metadata completeness — affects recommendation accuracy">
            <Icon name="info" size={12} style={{ color:'var(--t4)', cursor:'help' }} />
          </Tooltip>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--b1)', padding:'18px 22px', animation:'fadeIn .2s ease', background:'var(--s3)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
            {[['License',font.license],['Contrast',font.contrast],['Subtype',font.subtype],['Languages',font.languages]].map(([k,v])=>(
              <div key={k}>
                <SectionLabel style={{ marginBottom:4 }}>{k}</SectionLabel>
                <div style={{ fontSize:13, color:'var(--t2)' }}>{v||'—'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <SectionLabel style={{ marginBottom:7 }}>Use cases</SectionLabel>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {font.useCases.map(u=><Chip key={u} label={u} size="sm" color="collection" />)}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <SectionLabel style={{ marginBottom:7 }}>Pairs with</SectionLabel>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {font.pairingWith?.map(p=><Chip key={p} label={p} size="sm" color="primary" />)}
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.65, padding:'10px 14px', background:'var(--bg)', borderRadius:'var(--r-md)', borderLeft:'3px solid rgba(123,168,255,0.4)' }}>
            {font.notes}
          </div>
          {pct < 85 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, padding:'8px 12px', background:'rgba(255,144,112,0.07)', border:'1px solid rgba(255,144,112,0.2)', borderRadius:'var(--r-md)' }}>
              <Icon name="warning" size={14} style={{ color:'var(--warm)' }} />
              <span style={{ fontSize:12, color:'var(--t2)' }}>Metadata {pct}% complete — enriching improves match quality.</span>
              <button style={{ marginLeft:'auto', fontSize:11, color:'var(--warm)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:'var(--font-ui)', fontWeight:500 }}>Complete</button>
            </div>
          )}
        </div>
      )}
      <div onClick={()=>setExpanded(e=>!e)} style={{ padding:'7px 22px', borderTop:'1px solid var(--b1)', display:'flex', alignItems:'center', justifyContent:'center', gap:4, cursor:'pointer', background:'transparent', transition:'all .15s' }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--s3)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <span style={{ fontSize:10, color:'var(--t4)', fontFamily:'var(--font-accent)', letterSpacing:'.04em', textTransform:'uppercase' }}>{expanded?'Less':'Details'}</span>
        <Icon name={expanded?'keyboard_arrow_up':'keyboard_arrow_down'} size={13} style={{ color:'var(--t4)' }} />
      </div>
    </div>
  );
}

function Collection({ collection, setCollection, onNavigate }) {
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('Name');
  const [selected, setSelected] = useState([]);
  const [view,     setView]     = useState('grid');

  function toggleSelect(id) { setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]); }

  const filtered = collection
    .filter(f=>filter==='All'||f.classification===filter)
    .filter(f=>!search||f.name.toLowerCase().includes(search.toLowerCase())||f.mood?.some(m=>m.includes(search.toLowerCase())))
    .sort((a,b)=>{
      if(sort==='Readability')  return b.readability-a.readability;
      if(sort==='Completeness') return b.completeness-a.completeness;
      return a.name.localeCompare(b.name);
    });

  const avgComp = Math.round(collection.reduce((s,f)=>s+(f.completeness||80),0)/collection.length);
  const incomplete = collection.filter(f=>(f.completeness||80)<85).length;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Health banner */}
      {incomplete>0 && (
        <div style={{ padding:'9px 24px', background:'rgba(255,144,112,0.07)', borderBottom:'1px solid rgba(255,144,112,0.14)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <Icon name="warning" size={14} style={{ color:'var(--warm)' }} />
          <span style={{ fontSize:12, color:'rgba(255,144,112,0.85)' }}>{incomplete} font{incomplete>1?'s':''} have incomplete metadata.</span>
          <button style={{ marginLeft:'auto', fontSize:11, color:'var(--warm)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:'var(--font-ui)' }}>Review</button>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid var(--b1)', flexWrap:'wrap', flexShrink:0 }}>
        <h2 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)' }}>My Collection</h2>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Icon name="search" size={14} style={{ color:'var(--t3)', position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
            <input type="search" placeholder="Search fonts, moods…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:30, width:200, padding:'7px 10px 7px 30px' }} />
          </div>
          <div style={{ display:'flex', background:'var(--s2)', borderRadius:'var(--r-md)', border:'1px solid var(--b1)', padding:2, gap:2 }}>
            {[['grid_view','grid'],['view_list','list']].map(([ic,v])=>(
              <button key={v} onClick={()=>setView(v)} style={{ padding:'4px 8px', borderRadius:'var(--r-sm)', border:'none', background:view===v?'var(--s4)':'transparent', color:view===v?'var(--t1)':'var(--t3)', cursor:'pointer', display:'flex', alignItems:'center' }}>
                <Icon name={ic} size={14} />
              </button>
            ))}
          </div>
          <Btn size="sm" startIcon="add" onClick={()=>onNavigate('addfonts')}>Add font</Btn>
        </div>
      </div>

      {/* Filters + sort */}
      <div style={{ padding:'8px 24px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,255,255,0.04)', flexWrap:'wrap', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, flex:1, flexWrap:'wrap' }}>
          {['All','Serif','Sans-serif','Display'].map(c=>(
            <Chip key={c} label={c} selected={filter===c} onClick={()=>setFilter(c)} size="sm" color="neutral" />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'var(--t4)' }}>Sort:</span>
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            {['Name','Readability','Completeness'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:'8px 24px', display:'flex', gap:24, borderBottom:'1px solid rgba(255,255,255,0.03)', flexShrink:0 }}>
        {[
          [`${collection.length} fonts`,'in collection','var(--purple)'],
          [`${avgComp}%`,'avg completeness',avgComp>=85?'var(--teal)':'var(--warm)'],
          [`${collection.filter(f=>f.variable).length}`,'variable','var(--primary)'],
        ].map(([v,l,c])=>(
          <div key={l} style={{ display:'flex', alignItems:'baseline', gap:5 }}>
            <span style={{ fontSize:13, fontWeight:700, color:c, fontFamily:'var(--font-accent)' }}>{v}</span>
            <span style={{ fontSize:11, color:'var(--t4)' }}>{l}</span>
          </div>
        ))}
        {selected.length>0 && (
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:12, color:'var(--t3)' }}>{selected.length} selected</span>
            <Btn variant="tonal" size="sm" onClick={()=>onNavigate('pairing')}>Open in Studio</Btn>
            <Btn variant="ghost" size="sm" onClick={()=>setSelected([])}>Clear</Btn>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {filtered.length===0 ? (
          <EmptyState icon="search_off" title="No fonts found" description="Try adjusting your search or filter." action={<Btn variant="tonal" size="sm" onClick={()=>{setSearch('');setFilter('All');}}>Clear filters</Btn>} />
        ) : view==='grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
            {filtered.map((f,i)=>(
              <div key={f.id} className="fade-up" style={{ animationDelay:`${i*.04}s` }}>
                <FontCard font={f} onSelect={toggleSelect} selected={selected.includes(f.id)} onPreview={()=>onNavigate('pairing')} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {filtered.map(f=>(
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', background:'var(--s2)', borderRadius:'var(--r-lg)', border:'1px solid var(--b1)', transition:'all .15s', cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.background='var(--s3)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b1)';e.currentTarget.style.background='var(--s2)';}}>
                <div style={{ fontFamily:f.fontFamily, fontSize:20, fontWeight:600, color:'var(--t1)', minWidth:200, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                <Badge label={f.classification} color="neutral" />
                {f.variable && <Badge label="Variable" color="primary" />}
                <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center' }}>
                  <ScoreRing value={f.readability} size={34} color="var(--primary)" strokeWidth={3} />
                  <ScoreRing value={f.screenSuitability} size={34} color="var(--purple)" strokeWidth={3} />
                  <Btn variant="ghost" size="sm" onClick={()=>toggleSelect(f.id)}>{selected.includes(f.id)?'Deselect':'Compare'}</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Collection });
