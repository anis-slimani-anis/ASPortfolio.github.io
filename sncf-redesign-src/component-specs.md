# Component anatomy, extracted from Figma

Every line is `name | type | size | layout pad/gap/align | sizing | radius | fill token | stroke token | text spec`.
Token names map onto `tokens.css` custom properties: `surface/card` becomes `--surface-card`.

---

## journey/result-card  (desktop, node 317:1863)

Boolean props: `reco`, `correspondance`, `meilleurPrix`, `perturbation`, `perturbation2`, `alteration`, `alternative`

```
journey/result-card | VERTICAL gap:0 | radius=radius/strip | fill=surface/card | stroke=border/default:1
  reco | HORIZONTAL pad:12/16/12/16 gap:8 align:MIN/CENTER | fill=accent/reco | HIDDEN by default
    "Trajet recommandé" ExtraBold 16/22 color=text/on-accent | w:FILL
    icon/severity-info 20x20
  corps | HORIZONTAL pad:16/16/16/16 gap:12 align:MIN/CENTER | w:FILL | fill=surface/card
    modes | HORIZONTAL pad:14/12/14/12 gap:8 align:MIN/CENTER | w:HUG | radius=radius/strip | fill=surface/card | stroke=border/default:1
      icon/train 22x22  (vector fill=text/primary)
      fleche "→" Regular 14/19 color=text/muted        <- hidden when correspondance=false
      mode2 icon/train 22x22                            <- hidden when correspondance=false
    trajet | VERTICAL gap:4 | w:FILL
      depart | HORIZONTAL gap:10
        "07:28" ExtraBold 16/22 color=text/primary | w:FIXED 52
        "Massy TGV" Regular 16/22 color=text/primary | w:FILL
      arrivee | HORIZONTAL gap:10
        "12:10" ExtraBold 16/22 color=text/primary | w:FIXED 52
        "Marseille Saint-Charles" Regular 16/22 color=text/primary | w:FILL
    duree | HORIZONTAL gap:6 align:MIN/CENTER | w:HUG
      icon/clock 18x18 (vector fill=text/secondary)
      "4h42" Regular 14/19 color=text/secondary
      "1 correspondance" Regular 14/19 color=text/secondary
    detail | HORIZONTAL pad:17/14/17/14 gap:8 align:MIN/CENTER | w:HUG | radius=radius/strip | fill=surface/accent-soft
      "Détail du trajet" SemiBold 15/20 color=accent/primary
      icon/route 20x20 (vector fill=accent/primary)
    separateur | 2x44 | fill=surface/accent-soft
    prix | HORIZONTAL gap:12 align:MIN/MAX | w:HUG      <- MAX bottom-aligns both columns
      prix 2de | VERTICAL gap:2 align:MIN/CENTER | w:FIXED 118
        meilleur-prix 2de | HORIZONTAL pad:4/10/4/10 | radius=radius/chip | fill=accent/best-price
          "Meilleur prix" ExtraBold 12/16 color=text/primary
        "dès" Regular 14/19 color=text/secondary
        "150 €" ExtraBold 24/32 color=text/primary
      prix 1re | VERTICAL gap:2 align:MIN/CENTER | w:FIXED 118
        meilleur-prix 1re | same, always HIDDEN
        "dès" Regular 14/19 color=text/secondary
        "191 €" ExtraBold 24/32 color=text/primary
    deplier | 48x48 | VERTICAL pad:14/0/14/0 align:CENTER/CENTER | radius=radius/strip | fill=surface/accent-soft
      icon/chevron-right 20x20 rotated -90 (vector fill=accent/primary)
  perturbation | INSTANCE of journey/disruption-strip, Breakpoint=Desktop | w:FILL
  perturbation 2 | same | HIDDEN by default
  alteration | HORIZONTAL pad:8/16/8/16 align:SPACE_BETWEEN/MIN | w:FILL | fill=surface/strip-alt
    "4 h 42 au lieu de 3 h 52" Regular 13/18 color=disruption/planned-strong
    icon/chevron-right 16x16 (vector fill=disruption/planned-strong)
  alternative | HORIZONTAL pad:8/16/8/16 gap:10 align:MIN/CENTER | w:FILL | fill=surface/card | stroke=border/default top only
    "Trajet sans car de substitution à 09:13, 41 € de plus" Regular 14/19 color=text/primary | w:FILL
    "Choisir" ExtraBold 14/19 color=accent/primary
```

---

## journey/result-card-mobile  (node 317:1907, width 361)

Boolean props: `reco`, `meilleurPrix`, `perturbation`, `perturbation2`, `alteration`, `alternative`

