import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(ScrollTrigger, Draggable);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover)').matches;

// Défilement doux
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.split('#')[1];
      const el = id && document.getElementById(id);
      if (el && (a.pathname === location.pathname)) { e.preventDefault(); lenis.scrollTo(el, { offset: -20 }); }
    });
  });
}

// Titres découpés lettre par lettre
document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const chars: HTMLElement[] = [];
  text.split(' ').forEach((word, w, all) => {
    const line = document.createElement('span');
    line.setAttribute('aria-hidden', 'true');
    line.style.cssText = 'display:inline-block;white-space:nowrap';
    [...word].forEach((c) => {
      const s = document.createElement('span');
      s.textContent = c;
      s.style.display = 'inline-block';
      line.append(s);
      chars.push(s);
    });
    el.append(line);
    if (w < all.length - 1) el.append(document.createElement(el.dataset.split === 'lines' ? 'br' : 'wbr'), ' ');
  });
  if (reduce) return;
  gsap.from(chars, {
    yPercent: 120, rotation: () => gsap.utils.random(-35, 35), scale: 0.4, opacity: 0,
    duration: 1.4, ease: 'elastic.out(1, 0.45)', stagger: { each: 0.05, from: 'random' }, delay: 0.15,
  });
  if (fine) chars.forEach((s) => s.addEventListener('mouseenter', () => {
    gsap.fromTo(s, { y: 0, rotation: 0 }, { y: -18, rotation: gsap.utils.random(-14, 14), duration: 0.5, ease: 'elastic.out(1, 0.35)', yoyo: true, repeat: 1 });
  }));
});

if (!reduce) {
  // Dessins flottants : dérive continue + parallaxe au scroll
  document.querySelectorAll<SVGElement>('[data-float]').forEach((el) => {
    gsap.to(el, { y: gsap.utils.random(-18, 18), x: gsap.utils.random(-12, 12), rotation: gsap.utils.random(-14, 14), duration: gsap.utils.random(2.4, 4), ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const depth = Number(el.dataset.depth ?? 0.2);
    gsap.to(el.parentElement!, { yPercent: -depth * 60, ease: 'none', scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Apparition élastique
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 70, rotation: gsap.utils.random(-3, 3), opacity: 0, duration: 1.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray<HTMLElement>('[data-card]').forEach((el) => {
    gsap.from(el, { y: 120, scale: 0.9, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray<HTMLElement>('[data-hero-card]').forEach((el, i) => {
    gsap.from(el, { y: 200, rotation: gsap.utils.random(-30, 30), opacity: 0, duration: 1.6, delay: 0.5 + i * 0.15, ease: 'elastic.out(1, 0.5)' });
    gsap.to(el, { y: i % 2 ? -16 : 16, rotation: `+=${i % 2 ? 3 : -3}`, duration: 3 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  // Cartes : effet gélatine au survol
  if (fine) document.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
    const tilt = parseFloat(getComputedStyle(el).getPropertyValue('--tilt')) || 0;
    el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.035, rotation: -tilt * 1.6, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, rotation: tilt, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' }));
  });

  // Stickers du carnet : à attraper et déplacer
  const board = document.querySelector<HTMLElement>('[data-board]');
  if (board) {
    let z = 10;
    Draggable.create(board.querySelectorAll('[data-drag]'), {
      type: 'x,y', bounds: board, edgeResistance: 0.7,
      onPress() { gsap.to(this.target, { scale: 1.08, rotation: '+=4', duration: 0.5, ease: 'elastic.out(1, 0.4)' }); (this.target as HTMLElement).style.zIndex = String(++z); },
      onRelease() { gsap.to(this.target, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' }); },
    });
    gsap.from(board.querySelectorAll('[data-drag]'), { scale: 0, rotation: () => gsap.utils.random(-60, 60), opacity: 0, duration: 1, ease: 'back.out(2)', stagger: 0.05, scrollTrigger: { trigger: board, start: 'top 80%' } });
  }
}

// Lecteur Vimeo : on ne charge l'iframe qu'au clic
document.querySelectorAll<HTMLButtonElement>('[data-vimeo]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const { vimeo, hash, title } = btn.dataset;
    const f = document.createElement('iframe');
    f.src = `https://player.vimeo.com/video/${vimeo}?${hash ? `h=${hash}&` : ''}autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
    f.title = title ?? 'Vidéo';
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.className = 'vimeo-frame';
    btn.replaceWith(f);
  }, { once: true });
});
