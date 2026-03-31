/* ============================================================
   ANIS SLIMANI PORTFOLIO — main.js
   1. Starfield canvas
   2. Scroll reveal + directional card animations
   3. Nav scroll state
   4. Language toggle (incl. CV href swap)
   5. Contact form (Formspree)
   ============================================================ */


/* ── 1. STARFIELD ─────────────────────────────────────────── */

(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.style.willChange = 'transform';           // GPU-layer hint
  let stars = [];
  let w, h;
  let mouseX = 0, mouseY = 0;
  let targetMX = 0, targetMY = 0;

  const STAR_COUNT = window.innerWidth < 860 ? 150 : 400;
  const LAYERS = 3;
  let dpr = 1;

  /* Falling stars */
  let fallingStars = [];

  function spawnFallingStar() {
    const angle = (Math.PI / 5) + (Math.random() - 0.5) * 0.25;
    const speed = Math.random() * 3 + 5;
    fallingStars.push({
      x:     Math.random() * w * 0.45 + w * 0.05,
      y:     Math.random() * h * 0.35 + h * 0.15,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      trail: Math.random() * 50 + 90,
      alpha: 0,
      peak:  0.88 + Math.random() * 0.12,
      phase: 'in',
    });
  }

  // Rhythm: 1 … pause pause … 1 … pause pause pause pause … 1 … repeat
  // Beat unit = 1.8 s  →  short gap = 2 beats (3.6 s), long gap = 4 beats (7.2 s)
  const BEAT = 1800;
  const RHYTHM = [2, 2, 4, 4]; // beats between each successive star
  let rhythmIdx = 0;
  let rhythmTimeout = null;
  let initTimeout = null;

  function scheduleNext() {
    clearTimeout(rhythmTimeout);                    // prevent duplicate chains
    const beats = RHYTHM[rhythmIdx % RHYTHM.length];
    rhythmIdx++;
    rhythmTimeout = setTimeout(() => { spawnFallingStar(); scheduleNext(); }, beats * BEAT);
  }

  // First star after animations settle, then rhythm kicks in
  initTimeout = setTimeout(() => { initTimeout = null; spawnFallingStar(); scheduleNext(); }, 1800);

  window.addEventListener('mousemove', e => {
    targetMX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* Debounced resize */
  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, (_, i) => {
      const layer  = Math.floor(Math.random() * LAYERS);
      const bright = i < STAR_COUNT * 0.1; // top 10% are crisp bright stars
      const yMin   = h * 0.22;
      return {
        ox:         Math.random() * w,
        oy:         yMin + Math.random() * (h - yMin),
        x: 0, y: 0,
        r:          bright                ? Math.random() * 0.5 + 0.6
                  : layer === 2          ? Math.random() * 0.7 + 0.35
                  : layer === 1          ? Math.random() * 0.5 + 0.2
                  :                        Math.random() * 0.35 + 0.1,
        baseA:      bright                ? Math.random() * 0.2 + 0.8
                  : layer === 2          ? Math.random() * 0.3 + 0.18
                  : layer === 1          ? Math.random() * 0.2 + 0.1
                  :                        Math.random() * 0.12 + 0.04,
        alpha: 0,
        layer,
        parallaxStr: (layer + 1) * 5,
        twinkling:  false,
        twinkDir:   1,
        twinkSpeed: Math.random() * 0.006 + 0.002,
      };
    });
    stars.forEach(s => { s.alpha = s.baseA; s.x = s.ox; s.y = s.oy; });
  }

  /* Track frame timing to cap delta after long pauses */
  let lastFrameTime = 0;

  function drawFrame(timestamp) {
    /* ── Delta-time guard ── */
    if (!lastFrameTime) lastFrameTime = timestamp;
    const dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    // If the gap is over 200ms (tab was hidden or lag spike), skip this frame
    // to prevent twinkling/falling-star jumps
    if (dt > 200) {
      if (!paused) requestAnimationFrame(drawFrame);
      return;
    }

    mouseX += (targetMX - mouseX) * 0.06;
    mouseY += (targetMY - mouseY) * 0.06;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    ctx.clearRect(0, 0, w, h);

    if (isLight) {
      /* ── Light mode: soft glows + dark purple particles (fixed canvas) ── */

      // Single soft glow — left side
      const glow = ctx.createRadialGradient(w * 0.05, h * 0.4, 0, w * 0.05, h * 0.4, w * 0.3);
      glow.addColorStop(0,   'rgba(160,140,240,0.19)');
      glow.addColorStop(0.3, 'rgba(130,110,220,0.08)');
      glow.addColorStop(0.6, 'rgba(100,80,200,0.03)');
      glow.addColorStop(1,   'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

    } else {
      /* ── Dark mode: sky gradient + nebula + stars ── */
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0,    'rgba(0,0,0,1)');
      grad.addColorStop(0.2,  'rgba(2,2,6,1)');
      grad.addColorStop(0.65, 'rgba(4,4,10,1)');
      grad.addColorStop(1,    'rgba(5,5,14,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const nebula = ctx.createRadialGradient(w * 0.58, h * 0.6, 0, w * 0.58, h * 0.6, w * 0.55);
      nebula.addColorStop(0,   'rgba(180,180,255,0.02)');
      nebula.addColorStop(0.5, 'rgba(150,150,240,0.008)');
      nebula.addColorStop(1,   'transparent');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      stars.forEach(s => {
        s.x = s.ox + mouseX * s.parallaxStr;
        s.y = s.oy + mouseY * s.parallaxStr;

        if (!s.twinkling && Math.random() < 0.002) { s.twinkling = true; s.twinkDir = -1; }
        if (s.twinkling) {
          s.alpha += s.twinkDir * s.twinkSpeed;
          if (s.alpha <= 0.01) { s.twinkDir = 1; s.alpha = 0.01; }
          if (s.alpha >= s.baseA) { s.alpha = s.baseA; s.twinkling = false; }
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235,235,255,${s.alpha.toFixed(3)})`;
        ctx.fill();
      });
    }

    /* ── Falling stars (skip in light mode) ── */
    if (isLight) { fallingStars = []; }
    fallingStars = fallingStars.filter(s => s.alpha > 0 || s.phase === 'in');
    fallingStars.forEach(s => {
      // Fade in quickly, then fade out gradually
      if (s.phase === 'in') {
        s.alpha = Math.min(s.alpha + 0.06, s.peak);
        if (s.alpha >= s.peak) s.phase = 'out';
      } else {
        s.alpha -= 0.012;
      }

      const len = Math.hypot(s.vx, s.vy);
      const tx  = s.x - (s.vx / len) * s.trail;
      const ty  = s.y - (s.vy / len) * s.trail;

      const streak = ctx.createLinearGradient(tx, ty, s.x, s.y);
      streak.addColorStop(0,   `rgba(220,220,255,0)`);
      streak.addColorStop(0.6, `rgba(220,220,255,${(s.alpha * 0.3).toFixed(3)})`);
      streak.addColorStop(1,   `rgba(255,255,255,${s.alpha.toFixed(3)})`);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = streak;
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      // Bright tip
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha.toFixed(3)})`;
      ctx.fill();
      ctx.restore();

      s.x += s.vx;
      s.y += s.vy;
      if (s.x > w + 20 || s.y > h + 20) s.alpha = 0;
    });

    if (!paused) requestAnimationFrame(drawFrame);
  }

  let paused = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      clearTimeout(initTimeout);                    // cancel initial timer too
      clearTimeout(rhythmTimeout);
      fallingStars = [];
    } else {
      paused = false;
      lastFrameTime = 0;                            // reset so first frame is skipped cleanly
      // Reset all twinkling so stars don't flash on return
      stars.forEach(s => { s.alpha = s.baseA; s.twinkling = false; });
      requestAnimationFrame(drawFrame);
      // Small delay before resuming shooting stars so the scene settles
      setTimeout(() => { if (!paused) scheduleNext(); }, 1200);
    }
  });

  window.addEventListener('resize', onResize, { passive: true });
  resize();
  requestAnimationFrame(drawFrame);
})();


