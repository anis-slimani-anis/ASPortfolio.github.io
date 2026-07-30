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
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(scaleStages);
    document.querySelectorAll('.pf-stage-wrap').forEach(function (wrap) {
      ro.observe(wrap);
    });
  } else {
    window.addEventListener('resize', scaleStages);
  }

  scaleStages();

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
