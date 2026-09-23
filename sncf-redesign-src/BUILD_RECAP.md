# SNCF Connect journey redesign: how it was built

A record of what this prototype is, how it is put together, and which decisions
were deliberate. Written for whoever picks it up next, including you in three
months.

Live at `anisslimani.com/sncf/`. Source in `sncf-redesign-src/`,
build output committed in `sncf/`.

---

## 1. What it is

A working static site that reproduces the redesigned SNCF Connect search and
results flow from Figma file `loA6bfeV7VKqkWsik9iaLr`, page `04 Final Screens`.

It exists because the case study makes a claim about proactive disruption
communication, and a claim like that is easier to believe when you can click it
than when you look at a flat frame. It runs one scripted scenario end to end:
Massy TGV to Marseille Saint-Charles over a weekend of engineering works, with
a replacement coach between Avignon and Marseille and roughly 50 minutes added.

Five routes:

| Route | Screen |
|---|---|
| `/` | Landing, search zone and promo |
| `/recherche` | Autocomplete. Desktop dims the page behind a panel, mobile is a full-screen sheet |
| `/voyageurs` | Passenger step between search and results |
| `/resultats?date=…` | Results, disrupted or clean depending on the date |
| `/alerte` | Pre-departure lock screen and alert card. Mobile only |

---

## 2. Running it

```bash
npm install
npm run dev      # http://localhost:5173/sncf/
npm run build    # writes to ../sncf/
```

Deployment is a git push. `sncf/` is committed to `main`, GitHub Pages
serves it, and `main` is the deploy branch, so there is no separate pipeline.

`vite.config.ts` carries the two lines that make that work: `base:
'/sncf/'` so every asset URL is absolute under the subpath, and
`build.outDir: '../sncf'` so the build lands where Pages will find it.

---

## 3. Stack, and what was refused

Vite 8, React 19, TypeScript. Two runtime dependencies: `react` and
`react-dom`. Nothing else.

No UI library, no Tailwind, no CSS-in-JS, no router package, no state manager,
no animation library, no icon package.

That was the point rather than an economy. The brief's whole argument is that
the design system holds up, and the way to show that is a stylesheet whose
declarations map one to one onto the tokens. A component library would have
hidden exactly the thing being demonstrated, because every spacing and colour
decision would then belong to the library instead of to the system.

What that costs is roughly 1,300 lines of hand-written CSS. What it buys is
that you can read any rule and see which token it came from.

Sizes, for reference: 294 KB of JavaScript (92 KB gzipped) and 58 KB of CSS
(9 KB gzipped). Most of the JavaScript is the 2,950-station dataset.

---

## 4. Architecture

### Routing

`src/lib/router.ts`, about 30 lines. Hash-based (`#/resultats?date=…`) because
GitHub Pages cannot rewrite unknown paths to `index.html`, so a real path
router would 404 on refresh or on a shared link. `useRoute()` subscribes to
`hashchange`, `go(path)` navigates.

### Breakpoints

Two, and only two: desktop at 1024 and up behaves as the 1440 design, anything
below behaves as the 393 design.

CSS is mobile-first with a single `@media (min-width: 1024px)` layer. Where a
component genuinely differs in structure rather than in style, `useIsDesktop()`
in `src/lib/useMedia.ts` reads the same query through `matchMedia`, so the
breakpoint is defined once and JavaScript and CSS cannot drift apart.

One caveat worth knowing: automated browser tools resize the viewport through
CDP, which does not dispatch `matchmedia change` or `resize` events. React then
keeps the old breakpoint and things look broken that are not. The hook listens
for both events as defence. A real browser is the only honest test of a resize.

### Theming

`src/lib/useTheme.ts` flips `data-theme` on `<html>` and persists the choice.

Night mode is a mobile-only affordance, because the real SNCF Connect website
has no appearance switch. The site decides how it looks, the visitor does not.
Only the app follows the device. So `useTheme(enabled)` pins the desktop to day
and `Header` only renders `ThemeButton` below 1024. The preference is still
stored, so narrowing the window gives it back.

That turned into a useful principle rather than a restriction: **night is the
app and day is the website**, so wherever the two products genuinely differ,
the theme selector is the right place to say so. The recommended-journey band is
hidden under `:root[data-theme="night"]`, because the app does not band the
recommended journey. The card's `aria-label` still opens with "Trajet
recommandé", so nothing is lost to a screen reader.

### State

No store. Three small hooks:

- `useSheet` tracks which drawer is open plus the follow opt-in, persisted to
  `localStorage`. Persisted because on mobile, following a route navigates away
  to the lock screen, and without persistence the state reset on the way back
  and the route could never be un-followed.
- `useDialog` gives the drawer its focus trap, Escape handling, focus restore
  and body scroll lock.
- `useMedia` and `useTheme` as above.