/* ── 2. SCROLL REVEAL + DIRECTIONAL ANIMATIONS ────────────── */

(function initReveal() {
  // Standard reveal
  const revealObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    }),
    { threshold: 0.05, rootMargin: '0px 0px -16px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-scale').forEach(el => revealObs.observe(el));

  // Directional reveals (left/right)
  const dirObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        dirObs.unobserve(e.target);
      }
    }),
    { threshold: 0.04, rootMargin: '0px 0px -8px 0px' }
  );

  document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => dirObs.observe(el));

  // Staggered children
  const staggerObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const children = e.target.querySelectorAll('.stagger-child');
        children.forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 80);
        });
        staggerObs.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.stagger-parent').forEach(el => staggerObs.observe(el));
})();



/* ── ACTIVE NAV HIGHLIGHTING ──────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
})();

/* ── 2b. MOBILE NAV TOGGLE ────────────────────────────────── */

(function initMobileNav() {
  const burger  = document.querySelector('.nav-burger');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = overlay ? overlay.querySelector('.mobile-nav-close') : null;
  if (!burger || !overlay) return;

  function open() {
    burger.classList.add('active');
    overlay.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    burger.classList.remove('active');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    overlay.classList.contains('open') ? close() : open();
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  overlay.querySelectorAll('.mobile-nav a, .mobile-nav-footer a').forEach(link => {
    link.addEventListener('click', close);
  });
})();





/* ── 3b. BACK-TO-WORK VISIBILITY ──────────────────────────── */

(function initBackToWork() {
  const btn = document.querySelector('.back-to-work');
  if (!btn) return;
  const content = document.querySelector('.case-content-wrap');
  const footer = document.querySelector('footer');
  if (!content) return;

  let ticking = false;
  function update() {
    const contentTop = content.getBoundingClientRect().top;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const show = contentTop < 120 && footerTop > 200;
    btn.classList.toggle('visible', show);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();


/* ── 4. READING PROGRESS BAR ──────────────────────────────── */

(function initProgressBar() {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;
  let ticking = false;
  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width  = pct + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();


/* ── 5. CASE NAV ACTIVE SECTION TRACKING ─────────────────── */

(function initCaseNav() {
  const nav = document.querySelector('.work-header');
  if (!nav) return;
  const links    = nav.querySelectorAll('.work-header-link');
  const sections = Array.from(links).map(l => {
    const id = l.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = nav.querySelector(`[href="#${entry.target.id}"]`);
        if (active) {
          active.classList.add('active');
          active.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        }
      }
    });
  }, { threshold: 0, rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ── 5b. TECH STRIP SCROLL ARROW ──────────────────────────── */

(function initTechStripArrow() {
  const arrow = document.querySelector('.tech-strip-arrow');
  const scroll = document.querySelector('.tech-strip-scroll');
  if (!arrow || !scroll) return;

  arrow.addEventListener('click', () => {
    scroll.scrollBy({ left: 120, behavior: 'smooth' });
  });

  // Hide arrow when scrolled to the end
  function checkArrow() {
    const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
    arrow.style.opacity = atEnd ? '0.2' : '1';
  }
  scroll.addEventListener('scroll', checkArrow, { passive: true });
  checkArrow();
})();


/* ── 6. LANGUAGE TOGGLE ───────────────────────────────────── */

(function initLangToggle() {
  const toggles = document.querySelectorAll('.lang-toggle');
  if (!toggles.length) return;

  let lang = localStorage.getItem('lang') || 'en';

  function apply(target) {
    const els = document.querySelectorAll('[data-fr]');
    els.forEach(el => {
      if (!el.dataset.en) el.dataset.en = el.textContent;
      el.textContent = target === 'fr' ? el.dataset.fr : el.dataset.en;
    });
    const htmlEls = document.querySelectorAll('[data-fr-html]');
    htmlEls.forEach(el => {
      if (!el.dataset.enHtml) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = target === 'fr' ? el.dataset.frHtml : el.dataset.enHtml;
    });
    // Update hrefs
    const hrefEls = document.querySelectorAll('[data-fr-href]');
    hrefEls.forEach(el => {
      if (!el.dataset.enHref) el.dataset.enHref = el.getAttribute('href');
      el.setAttribute('href', target === 'fr' ? el.dataset.frHref : el.dataset.enHref);
    });
    // Update placeholders
    const placeholders = document.querySelectorAll('[data-fr-placeholder]');
    placeholders.forEach(el => {
      if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.placeholder;
      el.placeholder = target === 'fr' ? el.dataset.frPlaceholder : el.dataset.enPlaceholder;
    });
    const frFlag = '<svg width="14" height="10" viewBox="0 0 21 15"><rect width="7" height="15" fill="#002395"/><rect x="7" width="7" height="15" fill="#fff"/><rect x="14" width="7" height="15" fill="#ED2939"/></svg>';
    const enFlag = '<svg width="14" height="10" viewBox="0 0 60 30"><clipPath id="c"><rect width="60" height="30"/></clipPath><g clip-path="url(#c)"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="4" clip-path="url(#c)"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></g></svg>';
    toggles.forEach(t => {
      t.innerHTML = target === 'fr' ? enFlag + ' EN' : frFlag + ' FR';
    });
    document.documentElement.lang = target;
    localStorage.setItem('lang', target);
    lang = target;
  }

  toggles.forEach(t => {
    t.addEventListener('click', () => apply(lang === 'en' ? 'fr' : 'en'));
  });

  if (lang === 'fr') apply('fr');
})();


/* ── 6b. THEME TOGGLE (light / dark) ────────────────────────── */

(function initThemeToggle() {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  // Respect saved preference, then system preference, default dark
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark

  let switching = false;

  function swapTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    // Swap hero portrait — fallback to default if light image missing
    document.querySelectorAll('.hero-photo img').forEach(img => {
      if (!img.dataset.darkSrc) img.dataset.darkSrc = img.src;
      if (t === 'light') {
        const lightImg = new Image();
        lightImg.onload = () => { img.src = lightImg.src; };
        lightImg.onerror = () => { /* keep current src */ };
        lightImg.src = 'assets/images/portrait-light.png';
      } else {
        img.src = img.dataset.darkSrc;
      }
    });
  }

  function apply(t, animate) {
    theme = t;
    if (!animate) { swapTheme(t); return; }

    if (switching) return;
    switching = true;

    // Fade out
    document.body.classList.add('theme-fading');
    document.body.classList.remove('theme-revealing');

    setTimeout(() => {
      // Swap while invisible
      swapTheme(t);

      // Fade back in
      requestAnimationFrame(() => {
        document.body.classList.remove('theme-fading');
        document.body.classList.add('theme-revealing');
        setTimeout(() => {
          document.body.classList.remove('theme-revealing');
          switching = false;
        }, 350);
      });
    }, 260);
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => apply(theme === 'dark' ? 'light' : 'dark', true));
  });

  if (saved) apply(saved, false);
})();


/* ── 7. CONTACT FORM ──────────────────────────────────────── */

/*
  FORMSPREE SETUP:

  1. Go to https://formspree.io — free account
  2. Create a form, copy the endpoint URL
  3. Replace FORMSPREE_ENDPOINT below with your URL
     e.g. https://formspree.io/f/xyzabc12
*/

/* ── 5. CONTACT FORM ───────────────────────────────────────── */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgpqqly';

(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn     = form.querySelector('.form-submit-btn');
  const success = document.getElementById('form-success');
  const error   = document.getElementById('form-error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const company = form.querySelector('[name="company"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    if (!name || !email || !message) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const isFr = document.documentElement.lang === 'fr';
    btn.textContent = isFr ? 'Envoi en cours…' : 'Sending…';
    btn.disabled    = true;
    if (error)   error.style.display = 'none';
    if (success) success.style.display = 'none';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({ name, email, company, message }),
      });
      if (res.ok) {
        form.reset();
        if (success) success.style.display = 'block';
        btn.textContent = isFr ? 'Message envoyé' : 'Message sent';
      } else { throw new Error(); }
    } catch {
      if (error) error.style.display = 'block';
      btn.textContent = isFr ? 'Envoyer le message →' : 'Send message →';
      btn.disabled    = false;
    }
  });
})();


/* ── PAGE TRANSITIONS ─────────────────────────────────────── */

(function initPageTransitions() {
  let navigating = false;

  // Fade out before navigating to internal .html pages
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || link.target === '_blank') return;

    link.addEventListener('click', e => {
      if (navigating) return;           // prevent double-clicks
      e.preventDefault();
      navigating = true;
      const dest = link.href;
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      // Navigate once, whichever fires first
      let navigated = false;
      const nav = () => {
        if (navigated) return;
        navigated = true;
        window.location.href = dest;
      };
      document.body.addEventListener('transitionend', nav, { once: true });
      setTimeout(nav, 300);             // fallback if transitionend doesn't fire
    });
  });

  // Restore opacity if navigating back (bfcache) or if navigation failed
  window.addEventListener('pageshow', () => {
    navigating = false;
    document.body.style.transition = '';
    document.body.style.opacity = '';
  });
})();
