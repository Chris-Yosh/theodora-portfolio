// Noo — interactions (vanilla ; Lenis optionnel pour le défilement doux)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Découpage du texte ---------- */
  // Titres : chaque mot glisse depuis un masque
  let wordIndex = 0;
  const splitWords = (node, wrap) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(' ');
          else frag.append(wrap(part));
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        splitWords(child, wrap);
      }
    });
  };
  $$('[data-split]').forEach((el) => {
    wordIndex = 0;
    splitWords(el, (w) => {
      const outer = document.createElement('span');
      outer.className = 'ln';
      const inner = document.createElement('span');
      inner.style.setProperty('--i', wordIndex++);
      inner.textContent = w;
      outer.append(inner);
      return outer;
    });
  });
  // Phrase manifeste : les mots s'allument au défilement
  $$('[data-words]').forEach((el) => splitWords(el, (w) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    return s;
  }));
  // Liens de navigation : texte doublé pour l'effet de roulement
  $$('[data-roll]').forEach((el) => {
    const t = el.textContent;
    el.innerHTML = `<span data-t="${t}">${t}</span>`;
  });

  /* ---------- Intro ---------- */
  const start = performance.now();
  const ready = () => {
    const wait = Math.max(0, 1300 - (performance.now() - start));
    setTimeout(() => body.classList.remove('is-loading'), reduced ? 0 : wait);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);
  setTimeout(() => body.classList.remove('is-loading'), 3500);

  /* ---------- Défilement doux ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    }));
  }

  /* ---------- En-tête ---------- */
  const header = $('[data-header]');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    header.classList.toggle('is-stuck', y > 40);
    header.classList.toggle('is-away', y > 400 && y > lastY && !body.classList.contains('menu-open'));
    lastY = y;
  };

  $('[data-announce-close]')?.addEventListener('click', () => $('[data-announce]').classList.add('is-hidden'));

  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
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

  /* ---------- Compteurs ---------- */
  const count = (el) => {
    const to = +el.dataset.count;
    if (reduced) return;
    const t0 = performance.now(), dur = 1800;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Conversation MIA ---------- */
  const chat = $('[data-chat]');
  const playChat = () => {
    if (reduced || !chat) return;
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
        setTimeout(next, 700);
      }, isMia ? 1100 : 400);
    };
    setTimeout(next, 300);
  };

  /* ---------- Apparitions ---------- */
  $$('[data-fade]').forEach((el) => {
    const sibs = $$(':scope > [data-fade]', el.parentElement);
    el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 6) * 0.09}s`);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      $$('[data-count]', el).forEach(count);
      if (el === chat) playChat();
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  const observe = () => $$('[data-fade], [data-split], [data-mask], [data-chat], [data-giant]').forEach((el) => io.observe(el));
  // On attend la fin de l'intro pour que le hero se dévoile après le rideau
  const waitIntro = () => body.classList.contains('is-loading') ? setTimeout(waitIntro, 60) : setTimeout(observe, 250);
  waitIntro();

  /* ---------- Effets liés au défilement ---------- */
  const words = $$('.statement .w');
  const statement = $('.statement');
  const rail = $('[data-rail]');
  const railBox = rail?.parentElement;
  const steps = $$('[data-step]');
  const parallax = $$('[data-parallax]');

  const onScroll = () => {
    const vh = innerHeight;
    onHeader();

    if (statement && !reduced) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }

    if (rail) {
      const r = railBox.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height));
      rail.style.transform = `scaleY(${p})`;
    }
    steps.forEach((s) => s.classList.toggle('is-on', s.getBoundingClientRect().top < vh * 0.7));

    if (!reduced) {
      parallax.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const off = (r.top + r.height / 2 - vh / 2) * +img.dataset.parallax;
        img.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
    }
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (reduced) words.forEach((w) => w.classList.add('on'));

  /* ---------- Témoignages ---------- */
  const quotes = $$('.quote');
  const cur = $('[data-current]');
  const bar = $('[data-progress]');
  const DURATION = 7000;
  let qi = 0, t0 = performance.now(), paused = false;
  const show = (i) => {
    quotes[qi].classList.remove('is-active');
    qi = (i + quotes.length) % quotes.length;
    quotes[qi].classList.add('is-active');
    cur.textContent = String(qi + 1).padStart(2, '0');
    t0 = performance.now();
  };
  $('[data-prev]').addEventListener('click', () => show(qi - 1));
  $('[data-next]').addEventListener('click', () => show(qi + 1));
  const box = $('[data-quotes]');
  box.addEventListener('mouseenter', () => { paused = true; });
  box.addEventListener('mouseleave', () => { paused = false; t0 = performance.now() - (parseFloat(bar.dataset.p || 0) * DURATION); });
  if (!reduced) {
    const loop = (t) => {
      if (!paused) {
        const p = Math.min(1, (t - t0) / DURATION);
        bar.style.transform = `scaleX(${p})`;
        bar.dataset.p = p;
        if (p >= 1) show(qi + 1);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
