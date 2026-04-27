// tm-onboarding.jsx v3 — Theme-token-aware, polished motion, MD3 spacing
const { useState } = React;

const GOALS = [
  { id:'primary', icon:'title',       label:'Find a primary typeface',    desc:'A hero font for your brand or product.' },
  { id:'pairing', icon:'compare',     label:'Find a pairing',             desc:'Two fonts that work beautifully together.' },
  { id:'replace', icon:'swap_horiz',  label:'Replace an existing font',   desc:'A better alternative to what you\'re using.' },
  { id:'system',  icon:'layers',      label:'Build a type system',        desc:'A full typographic hierarchy for a brand.' },
  { id:'explore', icon:'explore',     label:'Explore alternatives',       desc:'Discover options you haven\'t considered.' },
];

const SAMPLE_FONTS = ['Playfair Display','DM Sans','Fraunces','Space Grotesk','Cormorant Garamond','Syne'];
const FAMILIES = {
  'Playfair Display':"'Playfair Display',serif",
  'DM Sans':"'DM Sans',sans-serif",
  'Fraunces':"'Fraunces',serif",
  'Space Grotesk':"'Space Grotesk',sans-serif",
  'Cormorant Garamond':"'Cormorant Garamond',serif",
  'Syne':"'Syne',sans-serif",
};

