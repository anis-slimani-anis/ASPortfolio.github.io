/* ============================================================
   ANIS SLIMANI PORTFOLIO — main.js
   1. Starfield canvas
   2. Scroll reveal + directional card animations
   3. Nav scroll state
   4. Language toggle (incl. CV href swap)
   5. Contact form (Formspree)
   ============================================================ */


/* ── 1. STARFIELD ─────────────────────────────────────────── */
const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const prefersReducedMotion = () => motionQuery ? motionQuery.matches : false;

(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas || prefersReducedMotion()) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.style.willChange = 'transform';           // GPU-layer hint
  let stars = [];
  let w, h;
  let mouseX = 0, mouseY = 0;
  let targetMX = 0, targetMY = 0;

  const STAR_DENSITY = 0.00016;
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

  // Rhythm: occasional single stars with long rests between
  // Beat unit = 2.2 s  →  gaps of 4–8 beats (8.8 s – 17.6 s)
  const BEAT = 2200;
  const RHYTHM = [4, 8, 6, 10]; // beats between each successive star
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
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    const starCount = Math.max(90, Math.min(360, Math.round(w * h * STAR_DENSITY)));
    stars = Array.from({ length: starCount }, (_, i) => {
      const layer  = Math.floor(Math.random() * LAYERS);
      const bright = i < starCount * 0.1; // top 10% are crisp bright stars
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
      /* ── Light mode: transparent canvas, no background fill ── */
      /* Canvas stays clear — white body background shows through cleanly */

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
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const directionalEls = document.querySelectorAll('.reveal-left, .reveal-right');
  const staggerParents = document.querySelectorAll('.stagger-parent');

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    directionalEls.forEach(el => el.classList.add('visible'));
    staggerParents.forEach(parent => {
      parent.querySelectorAll('.stagger-child').forEach(child => child.classList.add('visible'));
    });
    return;
  }

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

  revealEls.forEach(el => revealObs.observe(el));

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

  directionalEls.forEach(el => dirObs.observe(el));

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

  staggerParents.forEach(el => staggerObs.observe(el));
})();



/* ── ACTIVE NAV HIGHLIGHTING ──────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  const hashLinks = Array.from(navLinks).filter(l => l.getAttribute('href').startsWith('#'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        hashLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-15% 0px -15% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

/* ── 2b. MOBILE NAV TOGGLE ────────────────────────────────── */

