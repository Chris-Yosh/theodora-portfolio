import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Draggable);
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

/* ---------- En-tête : se cache en descendant, revient en remontant ---------- */
const header = $('[data-header]');
if (header && !reduce) {
  ScrollTrigger.create({
    start: 'top -120',
    onUpdate: (st) => gsap.to(header, { yPercent: st.direction === 1 ? -110 : 0, duration: 0.6, ease: 'expo.out', overwrite: true }),
    onLeaveBack: () => gsap.to(header, { yPercent: 0, duration: 0.6, ease: 'expo.out', overwrite: true }),
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
  const stage = $('[data-hero-stage]', root)!;
  const copy = $('.hero-copy', root)!;
  const frame = $('[data-hero-frame]', root)!;
  const capsule = $('[data-capsule]', root)!;
  const slides = $$('[data-slide]', root);
  const cap = $('[data-frame-cap]', root)!;
  const fls = $$('[data-fl]', root);
  const lines = $$('[data-hl-line]', root);
  const fades = $$('[data-hero-fade]', root);
  const draws = $$<SVGPathElement>('[data-draw]', root);
  const mark = $('[data-mark]', root)!;

  // La fenêtre vidéo est posée exactement sur la capsule de la phrase
  // Mesure sans les transformations (intro, souris, scroll) : position de mise en page pure
  const place = () => {
    let x = 0, y = 0, n: HTMLElement | null = capsule;
    while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
    return { left: x, top: y, width: capsule.offsetWidth, height: capsule.offsetHeight };
  };
  gsap.set(frame, place());
  let opened = 0;
  window.addEventListener('resize', () => { if (opened === 0) gsap.set(frame, place()); });

  // Diaporama dans la capsule
  let i = 0;
  const next = () => {
    const prev = slides[i];
    i = (i + 1) % slides.length;
    const cur = slides[i];
    slides.forEach((s) => (s.style.zIndex = s === cur ? '2' : s === prev ? '1' : '0'));
    cap.textContent = cur.dataset.title ?? '';
    gsap.timeline()
      .fromTo(cur, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'curtain' })
      .fromTo($('img', cur), { scale: 1.4, xPercent: 10 }, { scale: 1, xPercent: 0, duration: 1.5, ease: 'silk' }, 0)
      .to($('img', prev), { xPercent: -14, duration: 1.2, ease: 'curtain' }, 0)
      .set($('img', prev), { xPercent: 0 }, 1.2);
  };
  if (!reduce) gsap.delayedCall(4.2, function loop() { next(); gsap.delayedCall(2.8, loop); });

  if (reduce) return;

  // Entrée : la phrase monte, le surligneur passe, les traits se dessinent, la capsule s'ouvre, les cartes arrivent
  draws.forEach((d) => { const l = d.getTotalLength(); gsap.set(d, { strokeDasharray: l, strokeDashoffset: l }); });
  gsap.set(mark, { skewX: -6, scaleX: 0, transformOrigin: 'left center' });
  gsap.set(lines, { clipPath: 'inset(-60% -12% -8% -12%)' });
  const inner = lines.map((l) => { const w = document.createElement('span'); w.style.display = 'inline-block'; while (l.firstChild) w.append(l.firstChild); l.append(w); return w; });
  const cards = fls.map((f) => $('.fl-card', f)!);

  const intro = gsap.timeline({ delay: 0.8, onComplete: () => { gsap.set(lines, { clipPath: 'none' }); } });
  intro
    .from(inner, { yPercent: 110, rotate: 3, duration: 1.5, ease: 'silk', stagger: 0.12 }, 0)
    .from(fades[0], { y: 16, opacity: 0, duration: 1, ease: 'expo.out' }, 0.1)
    .to(mark, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0.75)
    .to(draws, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.15 }, 1.05)
    .add(() => gsap.set(frame, place()), 1.1)
    .fromTo(frame, { clipPath: 'inset(0% 50% 0% 50% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.2, ease: 'curtain', onComplete: () => { gsap.set(frame, { clipPath: 'none' }); } }, 1.1)
    .from($('img', slides[0]), { scale: 1.6, duration: 1.8, ease: 'silk' }, 1.1)
    .from(fades.slice(1), { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 1.2)
    .from(cards, {
      opacity: 0, scale: 0.4, y: 120, rotation: () => gsap.utils.random(-40, 40),
      duration: 1.5, ease: 'back.out(1.4)', stagger: { each: 0.08, from: 'center' },
      onComplete() {
        cards.forEach((c, k) => gsap.to(c, { y: k % 2 ? -12 : 12, rotation: k % 2 ? 1.5 : -1.5, duration: 2.6 + k * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      },
    }, 1.0);

  // Profondeur : chaque carte suit la souris selon sa distance
  if (fine) {
    const movers = fls.map((f) => {
      const p = $('.fl-p', f)!, d = Number(f.dataset.depth ?? 1);
      return { d, x: gsap.quickTo(p, 'x', { duration: 1.4, ease: 'power3' }), y: gsap.quickTo(p, 'y', { duration: 1.4, ease: 'power3' }) };
    });
    const cx = gsap.quickTo(copy, 'x', { duration: 1.8, ease: 'power3' });
    const cy = gsap.quickTo(copy, 'y', { duration: 1.8, ease: 'power3' });
    root.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => { m.x(-nx * 70 * m.d); m.y(-ny * 50 * m.d); });
      cx(nx * 12); cy(ny * 8);
    });
  }

  // Au scroll : les cartes s'envolent vers les bords, la capsule s'ouvre en plein écran
  gsap.matchMedia().add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: '+=130%', pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: (st) => (opened = st.progress) },
    });
    tl.fromTo(frame, { left: () => place().left, top: () => place().top, width: () => place().width, height: () => place().height }, {
      left: 0, top: 0, width: () => stage.clientWidth, height: () => stage.clientHeight, ease: 'power3.inOut', immediateRender: false,
    }, 0)
      .fromTo(frame, { borderRadius: () => capsule.offsetHeight / 2 }, { borderRadius: 0, ease: 'power2.in', immediateRender: false }, 0)
      .to(copy, { opacity: 0, scale: 0.94, filter: 'blur(6px)', ease: 'power2.in', duration: 0.6 }, 0)
      .to(cap, { opacity: 1, duration: 0.2 }, 0.8);
    fls.forEach((f) => {
      tl.to(f, {
        x: () => { const r = f.getBoundingClientRect(); return (r.left + r.width / 2 - innerWidth / 2) * 0.9; },
        y: () => { const r = f.getBoundingClientRect(); return (r.top + r.height / 2 - innerHeight / 2) * 0.9; },
        rotation: () => gsap.utils.random(-25, 25), scale: 0.85, opacity: 0, ease: 'power2.in', duration: 0.7,
      }, 0);
    });
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

/* ---------- Carnet : anneau 3D (rotation lente, élan au scroll, glisser ou swiper) ---------- */
function ring() {
  const stage = $('[data-ring-stage]'), el = $('[data-ring]');
  if (!stage || !el) return;
  const cards = $$('[data-rc]', el);
  const step = 360 / cards.length;
  const readR = () => parseFloat(getComputedStyle(el).getPropertyValue('--R')) || 700;
  let R = readR(), rot = 0, vel = 0, dragging = false, lastX = 0, moved = 0, visible = true;
  window.addEventListener('resize', () => { R = readR(); });

  const render = () => {
    el.style.transform = `translateZ(${-R}px) rotateX(-9deg) rotateY(${rot}deg)`;
    cards.forEach((c, k) => {
      const cos = Math.cos(((k * step + rot) * Math.PI) / 180);
      c.style.opacity = String(0.2 + 0.8 * Math.max(0, (cos + 0.4) / 1.4) ** 1.4);
      c.style.pointerEvents = cos > 0.55 ? 'auto' : 'none';
    });
  };
  render();

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
  gsap.ticker.add(() => {
    if (!visible && !dragging) return;
    if (!dragging) { vel *= 0.94; rot += (reduce ? 0 : 0.05) + vel; }
    render();
  });
  ScrollTrigger.create({
    trigger: stage, start: 'top bottom', end: 'bottom top',
    onEnter: () => { if (!reduce) vel = -5; },
    onUpdate: (st) => { if (!dragging && !reduce) vel += gsap.utils.clamp(-0.6, 0.6, st.getVelocity() / -6000); },
  });

  // Glisser à la souris ou au doigt
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'mouse') e.preventDefault();
    dragging = true; moved = 0; lastX = e.clientX; vel = 0;
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX; moved += Math.abs(dx);
    if (moved > 4 && !stage.hasPointerCapture(e.pointerId)) { stage.setPointerCapture(e.pointerId); stage.classList.add('dragging'); }
    rot += dx * 0.14; vel = dx * 0.14;
  });
  const up = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false; stage.classList.remove('dragging');
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  // Après un glisser, on n'ouvre pas le lien sous le doigt
  stage.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  stage.addEventListener('dragstart', (e) => e.preventDefault());
  // Swipe horizontal au trackpad
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); vel -= e.deltaX * 0.012; }
  }, { passive: false });
  // Clavier : flèches gauche / droite
  stage.tabIndex = 0;
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') vel += 2.5;
    if (e.key === 'ArrowRight') vel -= 2.5;
  });
}

/* ---------- À propos : tuiles et collage ---------- */
function about() {
  const tiles = $$('[data-tile]');
  if (!tiles.length) return;
  if (!reduce) {
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      onEnter: (batch) => gsap.from(batch, { y: 80, scale: 0.94, rotation: () => gsap.utils.random(-4, 4), opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08 }),
    });
  }
  let z = 20;
  Draggable.create($$('[data-sticker]'), {
    type: 'x,y', bounds: $('[data-collage]') ?? undefined, edgeResistance: 0.65,
    onPress() { const t = this.target as HTMLElement; t.style.zIndex = String(++z); gsap.to(t, { scale: 1.08, rotation: '+=6', duration: 0.5, ease: 'back.out(2)' }); },
    onRelease() { gsap.to(this.target, { scale: 1, duration: 0.6, ease: 'back.out(2)' }); },
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
  ring();
  about();
  projectPage();
  ScrollTrigger.refresh();
});
