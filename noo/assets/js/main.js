// Noo — interactions (sans dépendance)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bandeau d'annonce
  $('[data-announce-close]')?.addEventListener('click', () => $('[data-announce]').classList.add('is-hidden'));

  // En-tête collant
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-stuck', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Sous-menu Offres
  const dropBtn = $('[data-drop]');
  dropBtn.addEventListener('click', () => {
    const open = dropBtn.parentElement.classList.toggle('is-open');
    dropBtn.setAttribute('aria-expanded', open);
  });

  // Boutons MIA : ouvre l'agent Jotform (widget s'il est chargé, sinon page dédiée)
  $$('[data-mia]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.querySelector('#JotformAgent-019bdbf2ceb07143ad793afebff71178bb2b .ai-agent-chat-avatar')
      || document.querySelector('.ai-agent-chat-avatar') || document.querySelector('.jficc');
    if (el) el.click();
    else window.open('https://eu.jotform.com/agent/019bdbf2ceb07143ad793afebff71178bb2b', '_blank');
  }));

  // Compteurs
  const fmt = (n, el) => el.dataset.format === 'fr' ? n.toLocaleString('fr-FR').replace(/ /g, ' ') : String(n);
  const count = (el) => {
    const to = +el.dataset.count;
    if (reduced) { el.textContent = fmt(to, el); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 4))), el);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Conversation MIA jouée message par message
  const chat = $('.chat');
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
      if (isMia) {
        m.before(typing);
        typing.classList.add('is-shown');
      }
      setTimeout(() => {
        typing.classList.remove('is-shown');
        m.classList.add('is-shown');
        setTimeout(next, 650);
      }, isMia ? 900 : 350);
    };
    next();
  };

  // Révélations au défilement
  $$('.reveal').forEach((el) => {
    const sibs = $$(':scope > .reveal', el.parentElement);
    el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * 0.08}s`);
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
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .hl').forEach((el) => io.observe(el));

  // Tracé du chemin des étapes, piloté par le défilement
  const draw = $('[data-draw]');
  if (draw && !reduced) {
    const box = draw.closest('.steps__path');
    const update = () => {
      const r = box.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
      draw.style.strokeDashoffset = 1 - p;
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  // Carrousel témoignages
  const track = $('[data-reviews]');
  const step = () => (track.firstElementChild.getBoundingClientRect().width + 20);
  $('[data-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-next]').addEventListener('click', () => {
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step(), behavior: 'smooth' });
  });

  // Léger effet magnétique sur les boutons (souris uniquement)
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('.btn').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.translate = `${x * 8}px ${y * 6}px`;
      });
      b.addEventListener('mouseleave', () => { b.style.translate = ''; });
    });
  }
})();
