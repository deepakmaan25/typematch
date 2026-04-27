// tm-components.jsx v3 — Full CSS-variable token system, theme-aware
const { useState, useEffect, useRef } = React;

/* ── Icon ─────────────────────────────────────────────── */
function Icon({ name, size=20, style={} }) {
  return <span className="material-icons-round" style={{ fontSize:size, lineHeight:1, display:'inline-flex', alignItems:'center', userSelect:'none', flexShrink:0, ...style }}>{name}</span>;
}

/* ── Btn — full CSS-var token system w/ MD3 ripple ────── */
function Btn({ children, variant='contained', onClick, size='md', startIcon, endIcon, disabled, loading, fullWidth, style={} }) {
  const [hov,     setHov]     = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);

  function spawnRipple(e) {
    if (disabled || loading) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = (e.clientX || rect.left + rect.width/2) - rect.left - size/2;
    const y = (e.clientY || rect.top + rect.height/2) - rect.top - size/2;
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, x, y, size }]);
    setTimeout(() => setRipples(r => r.filter(r2 => r2.id !== id)), 620);
  }

  const sz = {
    sm: { pad:'5px 14px',  fs:11, iconSz:13, gap:5 },
    md: { pad:'8px 20px',  fs:12, iconSz:15, gap:6 },
    lg: { pad:'12px 28px', fs:14, iconSz:17, gap:8 },
  }[size] || { pad:'8px 20px', fs:12, iconSz:15, gap:6 };

  // All colors come from CSS variables — theme updates automatically
  const cfg = {
    contained: {
      bg:     pressed ? 'var(--btn-p-press)' : hov ? 'var(--btn-p-hov)' : 'var(--btn-p-bg)',
      color:  'var(--btn-p-text)',
      border: 'transparent',
      shadow: hov && !pressed ? 'var(--shadow-primary)' : 'none',
    },
    tonal: {
      bg:     hov ? 'var(--btn-t-hov)' : 'var(--btn-t-bg)',
      color:  'var(--btn-t-text)',
      border: hov ? 'var(--btn-t-bor-hov)' : 'var(--btn-t-border)',
    },
    outlined: {
      bg:     hov ? 'var(--btn-o-hov)' : 'var(--btn-o-bg)',
      color:  'var(--btn-o-text)',
      border: hov ? 'var(--btn-o-bor-hov)' : 'var(--btn-o-border)',
    },
    ghost: {
      bg:     hov ? 'var(--btn-g-hov)' : 'var(--btn-g-bg)',
      color:  hov ? 'var(--btn-g-txt-hov)' : 'var(--btn-g-text)',
      border: hov ? 'var(--btn-g-bor-hov)' : 'var(--btn-g-border)',
    },
    text: {
      bg:     hov ? 'var(--btn-tx-hov)' : 'var(--btn-tx-bg)',
      color:  hov ? 'var(--btn-tx-hov-t)' : 'var(--btn-tx-text)',
      border: 'transparent',
    },
    destructive: {
      bg:     hov ? 'var(--btn-d-hov)' : 'var(--btn-d-bg)',
      color:  'var(--btn-d-text)',
      border: hov ? 'var(--btn-d-bor-hov)' : 'var(--btn-d-border)',
    },
    ai: {
      bg:     hov ? 'var(--btn-ai-hov)' : 'var(--btn-ai-bg)',
      color:  'var(--btn-ai-text)',
      border: hov ? 'var(--btn-ai-bh)' : 'var(--btn-ai-border)',
    },
    collection: {
      bg:     hov ? 'var(--btn-c-hov)' : 'var(--btn-c-bg)',
      color:  'var(--btn-c-text)',
      border: hov ? 'var(--btn-c-bh)' : 'var(--btn-c-border)',
    },
  }[variant] || {};

  return (
    <button
      ref={btnRef}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={(e) => { if (!disabled) { setPressed(true); if (variant === 'contained') spawnRipple(e); } }}
      onMouseUp={() => setPressed(false)}
      disabled={disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:sz.gap,
        padding:sz.pad, borderRadius:'var(--r-md)',
        border:`1px solid ${cfg.border||'transparent'}`,
        background:cfg.bg, color:cfg.color,
        fontSize:sz.fs, fontWeight:600, fontFamily:'var(--font-ui)',
        letterSpacing:0, textTransform:'none',
        boxShadow:cfg.shadow||'none',
        opacity: disabled ? 0.40 : 1,
        cursor: disabled||loading ? 'not-allowed' : 'pointer',
        transform: pressed && !disabled ? 'scale(0.99)' : 'none',
        width: fullWidth ? '100%' : undefined,
        position:'relative', overflow:'hidden',
        transition: 'transform .12s var(--ease-standard), box-shadow .2s var(--ease-standard), background-color .15s var(--ease-standard), border-color .15s var(--ease-standard), color .15s var(--ease-standard)',
        ...style,
      }}
    >
      {loading
        ? <><div style={{ width:sz.iconSz-1, height:sz.iconSz-1, border:`2px solid currentColor`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite', flexShrink:0 }} /><span style={{ opacity:0.6 }}>{children}</span></>
        : <>{startIcon && <Icon name={startIcon} size={sz.iconSz} />}{children}{endIcon && <Icon name={endIcon} size={sz.iconSz} />}</>
      }
      {ripples.map(r => (
        <span key={r.id} className="ripple-pulse" style={{ left:r.x, top:r.y, width:r.size, height:r.size }} />
      ))}
    </button>
  );
}