function Onboarding({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [goal, setGoal]       = useState(null);
  const [added, setAdded]     = useState([]);
  const [prefs, setPrefs]     = useState({ screenFirst: true, openOnly: false, variable: false });
  const [entering, setEntering] = useState(false);
  const totalSteps = 5;

  function goNext() {
    setEntering(true);
    setTimeout(() => { setStep(s => s + 1); setEntering(false); }, 240);
  }
  function goBack() {
    setEntering(true);
    setTimeout(() => { setStep(s => s - 1); setEntering(false); }, 240);
  }
  function toggleFont(name) {
    setAdded(a => a.includes(name) ? a.filter(n => n !== name) : [...a, name]);
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="scale-in" style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:24, maxWidth:520, margin:'0 auto' }}>
      <div className="float" style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,var(--primary),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 60px color-mix(in srgb,var(--primary) 30%,transparent), 0 12px 32px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize:38, fontWeight:800, color:'var(--on-primary)', fontFamily:'var(--font-accent)' }}>T</span>
      </div>
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.025em', marginBottom:14, lineHeight:1.1 }}>Welcome to <span style={{ fontStyle:'italic', fontWeight:400, color:'var(--primary)' }}>TypeMatch</span></h1>
        <p style={{ fontSize:15, color:'var(--t2)', lineHeight:1.7, maxWidth:460, margin:'0 auto' }}>
          The smart way to choose typefaces. We'll help you build your collection, understand your project needs, and surface the best matches — from your library and beyond.
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, width:'100%', marginTop:8 }}>
        {[
          { icon:'library_books', label:'Your collection',     color:'var(--purple)',  bg:'var(--purple-dim)' },
          { icon:'auto_awesome',  label:'AI + Web knowledge', color:'var(--teal)',    bg:'var(--teal-dim)' },
          { icon:'visibility',    label:'Rich previews',      color:'var(--primary)', bg:'var(--primary-dim)' },
        ].map((f,i) => (
          <div key={f.label} className="fade-up" style={{ animationDelay:`${.15+i*.08}s`, padding:'18px 12px', background:f.bg, border:`1px solid color-mix(in srgb,${f.color} 22%,transparent)`, borderRadius:'var(--r-lg)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <Icon name={f.icon} size={22} style={{ color:f.color }} />
            <span style={{ fontSize:11, color:'var(--t2)', textAlign:'center', lineHeight:1.4 }}>{f.label}</span>
          </div>
        ))}
      </div>
      <Btn size="lg" onClick={goNext} endIcon="arrow_forward" style={{ marginTop:8, padding:'13px 38px' }}>Let's get started</Btn>
    </div>,

    // Step 1: Goal
    <div key="goal" className="fade-through" style={{ maxWidth:580, margin:'0 auto', width:'100%' }}>
      <div style={{ marginBottom:28 }}>
        <SectionLabel style={{ marginBottom:10 }}>Step 1 of {totalSteps - 1}</SectionLabel>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.02em', marginBottom:8 }}>What are you looking for?</h2>
        <p style={{ fontSize:14, color:'var(--t3)' }}>This helps us shape your first recommendation query.</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {GOALS.map((g,i) => {
          const sel = goal === g.id;
          return (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className="fade-up md3-elevation"
              style={{ animationDelay:`${i*.05}s`,
                display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                borderRadius:'var(--r-lg)',
                border:`1px solid ${sel ? 'color-mix(in srgb,var(--primary) 50%,transparent)' : 'var(--b1)'}`,
                background: sel ? 'var(--primary-dim)' : 'var(--s2)',
                cursor:'pointer', textAlign:'left', color:'inherit',
                transition:'all .2s var(--ease-standard)' }}>
              <div style={{ width:38, height:38, borderRadius:'var(--r-md)', background: sel ? 'color-mix(in srgb,var(--primary) 22%,transparent)' : 'var(--s3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={g.icon} size={18} style={{ color: sel ? 'var(--primary)' : 'var(--t3)' }} />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color: sel ? 'var(--t1)' : 'var(--t2)', marginBottom:2 }}>{g.label}</div>
                <div style={{ fontSize:12, color:'var(--t3)' }}>{g.desc}</div>
              </div>
              {sel && <Icon name="check_circle" size={18} style={{ color:'var(--primary)', marginLeft:'auto', flexShrink:0 }} />}
            </button>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:28 }}>
        <Btn variant="ghost" onClick={goBack}>Back</Btn>
        <Btn onClick={goNext} disabled={!goal} endIcon="arrow_forward">Continue</Btn>
      </div>
    </div>,

    // Step 2: Add collection
    <div key="collection" className="fade-through" style={{ maxWidth:660, margin:'0 auto', width:'100%' }}>
      <div style={{ marginBottom:24 }}>
        <SectionLabel style={{ marginBottom:10 }}>Step 2 of {totalSteps - 1}</SectionLabel>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.02em', marginBottom:8 }}>Start your collection</h2>
        <p style={{ fontSize:14, color:'var(--t3)' }}>Select typefaces to add, or start with our sample library. You can enrich them later.</p>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <Btn variant="outlined" startIcon="add" size="sm">Add manually</Btn>
        <Btn variant="ghost" startIcon="upload" size="sm">Import list</Btn>
        <Btn variant="tonal" startIcon="library_add" size="sm" onClick={() => setAdded(SAMPLE_FONTS)}>Use sample library</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
        {SAMPLE_FONTS.map((name,i) => {
          const sel = added.includes(name);
          return (
            <button key={name} onClick={() => toggleFont(name)}
              className="fade-up md3-elevation"
              style={{ animationDelay:`${i*.04}s`,
                padding:'14px 16px', borderRadius:'var(--r-lg)',
                border:`1px solid ${sel ? 'color-mix(in srgb,var(--purple) 45%,transparent)' : 'var(--b1)'}`,
                background: sel ? 'var(--purple-dim)' : 'var(--s2)',
                cursor:'pointer', textAlign:'left', color:'inherit',
                transition:'all .2s var(--ease-standard)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <Badge label="Google Fonts" color="neutral" />
                {sel && <Icon name="check_circle" size={16} style={{ color:'var(--purple)' }} />}
              </div>
              <div style={{ fontFamily:FAMILIES[name], fontSize:20, color:'var(--t1)', marginBottom:4, fontWeight:name==='DM Sans'||name==='Space Grotesk'||name==='Syne'?500:600 }}>{name}</div>
              <div style={{ fontSize:11, color:'var(--t3)' }}>Free · OFL License</div>
            </button>
          );
        })}
      </div>

      {added.length > 0 && (
        <div className="scale-in" style={{ padding:'10px 16px', background:'var(--purple-dim)', border:'1px solid color-mix(in srgb,var(--purple) 22%,transparent)', borderRadius:'var(--r-md)', marginBottom:20 }}>
          <span style={{ fontSize:13, color:'var(--purple)' }}>{added.length} typeface{added.length > 1 ? 's' : ''} selected</span>
        </div>
      )}

      <div style={{ display:'flex', gap:12 }}>
        <Btn variant="ghost" onClick={goBack}>Back</Btn>
        <Btn onClick={goNext} endIcon="arrow_forward">Continue</Btn>
      </div>
    </div>,

    // Step 3: Preferences
    <div key="prefs" className="fade-through" style={{ maxWidth:540, margin:'0 auto', width:'100%' }}>
      <div style={{ marginBottom:28 }}>
        <SectionLabel style={{ marginBottom:10 }}>Step 3 of {totalSteps - 1}</SectionLabel>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.02em', marginBottom:8 }}>Set your preferences</h2>
        <p style={{ fontSize:14, color:'var(--t3)' }}>These shape how recommendations are ranked.</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {[
          { key:'screenFirst', label:'Prioritise screen readability', desc:'Rank fonts higher if they perform well at screen sizes and resolutions.', icon:'monitor' },
          { key:'openOnly',    label:'Open-source fonts only',        desc:'Limit suggestions to freely licensed typefaces (OFL, Apache, etc).', icon:'open_in_new' },
          { key:'variable',    label:'Prefer variable fonts',         desc:'Favour typefaces with variable axes for better performance and flexibility.', icon:'tune' },
        ].map((p,i) => {
          const on = prefs[p.key];
          return (
            <div key={p.key} onClick={() => setPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
              className="fade-up md3-elevation"
              style={{ animationDelay:`${i*.06}s`,
                display:'flex', alignItems:'center', gap:16, padding:'16px 18px',
                background:'var(--s2)',
                border:`1px solid ${on ? 'color-mix(in srgb,var(--primary) 32%,transparent)' : 'var(--b1)'}`,
                borderRadius:'var(--r-lg)', cursor:'pointer',
                transition:'all .2s var(--ease-standard)' }}>
              <div style={{ width:38, height:38, borderRadius:'var(--r-md)', background:on?'var(--primary-dim)':'var(--s3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={p.icon} size={18} style={{ color: on ? 'var(--primary)' : 'var(--t3)' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--t1)', marginBottom:3 }}>{p.label}</div>
                <div style={{ fontSize:12, color:'var(--t3)' }}>{p.desc}</div>
              </div>
              <div style={{ width:20, height:20, borderRadius:5, background: on ? 'var(--primary)' : 'transparent', border:`2px solid ${on ? 'var(--primary)' : 'var(--b3)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s var(--ease-standard)' }}>
                {on && <Icon name="check" size={13} style={{ color:'var(--on-primary)' }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:30 }}>
        <Btn variant="ghost" onClick={goBack}>Back</Btn>
        <Btn onClick={goNext} endIcon="arrow_forward">Continue</Btn>
      </div>
    </div>,

    // Step 4: Complete
    <div key="done" className="scale-in" style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:24, maxWidth:480, margin:'0 auto' }}>
      <div style={{ position:'relative', width:84, height:84 }}>
        <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'2px solid color-mix(in srgb,var(--teal) 30%,transparent)', animation:'pulseRing 1.6s var(--ease-emphasized) infinite' }} />
        <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:'1px solid color-mix(in srgb,var(--teal) 20%,transparent)', animation:'pulseRing 1.6s var(--ease-emphasized) infinite', animationDelay:'.3s' }} />
        <div style={{ width:84, height:84, borderRadius:'50%', background:'var(--teal-dim)', border:'1px solid color-mix(in srgb,var(--teal) 32%,transparent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="check" size={36} style={{ color:'var(--teal)' }} />
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.02em', marginBottom:12 }}>You're all set!</h2>
        <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.7 }}>
          Your collection is ready. TypeMatch will now use your preferences and fonts to generate intelligent recommendations.
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'100%' }}>
        <div style={{ padding:'16px 12px', background:'var(--purple-dim)', border:'1px solid color-mix(in srgb,var(--purple) 22%,transparent)', borderRadius:'var(--r-lg)', textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:700, color:'var(--purple)', fontFamily:'var(--font-accent)' }}>{added.length || 6}</div>
          <div style={{ fontSize:11, color:'var(--t3)' }}>fonts in collection</div>
        </div>
        <div style={{ padding:'16px 12px', background:'var(--teal-dim)', border:'1px solid color-mix(in srgb,var(--teal) 22%,transparent)', borderRadius:'var(--r-lg)', textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:700, color:'var(--teal)', fontFamily:'var(--font-accent)' }}>Ready</div>
          <div style={{ fontSize:11, color:'var(--t3)' }}>AI + Web active</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, marginTop:8 }}>
        <Btn variant="outlined" onClick={() => onComplete('collection')}>View collection</Btn>
        <Btn onClick={() => onComplete('recommend')} endIcon="auto_awesome">Get recommendations</Btn>
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <div style={{ height:2, background:'var(--b1)', position:'relative' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,var(--primary),var(--purple))', transition:'width .5s var(--ease-emphasized-decel)', width:`${(step / (totalSteps-1)) * 100}%` }} />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 48px' }}>
        <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,var(--primary),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--on-primary)', fontFamily:'var(--font-accent)' }}>T</span>
        </div>
        <span style={{ fontSize:15, fontWeight:600, fontFamily:'var(--font-accent)', color:'var(--t2)' }}>TypeMatch</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--t3)' }}>
          {step > 0 ? `Step ${step} of ${totalSteps-1}` : 'Welcome'}
        </span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 48px 64px', opacity: entering ? 0 : 1, transform: entering ? 'translateY(12px) scale(.98)' : 'none', transition:'all .26s var(--ease-emphasized-decel)' }}>
        {steps[step]}
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding });
