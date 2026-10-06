import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('silk', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('curtain', 'M0,0 C0.76,0 0.24,1 1,1');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* ---------- Défilement doux ---------- */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.hash.slice(1);
      const el = id && document.getElementById(id);
      if (el && a.pathname === location.pathname) { e.preventDefault(); lenis!.scrollTo(el, { duration: 1.6 }); }
    });
  });
}

/* ---------- Curseur ---------- */
const cursor = $('[data-cursor-el]');
if (cursor && fine && !reduce) {
  const label = $('[data-cursor-label]', cursor)!;
  gsap.set(cursor, { width: 92, height: 92, margin: '-46px 0 0 -46px', scale: 0.11, opacity: 1 });
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
  document.addEventListener('pointerover', (e) => {
    const el = e.target as HTMLElement;
    const t = el.closest<HTMLElement>('[data-cursor]');
    const big = !!t && !$('[data-lightbox]:not([hidden])');
    if (big) label.textContent = t!.dataset.cursor ?? '';
    gsap.to(cursor, { scale: big ? 1 : el.closest('a, button') ? 0.32 : 0.11, duration: 0.6, ease: 'expo.out' });
    gsap.to(label, { opacity: big ? 1 : 0, duration: big ? 0.3 : 0.15, delay: big ? 0.1 : 0 });
  });
}

/* ---------- Typo : apparitions masquées ---------- */
function splitReveals() {
  if (reduce) return;
  $$('[data-lines]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (s) => gsap.from(s.lines, { yPercent: 105, duration: 1.4, ease: 'silk', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 85%' } }),
    });
  });
  $$('[data-words]').forEach((el) => {
    SplitText.create(el, {
      type: 'words', autoSplit: true,
      onSplit: (s) => gsap.fromTo(s.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true } }),
    });
  });
}

/* ---------- Hero ---------- */
function hero() {
  const root = $('[data-hero]');
  if (!root) return;
  const frame = $('[data-hero-frame]', root)!;
  const words = $$('[data-hero-word]', root);
  const slides = $$('[data-slide]', root);
  const capT = $('[data-cap-title]', root)!;
  const capM = $('[data-cap-meta]', root)!;
  const chrome = $$('.hero-l, .hero-r, .hero-cap, .hero-scroll', root);
  let opened = 0;

  // Diaporama : chaque film entre par un volet qui remonte, la légende change en même temps
  let i = 0;
  const next = () => {
    const prev = slides[i];
    i = (i + 1) % slides.length;
    const cur = slides[i];
    slides.forEach((s) => (s.style.zIndex = s === cur ? '2' : s === prev ? '1' : '0'));
    gsap.timeline()
      .fromTo(cur, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'curtain' })
      .fromTo($('img', cur), { scale: 1.35, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 1.6, ease: 'silk' }, 0)
      .to($('img', prev), { yPercent: -12, scale: 1.08, duration: 1.3, ease: 'curtain' }, 0)
      .to([capT, capM], { yPercent: -60, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.05 }, 0)
      .add(() => {
        capT.textContent = cur.dataset.title ?? '';
        capM.textContent = cur.dataset.meta ?? '';
      }, 0.5)
      .set($('img', prev), { yPercent: 0, scale: 1 }, 1.3)
      .fromTo([capT, capM], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.5);
  };
  if (!reduce) gsap.delayedCall(3.6, function loop() { next(); gsap.delayedCall(3.2, loop); });
  if (reduce) return;

  // Entrée : après le rideau, le nom monte lettre par lettre et la fenêtre s'ouvre depuis son centre
  const intro = gsap.timeline({ delay: 0.75 });
  words.forEach((w, k) => {
    const s = SplitText.create(w, { type: 'chars', mask: 'chars' });
    intro.from(s.chars, { yPercent: 115, rotate: k ? -8 : 8, duration: 1.6, ease: 'silk', stagger: 0.045 }, k * 0.12);
  });
  intro
    .from(frame, { clipPath: 'inset(50% 50% 50% 50%)', duration: 1.6, ease: 'curtain' }, 0.25)
    .from($('img', slides[0]), { scale: 1.6, duration: 2.2, ease: 'silk' }, 0.25)
    .from(chrome, { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0.9);

  // La fenêtre s'incline vers la souris, le nom glisse en sens inverse
  if (fine) {
    gsap.set(frame, { transformPerspective: 900 });
    const rx = gsap.quickTo(frame, 'rotationY', { duration: 1.2, ease: 'power3' });
    const ry = gsap.quickTo(frame, 'rotationX', { duration: 1.2, ease: 'power3' });
    const wx = words.map((w) => gsap.quickTo(w, 'x', { duration: 1.6, ease: 'power3' }));
    root.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      const k = 1 - opened;
      rx(nx * 14 * k); ry(-ny * 10 * k);
      wx.forEach((f, k) => f(nx * (k ? -40 : 40)));
    });
  }

  // Au scroll : la fenêtre s'ouvre en plein écran et le nom s'écarte
  gsap.matchMedia().add('(min-width: 900px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: '+=110%', pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => { opened = s.progress; if (s.progress > 0.02) gsap.to(frame, { rotationX: 0, rotationY: 0, duration: 0.6, overwrite: 'auto' }); } } })
      .to(frame, { width: () => innerWidth, height: () => innerHeight, borderRadius: 0, ease: 'power2.inOut' }, 0)
      .to(words[0], { xPercent: -70, opacity: 0, ease: 'power2.in' }, 0)
      .to(words[1], { xPercent: 70, opacity: 0, ease: 'power2.in' }, 0)
      .to(chrome, { opacity: 0, duration: 0.25 }, 0);
  });
}