/* ── FAB — Floating Action Button (MD3) ─────────────────── */
function FAB({ icon, label, onClick, color='primary', extended=false, style={} }) {
  const [hov, setHov] = useState(false);
  const palette = {
    primary: { bg:'var(--btn-p-bg)', hov:'var(--btn-p-hov)', text:'var(--btn-p-text)' },
    teal:    { bg:'var(--teal)', hov:'var(--teal)', text:'var(--on-primary)' },
    purple:  { bg:'var(--purple)', hov:'var(--purple)', text:'var(--on-primary)' },
  }[color] || { bg:'var(--btn-p-bg)', hov:'var(--btn-p-hov)', text:'var(--btn-p-text)' };
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ height: extended ? 52 : 56, width: extended ? 'auto' : 56, padding: extended ? '0 22px' : 0,
        borderRadius: extended ? 18 : 16, border:'none', cursor:'pointer',
        background: hov ? palette.hov : palette.bg, color: palette.text,
        display:'inline-flex', alignItems:'center', gap:10,
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.18)' : '0 4px 12px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .25s var(--ease-emphasized-decel)',
        fontFamily:'var(--font-ui)', fontWeight:600, fontSize:13, letterSpacing:0, textTransform:'none',
        ...style }}>
      <Icon name={icon} size={extended ? 18 : 22} />
      {extended && label && <span>{label}</span>}
    </button>
  );
}

