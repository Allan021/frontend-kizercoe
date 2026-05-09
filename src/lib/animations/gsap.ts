import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function initGSAP() {
  if (typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Global defaults
  gsap.defaults({ ease: 'power3.out' });

  // Refresh ScrollTrigger on resize
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  return { gsap, ScrollTrigger, SplitText };
}

export function animateHero() {
  if (typeof window === 'undefined') return;
  const ctx = gsap.context(() => {
    // 3-D perspective on the title container for rotateX chars
    gsap.set('#kz-title', { perspective: 700 });

    const tl = gsap.timeline({ delay: 0.08 });

    // 1. Badge slides down
    tl.fromTo(
      '#hero-badge',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    );

    // 2. "Kizercode" — each letter bounces in from below (spring physics)
    tl.fromTo(
      '.kz-char',
      { opacity: 0, y: 40, rotateX: -80, scale: 0.85 },
      {
        opacity: 1, y: 0, rotateX: 0, scale: 1,
        duration: 0.38,
        stagger: 0.048,           // 48ms per char → ~430ms total for 9 chars
        ease: 'back.out(2.4)',
      },
      '-=0.15'
    );

    // 3. Cursor appears; CSS class handles blink loop
    tl.set('#kz-cursor', { opacity: 1 });
    tl.add(() => {
      document.getElementById('kz-cursor')?.classList.add('kz-cursor-blink');
    });

    // 4. Tagline fades up (starts while last chars still landing)
    tl.fromTo(
      '#hero-tagline',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      '-=0.28'
    );

    // 5. Description
    tl.fromTo(
      '#hero-sub',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' },
      '-=0.2'
    );

    // 6. CTA buttons
    tl.fromTo(
      '#hero-actions',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' },
      '-=0.22'
    );

    // 7. Stats — stagger 40ms (tight, rhythmic)
    tl.fromTo(
      '.hero-stat',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power3.out' },
      '-=0.18'
    );

    // 8. Code window — absolute start so it runs in parallel with the chars
    tl.fromTo(
      '#hero-visual',
      { opacity: 0, x: 28, scale: 0.97 },
      { opacity: 1, x: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
      0.22
    );

    // Stat number counters
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = el as HTMLElement;
      const endVal = parseFloat(target.dataset['count'] || '0');
      gsap.fromTo(
        target,
        { innerText: 0 },
        {
          innerText: endVal,
          duration: 2,
          delay: 2,
          ease: 'power2.out',
          snap: { innerText: endVal % 1 === 0 ? 1 : 0.1 },
          onUpdate: function () {
            const val = parseFloat((this.targets()[0] as HTMLElement).innerText);
            target.innerText =
              endVal % 1 === 0 ? Math.round(val).toString() : val.toFixed(1);
          },
        }
      );
    });
  });
  return ctx;
}

export function animateSections() {
  if (typeof window === 'undefined') return;

  // Generic fade-up for sections
  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Stagger children
  gsap.utils.toArray<HTMLElement>('[data-gsap="stagger"]').forEach((parent) => {
    const children = parent.querySelectorAll('[data-gsap-child]');
    if (children.length === 0) return;
    gsap.fromTo(
      children,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Process steps with connecting line
  const processSteps = gsap.utils.toArray<HTMLElement>('.process-step-item');
  processSteps.forEach((step, i) => {
    gsap.fromTo(
      step,
      { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Metrics counter
  gsap.utils.toArray<HTMLElement>('.metric-num').forEach((el) => {
    const text = el.innerText;
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;

    gsap.fromTo(
      { val: 0 },
      { val: num },
      {
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
          el.innerText =
            (num % 1 === 0
              ? Math.round(this.targets()[0].val)
              : this.targets()[0].val.toFixed(1)) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

export function initMagneticButtons() {
  if (typeof window === 'undefined') return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

export function initNavScroll() {
  if (typeof window === 'undefined') return;
  const nav = document.querySelector('#main-nav') as HTMLElement;
  if (!nav) return;

  const applyNavBg = (scrolled: boolean) => {
    nav.style.background = scrolled
      ? 'var(--color-nav-bg-scrolled)'
      : 'var(--color-nav-bg)';
    nav.style.borderBottomColor = scrolled
      ? 'var(--color-border)'
      : 'var(--color-border-soft)';
  };

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => applyNavBg(self.scroll() > 80),
  });
}
