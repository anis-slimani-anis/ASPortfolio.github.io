/* À ma façon · étude de cas. Comportement de la page (EN et FR). */
(function () {
  document.body.classList.remove('no-js');

  var proto = mountPrototype(document.getElementById('proto'));
  var protoEl = document.getElementById('proto');
  var phone = document.getElementById('phone');
  var slot = document.getElementById('phoneSlot');
  var notes = [].slice.call(document.querySelectorAll('.note'));
  var fullscreenBtn = document.getElementById('fullscreen');
  var desktop = window.matchMedia('(min-width: 900px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Annotations <-> prototype ── */
  function highlight(name) {
    notes.forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-state') === name); });
  }
  proto.onChange(highlight);
  notes.forEach(function (n) {
    n.querySelector('button').addEventListener('click', function () {
      proto.goTo(n.getAttribute('data-state'));
      if (!desktop.matches) slot.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
  // Desktop : l'annotation au centre de l'écran pilote le prototype
  var noteIO = new IntersectionObserver(function (entries) {
    if (!desktop.matches) return;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var name = e.target.getAttribute('data-state');
      if (proto.getState() !== name) proto.goTo(name); else highlight(name);
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  notes.forEach(function (n) { noteIO.observe(n); });

  /* ── Mobile : plein écran sur demande ── */
  var locked = false, coached = false;
  var coach = document.getElementById('coach'), coachTimer;

  // Le plein écran ne s'ouvre que sur demande, par le bouton
  function canImmerse() { return !desktop.matches; }
  function enter() {
    if (locked || !canImmerse()) return;
    locked = true;
    document.documentElement.classList.add('is-locked');
    phone.classList.add('is-immersive');
    protoEl.classList.add('cm-root--fill');
    proto.refit();
    // Première ouverture : un mot d'explication, qui s'efface au premier geste
    if (!coached) {
      coached = true;
      // On attend la fin du zoom pour mesurer la position de l'onglet
      coachTimer = setTimeout(showCoach, reduced.matches ? 0 : 380);
    }
  }
  function coachTarget() { return protoEl.querySelector('[data-mode="custom"]'); }
  function showCoach() {
    var tab = coachTarget();
    if (!locked || !tab) return;
    var t = tab.getBoundingClientRect(), p = phone.getBoundingClientRect(), pad = 8;
    var spot = document.getElementById('coachSpot'), card = document.getElementById('coachCard');
    spot.style.left = (t.left - p.left - pad) + 'px';
    spot.style.top = (t.top - p.top - pad) + 'px';
    spot.style.width = (t.width + pad * 2) + 'px';
    spot.style.height = (t.height + pad * 2) + 'px';
    card.style.bottom = (p.bottom - t.top + pad + 16) + 'px';
    card.style.setProperty('--arrow', Math.max(12, p.right - 12 - (t.left + t.width / 2) - 9) + 'px');
    coach.classList.add('is-on');
    coachTimer = setTimeout(hideCoach, 12000);
  }
  function hideCoach() { clearTimeout(coachTimer); coach.classList.remove('is-on'); }
  // Un toucher ferme le tutoriel ; sur l'onglet mis en avant, il l'ouvre aussi
  coach.addEventListener('click', function (e) {
    var tab = coachTarget(), t = tab && tab.getBoundingClientRect();
    hideCoach();
    if (t && e.clientX >= t.left - 8 && e.clientX <= t.right + 8 && e.clientY >= t.top - 8 && e.clientY <= t.bottom + 8) tab.click();
  });
  // how : 'button' | 'esc' | 'up' | 'skip' | 'focus' | 'resize'. Seul 'skip' déplace la page.
  function exit(how) {
    if (!locked) return;
    locked = false; hideCoach();
    var hadFocus = phone.contains(document.activeElement);
    document.documentElement.classList.remove('is-locked');
    phone.classList.remove('is-immersive');
    protoEl.classList.remove('cm-root--fill');
    proto.refit();
    if (hadFocus && how !== 'focus') phone.focus({ preventScroll: true });
    if (how === 'skip') document.getElementById('after-prototype').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  }
  document.getElementById('quit').addEventListener('click', function () { exit('button'); });
  document.getElementById('skip').addEventListener('click', function () { exit('skip'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') exit('esc'); });
  // Jamais de piège : si le focus sort du téléphone, on relâche
  document.addEventListener('focusin', function (e) { if (locked && !phone.contains(e.target)) exit('focus'); });
  // Défilement au-delà d'un bord du prototype : on relâche, vers le haut
  // (retour au-dessus) ou vers le bas (suite de la page). Jamais coincé.
  var touchY = null, fromTop = false, fromBottom = false, pull = 0;
  function atTop() { var s = proto.scroller(); return !s || s.scrollTop <= 0; }
  function atBottom() { var s = proto.scroller(); return !s || s.scrollTop + s.clientHeight >= s.scrollHeight - 1; }
  phone.addEventListener('touchstart', function (e) {
    touchY = e.touches[0].clientY; fromTop = atTop(); fromBottom = atBottom();
  }, { passive: true });
  phone.addEventListener('touchmove', function (e) {
    if (!locked || touchY == null) return;
    var dy = e.touches[0].clientY - touchY;
    if (fromTop && atTop() && dy > 80) { touchY = null; exit('up'); }
    else if (fromBottom && atBottom() && dy < -110) { touchY = null; exit('skip'); }
  }, { passive: true });
  phone.addEventListener('wheel', function (e) {
    if (!locked) return;
    if (e.deltaY < 0 && atTop()) { pull = Math.min(pull, 0) + e.deltaY; if (pull < -80) { pull = 0; exit('up'); } }
    else if (e.deltaY > 0 && atBottom()) { pull = Math.max(pull, 0) + e.deltaY; if (pull > 160) { pull = 0; exit('skip'); } }
    else pull = 0;
  }, { passive: true });

  fullscreenBtn.addEventListener('click', function () { enter(); document.getElementById('quit').focus(); });
  function syncMode() {
    if (!canImmerse()) exit('resize');
    fullscreenBtn.hidden = !canImmerse();
    document.getElementById('phoneHint').hidden = !canImmerse();
  }
  desktop.addEventListener('change', syncMode);
  syncMode();

  /* ── Scroll reveal ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