(function initMobileNav() {
  const burger  = document.querySelector('.nav-burger');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = overlay ? overlay.querySelector('.mobile-nav-close') : null;
  let scrollY = 0;
  if (!burger || !overlay) return;
  if ('inert' in overlay) overlay.inert = true;

  function open() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    burger.classList.add('active');
    overlay.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    if ('inert' in overlay) overlay.inert = false;
    document.body.classList.add('mobile-nav-open');
    document.body.style.top = `-${scrollY}px`;
  }

  function close() {
    burger.classList.remove('active');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    if ('inert' in overlay) overlay.inert = true;
    document.body.classList.remove('mobile-nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  burger.addEventListener('click', () => {
    overlay.classList.contains('open') ? close() : open();
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  overlay.querySelectorAll('.mobile-nav a, .mobile-nav-footer a').forEach(link => {
    link.addEventListener('click', close);
  });
})();





/* ── 3b. BACK-TO-WORK VISIBILITY ──────────────────────────── */

(function initBackToWork() {
  const back = document.querySelector('.back-to-work');
  const next = document.querySelector('.next-project');
  if (!back && !next) return;
  const content = document.querySelector('.case-content-wrap');
  const footer = document.querySelector('footer');
  if (!content) return;

  let ticking = false;
  function update() {
    const contentTop = content.getBoundingClientRect().top;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const show = contentTop < 120 && footerTop > 200;
    if (back) back.classList.toggle('visible', show);
    if (next) next.classList.toggle('visible', show);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
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
  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ── 5. CASE NAV ACTIVE SECTION TRACKING ─────────────────── */

(function initCaseNav() {
  const nav = document.querySelector('.work-header');
  if (!nav || !('IntersectionObserver' in window)) return;
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
    scroll.scrollBy({ left: 120, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
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
    document.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: target } }));
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

  const saved = localStorage.getItem('theme');
  let theme = document.documentElement.getAttribute('data-theme') || saved || 'dark';

  let switching = false;
  function syncThemeToggleState(t) {
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  function swapTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t === 'light' ? 'only light' : 'dark';
    localStorage.setItem('theme', t);
    syncThemeToggleState(t);
    document.dispatchEvent(new CustomEvent('site:themechange'));
  }

  function apply(t, animate) {
    theme = t;
    if (!animate || prefersReducedMotion()) { swapTheme(t); return; }

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

  syncThemeToggleState(theme);
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

  const btn = form.querySelector('.form-submit-btn');
  const label = btn?.querySelector('span') || btn;
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');
  if (!btn) return;

  const copy = {
    en: { idle: 'Send message \u2192', sending: 'Sending...', sent: 'Message sent' },
    fr: { idle: 'Envoyer le message \u2192', sending: 'Envoi en cours...', sent: 'Message envoy\u00E9' },
  };

  function currentLang() {
    return document.documentElement.lang === 'fr' ? 'fr' : 'en';
  }

  function setLabel(state) {
    label.textContent = copy[currentLang()][state];
  }

  function hideStatus(node) {
    if (node) node.hidden = true;
  }

  function showStatus(node) {
    if (node) node.hidden = false;
  }

  form.addEventListener('input', () => {
    hideStatus(success);
    hideStatus(error);
    if (!btn.disabled) setLabel('idle');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const company = form.querySelector('[name="company"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    setLabel('sending');
    hideStatus(error);
    hideStatus(success);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      });
      if (res.ok) {
        form.reset();
        showStatus(success);
        setLabel('sent');
        setTimeout(() => {
          btn.disabled = false;
          btn.setAttribute('aria-busy', 'false');
          setLabel('idle');
        }, 1600);
      } else { throw new Error(); }
    } catch {
      btn.disabled = false;
      btn.setAttribute('aria-busy', 'false');
      showStatus(error);
      setLabel('idle');
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
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || link.target === '_blank' || link.hasAttribute('download')) return;

    link.addEventListener('click', e => {
      if (navigating || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const destUrl = new URL(link.href, window.location.href);
      if (destUrl.pathname === window.location.pathname || prefersReducedMotion()) return;
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


/* ── CARD SPOTLIGHT + TILT ──────────────────────────────────── */

(function initCardEffects() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const cards = document.querySelectorAll('.case-card, .service-block');
  if (!cards.length) return;

  const BASE_T  = 'border-color 0.25s, box-shadow 0.2s';
  const ENTER_T = BASE_T + ', transform 0.35s ease-out';
  const MOVE_T  = BASE_T + ', transform 0.08s ease-out';
  const LEAVE_T = BASE_T + ', transform 0.4s ease-out';

  function reset(card) {
    card.style.transition = LEAVE_T;
    card.style.transform  = '';
    card.style.setProperty('--cx', '50%');
    card.style.setProperty('--cy', '50%');
  }

  cards.forEach(card => {
    let moved = false;

    card.addEventListener('mouseenter', () => {
      moved = false;
      card.style.transition = ENTER_T;
    });

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -5;
      const ry = ((x / r.width)  - 0.5) *  7;

      card.style.setProperty('--cx', (x / r.width  * 100).toFixed(1) + '%');
      card.style.setProperty('--cy', (y / r.height * 100).toFixed(1) + '%');

      if (!moved) { card.style.transition = MOVE_T; moved = true; }
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => reset(card));
  });

  /* Reset on scroll — prevents stuck tilts when page scrolls under cursor */
  window.addEventListener('scroll', () => {
    cards.forEach(card => {
      card.style.transition = '';
      card.style.transform  = '';
    });
  }, { passive: true });
})();

/* ── HERO WORD CAROUSEL ─────────────────────────────────────── */
(function initHeroWordCarousel() {
  const SEQUENCE = {
    en: ['usability', 'trust', 'flow', 'impact', 'intuition', 'clarity'],
    fr: ['optimisée', 'intuitive', 'fluide', 'impactante', 'clarifiée', 'simplifiée'],
  };
  const HOLD_MS = 1500;
  const OUT_MS  = 180;
  let runToken = 0;
  let holdTimer = null;
  let outTimer = null;

  function getLang() {
    return document.documentElement.lang === 'fr' ? 'fr' : 'en';
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function run() {
    runToken++;
    clearTimeout(holdTimer);
    clearTimeout(outTimer);

    const el = document.querySelector('.hero-word-carousel');
    if (!el) return;

    // Announce word changes to screen readers
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');

    const words = SEQUENCE[getLang()];
    let idx = 0;
    const token = runToken;

    function next() {
      // If element was replaced by lang toggle, stop this sequence
      if (token !== runToken || !document.contains(el)) return;

      if (prefersReducedMotion()) {
        // Instant swap — no animation
        el.textContent = words[idx];
        idx++;
        if (idx < words.length) holdTimer = setTimeout(next, HOLD_MS);
        return;
      }

      el.classList.add('is-out');
      outTimer = setTimeout(() => {
        if (token !== runToken || !document.contains(el)) return;
        el.textContent = words[idx];
        el.classList.remove('is-out');
        el.classList.add('is-in');
        void el.offsetHeight;
        el.classList.remove('is-in');
        idx++;
        if (idx < words.length) holdTimer = setTimeout(next, HOLD_MS);
      }, OUT_MS);
    }

    holdTimer = setTimeout(next, HOLD_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('site:langchange', run);
})();

/* ── PENCIL SCRIBBLES (light mode only) ───────────────────── */
(function initScribbles() {
  const C_GRAY  = '#4a4a48';
  const C_BLACK = '#1b1d1f';
  let container = null;
  let scribbleItems = [];

  function wobblyPath(x1, y1, x2, y2, wobble) {
    const dx = x2-x1, dy = y2-y1;
    const steps = Math.max(5, Math.floor(Math.sqrt(dx*dx+dy*dy)/8));
    let d = `M ${x1} ${y1}`;
    for (let i=1; i<=steps; i++) {
      const t = i/steps;
      d += ` L ${(x1+dx*t+(Math.random()-.5)*wobble).toFixed(1)} ${(y1+dy*t+(Math.random()-.5)*wobble).toFixed(1)}`;
    }
    return d;
  }

  function mkSvg(w, h) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('width', w); s.setAttribute('height', h);
    s.setAttribute('viewBox', `0 0 ${w} ${h}`);
    return s;
  }

  function mkPath(svg, d, sw, color) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color || C_GRAY);
    p.setAttribute('stroke-width', (sw||1.3).toString());
    p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p); return p;
  }

  /* Complex shapes — go on the sides */
  function makeComplex(rng, type, color) {
    const c = color || C_GRAY;
    if (type === 0) {
      const r = 22+rng()*24, svg = mkSvg(r*2+8, r*2+8);
      const cx = r+4, cy = r+4; let d = '';
      for (let i=0; i<=32; i++) {
        const a = (i/32)*Math.PI*2*1.06, w = 3+rng()*4;
        const px = (cx+(r+(rng()-.5)*w)*Math.cos(a)).toFixed(1);
        const py = (cy+(r+(rng()-.5)*w)*Math.sin(a)).toFixed(1);
        d += i===0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
      }
      mkPath(svg, d, 1.3, c); return svg;
    } else if (type === 1) {
      const s = 30+rng()*22, svg = mkSvg(s+8, s+8);
      mkPath(svg, wobblyPath(4,4,s+4,s+4,3), 1.3, c);
      mkPath(svg, wobblyPath(4,s+4,s+4,4,3), 1.3, c);
      return svg;
    } else {
      const s = 30+rng()*26, svg = mkSvg(s+8, s+8);
      mkPath(svg, wobblyPath(4,s+4,4,4,3)+' '+wobblyPath(4,4,s+4,4,3).replace(/^M\S+ \S+ /,''), 1.3, c);
      return svg;
    }
  }

  /* Simple marks — dots and short lines for center */
  function makeSimple(rng, color) {
    const c = color || C_GRAY;
    const type = rng() < 0.55 ? 'dot' : 'line';
    if (type === 'dot') {
      const r = 1.5+rng()*1.5, svg = mkSvg(r*2+6, r*2+6);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', r+3); circle.setAttribute('cy', r+3);
      circle.setAttribute('r', r.toFixed(1)); circle.setAttribute('fill', c);
      svg.appendChild(circle); return svg;
    } else {
      const w = 24+rng()*40, svg = mkSvg(w+8, 18);
      mkPath(svg, wobblyPath(4,9,w+4,9,3.5), 1.2, c);
      return svg;
    }
  }

  /* Trigger a "re-draw" trace animation on paths inside el */
  function triggerDraw(el) {
    el.querySelectorAll('path').forEach(path => {
      const len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = (len * 0.35).toFixed(1);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        path.style.transition = `stroke-dashoffset ${0.38+Math.random()*0.22}s ease-out`;
        path.style.strokeDashoffset = '0';
      }));
    });
  }

  function render() {
    if (container) { container.remove(); container = null; scribbleItems = []; }
    if (document.documentElement.getAttribute('data-theme') !== 'light') return;
    if (document.querySelector('nav.work-header')) return; /* skip project pages */

    container = document.createElement('div');
    container.id = 'scribble-layer';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden';
    document.body.appendChild(container);

    let seed = 42;
    const rng = () => { seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

    /* Side positions — [x%, y%, shapeType, useBlack] */
    const sidePositions = [
      [rng()*10,      6+rng()*16,  0, false],
      [rng()*11,     28+rng()*14,  1, true ],
      [rng()*9,      52+rng()*14,  2, false],
      [rng()*10,     72+rng()*14,  0, true ],
      [rng()*11,     88+rng()*8,   1, false],
      [89+rng()*10,  4+rng()*16,   2, true ],
      [88+rng()*11, 26+rng()*14,   0, false],
      [89+rng()*10, 50+rng()*14,   1, true ],
      [88+rng()*11, 70+rng()*14,   2, false],
      [89+rng()*10, 86+rng()*10,   0, true ],
    ];

    sidePositions.forEach(([x, y, type, isBlack]) => {
      const wrap = document.createElement('div');
      const rot = ((rng()-.5)*28).toFixed(1);
      const depth = 0.15+rng()*0.25;
      const color = isBlack ? C_BLACK : C_GRAY;
      /* black marks at lower opacity so they don't dominate */
      const opacityRange = isBlack ? (0.06 + rng()*0.08) : (0.07 + rng()*0.10);
      wrap.style.cssText = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;transform:rotate(${rot}deg);will-change:transform;opacity:${opacityRange.toFixed(3)}`;
      wrap.appendChild(makeComplex(rng, type, color));
      container.appendChild(wrap);
      scribbleItems.push({ el: wrap, depth, rot: parseFloat(rot) });
    });

    /* Center — dots and short lines, more of them, actually visible */
    const centerPositions = [
      [20+rng()*10, 10+rng()*10, true ],
      [65+rng()*12,  8+rng()*10, false],
      [30+rng()*14, 30+rng()*12, false],
      [55+rng()*12, 28+rng()*10, true ],
      [18+rng()*12, 52+rng()*10, true ],
      [68+rng()*10, 50+rng()*10, false],
      [35+rng()*16, 68+rng()*10, false],
      [58+rng()*12, 70+rng()*10, true ],
      [25+rng()*10, 84+rng()*10, false],
      [62+rng()*12, 86+rng()*10, true ],
    ];

    centerPositions.forEach(([x, y, isBlack]) => {
      const wrap = document.createElement('div');
      const rot = ((rng()-.5)*18).toFixed(1);
      const depth = 0.03+rng()*0.07;
      const color = isBlack ? C_BLACK : C_GRAY;
      const opacity = isBlack ? (0.10 + rng()*0.10) : (0.08 + rng()*0.09);
      wrap.style.cssText = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;transform:rotate(${rot}deg);will-change:transform;opacity:${opacity.toFixed(3)}`;
      wrap.appendChild(makeSimple(rng, color));
      container.appendChild(wrap);
      scribbleItems.push({ el: wrap, depth, rot: parseFloat(rot) });
    });
  }

  /* Mouse parallax + occasional draw-retrace effect */
  let mx = 0, my = 0, ticking = false, lastDraw = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX/window.innerWidth - 0.5) * 2;
    my = (e.clientY/window.innerHeight - 0.5) * 2;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      scribbleItems.forEach(s => {
        const dx = (mx * s.depth * 24).toFixed(1);
        const dy = (my * s.depth * 24).toFixed(1);
        s.el.style.transform = `translate(${dx}px,${dy}px) rotate(${s.rot}deg)`;
      });
      const now = Date.now();
      if (now - lastDraw > 900) {
        const withPaths = scribbleItems.filter(s => s.el.querySelector('path'));
        if (withPaths.length) {
          triggerDraw(withPaths[Math.floor(Math.random()*withPaths.length)].el);
          lastDraw = now;
        }
      }
      ticking = false;
    });
  });

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('site:themechange', render);
})();