---

## 5. The token system, and the bug it kept producing

`src/styles/tokens.css` is the exported Figma collection, saved verbatim and
never edited. Two tiers: primitives that never change, and semantics that flip
under `[data-theme="night"]`.

`src/styles/app.css` adds a small number of tokens the export did not cover,
kept in one block at the top so they are easy to audit:

```css
--on-hero, --on-hero-muted, --on-hero-fill, --on-hero-field   /* ink on always-navy surfaces */
--accent-on-hero                                              /* #8de8fe, named by the spec */
--placeholder                                                 /* themed, see below */
--pill-ink                                                    /* see below */
--surface-promo                                               /* the one promo colour */
```

Night-mode disruption bands are derived with `color-mix` rather than taken from
the shipped night tokens, because `orange-900` and `red-900` are so near black
that the band disappeared into the card, while the daytime tints were the
opposite problem and glared.

### The recurring failure

One class of bug appeared four separate times, in four different components:

> A token flips light at night while the ink sitting on it stays white.

It hit `--text-inverse` on hero surfaces, `--accent-primary` on selected chips,
`--text-primary` and `--disruption-*-strong` on the drawer's time pills, and
`--text-muted` on the boarding pill. Each time the symptom was invisible text,
and each time the instinct was to patch that one component.

The fix that actually held is a rule rather than a patch:

> **Any element whose background comes from a flipping token must take its ink
> from a token that flips with it.**

`--pill-ink` (white in day, near-black at night) covers the backgrounds that are
dark in day and light at night. The grey boarding pill runs the other way, so it
pairs `--text-secondary` with `--pill-ink`. Same principle, opposite direction.

If you add a tinted surface, check it in both themes before anything else.

---

## 6. Data and the scripted scenario

No live API. A real API will not reliably return a disrupted Massy to Marseille
journey on demand, and the entire case depends on that state existing.

- `src/data/journeys.ts` holds fixed lists per date, with a seeded PRNG as a
  fallback for dates outside the scripted window so nothing ever renders empty.
- `src/data/dates.ts` builds the date strip and holds the works banner copy,
  which was scraped from the live site rather than invented.
- `src/data/itinerary.ts` holds the drawer's three variants. The itinerary is
  identical across `works` and `delay` except for the final leg: the same
  journey disrupted two different ways. That is the point the drawer makes, so
  the shape is shared and only the leg swaps. `normal` is the same anatomy with
  nothing marked.
- `src/data/stations.json` is 2,950 real passenger stations from
  `ressources.data.sncf.com` under Licence Ouverte, lazy-loaded.

### The demo window

Wed 23 to Tue 29 September 2026, works on **Fri 25, Sat 26, Sun 27**.
`DATE_DISRUPTED = 2026-09-26`, `DATE_CLEAN = 2026-09-28`.

Moved forward one week on 21 September 2026 so the scenario sits in the future
for user testing. A booking flow offering past dates reads as broken next to the
live site, which only ever offers future ones.

To move it again: shift in **whole weeks**. Every weekday label then stays
correct and no formatted copy has to change. The dates live in five files:
`lib/types.ts`, `data/dates.ts` (strip, TRAVAUX set, banner copy),
`data/journeys.ts`, `screens/Alerte.tsx`, `components/DisruptionAlert.tsx`.

### Search, deliberately constrained

Typing filters the real dataset and renders real matches, but only the Marseille
set routes through. Anything else is visible and not clickable. `FORCED_QUERY`
in `src/data/suggestions.ts` states this in the code so it reads as a decision
rather than a bug. Presenting the constraint honestly beat faking depth.

---

## 7. Notes per screen

**Landing.** The search field is plain white at rest. The heavy near-black ring
belongs to the open autocomplete state only, and it is a transparent border
rather than no border so the pill does not resize between states. The mode tab
row is a transparent band where only the selection is a surface, lifted on
`--elevation-300`. It is deliberately not interactive: the demo runs one
scenario, so a tab that moved the selection would change nothing underneath it,
and nothing here should invite a click it cannot answer. The promo sits off the
1128 grid at 1392 wide, which is what makes the narrow search column above read
as centred rather than cramped.

**Autocomplete.** Desktop draws the landing behind a blurred scrim and rises the
column into place, staggered, so it reads as a movement rather than a cut.
Clicking the dimmed area returns to the landing. Mobile is a full-screen sheet
using the same search pill, so the field never changes shape between screens.

**Voyageurs.** Originally one page-wide white card, which on the day palette is
nearly invisible against the page and turned every field into a box inside a
box. Now a column of grouped blocks on the page itself, with the filter chips
floating free of any container.

**Results.** The core screen. `ResultCard` props mirror the Figma booleans
exactly, so a variant is never a new component, only different data. Every
disruption surface opens the drawer: both strips, the alteration line, and
`Détail du trajet`. Cards without a best price still reserve the chip's slot, so
two cards side by side are the same height, which is what Figma does with the
first-class slot.

