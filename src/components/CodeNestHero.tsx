import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/* ── Constants ─────────────────────────────────────────────────────── */
const HLS_SRC =
  'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
const NAV_LINKS = ['PROJECTS', 'BLOG', 'ABOUT', 'RESUME'] as const;
const F = {
  jakarta: "'Plus Jakarta Sans', sans-serif",
  inter:   "'Inter', sans-serif",
  serif:   "'Instrument Serif', serif",
};
const GREEN = '#5ed29c';
const BG    = '#070b0a';

const STATS = [
  { value: 2400, suffix: '+', label: 'Developers Hired',   decimals: 0 },
  { value: 98,   suffix: '%', label: 'Job Placement Rate', decimals: 0 },
  { value: 40,   suffix: '+', label: 'Partner Companies',  decimals: 0 },
  { value: 4.9,  suffix: '★', label: 'Avg Rating',         decimals: 1 },
];

/* ── CSS keyframes (injected once) ────────────────────────────────── */
const STYLES = `
  @keyframes cn-shimmer {
    0%   { transform: translateX(-160%); }
    100% { transform: translateX(160%); }
  }
  @keyframes cn-glow-pulse {
    0%, 100% { opacity: .65; transform: scaleX(1) scaleY(1); }
    50%       { opacity: .30; transform: scaleX(.9) scaleY(.85); }
  }
  @keyframes cn-float {
    0%,100% { transform: translateY(-50px) rotate(-1.2deg); }
    50%     { transform: translateY(-60px) rotate(1deg); }
  }
  @keyframes cn-line-pulse {
    0%,100% { opacity: .07; }
    50%     { opacity: .18; }
  }
  @keyframes cn-noise-drift {
    0%   { transform: translate(0, 0); }
    25%  { transform: translate(-1%, .5%); }
    50%  { transform: translate(.5%, -1%); }
    75%  { transform: translate(-1%, 1%); }
    100% { transform: translate(0, 0); }
  }
  @keyframes cn-wave {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

/* ── Helpers ───────────────────────────────────────────────────────── */
function reveal(mounted: boolean, delay: number): React.CSSProperties {
  return {
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  };
}

function useCounter(target: number, decimals: number, active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setN(parseFloat((target * ease).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, decimals]);
  return n;
}

/* ── Stat item ─────────────────────────────────────────────────────── */
function StatItem({
  value, suffix, label, decimals, active,
}: typeof STATS[0] & { active: boolean }) {
  const n = useCounter(value, decimals, active);
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: F.inter,
          fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 800,
          color: GREEN,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {decimals > 0 ? n.toFixed(decimals) : Math.round(n)}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: F.inter,
          fontSize: 11,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Liquid Glass Card ─────────────────────────────────────────────── */
function LiquidGlassCard({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
  return (
    /* Floating + parallax wrapper */
    <div
      style={{
        display: 'inline-block',
        animation: 'cn-float 6s ease-in-out infinite',
        transform: `translateX(${offsetX}px) translateY(${offsetY}px)`,
        transition: 'transform .9s cubic-bezier(.23,1,.36,1)',
        marginBottom: 32,
        willChange: 'transform',
      }}
    >
      {/* Gradient border shell */}
      <div
        style={{
          width: 210,
          height: 210,
          background:
            'linear-gradient(160deg, rgba(255,255,255,.32) 0%, rgba(255,255,255,.04) 60%, rgba(94,210,156,.12) 100%)',
          borderRadius: 24,
          padding: '1.4px',
          boxShadow:
            '0 2px 40px rgba(0,0,0,.5), 0 0 60px rgba(94,210,156,.06)',
        }}
      >
        {/* Glass inner */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 23,
            padding: 22,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(10px) saturate(1.4)',
            backgroundBlendMode: 'luminosity',
            boxShadow:
              'inset 0 1.5px 1.5px rgba(255,255,255,.14), inset 0 -1px 1px rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            position: 'relative' as const,
            overflow: 'hidden',
          }}
        >
          {/* Shimmer sweep */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '55%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)',
              animation: 'cn-shimmer 4s ease-in-out 1.5s infinite',
              pointerEvents: 'none',
              borderRadius: 23,
            }}
          />

          {/* Tag */}
          <span
            style={{
              fontFamily: F.inter,
              fontSize: 13,
              fontWeight: 600,
              color: GREEN,
              letterSpacing: '0.08em',
              position: 'relative' as const,
              zIndex: 1,
            }}
          >
            [ 2025 ]
          </span>

          {/* Headline */}
          <h3
            style={{
              fontFamily: F.inter,
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              position: 'relative' as const,
              zIndex: 1,
            }}
          >
            Taught by{' '}
            <em
              style={{
                fontFamily: F.serif,
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'rgba(255,255,255,.9)',
              }}
            >
              Industry
            </em>
            <br />
            Professionals
          </h3>

          {/* Desc */}
          <p
            style={{
              fontFamily: F.inter,
              fontSize: 11,
              color: 'rgba(255,255,255,.5)',
              lineHeight: 1.65,
              position: 'relative' as const,
              zIndex: 1,
            }}
          >
            Learn from engineers at top tech companies with real-world
            experience.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Logo ──────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <a
      href="/codenest"
      style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" fill="white" fillOpacity=".1" />
        <rect width="32" height="32" rx="9" stroke="white" strokeOpacity=".15" strokeWidth="1" />
        <path
          d="M8 12l6 4-6 4M15 20h9"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontFamily: F.inter,
          fontWeight: 800,
          fontSize: 17,
          color: 'white',
          letterSpacing: '-0.03em',
        }}
      >
        CodeNest
      </span>
    </a>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function CodeNestHero() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const [mounted,       setMounted]       = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [navScrolled,   setNavScrolled]   = useState(false);
  const [statsActive,   setStatsActive]   = useState(false);
  const [cardOffset,    setCardOffset]    = useState({ x: 0, y: 0 });
  const [ctaHover,      setCtaHover]      = useState(false);
  const [navHover,      setNavHover]      = useState<string | null>(null);

  /* Inject keyframes once */
  useEffect(() => {
    if (document.getElementById('cn-styles')) return;
    const s = document.createElement('style');
    s.id = 'cn-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }, []);

  /* Mount → trigger entrance animations */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* HLS video */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;
    import('hls.js').then(({ default: Hls }) => {
      if (destroyed) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: false });
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = HLS_SRC;
        video.play().catch(() => {});
      }
    }).catch(() => {});
    return () => { destroyed = true; hls?.destroy(); };
  }, []);

  /* Nav scroll awareness */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Mouse parallax (card only, RAF-throttled via ref) */
  useEffect(() => {
    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setCardOffset({
          x: (e.clientX / window.innerWidth  - 0.5) * -12,
          y: (e.clientY / window.innerHeight - 0.5) * -8,
        });
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);

  /* Stats IntersectionObserver */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Close menu helpers */
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: BG, overflow: 'hidden', fontFamily: F.inter }}>

      {/* ── Injected fonts ──────────────────────────────────── */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&family=Instrument+Serif:ital@1&display=swap"
      />

      {/* ── Video background ────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
          autoPlay loop muted playsInline aria-hidden="true"
        />
        {/* Directional overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #070b0a 0%, rgba(7,11,10,.75) 35%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070b0a 0%, rgba(7,11,10,.6) 30%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,11,10,.5) 0%, transparent 18%)' }} />
        {/* Noise grain (SVG filter via pseudo-approach) */}
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.35,
            pointerEvents: 'none',
            animation: 'cn-noise-drift 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Animated sine waves ─────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        {/* Wave 1 — green, mid-screen */}
        <div style={{ position: 'absolute', top: '30%', left: 0, width: '200%', animation: 'cn-wave 14s linear infinite' }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
            <path
              d="M0,50 C180,20 540,80 720,50 C900,20 1260,80 1440,50 C1620,20 1980,80 2160,50 C2340,20 2700,80 2880,50"
              fill="none"
              stroke="rgba(94,210,156,0.07)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {/* Wave 2 — cyan, upper area, slower */}
        <div style={{ position: 'absolute', top: '18%', left: 0, width: '200%', animation: 'cn-wave 20s linear infinite reverse' }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
            <path
              d="M0,50 C240,15 480,85 720,50 C960,15 1200,85 1440,50 C1680,15 1920,85 2160,50 C2400,15 2640,85 2880,50"
              fill="none"
              stroke="rgba(0,200,255,0.045)"
              strokeWidth="1"
            />
          </svg>
        </div>
        {/* Wave 3 — green, lower, different phase */}
        <div style={{ position: 'absolute', top: '55%', left: 0, width: '200%', animation: 'cn-wave 18s linear 1.5s infinite' }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
            <path
              d="M0,50 C120,28 600,72 720,50 C840,28 1320,72 1440,50 C1560,28 2040,72 2160,50 C2280,28 2760,72 2880,50"
              fill="none"
              stroke="rgba(94,210,156,0.04)"
              strokeWidth="1"
            />
          </svg>
        </div>
        {/* Wave 4 — cyan, bottom, fastest */}
        <div style={{ position: 'absolute', top: '72%', left: 0, width: '200%', animation: 'cn-wave 10s linear 0.8s infinite reverse' }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
            <path
              d="M0,50 C360,10 360,90 720,50 C1080,10 1080,90 1440,50 C1800,10 1800,90 2160,50 C2520,10 2520,90 2880,50"
              fill="none"
              stroke="rgba(0,200,255,0.03)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* ── Vertical grid lines (desktop) ───────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} className="hidden md:block">
        {[25, 50, 75].map((pct, i) => (
          <div
            key={pct}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${pct}%`,
              width: 1,
              background: 'rgba(255,255,255,.07)',
              animation: `cn-line-pulse ${3.5 + i * 0.7}s ease-in-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Central glow ellipse ────────────────────────────── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <svg width="100%" height="380" viewBox="0 0 1440 380" preserveAspectRatio="xMidYTop slice">
          <defs>
            <filter id="cn-blur" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="25" />
            </filter>
            <radialGradient id="cn-glow-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1aff8c" stopOpacity=".18" />
              <stop offset="60%" stopColor="#0d5c42" stopOpacity=".12" />
              <stop offset="100%" stopColor="#0a3d2e" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Outer glow */}
          <ellipse cx="720" cy="80" rx="680" ry="120"
            fill="#0a3d2e" filter="url(#cn-blur)" style={{ animation: 'cn-glow-pulse 5s ease-in-out infinite' }} opacity=".7" />
          {/* Mid glow */}
          <ellipse cx="720" cy="50" rx="380" ry="70"
            fill="#0e6645" filter="url(#cn-blur)" style={{ animation: 'cn-glow-pulse 5s ease-in-out 1.5s infinite' }} opacity=".45" />
          {/* Bright core */}
          <ellipse cx="720" cy="30" rx="180" ry="40"
            fill="#1aff8c" filter="url(#cn-blur)" style={{ animation: 'cn-glow-pulse 5s ease-in-out 3s infinite' }} opacity=".15" />
        </svg>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 64px',
          height: 72,
          background: navScrolled ? 'rgba(7,11,10,.88)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(16px)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent',
          transition: 'background .3s ease, backdrop-filter .3s ease, border-color .3s ease',
        }}
        className="!px-5 sm:!px-8 md:!px-16"
      >
        <Logo />

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontFamily: F.inter,
                fontSize: 13,
                fontWeight: 600,
                color: navHover === link ? GREEN : 'rgba(255,255,255,.7)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                transition: 'color .2s',
              }}
              onMouseEnter={() => setNavHover(link)}
              onMouseLeave={() => setNavHover(null)}
            >
              {link}
            </a>
          ))}
          <a
            href="#"
            style={{
              fontFamily: F.inter,
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,.65)',
              textDecoration: 'none',
              padding: '8px 22px',
              border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 999,
              letterSpacing: '0.06em',
              transition: 'all .2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = GREEN;
              e.currentTarget.style.color = GREEN;
              e.currentTarget.style.boxShadow = `0 0 16px rgba(94,210,156,.15)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,.16)';
              e.currentTarget.style.color = 'rgba(255,255,255,.65)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Sign In
          </a>
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(7,11,10,.97)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity .25s ease',
        }}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link, i) => (
          <a
            key={link}
            href="#"
            onClick={closeMenu}
            style={{
              fontFamily: F.inter,
              fontSize: 40,
              fontWeight: 800,
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity .3s ease ${i * 60 + 80}ms, transform .3s ease ${i * 60 + 80}ms, color .2s`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
          >
            {link}
          </a>
        ))}
        <div
          style={{
            marginTop: 16,
            opacity: menuOpen ? 1 : 0,
            transition: `opacity .3s ease 400ms`,
          }}
        >
          <a
            href="#"
            style={{
              fontFamily: F.inter,
              fontSize: 13,
              fontWeight: 600,
              color: BG,
              background: GREEN,
              textDecoration: 'none',
              padding: '12px 28px',
              borderRadius: 999,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Get Started
          </a>
        </div>
      </div>

      {/* ── Hero content ────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 64px 80px',
        }}
        className="!px-5 sm:!px-8 md:!px-16 lg:!px-24"
      >

        {/* Glass card */}
        <div style={reveal(mounted, 0)}>
          <LiquidGlassCard offsetX={cardOffset.x} offsetY={cardOffset.y} />
        </div>

        {/* Eyebrow */}
        <p
          style={{
            ...reveal(mounted, 100),
            fontFamily: F.jakarta,
            fontSize: 11,
            fontWeight: 700,
            color: GREEN,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ display: 'inline-block', width: 20, height: 1, background: GREEN, flexShrink: 0 }} />
          Career-Ready Curriculum
        </p>

        {/* Headline */}
        <h1
          style={{
            ...reveal(mounted, 200),
            fontFamily: F.inter,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            lineHeight: 0.93,
            color: 'white',
            marginBottom: 24,
            fontSize: 'clamp(38px, 6.5vw, 76px)',
            maxWidth: '13ch',
          }}
        >
          LAUNCH YOUR
          <br />
          CODING CAREER
          <span style={{ color: GREEN }}>.</span>
        </h1>

        {/* Description */}
        <p
          style={{
            ...reveal(mounted, 320),
            fontFamily: F.inter,
            fontSize: 14,
            color: 'rgba(255,255,255,.68)',
            lineHeight: 1.75,
            maxWidth: 490,
            marginBottom: 40,
          }}
        >
          Master in-demand coding skills with hands-on projects and mentorship
          from industry professionals. Build a portfolio that gets you hired.
        </p>

        {/* CTAs */}
        <div style={{ ...reveal(mounted, 430), display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Primary CTA */}
          <button
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              fontFamily: F.inter,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              background: ctaHover ? '#4fc98e' : GREEN,
              color: BG,
              border: 'none',
              borderRadius: 999,
              padding: '14px 28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transform: ctaHover ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: ctaHover
                ? `0 14px 40px rgba(94,210,156,.4), 0 0 0 1px rgba(94,210,156,.3)`
                : `0 4px 20px rgba(94,210,156,.22)`,
              transition: 'all .22s cubic-bezier(.22,1,.36,1)',
            }}
          >
            {/* Shine sweep */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: ctaHover ? '150%' : '-100%',
                width: '60%',
                height: '100%',
                background: 'linear-gradient(105deg, transparent, rgba(255,255,255,.35), transparent)',
                transition: ctaHover ? 'left .4s ease' : 'none',
                pointerEvents: 'none',
              }}
            />
            Get Started
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>

          {/* Ghost CTA */}
          <a
            href="#"
            style={{
              fontFamily: F.inter,
              fontSize: 13,
              color: 'rgba(255,255,255,.55)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,255,255,.2)',
              textUnderlineOffset: 4,
              letterSpacing: '0.04em',
              transition: 'color .2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.9)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.55)')}
          >
            View all courses →
          </a>
        </div>

        {/* Social proof */}
        <div style={{ ...reveal(mounted, 540), marginTop: 52, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex' }}>
            {['#00c8ff', '#ff6b35', '#c8a0ff', GREEN, '#ffbd2e'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}55, ${color}18)`,
                  border: `2px solid ${BG}`,
                  marginLeft: i === 0 ? 0 : -9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  flexShrink: 0,
                }}
              >
                {['A', 'J', 'M', 'S', 'K'][i]}
              </div>
            ))}
          </div>
          {/* Stars + text */}
          <div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={GREEN}>
                  <path d="M6 1l1.4 3h3l-2.4 1.8.9 3L6 7.3 3.1 8.8l.9-3L1.6 4h3z" />
                </svg>
              ))}
            </div>
            <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1 }}>
              <span style={{ color: GREEN, fontWeight: 600 }}>2,400+</span>
              {' '}developers launched their careers
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          style={{
            ...reveal(mounted, 640),
            marginTop: 64,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 540,
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,.06)',
          }}
          className="!grid-cols-2 sm:!grid-cols-4"
        >
          {STATS.map((s, i) => (
            <StatItem key={i} {...s} active={statsActive} />
          ))}
        </div>
      </div>

      {/* ── Corner brackets ─────────────────────────────────── */}
      {[
        { pos: { top: 20, left: 20 }, d: 'M28 0H0v28' },
        { pos: { bottom: 20, right: 20 }, d: 'M0 28h28V0' },
      ].map(({ pos, d }, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{ position: 'absolute', ...pos, zIndex: 2, pointerEvents: 'none', opacity: mounted ? 1 : 0, transition: `opacity .8s ease ${600 + i * 200}ms` }}
          className="hidden lg:block"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d={d} stroke="rgba(94,210,156,.28)" strokeWidth="1.5" />
          </svg>
        </div>
      ))}

    </div>
  );
}
