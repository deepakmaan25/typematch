// tm-landing.jsx v3 — Editorial hero redesign, fixed CTA logic
const { useState, useEffect } = React;

const ROTATING_FONTS = [
  { name:'Playfair Display',   family:"'Playfair Display',serif",      style:'italic', weight:700, classification:'Display Serif' },
  { name:'Fraunces',           family:"'Fraunces',serif",              style:'italic', weight:300, classification:'Variable Serif' },
  { name:'Cormorant Garamond', family:"'Cormorant Garamond',serif",    style:'normal', weight:300, classification:'Old Style Serif' },
  { name:'DM Serif Display',   family:"'DM Serif Display',serif",      style:'italic', weight:400, classification:'Display Serif' },
  { name:'Syne',               family:"'Syne',sans-serif",             style:'normal', weight:800, classification:'Display Sans' },
];

function Landing({ onStart }) {
  const [fontIdx, setFontIdx] = useState(0);
  const [fading,  setFading]  = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(()=>setVisible(true), 100); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setFontIdx(i=>(i+1)%ROTATING_FONTS.length); setFading(false); }, 350);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const activeFont = ROTATING_FONTS[fontIdx];

  // Secondary CTA: scroll to the sample results strip on this page.
  // Honest — the strip genuinely exists below. Does not start the onboarding flow.
  function scrollToDemo() {
    const container = document.getElementById('landing-scroll');
    const target    = document.getElementById('demo-strip');
    if (!target || !container) return;
    const dest = target.offsetTop - 64;
    try {
      container.scrollTo({ top: dest, behavior: 'smooth' });
    } catch {
      container.scrollTop = dest;
    }
  }

  return (
    <div id="landing-scroll" style={{ minHeight:'100vh', background:'var(--bg)', overflowY:'auto', overflowX:'hidden' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 48px', position:'sticky', top:0, zIndex:100, background:'color-mix(in srgb,var(--bg) 85%,transparent)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--b1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'linear-gradient(135deg,var(--primary),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:14, fontWeight:800, color:'var(--on-primary)', fontFamily:'var(--font-accent)' }}>T</span>
          </div>
          <span style={{ fontSize:16, fontWeight:700, fontFamily:'var(--font-accent)', color:'var(--t1)', letterSpacing:'-.01em' }}>TypeMatch</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn variant="ghost" size="sm" onClick={onStart}>Sign in</Btn>
          <Btn size="sm" onClick={onStart}>Get started</Btn>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding:'80px 48px 64px', maxWidth:1140, margin:'0 auto', opacity:visible?1:0, transition:'opacity .8s ease' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center', minHeight:480 }}>

          {/* Left copy */}
          <div>
            {/* Quiet category label — no pill, no animation, no noise */}
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--t4)', fontFamily:'var(--font-accent)', marginBottom:28 }}>
              Typography selector
            </p>

            {/* Single semantically-correct h1 */}
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(38px,4.6vw,64px)', fontWeight:700, lineHeight:1.06, letterSpacing:'-.03em', color:'var(--t1)', marginBottom:28 }}>
              Find type that<br />
              actually{' '}
              <span style={{ fontStyle:'italic', fontWeight:300, color:'var(--primary)' }}>fits.</span>
            </h1>

            <p style={{ fontSize:16, color:'var(--t3)', lineHeight:1.78, marginBottom:40, maxWidth:440 }}>
              TypeMatch uses structured scoring against your brief to surface exactly the right typeface — with full reasoning, not just a list.
            </p>

            {/* CTAs: primary + distinct secondary (scroll-to-demo, not onStart) */}
            <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', marginBottom:48 }}>
              <Btn size="lg" onClick={onStart} endIcon="arrow_forward" style={{ padding:'13px 32px', fontSize:14 }}>
                Start matching
              </Btn>
              {/* Text-link style — visually distinct so users don't mistake it for the same action */}
              <button
                onClick={scrollToDemo}
                aria-label="See sample results below"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'13px 4px', fontSize:14, fontWeight:500, color:'var(--t3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-ui)', transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}
              >
                See sample results
                <Icon name="south" size={14} />
              </button>
            </div>

            {/* Feature trust markers */}
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              {[
                ['Your collection', 'collections_bookmark', 'var(--purple)'],
                ['Library matches',  'auto_awesome',         'var(--teal)'],
                ['Full reasoning',  'verified',             'var(--warm)'],
              ].map(([l,ic,c])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon name={ic} size={14} style={{ color:c }} />
                  <span style={{ fontSize:12, color:'var(--t3)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: editorial specimen card
              Designed like a type foundry specimen sheet — structured, restrained,
              product-led. No decorative floating badges. No generic "Aa" glyph. */}
          <div style={{ position:'relative', height:480, display:'flex', alignItems:'stretch' }}>
            <div style={{
              flex:1,
              border:'1px solid var(--b2)',
              borderRadius:'var(--r-xl)',
              background:'var(--s2)',
              overflow:'hidden',
              display:'flex',
              flexDirection:'column',
              padding:'28px 32px 24px',
            }}>
              {/* Specimen header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:'.12em',
                  textTransform:'uppercase', color:'var(--t4)',
                  fontFamily:'var(--font-accent)',
                  opacity: fading ? 0 : 1,
                  transition:'opacity .35s ease',
                }}>
                  {activeFont.classification}
                </span>
                <span style={{ fontSize:10, color:'var(--t4)', fontFamily:'var(--font-ui)' }}>
                  {fontIdx + 1}&thinsp;/&thinsp;{ROTATING_FONTS.length}
                </span>
              </div>

              {/* Main specimen — fades with font transition */}
              <div style={{ opacity:fading?0:1, transition:'opacity .35s ease', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                {/* Headline specimen */}
                <div style={{
                  fontFamily: activeFont.family,
                  fontSize: 'clamp(44px,5.5vw,72px)',
                  fontWeight: activeFont.weight,
                  fontStyle: activeFont.style,
                  lineHeight: 1.02,
                  letterSpacing: '-.025em',
                  color: 'var(--t1)',
                  marginBottom: 20,
                }}>
                  The craft of<br />beautiful type.
                </div>

                {/* Body specimen — shows readability at text sizes */}
                <div style={{
                  fontFamily: activeFont.family,
                  fontSize: 14,
                  fontWeight: 400,
                  fontStyle: 'normal',
                  lineHeight: 1.65,
                  color: 'var(--t3)',
                  marginBottom: 22,
                  maxWidth: 320,
                }}>
                  Typography shapes the voice of a brand before a single word is consciously read.
                </div>

                {/* Alphabet specimen row */}
                <div style={{
                  fontFamily: activeFont.family,
                  fontSize: 13,
                  fontWeight: activeFont.weight,
                  letterSpacing: '.06em',
                  color: 'var(--t4)',
                }}>
                  Aa Bb Cc Dd · 0123456789
                </div>
              </div>

              {/* Footer: font name + pagination dots */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:24, paddingTop:20, borderTop:'1px solid var(--b1)' }}>
                <span style={{ fontSize:12, fontWeight:500, color:'var(--t3)', fontFamily:'var(--font-ui)', opacity:fading?0:1, transition:'opacity .35s ease' }}>
                  {activeFont.name}
                </span>
                <div style={{ display:'flex', gap:5 }}>
                  {ROTATING_FONTS.map((_,i)=>(
                    <div
                      key={i}
                      onClick={()=>{ setFontIdx(i); }}
                      aria-label={`Show ${ROTATING_FONTS[i].name}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e=>{ if(e.key==='Enter'||e.key===' ') setFontIdx(i); }}
                      style={{ width:i===fontIdx?18:5, height:5, borderRadius:'var(--r-pill)', background:i===fontIdx?'var(--primary)':'var(--b3)', transition:'all .3s', cursor:'pointer' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo results strip ─────────────────────────────── */}
      {/* id="demo-strip" is the scroll target for "See sample results" */}
      <section id="demo-strip" style={{ padding:'20px 48px 72px', maxWidth:1140, margin:'0 auto', scrollMarginTop:70 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--t4)', fontFamily:'var(--font-accent)', marginBottom:18 }}>
          Sample output
        </p>
        <div style={{ background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
          <div style={{ padding:'10px 18px', background:'var(--s1)', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:8 }}>
            {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
            <span style={{ marginLeft:6, fontSize:11, color:'var(--t4)', fontFamily:'var(--font-ui)' }}>TypeMatch — Results for "Premium editorial SaaS"</span>
          </div>
          <div style={{ padding:'24px 28px' }}>
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(168,127,255,0.08)', border:'1px solid rgba(168,127,255,0.2)', borderRadius:'var(--r-md)' }}>
                <Icon name="collections_bookmark" size={13} style={{ color:'var(--purple)' }} />
                <span style={{ fontSize:11, fontWeight:600, color:'var(--purple)', fontFamily:'var(--font-accent)' }}>From Your Collection</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(45,212,160,0.07)', border:'1px solid rgba(45,212,160,0.2)', borderRadius:'var(--r-md)' }}>
                <Icon name="auto_awesome" size={13} style={{ color:'var(--teal)' }} />
                <span style={{ fontSize:11, fontWeight:600, color:'var(--teal)', fontFamily:'var(--font-accent)' }}>Library</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { name:'Playfair Display', score:94, src:'collection', mood:'Editorial · Elegant',     family:"'Playfair Display',serif", desc:'Strong mood alignment with editorial + sophisticated. High contrast serif ideal for headlines.' },
                { name:'DM Sans',          score:91, src:'collection', mood:'Modern · UI-ready',       family:"'DM Sans',sans-serif",     desc:'Exceptional screen readability. Perfect body complement to a display serif.' },
                { name:'GT Alpina',        score:88, src:'ai',         mood:'Premium · Authoritative', family:"'Georgia',serif",          desc:'Widely used in premium SaaS. Commercial — Grilli Type.' },
              ].map((f,i)=>(
                <div key={f.name} className="fade-up" style={{ animationDelay:`${i*.1}s`, display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:i===0?'rgba(123,168,255,0.06)':'var(--s3)', borderRadius:'var(--r-lg)', border:`1px solid ${i===0?'rgba(123,168,255,0.2)':'var(--b1)'}` }}>
                  <div style={{ textAlign:'center', minWidth:52 }}>
                    <div style={{ fontSize:22, fontWeight:700, color:f.src==='ai'?'var(--teal)':'var(--purple)', fontFamily:'var(--font-accent)' }}>{f.score}</div>
                    <div style={{ fontSize:8, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em' }}>match</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:f.family, fontSize:22, fontWeight:700, color:'var(--t1)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                    <div style={{ fontSize:11, color:'var(--t3)' }}>{f.mood}</div>
                  </div>
                  <Badge label={f.src==='ai'?'Library':'Collection'} color={f.src==='ai'?'ai':'collection'} dot />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section style={{ padding:'40px 48px 80px', maxWidth:1140, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:64, alignItems:'start' }}>
          <div>
            <SectionLabel style={{ marginBottom:14 }}>Process</SectionLabel>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, letterSpacing:'-.03em', color:'var(--t1)', lineHeight:1.1, marginBottom:20 }}>From need to decision — in minutes.</h2>
            <p style={{ fontSize:14, color:'var(--t3)', lineHeight:1.75 }}>TypeMatch is the only tool that checks your own carefully-curated library first, then goes further.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {[
              { n:'01', color:'var(--purple)', title:'Build your collection', body:"Import typefaces and enrich them with mood, use case, readability, and brand fit metadata. The more you add, the smarter it gets." },
              { n:'02', color:'var(--primary)', title:'Describe your need', body:"Tell TypeMatch the project type, the mood it should express, and how it'll be read. Smart chips and sliders make this fast and precise." },
              { n:'03', color:'var(--teal)', title:'Get ranked matches', body:'Results split clearly: fonts from your collection ranked by fit, and library suggestions scored against your brief, with full explainability.' },
            ].map((s,i)=>(
              <div key={s.n} className="fade-up" style={{ animationDelay:`${i*.12}s`, display:'flex', gap:20, padding:'24px 20px', borderRadius:'var(--r-lg)', transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--s2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ fontSize:13, fontWeight:800, fontFamily:'var(--font-accent)', color:s.color, minWidth:28 }}>{s.n}</div>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:600, color:'var(--t1)', marginBottom:6 }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:'var(--t3)', lineHeight:1.65 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two sources ───────────────────────────────────── */}
      <section style={{ padding:'0 48px 80px', maxWidth:1140, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { color:'var(--purple)', bg:'rgba(168,127,255,0.06)', border:'rgba(168,127,255,0.15)', icon:'collections_bookmark', label:'Source 01', title:'From Your Collection', body:'Every recommendation from your library includes exact metadata you added — moods, use cases, readability scores, and brand fit. Completely contextual.' },
            { color:'var(--teal)',   bg:'rgba(45,212,160,0.05)',  border:'rgba(45,212,160,0.14)',  icon:'auto_awesome',         label:'Source 02', title:'Library Suggestions', body:'Suggestions drawn from a curated open-font library, scored across mood, use case, readability, and brand fit. Always ranked, always explained.' },
          ].map(s=>(
            <div key={s.title} style={{ padding:'36px 32px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:'var(--r-xl)' }}>
              <SectionLabel style={{ color:s.color, marginBottom:14 }}>{s.label}</SectionLabel>
              <Icon name={s.icon} size={28} style={{ color:s.color, marginBottom:14, display:'block' }} />
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, letterSpacing:'-.02em', color:'var(--t1)', marginBottom:12 }}>{s.title}</h3>
              <p style={{ fontSize:14, color:'var(--t3)', lineHeight:1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={{ padding:'20px 48px 96px', maxWidth:1140, margin:'0 auto' }}>
        <div style={{ padding:'64px 48px', background:'linear-gradient(135deg, rgba(123,168,255,0.07), rgba(168,127,255,0.05))', border:'1px solid rgba(123,168,255,0.13)', borderRadius:'var(--r-xl)', textAlign:'center' }}>
          <SectionLabel style={{ textAlign:'center', marginBottom:16 }}>Ready?</SectionLabel>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:700, letterSpacing:'-.03em', color:'var(--t1)', marginBottom:16, lineHeight:1.1 }}>
            Your next typeface<br />
            <span style={{ fontStyle:'italic', fontWeight:300, color:'var(--primary)' }}>is waiting.</span>
          </h2>
          <p style={{ fontSize:15, color:'var(--t3)', marginBottom:36, maxWidth:380, margin:'0 auto 36px' }}>Set up your collection in minutes. Start with our sample library if you prefer.</p>
          <Btn size="lg" onClick={onStart} endIcon="arrow_forward" style={{ padding:'14px 40px', fontSize:15 }}>Get started — it's free</Btn>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Landing });
