# SNCF Connect journey redesign, build brief

Ship the redesigned results flow as a static site. It must reproduce the Figma
screens exactly, not reinterpret them.

Figma file key: `loA6bfeV7VKqkWsik9iaLr`
Design system: page `02 Design System`. Screens: page `04 Final Screens`.

> Updated after the proactive-communication pass. New since the first version:
> a Delay variant of the detail sheet, two proactive components, the mobile
> `Aller` hero, the mobile mode tabs, and a fifth route for the pre-departure alert.

---

## 1. Non-negotiables

- Use `tokens.css` as supplied. Never write a raw hex value in a component.
- Reproduce the component anatomy in section 4 exactly: same padding, same gaps,
  same font sizes, same radii.
- Nunito Sans, weights 400, 500, 600, 700, 800. Load from Google Fonts.
- Two breakpoints only: desktop at >= 1024px behaves as the 1440 design
  (156px page gutter, 1128px content), mobile below that behaves as the 393 design
  (16px gutter, 361px content).
- French UI copy throughout. Do not translate.

## 2. Stack

Vite + React + TypeScript, plain CSS modules or a single stylesheet. No UI library,
no Tailwind. The point is that the CSS maps one to one onto the tokens.
Deploy target: static, Vercel or Netlify.

## 3. Data

### Stations
Download `liste-des-gares` from `ressources.data.sncf.com` (Licence Ouverte).
Filter to passenger stations, keep `name`, `uic`, `lat`, `lon`, `commune`, `region`.
Ship as `src/data/stations.json`. No runtime API call.

### Search behaviour, deliberately constrained
The demo has one scripted scenario. Whatever the user types in the arrival field,
the suggestion panel resolves to the Marseille set. Implement it as a
`FORCED_QUERY` constant so the constraint is visible in the code rather than a bug:

```ts
// The prototype demonstrates one disruption scenario end to end.
// Any query resolves to the Marseille station set so the scenario always holds.
const FORCED_QUERY = "Marseille";
```

Suggestions shown, in this order, matching `search/suggestions-desktop`:
1. Marseille, Ville, Provence-Alpes-Cote d'Azur
2. Marseille Saint-Charles, Gare, with line badges 33 34 48 50 51 and "+ 13 autres", severity Travaux
3. Marseille Blancarde, Gare, severity Travaux
4. Vitrolles Aeroport Marseille-Provence, Gare
5. Marseille-en-Beauvaisis, Ville, Hauts-de-France
6. Marseille-en-Beauvaisis, Gare, Hauts-de-France
7. Picon-Busserine (Marseille), Gare
8. Marseillette, Ville, Occitanie
Then section "Arrets et stations": Marseille, Arret, Reseau urbain.

Departure is fixed to `Massy TGV`.

### Journeys
Do not call a live API. A real API will not reliably return a disrupted
Massy to Marseille journey, and the entire case depends on that state existing.

Generate deterministically from `hash(origin + destination + date)` so the same
inputs always produce the same list. Seed a small PRNG, derive departure times,
durations and prices from it.

Two fixed dates drive the demo:
- `2026-09-19` (Saturday): disrupted. Engineering works between Avignon and
  Marseille, replacement coach, roughly 50 minutes added.
- `2026-09-21` (Monday): clean. No disruption on any journey.

Journey shape:
```ts
type Journey = {
  id: string;
  departTime: string;        // "07:28"
  arriveTime: string;        // "12:10"
  departStation: string;     // "Massy TGV"
  arriveStation: string;     // "Marseille Saint-Charles"
  durationLabel: string;     // "4h42"
  connectionLabel: string;   // "1 correspondance" | "direct"
  modes: ("train" | "bus")[];
  price2nd: string;          // "145 €"
  price1st: string;          // "191 €" | "-"
  recommended: boolean;
  bestPrice: boolean;
  strips: { severity: "planned" | "critical" | "unknown"; label: string }[];
  alteration?: string;       // "4 h 42 au lieu de 3 h 52"
  alternative?: string;      // "Trajet sans car de substitution à 09:13, 41 € de plus"
};
```

Saturday list, in this order:
1. 07:28 to 12:10, train+bus+train, 4h42, 1 correspondance, 145/191, strip planned
   "Travaux, car de substitution entre Avignon et Marseille", alteration
   "4 h 42 au lieu de 3 h 52", alternative "Trajet sans car de substitution à 09:13, 41 € de plus"
2. 09:13 to 12:34, train, 3h21, direct, 186/246, **recommended** with header
   "Trajet recommandé, sans car de substitution", **bestPrice** true, no strips
3. 13:07 to 17:58, train+bus+train, 4h51, 1 correspondance, 98/129, strip planned
   same label, PLUS a second strip, critical, "Retard annonce de 20 minutes".
   Alteration "4 h 51 au lieu de 3 h 55", alternative
   "Trajet sans car de substitution a 09:13, 88 EUR de plus"

Mobile adds a fourth: 18:12 to 23:04, train, 4h51, 1 corr., 72/95,
strip unknown "État du trafic indisponible".

Monday list: 08:12/12:03 132/174, 10:37/14:28 149/197, 14:07/17:58 118/156.
All direct, 3h51, no strips. The 14:07 is recommended and best price.

## 4. Components

Anatomy is in `component-specs.md`, extracted from the Figma file.
Build these, in this order:

1. `Icon` — train, bus, chevron, clock, route, severity travaux / critique / info / indisponible.
   Pull the SVG paths from Figma via MCP, node ids in section 6. 20x20 viewBox, `fill: currentColor`.
2. `DisruptionStrip` — props `severity`, `breakpoint`, `label`. Full width, tinted, icon left,
   label, chevron right. Bus glyph for planned, alert circle for critical, minus circle for unknown.
3. `ResultCard` — the core. Props exactly mirror the Figma booleans:
   `reco`, `correspondance`, `meilleurPrix`, `perturbation`, `perturbation2`, `alteration`, `alternative`.
4. `DateChip` — props `day`, `price`, `severity` (normal | travaux), `selected`.
5. `WorksBanner` — white card, 1px `--disruption-planned-strong` border, radius 14,
   filled alert circle, title in the same orange, body in `--text-primary`.
   Mobile truncates the body and adds a "Lire la suite" link.
6. `DetailSheet` — props `type`: `works` | `delay`. Tinted full-bleed header, title,
   body, journey rail with ringed stops, dates, then `FollowRoute`, then "Compris".
   Desktop 640 centred with `--elevation-400`, mobile full width bottom anchored.
   Delay uses the critical band, the alert glyph and a red rail. Layout is identical,
   which is the point: severity changes the sheet, not its structure.
7. `FollowRoute` — "Suivre ce trajet" / "Etre prevenu si les travaux changent" plus a
   toggle. Sits inside both sheet types at both breakpoints, above the dismiss action.
8. `DisruptionAlert` — props `type`: `works` | `delay`. The out-of-session card:
   severity strip, route and date, plain-language consequence, altered duration,
   "Voir les alternatives" primary and "Compris" secondary. Reuses the strip and the
   alteration line unchanged, which is why it costs nothing to build.
9. `Toggle`, `PillButton`, `LoadMoreBar`, `StationRow`, `SuggestionsPanel`,
   `HeaderDesktop`, `HeaderMobile`, `ModeTabs`, `SearchFieldDesktop`, `SearchFieldMobile`,
   `AllerHero`.

## 5. Screens and routes

| Route | Screen |
|---|---|
| `/` | Landing. Header, search zone with mode tabs and field, hero promo block |
| `/recherche` | Autocomplete. Desktop: dropdown panel under the field, page dimmed. Mobile: full-screen sheet with dark header, Recherche and Fermer |
| `/resultats?date=2026-09-19` | Results, disrupted |
| `/resultats?date=2026-09-19&filtre=1` | Results, disrupted journeys hidden, plus the "N trajets perturbés sont masqués / Tout afficher" row |
| `/resultats?date=2026-09-21` | Results after the date shift, clean, with "Revenir au samedi 19 septembre" |
| `/alerte` | NEW. Pre-departure alert. Lock-screen push above, `DisruptionAlert` anchored to the bottom over a blurred scrim |

### Results page composition, top to bottom