```
journey/result-card-mobile | VERTICAL gap:0 | radius=radius/strip | fill=surface/card | stroke=border/default:1
  reco | HORIZONTAL pad:12/16/12/16 gap:8 align:MIN/CENTER | fill=accent/reco | HIDDEN
    "Trajet recommandé" ExtraBold 15/21 color=text/on-accent | w:FILL
    icon/severity-info 20x20
  corps | VERTICAL pad:16/16/16/16 gap:10 | w:FILL | fill=surface/card
    meilleur-prix | HORIZONTAL pad:4/10/4/10 | radius=radius/chip | fill=accent/best-price | HIDDEN
      "Meilleur prix" ExtraBold 12/16 color=text/primary
    haut | HORIZONTAL gap:12 align:MIN/MIN | w:FILL
      trajet | VERTICAL gap:4 | w:FILL
        depart | HORIZONTAL gap:10
          "07:28" ExtraBold 16/22 color=text/primary | w:FIXED 46
          "Massy TGV" Regular 16/22 color=text/primary | w:FILL
        arrivee | HORIZONTAL gap:10
          "12:10" ExtraBold 16/22 | w:FIXED 46
          "Marseille Saint-Charles" Regular 16/22 | w:FILL
      prix | VERTICAL gap:2 align:MIN/MAX | w:FIXED 84
        "dès" Regular 14/19 color=text/secondary
        "84 €" ExtraBold 19/26 color=text/primary
    duree | HORIZONTAL pad:6/8/6/12 gap:8 align:MIN/CENTER | w:FILL | radius=radius/strip | fill=surface/accent-soft
      icon/clock 18x18 (fill=text/secondary)
      "4h42" Regular 14/19 color=text/secondary
      "1 correspondance" Regular 14/19 color=text/secondary | w:FILL
      icon/chevron-right 20x20 (fill=accent/primary)
  perturbation | INSTANCE of journey/disruption-strip, Breakpoint=Mobile | w:FILL
  perturbation 2 | same | HIDDEN
  alteration | HORIZONTAL pad:8/14/8/14 align:SPACE_BETWEEN/MIN | w:FILL | fill=surface/strip-alt
    "4 h 42 au lieu de 3 h 52" Regular 13/18 color=disruption/planned-strong
    icon/chevron-right 14x14
  alternative | HORIZONTAL pad:8/14/8/14 gap:10 align:MIN/CENTER | w:FILL | fill=surface/card | stroke top only
    "Sans car à 09:13, 41 € de plus" Regular 14/19 color=text/primary | w:FILL
    "Choisir" ExtraBold 14/19 color=accent/primary
```

Note the mobile card has **no** `Détail du trajet` button and **no** second price
column. The duration pill is the tap target, and only the 2nd class price shows.

---

## journey/disruption-strip  (node 209:234)

6 variants: `Breakpoint` (Desktop | Mobile) x `Severity` (Planned | Critical | Unknown)

```
Desktop | HORIZONTAL pad:12/20/12/20 gap:10 align:MIN/CENTER | w:FILL
  icon 20x20 | label Bold 14/19 w:FILL | icon/chevron-right 16x16
Mobile  | HORIZONTAL pad:10/14/10/14 gap:10 align:MIN/CENTER | w:FILL
  icon 18x18 | label Bold 13/18 w:FILL | icon/chevron-right 14x14
```

| Severity | fill | fg (icon + label + chevron) | icon |
|---|---|---|---|
| Planned | `surface/strip-planned` | `text/on-planned` | `icon/bus` |
| Critical | `surface/strip-critical` | `text/on-critical` | `icon/severity-critique` |
| Unknown | `surface/strip-unknown` | `disruption/unknown` | `icon/severity-indisponible` |

Note: inside the result card the planned strip's foreground is
`disruption/planned-strong`, the deeper orange scraped from the live site.

---

## date/day-card  (node 209:212)

4 variants: `State` (Default | Selected) x `Severity` (Normal | Travaux)

```
VERTICAL pad:12/8/12/8 gap:2 align:MIN/CENTER | radius=radius/card
  fill=surface/card | stroke=border/default:1        (Selected: both = accent/primary)
  "Mer 16" SemiBold 14/19 color=text/secondary        (Selected: text/on-accent)
  "19 €"   ExtraBold 19/26 color=text/primary          (Selected: text/on-accent)
  statut | HORIZONTAL pad-top:6 gap:5 align:MIN/CENTER
    dot 8x8 circle   fill = color/neutral/400 | disruption/planned | text/on-accent when selected
    "Normal" / "Travaux" Bold 12/16 color = text/secondary | text/on-planned | text/on-accent
```

In the date strip the cards sit in a HORIZONTAL row, gap 10, each `w:FILL`.
Desktop shows 7 days, mobile shows 4.
