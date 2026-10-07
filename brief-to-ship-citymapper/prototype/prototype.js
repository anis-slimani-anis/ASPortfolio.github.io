/*
 * À ma façon · prototype
 * mountPrototype(el) monte un écran 390 x 844 qui se met à l'échelle de son
 * conteneur. Aucune dépendance. Les données viennent de window.CM_DATA (data.js).
 *
 * États (machine à états, voir `state.screen`) :
 *   results  -> builder (étape "line" puis "stop", répétée) -> composed -> results (épinglé)
 */
(function () {
  'use strict';

  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  var W = 390, H = 844;
  var uid = 0;

  function ensureFont() {
    if (document.getElementById('cm-inter')) return;
    var l = document.createElement('link');
    l.id = 'cm-inter';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    document.head.appendChild(l);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function toMin(hhmm) { var p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmt(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function lcFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  function mountPrototype(el, options) {
    var DATA = (options && options.data) || window.CM_DATA;
    if (!el || !DATA) throw new Error('mountPrototype: conteneur ou données manquants');
    ensureFont();
    var id = 'cm' + (++uid);
    var listeners = [];

    el.classList.add('cm-root');
    el.innerHTML =
      '<div class="cm-stage">' +
        '<div class="cm-screen" style="display:contents"></div>' +
        '<div class="cm-sr" aria-live="polite" aria-atomic="true"></div>' +
      '</div>';
    var stage = el.querySelector('.cm-stage');
    var screenEl = el.querySelector('.cm-screen');
    var liveEl = el.querySelector('[aria-live]');

    /* ── Réseau ───────────────────────────────────────────── */
    function station(sid) { return DATA.stations[sid].name; }
    function stopIndex(line, sid) {
      var stops = DATA.lines[line].stops;
      for (var i = 0; i < stops.length; i++) if (stops[i].s === sid) return i;
      return -1;
    }
    function ride(line, a, b) {
      var o = DATA.rideOverrides || {};
      var k1 = line + '|' + a + '|' + b, k2 = line + '|' + b + '|' + a;
      if (o[k1] != null) return o[k1];
      if (o[k2] != null) return o[k2];
      var stops = DATA.lines[line].stops;
      return Math.abs(stops[stopIndex(line, a)].t - stops[stopIndex(line, b)].t);
    }
    // Correspondances possibles en descendant de `line` à `sid`
    function transfersFrom(sid, line, used) {
      if (line == null) {
        return Object.keys(DATA.lines)
          .filter(function (l) { return stopIndex(l, sid) > -1; })
          .map(function (l) { return { at: sid, from: null, to: l, board: sid, min: 0, label: 'Départ' }; });
      }
      return DATA.transfers.filter(function (t) {
        return t.at === sid && t.from === line && used.indexOf(t.to) === -1;
      });
    }
    // Meilleur temps restant jusqu'à destination une fois monté sur `line` à `board`
    function remaining(board, line, used) {
      var best = { min: Infinity };
      DATA.lines[line].stops.forEach(function (st) {
        if (st.s === board) return;
        var r = ride(line, board, st.s);
        var rest = st.s === DATA.destination ? { min: 0, next: null } : onward(st.s, line, used);
        if (r + rest.min < best.min) best = { min: r + rest.min, stop: st.s };
      });
      return best;
    }
    // Meilleur temps restant en descendant de `line` à `sid` (correspondance comprise)
    function onward(sid, line, used) {
      var best = { min: Infinity, next: null };
      transfersFrom(sid, line, used).forEach(function (t) {
        var rem = remaining(t.board, t.to, used.concat(t.to));
        if (t.min + rem.min < best.min) best = { min: t.min + rem.min, next: t };
      });
      return best;
    }

    /* ── État ─────────────────────────────────────────────── */
    var state, history, discovered = false;
    function initial() {
      return {
        screen: 'results',        // results | builder | composed
        mode: 'classique',        // onglet actif de la barre basse
        step: 'line',             // builder : line | stop
        line: null,               // builder : ligne choisie (étape stop)
        legs: [],
        pinned: null,
        arrive: state ? state.arrive : toMin(DATA.arriveBy),
        editTime: false,
        more: false
      };
    }
    function usedLines() { return state.legs.map(function (l) { return l.line; }); }
    function position() {
      var last = state.legs[state.legs.length - 1];
      return last ? { station: last.to, line: last.line } : { station: DATA.origin, line: null };
    }
    function total(legs) {
      return legs.reduce(function (s, l) { return s + l.ride + (l.transfer ? l.transfer.min : 0); }, 0);
    }
    function transferWalk(legs) {
      return legs.reduce(function (s, l) { return s + (l.transfer ? l.transfer.min : 0); }, 0);
    }

    // Lignes proposées depuis la position courante : uniquement celles qui
    // desservent la station ET qui rapprochent de la destination.
    function lineOptions() {
      var pos = position(), used = usedLines();
      var here = onward(pos.station, pos.line, used).min;
      return transfersFrom(pos.station, pos.line, used).map(function (t) {
        var stops = stopOptions(t, used.concat(t.to), here);
        if (!stops.length) return null;
        var best = stops.reduce(function (a, b) { return b.cost < a.cost ? b : a; });
        return { line: t.to, transfer: t, stops: stops, best: best };
      }).filter(Boolean).sort(function (a, b) { return a.transfer.min - b.transfer.min; });
    }
    // Arrêts de descente utiles sur une ligne : la destination, ou un arrêt
    // d'où l'on peut repartir en étant plus près qu'avant.
    function stopOptions(t, used, here) {
      var line = t.to, from = stopIndex(line, t.board), out = [];
      DATA.lines[line].stops.forEach(function (st, i) {
        if (st.s === t.board) return;
        var isDest = st.s === DATA.destination;
        var next = isDest ? { min: 0, next: null } : onward(st.s, line, used);
        if (!isDest && !(next.min < here)) return;
        var r = ride(line, t.board, st.s);
        out.push({ stop: st.s, ride: r, n: Math.abs(i - from), dest: isDest, next: next.next, cost: r + next.min });
      });
      return out;
    }
    function findOption(line) {
      return lineOptions().filter(function (o) { return o.line === line; })[0];
    }

    /* ── Transitions ──────────────────────────────────────── */
    function snapshot() { return JSON.stringify(state); }
    function commit(fn, silent) {
      history.push(snapshot());
      fn();
      state.editTime = false;
      render();
      if (!silent) emit();
    }
    function emit() {
      var name = api.getState();
      listeners.forEach(function (cb) { cb(name); });
    }
    function announce(msg) {
      liveEl.textContent = '';
      setTimeout(function () { liveEl.textContent = msg; }, 60);
    }

    function openBuilder() {
      discovered = true;
      commit(function () {
        state.screen = 'builder'; state.step = 'line'; state.line = null; state.legs = []; state.more = false;
      });
    }
    function chooseLine(line) {
      commit(function () { state.step = 'stop'; state.line = line; });
    }
    function addLeg(line, stopId, quiet) {
      var opt = findOption(line);
      var stop = opt && opt.stops.filter(function (s) { return s.stop === stopId; })[0];
      if (!stop) return;
      var t = opt.transfer;
      var leg = {
        line: line, from: t.board, to: stop.stop, ride: stop.ride,
        transfer: t.from ? { at: t.at, board: t.board, min: t.min, label: t.label, long: !!t.long, walk: !!t.walk } : null
      };
      commit(function () {
        state.legs.push(leg);
        state.step = 'line'; state.line = null; state.more = false;
        if (stop.dest) state.screen = 'composed';
      }, quiet);
      if (quiet) return;
      if (stop.dest) {
        var tt = total(state.legs);
        announce('Trajet complet. ' + tt + ' minutes, départ ' + fmt(state.arrive - tt) + '.');
      } else {
        announce('Tronçon ajouté, ' + line.replace(/^M/, 'ligne ') + ' : ' + station(leg.from) + ' vers ' + station(leg.to) + ', ' + leg.ride + ' minutes.');
      }
    }
    function removeLeg(i) {
      commit(function () {
        state.legs = state.legs.slice(0, i);
        state.screen = 'builder'; state.step = 'line'; state.line = null;
      });
      announce('Trajet raccourci. ' + state.legs.length + ' tronçon' + (state.legs.length > 1 ? 's' : '') + ' restant' + (state.legs.length > 1 ? 's' : '') + '.');
    }
    function pin() {
      commit(function () {
        state.pinned = state.legs.slice();
        state.screen = 'results'; state.mode = 'custom';
      });
      announce('Trajet épinglé en tête des suggestions.');
    }
    function back() {
      if (!history.length) return;
      var arrive = state.arrive;
      state = JSON.parse(history.pop());
      state.arrive = arrive; state.editTime = false;
      render(); emit();
    }
    function setMode(mode) {
      if (mode === 'custom') return openBuilder();
      if (state.mode === mode) return;
      commit(function () { state.mode = mode; });
    }
    function shiftTime(delta) {
      state.arrive = ((state.arrive + delta) % 1440 + 1440) % 1440;
      render();
    }

    /* ── Rendu ────────────────────────────────────────────── */
    function badge(line) {
      return '<img class="cm-badge" src="' + BASE + 'assets/' + DATA.lines[line].badge + '" width="24" height="24" alt="' + esc(line.replace(/^M/, 'Métro ')) + '">';
    }
    function topbar() {
      var canBack = history.length > 0;
      var pill = state.editTime
        ? '<div class="cm-pill cm-pill--edit" role="group" aria-label="Heure d’arrivée">' +
            '<button type="button" class="cm-pill__step cm-label" data-act="time-minus" data-key="time-minus" aria-label="Arriver ' + DATA.timeStep + ' minutes plus tôt">−</button>' +
            '<span class="cm-pill__value cm-label" aria-live="polite">Arrivée : ' + fmt(state.arrive) + '</span>' +
            '<button type="button" class="cm-pill__step cm-label" data-act="time-plus" data-key="time-plus" aria-label="Arriver ' + DATA.timeStep + ' minutes plus tard">+</button>' +
            '<button type="button" class="cm-pill__ok cm-label" data-act="time-toggle" data-key="time">OK</button>' +
          '</div>'
        : '<div class="cm-pill">' +
            '<button type="button" class="cm-pill__main cm-label" data-act="time-toggle" data-key="time" aria-label="Arrivée : ' + fmt(state.arrive) + '. Modifier l’heure d’arrivée">Arrivée : ' + fmt(state.arrive) + '</button>' +
          '</div>';
      return '<div class="cm-topbar">' +
        '<button type="button" class="cm-back cm-body-strong" data-act="back" data-key="back" aria-label="Retour"' + (canBack ? '' : ' aria-disabled="true"') + '>‹</button>' +
        pill +
      '</div>';
    }
    function fields() {
      return '<div class="cm-fields">' +
        '<div class="cm-field">' + badge('RER B') + '<span class="cm-body-strong">' + esc(station(DATA.origin)) + '</span></div>' +
        '<div class="cm-field">' + badge('M7') + '<span class="cm-body-strong">' + esc(station(DATA.destination)) + '</span></div>' +
      '</div>';
    }
    function routeRow(r, pinned) {
      var legs = r.lines.map(badge).join('<span class="cm-route__dot cm-body-strong" aria-hidden="true">·</span>');
      if (r.walk) legs += '<span class="cm-route__dot cm-body-strong" aria-hidden="true">·</span><span class="cm-caption">à pied</span>';
      return '<li class="cm-route">' +
        (pinned ? '<p class="cm-route__tag cm-label">Ton trajet · épinglé</p>' : '') +
        '<div class="cm-route__top">' +
          '<div class="cm-route__legs">' + legs + '</div>' +
          '<span class="cm-spacer"></span>' +
          '<span class="cm-route__fare cm-label">' + esc(DATA.fare) + '</span>' +
          '<span class="cm-time"><span class="cm-display">' + r.total + '</span><span class="cm-caption">min</span></span>' +
        '</div>' +
        '<p class="cm-route__meta cm-caption">Départ ' + fmt(state.arrive - (r.early || 0) - r.total) + ' · ' +
          '<span class="cm-live"><span class="cm-live__dot" aria-hidden="true"></span>À l’heure</span></p>' +
      '</li>';
    }
    function modeBtn(key, label, glyph, glyphClass, iconClass, inert) {
      var active = state.mode === key;
      var hint = key === 'custom' && !discovered && !state.pinned ? ' cm-mode--hint' : '';
      return '<button type="button" class="cm-mode' + hint + '" data-act="mode" data-mode="' + key + '" data-key="mode-' + key + '"' +
        (inert ? ' aria-disabled="true"' : ' aria-pressed="' + active + '"') + '>' +
        '<span class="cm-mode__icon ' + iconClass + ' ' + glyphClass + '" aria-hidden="true">' + glyph + '</span>' +
        '<span class="' + (active ? 'cm-label' : 'cm-caption') + '">' + label + '</span>' +
      '</button>';
    }
    function renderResults() {
      var rows = DATA.suggested.slice();
      var list = '';
      if (state.pinned) {
        list += routeRow({ lines: state.pinned.map(function (l) { return l.line; }), total: total(state.pinned) }, true);
        rows = rows.slice(0, rows.length - 1);
      }
      list += rows.map(function (r) { return routeRow(r, false); }).join('');
      return topbar() +
        '<div class="cm-panel">' +
          fields() +
          '<div class="cm-card cm-modes">' + DATA.otherModes.map(function (m) {
            return '<div class="cm-modes__cell"><span class="cm-body-strong">' + esc(m.value) + '</span><span class="cm-caption">' + esc(m.label) + '</span></div>';
          }).join('') + '</div>' +
          '<h3 class="cm-body-strong cm-on-dark" tabindex="-1" data-key="heading">Suggérés</h3>' +
          '<ul class="cm-card">' + list + '</ul>' +
        '</div>' +
        '<div class="cm-bottombar" role="group" aria-label="Modes de trajet">' +
          modeBtn('classique', 'Classique', '→', 'cm-body-strong', 'cm-mode__icon--green') +
          modeBtn('accessible', 'Accessible', 'A', 'cm-body-strong', 'cm-mode__icon--blue', true) +
          modeBtn('bus', 'Bus+', 'Bus', 'cm-label', '', true) +
          modeBtn('train', 'Train+', 'RER', 'cm-label', '', true) +
          modeBtn('custom', 'À ma façon', '+', 'cm-body-strong', '') +
        '</div>';
    }
    function transferText(t) {
      if (t.at !== t.board) return esc(station(t.at)) + ' → ' + esc(station(t.board)) + ' · ' + t.min + ' min à pied';
      return esc(station(t.at)) + ' · ' + esc(lcFirst(t.label)) + ', ' + t.min + ' min';
    }
    function legRows(legs, removable) {
      return legs.map(function (l, i) {
        var tr = l.transfer
          ? '<li class="cm-transfer' + (l.transfer.long ? ' cm-transfer--long' : '') + '">' +
              '<span class="cm-transfer__icon cm-label" aria-hidden="true">↳</span>' +
              '<span class="cm-transfer__text cm-caption"><span class="cm-sr">Correspondance : </span>' + transferText(l.transfer) + '</span>' +
            '</li>'
          : '';
        return tr + '<li class="cm-leg">' + badge(l.line) +
          '<span class="cm-leg__text"><span class="cm-body-strong">' + esc(station(l.from)) + ' → ' + esc(station(l.to)) + '</span>' +
          (removable ? '<button type="button" class="cm-leg__remove cm-caption" data-act="remove" data-i="' + i + '" data-key="remove-' + i + '" aria-label="Retirer ' +
            esc(DATA.lines[l.line].label) + (i < legs.length - 1 ? ' et la suite du trajet' : '') + '">Retirer</button>' : '') +
          '</span>' +
          '<span class="cm-leg__min cm-label">' + l.ride + ' min</span>' +
        '</li>';
      }).join('');
    }
    function optionSub(t, next) {
      if (!t.from) return 'Au départ, sans correspondance';
      return esc(t.label) + ' · ' + t.min + ' min' + (t.walk ? ' à pied' : '') + nextHint(next);
    }
    function nextHint(next) {
      if (!next) return '';
      return ', puis ' + esc(DATA.lines[next.to].label) + (next.board !== next.at ? ' à ' + esc(station(next.board)) : '');
    }
    function stopTitle(s) {
      return esc(station(s.stop)) + (s.dest ? ', direct' : ', ' + s.n + ' arrêt' + (s.n > 1 ? 's' : ''));
    }
    function renderBuilder() {
      var pos = position(), opts = lineOptions();
      var headId = id + '-pick', heading, rows = '', cta = '';
      if (state.step === 'stop') {
        var opt = findOption(state.line);
        heading = 'Sur ' + DATA.lines[state.line].label + ', descends à';
        rows = opt.stops.map(function (s) {
          var checked = s.stop === opt.best.stop;
          return '<label class="cm-option">' + badge(state.line) +
            '<input type="radio" name="' + id + '-stop" value="' + s.stop + '" data-label="' + esc(station(s.stop)) + '" data-dest="' + s.dest + '"' + (checked ? ' checked' : '') + '>' +
            '<span class="cm-option__text"><span class="cm-body-strong">' + stopTitle(s) + '</span>' +
            '<span class="cm-option__sub cm-caption">' + s.ride + ' min de trajet</span></span>' +
            '<span class="cm-radio cm-label" aria-hidden="true">✓</span></label>';
        }).join('');
        cta = '<button type="button" class="cm-cta cm-body-strong" data-act="add" data-key="cta">' + stopCta(opt.best) + '</button>';
      } else {
        heading = state.legs.length
          ? 'Depuis ' + station(pos.station) + ', continue avec'
          : 'Depuis ' + station(pos.station) + ', commence avec';
        rows = opts.map(function (o, i) {
          return '<label class="cm-option">' + badge(o.line) +
            '<input type="radio" name="' + id + '-line" value="' + esc(o.line) + '"' + (i === 0 ? ' checked' : '') + '>' +
            '<span class="cm-option__text"><span class="cm-body-strong">' + stopTitle(o.best) + '</span>' +
            '<span class="cm-option__sub cm-caption' + (o.transfer.long ? ' cm-option__sub--long' : '') + '">' + optionSub(o.transfer, o.best.next) + '</span></span>' +
            '<span class="cm-radio cm-label" aria-hidden="true">✓</span></label>';
        }).join('');
        if (!opts.length) rows = '<p class="cm-empty cm-caption">Aucune ligne ne rapproche de ' + esc(station(DATA.destination)) + ' depuis ici. Retire le dernier tronçon.</p>';
        var others = DATA.stations[pos.station].otherLines;
        if (others && others.length) {
          rows += '<div class="cm-more">' +
            '<button type="button" class="cm-more__btn cm-caption" data-act="more" data-key="more" aria-expanded="' + state.more + '">+ ' + others.length + ' autres lignes à ' + esc(station(pos.station)) + '</button>' +
            (state.more ? '<p class="cm-more__detail cm-caption">' + esc(others.join(', ')) + ' : non proposées dans ce prototype.</p>' : '') +
          '</div>';
        }
        if (opts.length) cta = '<button type="button" class="cm-cta cm-body-strong" data-act="continue" data-key="cta">Continuer avec ' + esc(DATA.lines[opts[0].line].label) + '</button>';
      }
      return topbar() +
        '<div class="cm-panel">' +
          fields() +
          '<div class="cm-titleblock">' +
            '<h3 class="cm-title" tabindex="-1" data-key="heading">À ma façon</h3>' +
            '<p class="cm-caption">Compose ton trajet ligne par ligne. Seules les lignes qui existent te sont proposées, chaque correspondance est vérifiée.</p>' +
          '</div>' +
          (state.legs.length ? '<ul class="cm-card" aria-label="Trajet en cours">' + legRows(state.legs, true) + '</ul>' : '') +
          '<h4 class="cm-body-strong cm-on-dark" id="' + headId + '">' + esc(heading) + '</h4>' +
          '<div class="cm-card" role="radiogroup" aria-labelledby="' + headId + '">' + rows + '</div>' +
          cta +
        '</div>';
    }
    function stopCta(s) {
      return s.dest ? 'Aller jusqu’à ' + esc(station(s.stop)) : 'Descendre à ' + esc(station(s.stop));
    }
    function summaryText(legs) {
      var ref = DATA.reference, d = total(legs) - ref.total, w = transferWalk(legs);
      var a = d > 0 ? d + ' min de plus que le suggéré' : d < 0 ? (-d) + ' min de moins que le suggéré' : 'Même durée que le suggéré';
      var b = w === ref.transferWalk
        ? w + ' min de marche en correspondance'
        : w + ' min de marche en correspondance au lieu de ' + ref.transferWalk;
      return a + ', ' + b + '. Suivi en direct comme un trajet suggéré.';
    }
    function renderComposed() {
      var tt = total(state.legs);
      return topbar() +
        '<div class="cm-panel">' +
          fields() +
          '<div class="cm-titleblock">' +
            '<h3 class="cm-title" tabindex="-1" data-key="heading">Ton trajet</h3>' +
            '<p class="cm-caption">Arrivée atteinte. Toutes les correspondances sont valides.</p>' +
          '</div>' +
          '<ul class="cm-card" aria-label="Trajet composé">' + legRows(state.legs, false) + '</ul>' +
          '<div class="cm-card cm-summary">' +
            '<div class="cm-summary__row">' +
              '<span class="cm-display">' + tt + '</span><span class="cm-caption">min</span>' +
              '<span class="cm-spacer"></span>' +
              '<span class="cm-summary__dep cm-label">Départ ' + fmt(state.arrive - tt) + '</span>' +
            '</div>' +
            '<p class="cm-summary__text cm-caption">' + summaryText(state.legs) + '</p>' +
          '</div>' +
          '<button type="button" class="cm-cta cm-body-strong" data-act="pin" data-key="cta">Épingler ce trajet</button>' +
        '</div>';
    }

    var lastView = '';
    function render() {
      var hadFocus = stage.contains(document.activeElement);
      var key = hadFocus && document.activeElement.getAttribute('data-key');
      var panel = screenEl.querySelector('.cm-panel');
      var view = state.screen + '/' + state.step + '/' + state.legs.length;
      var scroll = panel && view === lastView ? panel.scrollTop : 0;

      screenEl.innerHTML = state.screen === 'builder' ? renderBuilder()
        : state.screen === 'composed' ? renderComposed() : renderResults();

      panel = screenEl.querySelector('.cm-panel');
      if (panel) panel.scrollTop = scroll;
      if (hadFocus) {
        var target = view === lastView && key && screenEl.querySelector('[data-key="' + key + '"]');
        (target || screenEl.querySelector('[data-key="heading"]')).focus({ preventScroll: true });
      }
      lastView = view;
    }

    /* ── Événements ───────────────────────────────────────── */
    stage.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !stage.contains(b) || b.getAttribute('aria-disabled') === 'true') return;
      var act = b.getAttribute('data-act');
      if (act === 'back') back();
      else if (act === 'time-toggle') { state.editTime = !state.editTime; render(); }
      else if (act === 'time-minus') shiftTime(-DATA.timeStep);
      else if (act === 'time-plus') shiftTime(DATA.timeStep);
      else if (act === 'mode') setMode(b.getAttribute('data-mode'));
      else if (act === 'more') { state.more = !state.more; render(); }
      else if (act === 'remove') removeLeg(+b.getAttribute('data-i'));
      else if (act === 'pin') pin();
      else if (act === 'continue') {
        var l = stage.querySelector('input[name="' + id + '-line"]:checked');
        if (l) chooseLine(l.value);
      } else if (act === 'add') {
        var s = stage.querySelector('input[name="' + id + '-stop"]:checked');
        if (s) addLeg(state.line, s.value);
      }
    });
    // Le choix d'un radio met à jour le libellé du CTA sans re-rendu
    stage.addEventListener('change', function (e) {
      var cta = stage.querySelector('.cm-cta');
      if (!cta || e.target.type !== 'radio') return;
      if (e.target.name === id + '-line') cta.textContent = 'Continuer avec ' + DATA.lines[e.target.value].label;
      else cta.textContent = (e.target.getAttribute('data-dest') === 'true' ? 'Aller jusqu’à ' : 'Descendre à ') + e.target.getAttribute('data-label');
    });

    /* ── Mise à l'échelle ─────────────────────────────────── */
    function fit() {
      var w = el.clientWidth;
      if (!w) return;
      var scale = w / W;
      var h = el.classList.contains('cm-root--fill') && el.clientHeight ? el.clientHeight / scale : H;
      el.style.setProperty('--cm-scale', scale);
      el.style.setProperty('--cm-h', h);
    }
    var ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', fit);

    /* ── API ──────────────────────────────────────────────── */
    // Trajet "héros" rejoué par les mêmes fonctions que l'interface
    var HERO = [['RER B', 'chatelet'], ['RER A', 'auber'], ['M7', DATA.destination]];
    var api = {
      // 'results' | 'picker' | 'composed' | 'pinned'
      goTo: function (name) {
        history = []; state = initial();
        if (name !== 'results') {
          discovered = true;
          history.push(snapshot());
          state.screen = 'builder';
          var n = name === 'picker' ? 1 : HERO.length;
          for (var i = 0; i < n; i++) {
            var opt = findOption(HERO[i][0]);
            var stop = opt.stops.filter(function (s) { return s.stop === HERO[i][1]; })[0];
            history.push(snapshot());
            state.legs.push({
              line: opt.line, from: opt.transfer.board, to: stop.stop, ride: stop.ride,
              transfer: opt.transfer.from ? { at: opt.transfer.at, board: opt.transfer.board, min: opt.transfer.min, label: opt.transfer.label, long: !!opt.transfer.long, walk: !!opt.transfer.walk } : null
            });
            if (stop.dest) state.screen = 'composed';
          }
          if (name === 'pinned') {
            history.push(snapshot());
            state.pinned = state.legs.slice(); state.screen = 'results'; state.mode = 'custom';
          }
        }
        render(); emit();
      },
      getState: function () {
        if (state.screen === 'builder') return 'picker';
        if (state.screen === 'composed') return 'composed';
        return state.pinned && state.mode === 'custom' ? 'pinned' : 'results';
      },
      onChange: function (cb) { listeners.push(cb); },
      back: back,
      refit: fit,
      scroller: function () { return screenEl.querySelector('.cm-panel'); },
      destroy: function () { if (ro) ro.disconnect(); el.innerHTML = ''; el.classList.remove('cm-root'); }
    };

    history = []; state = null; state = initial();
    render(); fit();
    return api;
  }

  window.mountPrototype = mountPrototype;
})();