DESKTOP: `HeaderDesktop`, journey bar (`Aller`, Depart/Arrivee with swap, date,
Ajouter le retour, passenger and Codes, filter chips), `ModeTabs`, date strip of 7 days,
`WorksBanner`, filter toggle row, journey list, `LoadMoreBar`, upsell row.

MOBILE: `HeaderMobile`, `AllerHero` (295px tall: title, passenger and Codes,
Depart/Arrivee with swap, date and Ajouter le retour, horizontally scrolling filter chips),
`ModeTabs` (Train / Bus ou covoit.), date strip of 4 days, `WorksBanner`,
filter toggle row, journey list, `LoadMoreBar`.

Mobile has NO upsell row and NO `Detail du trajet` button. The duration pill is the tap
target and only the 2nd class price shows.

Interactions:
- Clicking any station suggestion goes to results.
- EVERY disruption surface opens the sheet: either strip, the works banner, the
  alteration line, and `Detail du trajet`. Planned strips open `type=works`,
  critical strips open `type=delay`.
- The sheet closes on `Compris`, on `Fermer`, and on scrim click. Scrim is
  `rgba(15,27,45,0.5)` with `backdrop-filter: blur(10px)`.
- The toggle filters. The date chips switch date. Scroll position is preserved throughout.
- `FollowRoute` toggling on is the entry point to `/alerte`. For the demo a link from the
  sheet is enough, no persistence required.

## 6. Figma node index, pull the rest yourself

Use the Figma MCP against file `loA6bfeV7VKqkWsik9iaLr`:

| Node | Id |
|---|---|
| journey/result-card | `317:1863` |
| journey/result-card-mobile | `317:1907` |
| journey/disruption-strip (6 variants) | `209:234` |
| date/day-card (4 variants) | `209:212` |
| banner/travaux | `333:2175` |
| banner/travaux-mobile | `333:2187` |
| sheet/disruption-detail, Works + Delay | `513:722` |
| sheet/disruption-detail-mobile, Works + Delay | `513:723` |
| control/follow-route | `612:673` |
| alert/disruption-alert, Works + Delay | `612:710` |
| control/toggle | `215:213` |
| control/button-pill | `215:216` |
| bar/afficher-suivants-mobile | `333:2222` |
| shell/header-desktop | `352:2886` |
| search/station-row | `337:1476` |
| search/station-row-mobile | `337:1600` |
| search/suggestions-desktop | `338:2677` |
| search/suggestions-mobile | `338:2767` |
| search/field-desktop | `338:2534` |
| search/mode-tabs-desktop | `338:2552` |
| icons | `208:186` train, `208:189` bus, `208:192` chevron, `208:195` travaux, `208:198` critique, `208:201` info, `208:204` indisponible |

Screens on `04 Final Screens` for visual reference:
`03 RESULTATS DESKTOP`, `03 MOBILE, resultats`, `03 RESULTATS DESKTOP, perturbes masques`,
`02 AUTOCOMPLETE DESKTOP`, `02 AUTOCOMPLETE MOBILE`, `01 RECHERCHE, LANDING DESKTOP`,
`04 APRES BASCULE DESKTOP`, `OVERLAY DETAIL DESKTOP`, `OVERLAY DELAY DESKTOP`,
`05 ALERTE PRE-DEPART`.

Ignore the cyan numbered pins and the cards below each screen. Those are review
annotations, not part of the product.

## 7. Accessibility, this is the point of shipping

- Every severity is icon **and** text label **and** colour. Never colour alone.
- Each result card is an `<article>` with an `aria-label` that states, in order:
  departure time, arrival time, disruption type if any, real duration, price.
  The disruption must be announced before the price.
- The detail sheet is a `role="dialog"` with `aria-modal`, focus trapped,
  focus returned to the trigger on close, closes on Escape.
- The filter toggle is a real `<input type="checkbox" role="switch">`.
- Verify with VoiceOver. Check contrast on the tinted strips against WCAG 2.2 AA.

## 8. Do not

- Do not call a live API on the default path.
- Do not invent components that are not in the Figma file.
- Do not substitute a UI library for the hand-built components.
- Do not translate the UI copy.
- Do not build a bespoke card for an edge case. Switch the existing props.
