// Noo — mise en scène (GSAP + ScrollTrigger + Lenis, tous optionnels :
// sans eux, la page reste complète et lisible).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) document.documentElement.classList.add('no-gsap');

  /* ================= Préparation du DOM ================= */

  // Découpe un texte en mots, en conservant <em> et <br>
  const splitWords = (node, wrap) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          frag.append(/^\s+$/.test(part) ? ' ' : wrap(part));
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        splitWords(child, wrap);
      }
    });
  };
  $$('[data-split]').forEach((el) => splitWords(el, (w) => {
    const o = document.createElement('span');
    o.className = 'ln';
    o.innerHTML = '<span></span>';
    o.firstChild.textContent = w;
    return o;
  }));
  $$('[data-words]').forEach((el) => splitWords(el, (w) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    return s;
  }));
  $$('[data-roll]').forEach((el) => {
    const t = el.textContent;
    el.textContent = '';
    const s = document.createElement('span');
    s.dataset.t = t;
    s.textContent = t;
    el.append(s);
  });

  // Grille de points (80 sur 100)
  $$('[data-dots]').forEach((el) => {
    const on = +el.dataset.dots;
    for (let i = 0; i < 100; i++) {
      const d = document.createElement('i');
      if (!hasGsap && i < on) d.className = 'on';
      el.append(d);
    }
  });

  /* ================= Interface ================= */

  const header = $('[data-header]');
  $('[data-announce-close]')?.addEventListener('click', () => {
    $('[data-announce]').classList.add('is-hidden');
    body.classList.add('no-announce');
  });

  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  let lenis = null;
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const dropBtn = $('[data-drop]');
  dropBtn.addEventListener('click', () => {
    const open = dropBtn.parentElement.classList.toggle('is-open');
    dropBtn.setAttribute('aria-expanded', open);
  });

  // Boutons MIA : widget Jotform s'il est chargé, sinon page de l'agent
  $$('[data-mia]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.querySelector('#JotformAgent-019bdbf2ceb07143ad793afebff71178bb2b .ai-agent-chat-avatar')
      || document.querySelector('.ai-agent-chat-avatar') || document.querySelector('.jficc');
    if (el) el.click();
    else window.open('https://eu.jotform.com/agent/019bdbf2ceb07143ad793afebff71178bb2b', '_blank');
  }));

  // En-tête : thème clair/sombre selon la section dessous, masqué en descendant
  const themed = $$('main [data-theme], footer[data-theme]');
  let lastY = scrollY;
  const updateHeader = () => {
    const y = scrollY;
    body.classList.toggle('is-scrolled', y > 10);
    body.classList.toggle('past-hero', y > innerHeight * 0.6);
    if (!body.classList.contains('menu-open')) header.classList.toggle('is-away', y > innerHeight * 1.2 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-away');
    lastY = y;
    const probe = header.getBoundingClientRect().top + 24;
    let theme = 'dark';
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) theme = s.dataset.theme;
    }
    if (body.classList.contains('has-reveal') && $('.main').getBoundingClientRect().bottom < probe) theme = 'dark';
    header.dataset.theme = theme;
  };

  // Conversation MIA, message par message
  const chat = $('[data-chat]');
  let chatPlayed = false;
  const playChat = () => {
    if (chatPlayed || reduced || !chat) return;
    chatPlayed = true;
    const msgs = $$('.msg:not(.msg--typing)', chat);
    const typing = $('.msg--typing', chat);
    chat.classList.add('is-playing');
    let i = 0;
    const next = () => {
      if (i >= msgs.length) return;
      const m = msgs[i++];
      const isMia = m.classList.contains('msg--mia');
      if (isMia) { m.before(typing); typing.classList.add('is-shown'); }
      setTimeout(() => {
        typing.classList.remove('is-shown');
        m.classList.add('is-shown');
        setTimeout(next, 650);
      }, isMia ? 1000 : 380);
    };
    setTimeout(next, 250);
  };

  /* ================= Sans GSAP : version statique soignée ================= */
  if (!hasGsap || reduced) {
    body.classList.remove('is-loading');
    window.NooGL?.show();
    $$('.statement .w').forEach((w) => w.classList.add('on'));
    $$('.viz-dots i').forEach((d, i) => d.classList.toggle('on', i < 80));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { playChat(); io.disconnect(); } }), { threshold: .3 });
    if (chat) io.observe(chat);
    addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
    return;
  }

  /* ================= GSAP ================= */
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // Défilement doux synchronisé
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      lenis.scrollTo($(id), { offset: -40, duration: 1.6 });
    }));
  }
  gsap.ticker.add(updateHeader);

  /* ---------- États initiaux (posés par JS : sans JS tout reste visible) ---------- */
  const heroWords = $$('.hero__title .ln > span');
  const heroBits = $$('.hero__kicker, .hero__trio li, .hero__ctas .btn, .header > *');
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set(heroBits, { opacity: 0, y: 24 });
  gsap.set('.hero__pill', { width: 0 });

  /* ---------- Intro ---------- */
  const heroIn = () => {
    window.NooGL?.show();
    gsap.to(heroWords, { yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.07 });
    gsap.to('.hero__pill', { width: () => (innerWidth < 960 ? '1.3em' : '1.75em'), duration: 1.6, ease: 'expo.inOut', delay: 0.25, clearProps: 'width' });
    gsap.to(heroBits, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.05, delay: 0.45, clearProps: 'transform' });
  };

  const loader = $('.loader');
  const countEl = $('[data-loader-count]');
  const startIntro = () => {
    const c = { v: 0 };
    gsap.timeline({ onComplete: () => { body.classList.remove('is-loading'); loader.remove(); ScrollTrigger.refresh(); } })
      .to(c, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = String(Math.round(c.v)).padStart(3, '0'); } }, 0)
      .fromTo('.loader .ld-a', { attr: { cx: 54 } }, { attr: { cx: 87 }, duration: 1.4, ease: 'power3.inOut' }, 0.1)
      .fromTo('.loader .ld-b', { attr: { cx: 146 } }, { attr: { cx: 113 }, duration: 1.4, ease: 'power3.inOut' }, 0.1)
      .to('.loader__mark', { scale: 1.15, duration: 0.5, ease: 'power2.in' }, 1.55)
      .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, 1.75)
      .add(heroIn, 2.1);
  };
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(startIntro);

  /* ---------- Révélations génériques ---------- */
  $$('[data-split]').forEach((el) => {
    if (el.closest('.hero')) return;
    const words = $$('.ln > span', el);
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.05 }),
    });
  });
  gsap.set('[data-fade]', { opacity: 0, y: 30 });
  ScrollTrigger.batch('[data-fade]', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08 }),
  });

  // Phrase manifeste : les mots s'allument au défilement
  const words = $$('.statement .w');
  ScrollTrigger.create({
    trigger: '.statement', start: 'top 82%', end: 'bottom 40%', scrub: true,
    onUpdate: (s) => {
      const lit = Math.round(s.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    },
  });

  // Mosaïque : l'image s'ouvre depuis une capsule
  gsap.fromTo('.bento__img', { clipPath: 'inset(16% 22% 16% 22% round 400px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none',
    scrollTrigger: { trigger: '.bento', start: 'top 92%', end: 'top 30%', scrub: true },
  });
  gsap.fromTo('.bento__img img', { scale: 1.35 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.bento', start: 'top 92%', end: 'bottom top', scrub: true },
  });
  gsap.from('.bento__img figcaption', {
    y: 40, opacity: 0, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.bento', start: 'top 40%', once: true },
  });

  /* ---------- Comparatif ---------- */
  const counters = $$('[data-count]');
  counters.forEach((el) => { el.textContent = '0'; });
  gsap.set('.viz-time__bar', { scaleX: 0 });
  gsap.set('.viz-cost__small', { scale: 0 });
  gsap.set('.viz-cost__big', { scale: 0.6, opacity: 0 });
  gsap.set('.viz-ring__arc', { strokeDashoffset: 100 });

  const tweenIn = (sel, panel, vars) => { const t = $$(sel, panel); if (t.length) gsap.to(t, vars); };
  const playPanel = (panel) => {
    $$('[data-count]', panel).forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    const dots = $$('.viz-dots i', panel);
    dots.forEach((d, i) => { if (i < 80) gsap.delayedCall(i * 0.018, () => d.classList.add('on')); });
    tweenIn('.viz-time__bar', panel, { scaleX: 1, duration: 1.6, ease: 'expo.out', stagger: 0.25 });
    tweenIn('.viz-cost__big', panel, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' });
    tweenIn('.viz-cost__small', panel, { scale: 1, duration: 1.2, ease: 'back.out(3)', delay: 0.6 });
    tweenIn('.viz-ring__arc', panel, { strokeDashoffset: 30, duration: 2.2, ease: 'expo.out' });
  };

  /* ---------- Étapes : cartes empilées ---------- */
  const cards = $$('[data-card]');
  cards.forEach((card, i) => {
    const d = +card.dataset.d;
    gsap.fromTo($$('.ca', card), { attr: { cx: 22 } }, { attr: { cx: 100 - d / 2 }, ease: 'none', scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 35%', scrub: true } });
    gsap.fromTo($$('.cb', card), { attr: { cx: 178 } }, { attr: { cx: 100 + d / 2 }, ease: 'none', scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 35%', scrub: true } });
    const next = cards[i + 1];
    if (next) {
      gsap.fromTo(card, { scale: 1, '--shade': 0 }, {
        scale: 0.9, '--shade': 0.14, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top ${parseFloat(getComputedStyle(next).top) || 140}px`, scrub: true },
      });
    }
  });
  gsap.to('.steps__phone img', { yPercent: -18, rotate: 4, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- MIA : le panneau s'ouvre, la conversation se redresse ---------- */
  gsap.fromTo('.mia__panel', { clipPath: 'inset(0% 5% 0% 5% round 56px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
    scrollTrigger: { trigger: '.mia', start: 'top 95%', end: 'top 10%', scrub: true },
  });
  gsap.fromTo('.chat', { rotateX: 30, rotateY: -14, y: 140, scale: 0.88 }, {
    rotateX: 0, rotateY: 0, y: 0, scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.mia__stage', start: 'top 100%', end: 'center 55%', scrub: true },
  });
  ScrollTrigger.create({ trigger: '.chat', start: 'top 55%', once: true, onEnter: playChat });

  /* ---------- Bandeau défilant sensible à la vitesse ---------- */
  const mTrack = $('[data-marquee]');
  if (mTrack) {
    let x = 0, vel = 0, prev = scrollY;
    gsap.ticker.add(() => {
      const half = mTrack.scrollWidth / 2;
      const dy = scrollY - prev;
      prev = scrollY;
      vel += (dy - vel) * 0.12;
      x -= 0.7 + vel * 0.35;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      gsap.set(mTrack, { x, skewX: gsap.utils.clamp(-10, 10, -vel * 0.35) });
    });
  }

  /* ---------- Pied de page : le « noo » se rejoint ---------- */
  const footer = $('[data-footer]');
  const main = $('.main');

  /* ---------- Scènes selon la taille d'écran ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 961px)', () => {
    // Hero épinglé : les deux formes fusionnent, le titre s'écarte
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', scrub: true, pin: true, onUpdate: (s) => window.NooGL?.setMerge(s.progress) },
    })
      .to('.hero__line--1', { xPercent: -14, ease: 'none', duration: 1 }, 0)
      .to('.hero__line--2', { xPercent: 10, ease: 'none', duration: 1 }, 0)
      .to('.hero__bottom, .hero__kicker, .hero__scroll', { opacity: 0, y: -50, ease: 'none', duration: 0.45 }, 0);

    // Comparatif horizontal
    const stats = $('.stats');
    const track = $('[data-track]');
    stats.classList.add('is-horizontal');
    const dist = () => track.scrollWidth - innerWidth;
    const hTween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: stats, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set('[data-track-progress]', { scaleX: s.progress }),
      },
    });
    $$('.panel', track).forEach((p, i) => ScrollTrigger.create(i === 0
      ? { trigger: stats, start: 'top 55%', once: true, onEnter: () => playPanel(p) }
      : { trigger: p, containerAnimation: hTween, start: 'left 70%', once: true, onEnter: () => playPanel(p) }));
    gsap.to('.panel__num', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: stats, start: 'top top', end: () => `+=${dist()}`, scrub: true } });

    // Offres : éventail qui se déploie
    const offers = $$('.offer');
    gsap.fromTo(offers, {
      xPercent: (i) => [104, 0, -104][i], yPercent: (i) => [8, 0, 8][i], rotation: (i) => [-9, 0, 9][i],
    }, {
      xPercent: 0, yPercent: 0, rotation: 0, ease: 'power1.inOut',
      scrollTrigger: { trigger: '.deck', start: 'top 92%', end: 'top 25%', scrub: 0.6 },
    });
    gsap.set(offers[1], { zIndex: 3 });

    // Témoignages : cartes éparpillées, à déplacer
    const board = $('[data-board]');
    board.classList.add('is-scatter');
    const notes = $$('[data-drag]', board);
    gsap.from(notes, {
      y: 260, rotation: (i) => [-25, 18, -14, 22][i], opacity: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: board, start: 'top 80%', once: true },
    });
    let z = 10;
    notes.forEach((n) => {
      let sx, sy, ox, oy, vx = 0, vy = 0, lx, ly;
      n.addEventListener('pointerdown', (e) => {
        n.setPointerCapture(e.pointerId);
        n.classList.add('is-dragging');
        n.style.zIndex = ++z;
        sx = e.clientX; sy = e.clientY; lx = sx; ly = sy;
        ox = gsap.getProperty(n, 'x'); oy = gsap.getProperty(n, 'y');
        gsap.to(n, { scale: 1.04, duration: 0.3 });
      });
      n.addEventListener('pointermove', (e) => {
        if (!n.classList.contains('is-dragging')) return;
        vx = e.clientX - lx; vy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
        gsap.set(n, { x: ox + e.clientX - sx, y: oy + e.clientY - sy, rotation: gsap.utils.clamp(-14, 14, vx * 0.6) });
      });
      const end = () => {
        if (!n.classList.contains('is-dragging')) return;
        n.classList.remove('is-dragging');
        gsap.to(n, { x: `+=${vx * 10}`, y: `+=${vy * 10}`, rotation: 0, scale: 1, duration: 1, ease: 'power3.out' });
      };
      n.addEventListener('pointerup', end);
      n.addEventListener('pointercancel', end);
    });

    // Pied de page dévoilé sous le contenu
    const setReveal = () => {
      const fits = footer.offsetHeight < innerHeight - 40;
      body.classList.toggle('has-reveal', fits);
      main.style.marginBottom = fits ? `${footer.offsetHeight}px` : '';
    };
    setReveal();
    addEventListener('resize', setReveal);
    gsap.fromTo('.footer > .wrap', { yPercent: 30, opacity: 0.2 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: main, start: 'bottom bottom', end: () => `bottom ${innerHeight - footer.offsetHeight}px`, scrub: true },
    });
    const ooST = { trigger: main, start: 'bottom 70%', end: () => `bottom ${innerHeight - footer.offsetHeight}px`, scrub: true };
    gsap.fromTo('.footer__giant .oo-a', { attr: { cx: 220 } }, { attr: { cx: 314 }, ease: 'none', scrollTrigger: ooST });
    gsap.fromTo('.footer__giant .oo-b', { attr: { cx: 558 } }, { attr: { cx: 464 }, ease: 'none', scrollTrigger: ooST });

    return () => {
      stats.classList.remove('is-horizontal');
      board.classList.remove('is-scatter');
      body.classList.remove('has-reveal');
      main.style.marginBottom = '';
      removeEventListener('resize', setReveal);
    };
  });

  mm.add('(max-width: 960px)', () => {
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => window.NooGL?.setMerge(Math.min(1, s.progress * 1.6)) });
    $$('.panel').forEach((p) => ScrollTrigger.create({ trigger: p, start: 'top 70%', once: true, onEnter: () => playPanel(p) }));
    gsap.fromTo('.footer__giant .oo-a', { attr: { cx: 220 } }, { attr: { cx: 314 }, ease: 'none', scrollTrigger: { trigger: '.footer__giant', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo('.footer__giant .oo-b', { attr: { cx: 558 } }, { attr: { cx: 464 }, ease: 'none', scrollTrigger: { trigger: '.footer__giant', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });

  /* ---------- Curseur, aimantation, inclinaison (souris uniquement) ---------- */
  if (finePointer) {
    body.classList.add('has-cursor');
    const cursor = $('.cursor');
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    addEventListener('pointerover', (e) => {
      const t = e.target;
      cursor.classList.toggle('is-drag', !!t.closest('.is-scatter [data-drag]'));
      cursor.classList.toggle('is-hover', !!t.closest('a, button, [data-tilt]') && !t.closest('.is-scatter [data-drag]'));
    });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' }));
    });

    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        gsap.to(el, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10, duration: 0.6, ease: 'power3.out', transformPerspective: 1200 });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