**Drawer (`TrajetDetailDrawer`).** Revised once after design review. It is a 560
right-anchored full-height scrolling panel on desktop and full screen on mobile.
One notice at the top carrying the altered duration inline, then the itinerary
card with a continuous rail and ringed stops, then `Suivre ce trajet`. `Fermer`
in the header is the only way out, as on the live site. The disrupted leg is
marked from the time pill through the rail to the stop, which is the single
strongest thing the redesign does.

**Alerte.** The payoff. Mobile only, and guarded on desktop: reaching it on a
wide screen hands back to the results. That redirect runs in an effect, never
during render, which is the only place navigation is safe to trigger.

---

## 8. Accessibility

Treated as part of shipping rather than a pass at the end, because the case
study argues that a disruption has to be legible, and legible has a definition.

- Every severity is icon **and** text label **and** colour. Never colour alone.
- Each result card is an `<article>` whose `aria-label` states, in order:
  departure, arrival, disruption if any, duration, price. The disruption is
  announced before the price so it is never the last thing heard.
- The drawer is `role="dialog"` with `aria-modal`, focus trapped, focus returned
  to the trigger, closes on Escape.
- The filter is a real `<input type="checkbox" role="switch">`.
- The toast is a `role="status"` live region, so it announces without stealing
  focus, and it animates out rather than vanishing.
- Every animation sits behind `prefers-reduced-motion`.

### How contrast was actually verified

Programmatically, in the browser, across every route, both themes, both
breakpoints, drawers open and closed. The script walks visible text nodes,
composites each background through its ancestors (including alpha), and applies
the correct WCAG threshold for the size and weight it finds.

Two things that matter if you rerun it:

1. **It must parse `color(srgb …)`.** Every `color-mix` night tint computes to
   that form in Chrome, and a naive `match(/[\d.]+/g)` reads `color(srgb 0.35
   0.29 0.21)` as near-black, silently passing whatever sits on it. This
   invalidated a full sweep before it was caught.
2. **Verify the verifier.** Plant a deliberate failure, confirm the script
   catches it, remove it. A sweep returning zero failures because it is not
   measuring anything looks exactly like a sweep returning zero failures.

Current state: 0 failures everywhere.

---

## 9. Deliberate limits

Worth briefing anyone who tests this, because none of these are defects:

- Only the Marseille set routes through. Other stations render and do not
  navigate.
- `Gares desservies et voie` is inert, kept as scaffolding for a future
  iteration.
- The works banner expands rather than opening the drawer, unlike the strips.
- `/alerte` is mobile only, reached by following a route.
- The mobile app-shell variant (`235:2227`) was approximated, not built.
- The header is reduced to a logo and the theme switch. The real header's
  Voyager, Cartes, Panier and Se connecter are all unreachable here, and eight
  dead controls read worse than none.
- `PillButton` exists as a design-system component but no screen references it
  any more.

---

## 10. Working with the Figma file

- `get_metadata` reaches any node by id regardless of which page the desktop app
  has open. A 404 therefore means the node is genuinely gone, not that the wrong
  page is open. Several ids in `BUILD_BRIEF.md` are now dead for that reason.
- A whole page exceeds the MCP response limit and spills to a file. Grep that
  file instead of re-pulling.
- `FIGMA_NODES.md` is the current index. `BUILD_BRIEF.md` and
  `component-specs.md` are the original inputs and are superseded on the points
  where this document disagrees with them.

---

## 11. File map

```
src/
  App.tsx              routing, theme wiring, the /alerte desktop guard
  main.tsx             entry
  lib/
    router.ts          hash router, useRoute + go
    useMedia.ts        useIsDesktop, the single breakpoint definition
    useTheme.ts        day/night, desktop-pinned, persisted
    useSheet.ts        drawer state + follow opt-in
    useDialog.ts       focus trap, Escape, focus restore, scroll lock
    types.ts           Journey type, DATE_DISRUPTED, DATE_CLEAN
  data/
    journeys.ts        fixed lists per date + seeded fallback
    dates.ts           date strip + works banner copy
    itinerary.ts       drawer content, three variants
    suggestions.ts     the eight Marseille suggestions, FORCED_QUERY
    stations.ts/.json  2,950 stations, lazy-loaded
  screens/             Landing, Autocomplete, Voyageurs, Results, Alerte
  components/          23 components, one per Figma component
  styles/
    tokens.css         the Figma export, unedited
    app.css            the entire stylesheet, mobile-first
```

Docs: `BUILD_BRIEF.md` and `component-specs.md` (original inputs),
`FIGMA_NODES.md` (node index), `NEXT_SESSION.md` (open items), this file.
