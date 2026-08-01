(function () {
  var STAGE_W = 1920;
  var STAGE_H = 1080;

  function scaleStages() {
    var wraps = document.querySelectorAll('.pf-stage-wrap');
    wraps.forEach(function (wrap) {
      var stage = wrap.querySelector('.pf-stage');
      if (!stage) return;
      var scale = wrap.clientWidth / STAGE_W;
      stage.style.transform = 'scale(' + scale + ')';
    });
    // Pages without a stage (About) scale their chrome off the same ratio,
    // so the logo and nav are the same size on every page.
    document.documentElement.style.setProperty(
      '--pf-s', (document.documentElement.clientWidth / STAGE_W).toFixed(5));
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(scaleStages);
    document.querySelectorAll('.pf-stage-wrap').forEach(function (wrap) {
      ro.observe(wrap);
    });
  }
  // About has no stage for the observer to watch, so it needs this to keep
  // --pf-s in step with the viewport.
  window.addEventListener('resize', scaleStages);

  scaleStages();

  // Choreograph the load. Everything after the washes is staggered in DOM
  // order, which is what keeps a card's sheet ahead of its own title —
  // staggering per class let late sheets land after early titles.
  ['.pf-stage', '.pf-mobile', '.pf-proj-mobile'].forEach(function (sel) {
    var scope = document.querySelector(sel);
    if (!scope) return;

    scope.querySelectorAll('.pf-disc-swatch').forEach(function (el, i) {
      el.style.setProperty('--d', (200 + i * 55) + 'ms');
    });

    // Connectors animate clip-path, which repaints: sequence them so only
    // one is drawing at a time rather than all nine together.
    scope.querySelectorAll('.pf-vertices').forEach(function (el, i) {
      el.style.setProperty('--d', (140 + i * 90) + 'ms');
    });

    var seq = scope.querySelectorAll(
      '.pf-card-shape, .pf-card-photo, .pf-card-title,' +
      '.pf-proj-sheet, .pf-proj-img, .pf-note, .pf-video, .pf-proj-body,' +
      '.pf-proj-title, .pf-proj-mark, .pf-proto-shot, .pf-mobile-card'
    );
    seq.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(900 + i * 14, 1700) + 'ms');
    });

    // A card's label is part of its note, not a separate arrival: give it
    // the same delay as the sheet so the two land together.
    scope.querySelectorAll('.pf-card').forEach(function (card) {
      var sheet = card.querySelector('.pf-card-shape');
      var title = card.querySelector('.pf-card-title');
      if (sheet && title) title.style.setProperty('--d', sheet.style.getPropertyValue('--d'));
    });
  });

  // PROTO Collective: hover/focus pops the full-resolution photo up
  var shots = document.querySelectorAll('.pf-proto-shot[data-full], .pf-proto-shot-m[data-full]');
  if (shots.length) {
    var peek = document.createElement('div');
    peek.className = 'pf-proto-peek';
    peek.setAttribute('aria-hidden', 'true');
    var peekImg = document.createElement('img');
    peekImg.alt = '';
    peek.appendChild(peekImg);
    document.querySelector('.pf-root').appendChild(peek);

    var HOVER_DELAY = 450;   // deliberate hover, not a passing cursor
    var timer = null;
    var pending = null;
    // The browser fires mouseenter for whatever sits under a stationary
    // cursor on load, so a preview would pop open on arrival. Stay disarmed
    // until the pointer actually moves.
    var armed = false;
    window.addEventListener('mousemove', function () { armed = true; }, { once: true });

    var hide = function () {
      clearTimeout(timer);
      pending = null;
      peek.setAttribute('data-open', 'false');
    };

    var open = function (shot) {
      var full = shot.getAttribute('data-full');
      // Decode before revealing, so it never flashes the previous photo.
      var pre = new Image();
      pre.onload = function () {
        if (pending !== shot) return;      // pointer already moved on
        peekImg.setAttribute('src', full);
        peek.setAttribute('data-open', 'true');
      };
      pre.src = full;
    };

    shots.forEach(function (shot) {
      shot.addEventListener('mouseenter', function () {
        if (!armed) return;
        clearTimeout(timer);
        pending = shot;
        timer = setTimeout(function () { open(shot); }, HOVER_DELAY);
      });
      shot.addEventListener('mouseleave', hide);
      // Keyboard and click are explicit intent: no delay.
      shot.addEventListener('focus', function () { pending = shot; open(shot); });
      shot.addEventListener('blur', hide);
      shot.addEventListener('click', function () {
        armed = true;
        clearTimeout(timer);
        pending = shot;
        open(shot);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
    });
    window.addEventListener('blur', hide);
    document.addEventListener('scroll', hide, { passive: true });
  }

  // Sticky header goes fully opaque as soon as anything scrolls under it.
  // Read in a rAF so the scroll handler itself never measures layout.
  var headers = document.querySelectorAll('.pf-mheader');
  if (headers.length) {
    var queued = false;
    var syncStuck = function () {
      queued = false;
      var stuck = window.scrollY > 4;
      headers.forEach(function (h) { h.setAttribute('data-stuck', String(stuck)); });
    };
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(syncStuck);
    }, { passive: true });
    syncStuck();
  }

  // Mobile hamburger menu
  document.querySelectorAll('.pf-burger').forEach(function (burger) {
    var menu = document.getElementById(burger.getAttribute('aria-controls'));
    if (!menu) return;

    function setOpen(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(menu.hidden);
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
    });
  });
})();