/* ---------- Galerie de films : défilement horizontal épinglé ---------- */
function films() {
  const section = $('[data-films]');
  const track = $('[data-films-track]');
  if (!section || !track || reduce) return;
  gsap.matchMedia().add('(min-width: 900px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const skew = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' });
    const move = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (self) => skew(gsap.utils.clamp(-4, 4, self.getVelocity() / -500)),
        onLeave: () => skew(0), onLeaveBack: () => skew(0),
      },
    });
    $$('.film', track).forEach((card) => {
      const img = $('[data-film-img]', card)!;
      gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
    });
  });
}

/* ---------- Lecteur plein écran : la vignette s'agrandit jusqu'au lecteur ---------- */
function lightbox() {
  const lb = $('[data-lightbox]');
  if (!lb) return;
  const bg = $('[data-lb-bg]', lb)!, frame = $('[data-lb-frame]', lb)!, poster = $<HTMLImageElement>('[data-lb-poster]', lb)!;
  const ui = $('[data-lb-ui]', lb)!, closeBtn = $<HTMLButtonElement>('[data-lb-close]', lb)!, ext = $<HTMLAnchorElement>('[data-lb-ext]', lb)!;
  let source: HTMLElement | null = null, opener: HTMLElement | null = null, busy = false;

  const target = (ratio: string) => {
    const [a, b] = ratio.split('/').map(Number);
    const r = a / b, maxW = innerWidth * 0.88, maxH = innerHeight * 0.72;
    const width = Math.min(maxW, maxH * r), height = width / r;
    return { left: (innerWidth - width) / 2, top: (innerHeight - height) / 2 - 28, width, height };
  };
  const rectOf = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };

  const open = (btn: HTMLElement) => {
    if (busy) return;
    busy = true;
    const d = btn.dataset;
    opener = btn;
    source = btn.querySelector<HTMLElement>('.film-media') ?? btn.closest<HTMLElement>('[data-hero-frame]') ?? btn;
    poster.src = d.poster ?? '';
    $('[data-lb-title]', lb)!.textContent = d.title ?? '';
    $('[data-lb-meta]', lb)!.textContent = d.meta ?? '';
    ext.href = `https://vimeo.com/${d.vimeo}${d.hash ? '/' + d.hash : ''}`;
    lb.hidden = false;
    lenis?.stop();
    const to = target(d.ratio ?? '16 / 9');
    const done = () => {
      const f = document.createElement('iframe');
      f.src = `https://player.vimeo.com/video/${d.vimeo}?${d.hash ? `h=${d.hash}&` : ''}autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      f.title = d.title ?? 'Vidéo';
      f.addEventListener('load', () => f.classList.add('on'));
      frame.append(f);
      closeBtn.focus({ preventScroll: true });
      busy = false;
    };
    if (reduce) { gsap.set(frame, to); gsap.set([bg, ui], { opacity: 1 }); done(); return; }
    const from = rectOf(source);
    gsap.set(source, { visibility: 'hidden' });
    gsap.timeline({ onComplete: done })
      .set(frame, { ...from, borderRadius: 6 })
      .to(bg, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(frame, { ...to, duration: 1.15, ease: 'curtain' }, 0)
      .fromTo(poster, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'silk' }, 0)
      .fromTo(ui, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.6);
  };

  const close = () => {
    if (busy || lb.hidden) return;
    busy = true;
    $('iframe', frame)?.remove();
    const end = () => {
      lb.hidden = true;
      if (source) gsap.set(source, { visibility: 'visible' });
      lenis?.start();
      opener?.focus({ preventScroll: true });
      busy = false;
    };
    if (reduce || !source) { end(); return; }
    gsap.timeline({ onComplete: end })
      .to(ui, { opacity: 0, duration: 0.3 }, 0)
      .to(frame, { ...rectOf(source), duration: 1, ease: 'curtain' }, 0)
      .to(bg, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15);
  };

  gsap.set(bg, { opacity: 0 });
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-film]');
    if (btn) { e.preventDefault(); open(btn); }
  });
  closeBtn.addEventListener('click', close);
  bg.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ---------- Index : l'aperçu suit le curseur et penche selon sa vitesse ---------- */
function peek() {
  const box = $('[data-peek]'), rows = $('[data-rows]');
  if (!box || !rows || !fine || reduce) return;
  const img = $<HTMLImageElement>('[data-peek-img]', box)!;
  const px = gsap.quickTo(box, 'x', { duration: 0.7, ease: 'power3' });
  const py = gsap.quickTo(box, 'y', { duration: 0.7, ease: 'power3' });
  const rot = gsap.quickTo(box, 'rotation', { duration: 0.9, ease: 'power3' });
  let lastX = 0;
  rows.addEventListener('pointermove', (e) => {
    px(e.clientX); py(e.clientY);
    rot(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  });
  $$('[data-row]', rows).forEach((row) => {
    row.addEventListener('pointerenter', () => {
      if (img.getAttribute('src') !== row.dataset.img) {
        img.src = row.dataset.img ?? '';
        gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 0.9, ease: 'silk' });
      }
      gsap.to(box, { scale: 1, duration: 0.7, ease: 'expo.out' });
    });
  });
  rows.addEventListener('pointerleave', () => gsap.to(box, { scale: 0, duration: 0.5, ease: 'expo.in' }));
}

/* ---------- Carnet : deux bandeaux opposés qui accélèrent avec le scroll ---------- */
function marquees() {
  if (reduce) return;
  $$('[data-marquee]').forEach((m) => {
    const track = $('.m-track', m)!;
    const right = m.dataset.marquee === 'right';
    const loop = gsap.fromTo(track, { xPercent: right ? -50 : 0 }, { xPercent: right ? 0 : -50, duration: 70, ease: 'none', repeat: -1 });
    let hover = false;
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        if (hover) return;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 8);
        gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); } });
      },
    });
    m.addEventListener('pointerenter', () => { hover = true; gsap.to(loop, { timeScale: 0.15, duration: 0.8, overwrite: true }); });
    m.addEventListener('pointerleave', () => { hover = false; gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: true }); });
  });
}

/* ---------- Page projet ---------- */
function projectPage() {
  if (reduce) return;
  const title = $('[data-project-title]');
  if (title) {
    const s = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
    gsap.from(s.chars, { yPercent: 110, duration: 1.5, ease: 'silk', stagger: 0.025, delay: 0.75 });
  }
  $$('[data-fade]').forEach((el, k) => gsap.from(el, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 1 + k * 0.08 }));
  $$('[data-reveal]').forEach((el) => {
    const img = $('img', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } });
    tl.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'curtain' });
    if (img) tl.from(img, { scale: 1.3, duration: 1.8, ease: 'silk' }, 0);
  });
}

lightbox();
document.fonts.ready.then(() => {
  hero();
  splitReveals();
  films();
  peek();
  marquees();
  projectPage();
  ScrollTrigger.refresh();
});
