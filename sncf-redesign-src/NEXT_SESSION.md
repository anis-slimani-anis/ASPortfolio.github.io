# Next session

State: every screen in `04 Final Screens` is built and responsive.
0 contrast failures across `/`, `/recherche`, `/voyageurs`, the three results
states and `/alerte`, at 1440 and 393, day and night, drawers open and closed.
Build output is commit-ready in `../sncf-redesign/`.

## Demo window

Wed 23 to Tue 29 September 2026, works on **Fri 25 / Sat 26 / Sun 27**.
`DATE_DISRUPTED = 2026-09-26`, `DATE_CLEAN = 2026-09-28`.

Moved forward one week on 21 September 2026 so the scenario sits in the future
for user testing; a booking flow offering past dates reads as broken next to
the live site. `BUILD_BRIEF.md` still names the original 19/21 September and is
superseded on this point. The shift was +7 days exactly, which is why every
weekday label still holds. The dates live in five files: `lib/types.ts`,
`data/dates.ts` (strip, TRAVAUX set, banner copy), `data/journeys.ts`,
`screens/Alerte.tsx` and `components/DisruptionAlert.tsx`. Shift them together
in whole weeks and nothing else has to change.

## Standing rules discovered the hard way

**Night mode is a mobile-only affordance.** SNCF Connect's website has no
appearance switch, so `useTheme(enabled)` pins the desktop to day and `Header`
only renders `ThemeButton` below 1024. The preference is still stored, so
narrowing the window gives it back.

**Night is therefore the app, and day is the website.** Where the two products
differ, the theme selector is the right place to express it: the recommended
band is hidden under `:root[data-theme="night"]` because the app does not band
the recommended journey. The card's `aria-label` still opens with "Trajet
recommandé", so nothing is lost to a screen reader, and `#trajet-recommande`
still resolves for the upsell scroll.

**Pills whose background is a flipping token need ink from a token that flips
with it.** This has bitten four times: `--text-inverse` on hero surfaces,
`--accent-primary` on selected chips, `--text-primary` on drawer time pills,
and `--text-muted` on the boarding pill. `--pill-ink` covers the cases whose
background darkens in day and lightens at night; `--text-secondary` +
`--pill-ink` covers the grey pill, which runs the other way.

**The contrast script must parse `color(srgb …)`.** Every `color-mix` night
tint computes to that form, and a naive `match(/[\d.]+/g)` reads it as
near-black, silently passing whatever sits on it.

## Left over

- VoiceOver listen-through, Anis is doing this himself
- Mobile app-shell variant (`235:2227`) was approximated, not built
- Search: typing filters the real 2,950-station dataset (`findStations()`),
  but only the Marseille set routes through. `FORCED_QUERY` documents it.
- `Gares desservies et voie` is deliberately inert: kept as scaffolding for a
  future iteration, per Anis
- `PillButton` (`control/button-pill`) is no longer referenced by any screen
- The works banner expands rather than opening the drawer, unlike the strips,
  the alteration line and `Détail du trajet`
- Deploy: commit `sncf-redesign/` and push; lands at anisslimani.com/sncf-redesign/

## Reference

- `BUILD_BRIEF.md`, `component-specs.md`, `FIGMA_NODES.md` (all node ids)
- Figma `loA6bfeV7VKqkWsik9iaLr`, pages `2:4` (04 Final Screens), `2:5` (05 Test).
  `get_metadata` reaches any node by id regardless of which page the desktop app
  has open, so a 404 means the node is really gone. A whole page exceeds the MCP
  limit and spills to a file; grep that rather than re-pulling.
