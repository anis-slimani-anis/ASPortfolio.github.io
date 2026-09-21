# Figma node index

File `loA6bfeV7VKqkWsik9iaLr`. Page `04 Final Screens` = `2:4`, page `05 Test` = `2:5`.
`get_metadata` only enumerates the page the desktop app last had open, and a whole
page exceeds the MCP response limit, so these ids were extracted from the 2:4 dump.

## Screens

| Screen | Desktop | Mobile |
|---|---|---|
| 01 Recherche / landing | `352:2966` | `352:3073` |
| 02 Autocomplete | `265:3627` | `320:1948` |
| 03 Résultats | `216:1324` | `229:1546` (app shell `235:2227`) |
| 03 Résultats, perturbés masqués | `379:2067` | `379:2544` (app shell `379:2738`) |
| 04 Après bascule | `233:1842` | `233:2022` |
| Overlay détail (works) | `333:2238` | — |
| Overlay delay | `501:4633` | — |
| 05 Alerte pré-départ | — | `612:2942` |

## Components (from the build brief)

| Component | Node |
|---|---|
| journey/result-card | `317:1863` |
| journey/result-card-mobile | `317:1907` |
| journey/disruption-strip | `209:234` |
| date/day-card | `209:212` |
| banner/travaux | `333:2175` |
| banner/travaux-mobile | `333:2187` |
| sheet/trajet-detail (set) | `649:919`, Works `649:796`, Delay `649:918` |
| sheet/trajet-detail-mobile | instances Works `649:3777`, Delay `649:4019` |
| control/follow-route | `612:673` |
| control/toggle | `215:213` |
| control/button-pill | `215:216` |
| alert/disruption-alert | `612:710` |
| bar/afficher-suivants-mobile | `333:2222` |
| shell/header-desktop | `352:2886` |
| search/station-row | `337:1476` (mobile `337:1600`) |
| search/suggestions-desktop | `338:2677` (mobile `338:2767`) |
| search/field-desktop | `338:2534` |
| search/mode-tabs-desktop | `338:2552` |

Icons: train `208:186`, bus `208:189`, chevron `208:192`, travaux `208:195`,
critique `208:198`, info `208:201`, indisponible `208:204`.
Clock and route are not top-level; they were lifted from inside `317:1863`.

## Note, September 20 2026

`sheet/disruption-detail` and the two mobile overlay screens were deleted in the
redesign review; their ids 404 now, as do the drawer ids `642:979` / `642:1240`.
The live drawer is `sheet/trajet-detail` above. `get_metadata` reaches any node
by id even when the desktop app has another page open, so a dead id means the
node is really gone, not that the wrong page is open.