/* ── SegmentedButton (MD3) ──────────────────────────────── */
function SegmentedButton({ options, value, onChange, size='md' }) {
  const pad = size === 'sm' ? '6px 12px' : '8px 16px';
  const fs  = size === 'sm' ? 11 : 12;
  return (
    <div style={{ display:'inline-flex', borderRadius:'var(--r-pill)', border:'1px solid var(--b2)', background:'var(--s2)', padding:2, gap:2 }}>
      {options.map(opt => {
        const active = value === (opt.value ?? opt);
        const label  = opt.label ?? opt;
        const icon   = opt.icon;
        return (
          <button key={label} onClick={()=>onChange(opt.value ?? opt)}
            style={{ padding:pad, borderRadius:'var(--r-pill)', border:'none',
              background: active ? 'var(--primary-dim)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--t3)',
              fontSize:fs, fontWeight: active ? 600 : 500, fontFamily:'var(--font-ui)',
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6,
              letterSpacing:'.02em', transition:'all .18s var(--ease-standard)' }}>
            {icon && <Icon name={icon} size={fs+2} />}{label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Chip ─────────────────────────────────────────────── */
function Chip({ label, selected, onClick, color='neutral', size='md', icon, removable, onRemove }) {
  const [hov, setHov] = useState(false);

  // Non-neutral chips keep their brand colors but adapt opacity
  const palettes = {
    primary:    { bg:'var(--primary-dim)',  selBg:`color-mix(in srgb, var(--primary) 22%, transparent)`,  border:'color-mix(in srgb, var(--primary) 28%, transparent)', selBorder:'var(--primary)', text:'var(--primary)', selText:'var(--primary)' },
    collection: { bg:'var(--purple-dim)',   selBg:`color-mix(in srgb, var(--purple) 22%, transparent)`,   border:'color-mix(in srgb, var(--purple) 28%, transparent)',  selBorder:'var(--purple)',  text:'var(--purple)',  selText:'var(--purple)' },
    ai:         { bg:'var(--teal-dim)',     selBg:`color-mix(in srgb, var(--teal) 22%, transparent)`,     border:'color-mix(in srgb, var(--teal) 28%, transparent)',   selBorder:'var(--teal)',   text:'var(--teal)',   selText:'var(--teal)' },
    warm:       { bg:'var(--warm-dim)',     selBg:`color-mix(in srgb, var(--warm) 22%, transparent)`,     border:'color-mix(in srgb, var(--warm) 28%, transparent)',   selBorder:'var(--warm)',   text:'var(--warm)',   selText:'var(--warm)' },
    neutral:    { bg:'var(--chip-neutral-bg)', selBg:'var(--chip-neutral-sel)', border:'var(--chip-neutral-bor)', selBorder:'var(--chip-neutral-sbor)', text:'var(--chip-neutral-text)', selText:'var(--chip-neutral-stxt)' },
  };
  const p = palettes[color] || palettes.neutral;
  const fs  = size === 'sm' ? 11 : 12;
  const pad = size === 'sm' ? '3px 10px' : '5px 14px';

  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:pad, borderRadius:'var(--r-pill)',
        border:`1px solid ${selected ? p.selBorder : hov ? p.selBorder : p.border}`,
        background: selected ? p.selBg : hov ? 'color-mix(in srgb, var(--t1) 4%, transparent)' : p.bg,
        color: selected ? p.selText : hov ? p.selText : p.text,
        fontSize:fs, fontWeight:500, fontFamily:'var(--font-ui)', letterSpacing:'0.02em', whiteSpace:'nowrap', cursor:'pointer',
      }}>
      {icon && <Icon name={icon} size={fs+2} />}
      {label}
      {removable && <span onClick={e=>{e.stopPropagation();onRemove&&onRemove();}} style={{ marginLeft:2, opacity:.6, display:'inline-flex' }}><Icon name="close" size={fs} /></span>}
    </button>
  );
}

/* ── Badge ────────────────────────────────────────────── */
function Badge({ label, color='neutral', dot }) {
  const p = {
    primary:    { bg:'color-mix(in srgb, var(--primary) 16%, transparent)', text:'var(--primary)' },
    collection: { bg:'color-mix(in srgb, var(--purple) 15%, transparent)',  text:'var(--purple)' },
    ai:         { bg:'color-mix(in srgb, var(--teal) 14%, transparent)',    text:'var(--teal)' },
    warm:       { bg:'color-mix(in srgb, var(--warm) 14%, transparent)',    text:'var(--warm)' },
    gold:       { bg:'color-mix(in srgb, var(--gold) 14%, transparent)',    text:'var(--gold)' },
    success:    { bg:'color-mix(in srgb, var(--success) 14%, transparent)', text:'var(--success)' },
    warning:    { bg:'color-mix(in srgb, var(--warning) 14%, transparent)', text:'var(--warning)' },
    danger:     { bg:'color-mix(in srgb, var(--danger) 14%, transparent)',  text:'var(--danger)' },
    neutral:    { bg:'var(--b1)',   text:'var(--t3)' },
  }[color] || { bg:'var(--b1)', text:'var(--t3)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', borderRadius:'var(--r-sm)', background:p.bg, color:p.text, fontSize:10, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', whiteSpace:'nowrap', fontFamily:'var(--font-accent)' }}>
      {dot && <span style={{ width:5, height:5, borderRadius:'50%', background:p.text, flexShrink:0 }} />}
      {label}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────── */
function Card({ children, style={}, onClick, level=1 }) {
  const [hov, setHov] = useState(false);
  const bgs = { 1:'var(--s2)', 2:'var(--s3)', 3:'var(--s4)' };
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      className={onClick ? 'md3-elevation' : ''}
      style={{ background:bgs[level]||'var(--s2)', border:`1px solid ${hov&&onClick?'var(--b3)':'var(--b1)'}`, borderRadius:'var(--r-lg)',
        boxShadow:hov&&onClick?'var(--shadow-md)':'var(--shadow-sm)', cursor:onClick?'pointer':'default',
        transition:'border-color .2s var(--ease-standard), box-shadow .25s var(--ease-emphasized-decel), background-color .2s var(--ease-standard)',
        ...style }}>
      {children}
    </div>
  );
}

/* ── ProgressBar ──────────────────────────────────────── */
function ProgressBar({ value, color='var(--primary)', height=3 }) {
  return (
    <div style={{ height, borderRadius:height, background:'var(--b2)', overflow:'hidden', flexShrink:0 }}>
      <div style={{ height:'100%', width:`${Math.min(100,Math.max(0,value))}%`, background:color, borderRadius:height, transition:'width .7s cubic-bezier(0,0,.2,1)' }} />
    </div>
  );
}

/* ── ScoreRing ────────────────────────────────────────── */
function ScoreRing({ value, size=44, color='var(--primary)', label, strokeWidth=3.5 }) {
  const r = (size - strokeWidth*2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (value/100)*circ;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--b2)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transformOrigin:`${size/2}px ${size/2}px`, transform:'rotate(-90deg)', transition:'stroke-dashoffset .9s cubic-bezier(0,0,.2,1)' }} />
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          style={{ fill:'var(--t1)', fontSize:size*.28, fontFamily:'var(--font-ui)', fontWeight:600 }}>{value}</text>
      </svg>
      {label && <span style={{ fontSize:9, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', fontFamily:'var(--font-accent)' }}>{label}</span>}
    </div>
  );
}

/* ── ScoreBar ─────────────────────────────────────────── */
function ScoreBar({ label, value, color='var(--primary)', max=100 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:11, color:'var(--t3)', width:100, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1 }}><ProgressBar value={(value/max)*100} color={color} height={4} /></div>
      <span style={{ fontSize:11, fontWeight:600, color, width:28, textAlign:'right', flexShrink:0 }}>{value}</span>
    </div>
  );
}

/* ── RangeSlider ──────────────────────────────────────── */
function RangeSlider({ label, value, onChange, min=0, max=100, leftLabel, rightLabel, unit='' }) {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <span style={{ fontSize:12, fontWeight:500, color:'var(--t2)' }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--primary)' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{ background:`linear-gradient(to right, var(--primary) ${pct}%, var(--b2) ${pct}%)` }} />
      {(leftLabel||rightLabel) && (
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, color:'var(--t4)' }}>{leftLabel}</span>
          <span style={{ fontSize:10, color:'var(--t4)' }}>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────────── */
function Divider({ style={} }) {
  return <div style={{ height:1, background:'var(--b1)', ...style }} />;
}

/* ── Skeleton ─────────────────────────────────────────── */
function Skeleton({ width='100%', height=16, radius=6, style={} }) {
  return <div className="skeleton" style={{ width, height, borderRadius:radius, ...style }} />;
}

/* ── EmptyState ───────────────────────────────────────── */
function EmptyState({ icon, title, description, action, color='var(--primary)' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'72px 32px', gap:20, textAlign:'center' }}>
      <div style={{ width:68, height:68, borderRadius:'50%', background:`color-mix(in srgb, ${color} 12%, transparent)`, border:`1px solid color-mix(in srgb, ${color} 22%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon name={icon} size={28} style={{ color }} />
      </div>
      <div>
        <h3 style={{ fontSize:17, fontWeight:600, color:'var(--t1)', fontFamily:'var(--font-display)', marginBottom:8 }}>{title}</h3>
        <p style={{ fontSize:13, color:'var(--t3)', lineHeight:1.7, maxWidth:300 }}>{description}</p>
      </div>
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </div>
  );
}

/* ── Tooltip ──────────────────────────────────────────── */
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative', display:'inline-flex' }} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && (
        <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', background:'var(--s4)', border:'1px solid var(--b3)', borderRadius:'var(--r-sm)', padding:'6px 10px', fontSize:11, color:'var(--t1)', whiteSpace:'nowrap', zIndex:1500, boxShadow:'var(--shadow-lg)', pointerEvents:'none', animation:'fadeIn .15s ease' }}>
          {text}
        </div>
      )}
    </div>
  );
}

/* ── Snackbar ─────────────────────────────────────────── */
function Snackbar({ message, show, type='info' }) {
  if (!show) return null;
  const colorMap = { info:'var(--primary)', success:'var(--teal)', warning:'var(--warning)', danger:'var(--danger)' };
  const c = colorMap[type] || colorMap.info;
  return (
    <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:2000, background:'var(--s4)', border:`1px solid color-mix(in srgb, ${c} 28%, transparent)`, borderRadius:'var(--r-lg)', padding:'12px 20px', display:'flex', alignItems:'center', gap:10, boxShadow:'var(--shadow-lg)', animation:'fadeUp .3s cubic-bezier(0,0,.2,1)' }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:c, flexShrink:0 }} />
      <span style={{ fontSize:13, color:'var(--t1)', fontWeight:500 }}>{message}</span>
    </div>
  );
}

/* ── SectionLabel ─────────────────────────────────────── */
function SectionLabel({ children, style={} }) {
  return <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--t3)', fontFamily:'var(--font-accent)', ...style }}>{children}</p>;
}

/* ── TabBar ───────────────────────────────────────────── */
function TabBar({ tabs, active, onChange, style={} }) {
  return (
    <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--b1)', ...style }}>
      {tabs.map(t => (
        <button key={t.id||t} onClick={()=>onChange(t.id||t)}
          style={{ padding:'10px 18px', border:'none', borderBottom:`2px solid ${active===(t.id||t)?'var(--primary)':'transparent'}`, background:'transparent', color:active===(t.id||t)?'var(--t1)':'var(--t3)', fontSize:13, fontWeight:active===(t.id||t)?600:400, cursor:'pointer', display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap' }}>
          {t.icon && <Icon name={t.icon} size={15} />}
          {t.label||t}
          {t.count!=null && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:'var(--r-pill)', background:active===(t.id||t)?'var(--primary-dim)':'var(--b1)', color:active===(t.id||t)?'var(--primary)':'var(--t3)' }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── ThemeToggle ──────────────────────────────────────── */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <Tooltip text={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <button
        onClick={onToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{ width:34, height:34, borderRadius:'var(--r-md)', border:'1px solid var(--b2)', background:'var(--s2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--t2)', position:'relative', overflow:'hidden' }}
        onMouseEnter={e=>{e.currentTarget.style.background='var(--s3)';e.currentTarget.style.color='var(--t1)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.color='var(--t2)';}}>
        <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={16} />
      </button>
    </Tooltip>
  );
}

/* ── Inspector — reusable right-drawer (Phase 2 + Phase 3) ─
   Fixed-position drawer that slides in from the right.
   Use cases: result detail, font detail, settings detail.
   Props: open, onClose, title?, width?(=380), children
   Behavior:
     - ESC closes
     - Focus moves into the panel on open (Phase 2)
     - Phase 3: focus is trapped while open (Tab cycles inside)
     - Phase 3: previously-focused element is restored on close
     - reduced-motion: respects @media override in TypeMatch.html
─────────────────────────────────────────────────────────── */
function Inspector({ open, onClose, title, width=380, children }) {
  const ref = useRef(null);
  const prevFocusRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    // Remember whoever had focus before the drawer opened, so we can restore it
    prevFocusRef.current = document.activeElement;
    const node = ref.current;
    function focusables() {
      if (!node) return [];
      return Array.from(node.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null || el === node);
    }
    function onKey(e) {
      if (e.key === 'Escape') { onClose && onClose(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) { e.preventDefault(); node?.focus(); return; }
      const first = list[0], last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === node) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => { node?.focus(); }, 50);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      // Restore focus to the previously focused element
      const prev = prevFocusRef.current;
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        try { prev.focus(); } catch {}
      }
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <aside
      ref={ref}
      role="complementary"
      aria-label={title || 'Details'}
      tabIndex={-1}
      style={{
        position:'absolute', top:0, right:0, height:'100%', width,
        background:'var(--s2)', borderLeft:'1px solid var(--b2)',
        boxShadow:'var(--shadow-md)', display:'flex', flexDirection:'column',
        zIndex:80, animation:'slideInRt .24s var(--ease-emphasized-decel) both',
        outline:'none',
      }}
    >
      <header style={{ padding:'14px 18px', borderBottom:'1px solid var(--b1)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--t1)', flex:1, fontFamily:'var(--font-ui)' }}>{title || 'Details'}</span>
        <button
          onClick={onClose}
          aria-label="Close inspector"
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', display:'inline-flex', padding:4, borderRadius:'var(--r-sm)' }}
          onMouseEnter={e=>{e.currentTarget.style.color='var(--t1)';e.currentTarget.style.background='var(--b1)';}}
          onMouseLeave={e=>{e.currentTarget.style.color='var(--t3)';e.currentTarget.style.background='transparent';}}
        ><Icon name="close" size={16} /></button>
      </header>
      <div style={{ flex:1, minHeight:0, overflowY:'auto' }}>
        {children}
      </div>
    </aside>
  );
}

Object.assign(window, { Icon, Btn, FAB, SegmentedButton, Chip, Badge, Card, ProgressBar, ScoreRing, ScoreBar, RangeSlider, Divider, Skeleton, EmptyState, Tooltip, Snackbar, SectionLabel, TabBar, ThemeToggle, Inspector });
