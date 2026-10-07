(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const WA = '5534998697175';
  const wa = (msg, n = WA) => `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;

  /* ---------- split headline into letters ---------- */
  let ci = 0;
  $$('.h1 .split').forEach(el => {
    const txt = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    [...txt].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', ci++);
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    });
  });

  /* ---------- preloader ---------- */
  const pre = $('#preloader'), bar = $('#plBar');
  let pct = 0, ready = false, started = false;
  const heroImgs = ['img/flamengo.webp', 'img/barca.webp', 'img/logo.webp'];
  Promise.all(heroImgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })))
    .then(() => (ready = true));
  const t0 = performance.now();
  (function tick() {
    const el = performance.now() - t0;
    const target = ready ? 100 : Math.min(90, el / 18);
    pct += (target - pct) * 0.12;
    bar.style.width = pct.toFixed(1) + '%';
    if ((ready && pct > 99 && el > 1100) || el > 3500) return start();
    requestAnimationFrame(tick);
  })();
  function start() {
    if (started) return; started = true;
    bar.style.width = '100%';
    setTimeout(() => {
      pre.classList.add('done');
      document.body.classList.add('is-loaded');
      initReveal();
      setTimeout(() => pre.remove(), 1000);
    }, 250);
  }

  /* ---------- reveal on scroll + counters ---------- */
  function initReveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(count);
      io.unobserve(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }
  function count(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', dur = 1600, s = performance.now();
    (function f(t) {
      const p = Math.min(1, (t - s) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(f);
    })(s);
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  addEventListener('load', () => {
    if (window.Lenis && !reduce && fine) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    }
  });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.4 });
    else t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- nav, progress, fab, parallax ---------- */
  const nav = $('#nav'), prog = $('#progress'), fab = $('#fab');
  const par = $$('[data-speed]');
  let lastY = 0, ticking = false;
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > 500 && y > lastY + 4 && !$('#menu').classList.contains('open'));
    if (y < lastY - 4) nav.classList.remove('hide');
    lastY = y;
    fab.classList.toggle('show', y > innerHeight * 0.7);
    if (!reduce) par.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const c = r.top + r.height / 2 - innerHeight / 2;
      el.style.setProperty('--py', (c * +el.dataset.speed).toFixed(1) + 'px');
    });
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('lock'); }
  burger.addEventListener('click', () => {
    const o = !menu.classList.contains('open');
    menu.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o);
    document.body.classList.toggle('lock', o);
  });

  /* ---------- 3D tilt ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    /* magnetic buttons */
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28 - 3}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
    /* ball cursor */
    const cur = $('#cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.body.classList.add('has-cursor');
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    (function m() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = `translate(${cx}px,${cy}px) rotate(${(tx - cx) * 6}deg)`;
      requestAnimationFrame(m);
    })();
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.card,.pic,summary')));
  }

  /* ---------- hero living background (canvas) ---------- */
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let W, H, dpr, parts = [], mouse = { x: -999, y: -999 }, heroVisible = true;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = cv.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, W / 16));
    parts = Array.from({ length: n }, () => spawn(true));
  }
  const cols = ['255,106,19', '255,194,46', '67,176,255', '255,255,255'];
  function spawn(init) {
    return {
      x: Math.random() * W, y: init ? Math.random() * H : H + 20,
      r: Math.random() * 3.2 + 0.8, vy: -(Math.random() * 0.5 + 0.15),
      ph: Math.random() * 6.28, sw: Math.random() * 0.6 + 0.2,
      c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 0.5 + 0.3,
      sq: Math.random() < 0.18, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 0.05
    };
  }
  function frame(t) {
    requestAnimationFrame(frame);
    if (!heroVisible || reduce) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.y += p.vy; p.ph += 0.01;
      p.x += Math.sin(p.ph) * p.sw;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = dx * dx + dy * dy;
      if (d < 14000) { const f = (1 - d / 14000) * 3; const l = Math.sqrt(d) || 1; p.x += dx / l * f; p.y += dy / l * f; }
      if (p.y < -20) Object.assign(p, spawn(false));
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      if (p.sq) { p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r * 1.4, -p.r * .6, p.r * 2.8, p.r * 1.2); ctx.restore(); }
      else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  size(); requestAnimationFrame(frame);
  addEventListener('resize', size);
  $('#hero').addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  $('#hero').addEventListener('pointerleave', () => (mouse.x = mouse.y = -999));
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe($('#hero'));

  /* ---------- collection filters ---------- */
  const chips = $$('#filters .chip'), cards = $$('#grid .card');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-selected', x === c); });
    const f = c.dataset.f;
    let k = 0;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('out', !show);
      card.classList.remove('pop');
      if (show) { card.classList.add('in'); void card.offsetWidth; card.style.setProperty('--d', '0s'); card.style.animationDelay = (k++ * 0.06) + 's'; card.classList.add('pop'); }
    });
  }));
  $$('.buy').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    window.open(wa(`Olá! Vi o *${b.dataset.wa}* no site da T10 Sport Kids e quero saber tamanhos e disponibilidade ⚽`), '_blank', 'noopener');
  }));

  /* ---------- order builder ---------- */
  const form = $('#orderForm');
  const state = { produto: 'Kit de futebol', preco: 'R$ 40', tamanho: '06', entrega: 'Pronta entrega' };
  const sizeBox = $('.sizes', form), sizeLabel = sizeBox.parentElement.querySelector('label');
  const kidSizes = ['02', '04', '06', '08', '10', '12', '14'], sockSizes = ['28', '29', '30', '31', '32', '33'];
  function renderSizes(list, keep) {
    sizeBox.innerHTML = list.map(s => `<button type="button" class="o${s === keep ? ' on' : ''}" data-v="${s}">${s}</button>`).join('');
    if (!list.includes(state.tamanho)) { state.tamanho = list[Math.min(2, list.length - 1)]; sizeBox.children[Math.min(2, list.length - 1)].classList.add('on'); }
  }
  function summary() {
    const sock = state.produto === 'Meia divertida';
    const time = $('#time').value.trim();
    $('#tSum').textContent = `${state.produto}${time ? ' ' + time : ''} • ${sock ? 'nº' : 'tam.'} ${state.tamanho}`;
    $('#tSub').textContent = state.entrega;
    $('#tPrice').textContent = state.preco;
    const t = $('#ticket'); t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
  }
  form.addEventListener('click', e => {
    const o = e.target.closest('.o');
    if (!o) return;
    const grp = o.parentElement, name = grp.dataset.name;
    $$('.o', grp).forEach(x => x.classList.toggle('on', x === o));
    if (name === 'produto') {
      state.produto = o.dataset.v; state.preco = o.dataset.p;
      const sock = o.dataset.v === 'Meia divertida';
      sizeLabel.innerHTML = sock ? '3 · Numeração' : '3 · Tamanho <small>(anos)</small>';
      renderSizes(sock ? sockSizes : kidSizes, state.tamanho);
    } else state[name] = o.dataset.v;
    summary();
  });
  $('#time').addEventListener('input', summary);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#nome').value.trim(), time = $('#time').value.trim();
    const sock = state.produto === 'Meia divertida';
    const msg = `Olá! ${nome ? 'Meu nome é ' + nome + '. ' : ''}Quero fazer um pedido pelo site da T10 Sport Kids ⚽\n\n` +
      `• Produto: ${state.produto}${time ? '\n• Time/craque: ' + time : ''}\n• ${sock ? 'Numeração' : 'Tamanho'}: ${state.tamanho}\n• ${state.entrega}\n• Valor: ${state.preco}\n\nPode confirmar a disponibilidade?`;
    burst();
    setTimeout(() => window.open(wa(msg), '_blank', 'noopener'), 700);
  });

  /* ---------- confetti ---------- */
  const cf = $('#confetti'), cctx = cf.getContext('2d');
  function burst() {
    if (reduce) return;
    cf.width = innerWidth; cf.height = innerHeight;
    const colors = ['#ff6a13', '#ffc22e', '#43b0ff', '#fff', '#1f5bff', '#25d366'];
    const ps = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.65, vx: (Math.random() - .5) * 20, vy: -Math.random() * 18 - 6,
      s: Math.random() * 8 + 4, c: colors[(Math.random() * colors.length) | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4, ball: Math.random() < .12
    }));
    let f = 0;
    (function a() {
      cctx.clearRect(0, 0, cf.width, cf.height);
      ps.forEach(p => {
        p.vy += .5; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.r);
        if (p.ball) { cctx.font = p.s * 3 + 'px serif'; cctx.fillText('⚽', -p.s, p.s); }
        else { cctx.fillStyle = p.c; cctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        cctx.restore();
      });
      if (++f < 110) requestAnimationFrame(a); else cctx.clearRect(0, 0, cf.width, cf.height);
    })();
  }

  /* ---------- drag strip ---------- */
  const strip = $('#strip');
  let down = false, sx = 0, sl = 0;
  strip.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('drag'); });
  addEventListener('pointerup', () => { down = false; strip.classList.remove('drag'); });
  addEventListener('pointermove', e => { if (down) strip.scrollLeft = sl - (e.clientX - sx); });

  /* ---------- video ---------- */
  const phone = $('.phone'), vid = $('#reel'), play = $('#playBtn');
  function toggle() {
    if (vid.paused) { vid.play().then(() => phone.classList.add('playing')).catch(() => {}); }
    else { vid.pause(); phone.classList.remove('playing'); }
  }
  play.addEventListener('click', toggle);
  vid.addEventListener('click', toggle);
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !vid.paused) { vid.pause(); phone.classList.remove('playing'); } }, { threshold: .2 }).observe(phone);

  /* ---------- FAQ: one open at a time ---------- */
  const det = $$('.acc details');
  det.forEach(d => d.addEventListener('toggle', () => { if (d.open) det.forEach(o => o !== d && (o.open = false)); }));

  $('#yr').textContent = new Date().getFullYear();
})();
