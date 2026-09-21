# Dalma, "Le malus": how it was built

A record of what this page is and how it is put together.

Live at `anisslimani.com/dalma-malus/`. One file: `index.html`, 930 lines,
HTML, CSS and JS all inline. No build step, no dependencies.

---

## 1. What it is

A private product reflection written for the Dalma recruitment process
(contact: Valentine Basser). Not a portfolio piece. It carries
`<meta name="robots" content="noindex, nofollow">` and is shared by link only.

It takes one problem, the malus on pet insurance renewal, and offers three ways
of approaching it. It is a piece of thinking, not a spec.

---

## 2. Why it is a single file

No framework, no build, no package.json. The whole page is one HTML document
with two `<style>` blocks and one `<script>` at the end.

That was right for the job. The deliverable had to survive being opened by
someone who was not expecting it, on any device, with no explanation. A single
file that renders instantly and cannot half-load is the most reliable form that
takes. It also drops into the existing GitHub Pages site as a folder with no
pipeline, exactly like the rest of the portfolio.

---

## 3. Type

Two self-hosted families, loaded with `@font-face` from `/assets/fonts/`:

| Family | Use | Weights |
|---|---|---|
| Buenos Aires | display, headings | 600, 700, 800 |
| Scto Grotesk A | body | 400 only |

Self-hosted rather than from a CDN so the page has no third-party request, and
`font-display: swap` so text is readable before the files land.

Body line-height is 1.7, which is loose for a product page and deliberate: the
page is read, not scanned.

---

## 4. Tokens

Declared once on `:root`. Single light theme, no dark mode.

```css
--v:      #5067F7   /* Dalma violet, the primary */
--v-deep: #2B2E6B   /* deep violet, headings on light */
--v-soft: #eceefe   /* soft violet, section and phone backgrounds */
--v-mid:  #b9c5fc
--ink:    #1C1B2E   /* body text, near-black with violet in it */
--coral:  #FF8A6B   /* accent */
--mint:   #4FCBA4   /* accent */
--stone:  #EBEBF4   /* neutral surface */
--bg:     #ffffff
--r:      18px      /* the one radius */
```

The palette is Dalma's, not invented. Using their violet was the point: the
page had to read as though it belonged to the company it was addressed to.

### The one rule worth keeping

**No borders on cards.** Separation comes from gradient backgrounds
(`linear-gradient(140deg, #F2F0FF, #eceefe)`) or from shadow, never from a
1px line. The stat chips follow the same rule: gradient fill, no border.

It is the decision that gives the page its softness. A border would have made
it look like a dashboard.

### Eyebrow system

Every section opens with one: 10.5px, weight 600, 0.16em tracking, uppercase,
`var(--v)` at 70% opacity. It is the only repeating structural device, and it
carries the whole rhythm of the page.

---

## 5. Structure

```
Disclaimer bar
Hero              two rows: title + SVG on top, humility card below
Le problème
L'insight
Pourquoi ça compte
Piste 01          Repenser le moment du renouvellement   (interactive prototype)
Piste 02          Annoncer la trajectoire dès la souscription   (curve SVG)
Piste 03          Un bonus pour équilibrer le malus
Footer
```

The disclaimer bar comes before the hero rather than after. That ordering is
the argument of the whole page: the caveats are read before the ideas, not
discovered underneath them.

---

## 6. The interactive bit

Piste 01 holds a working phone prototype, not a picture of one. Frame is
`max-width: 300px`, centred, on `var(--v-soft)`.

Three toggles, each a coverage lever with a monthly saving attached. Flipping
one recalculates a live price, updates the lever's own label between "Inclus"
and "Retiré", fades in a "− N €/mois" line, and rewrites the CTA to carry the
new total.

About 25 lines of JavaScript driving it, with the levers as a small array so
adding a fourth is one line:

```js
const levers = [
  { t: 't1', v: 'v1', s: 's1', save: …, on: 'Inclus', off: 'Retiré' },
  …
];
```

It is there because the idea in Piste 01 is that a renewal should be a
negotiation rather than a notification, and you cannot argue that in prose as
well as you can by letting someone move the sliders.

---

## 7. Motion

One `IntersectionObserver` at threshold 0.06 adds `.in` to any `.reveal`
element as it enters the viewport, then unobserves it. Sections fade up once
and never again.

`overscroll-behavior: none` on `html` kills the rubber-band bounce, which
matters because the page is long and the bounce makes a single-file page feel
like a document rather than a product.

`scroll-behavior: smooth` for the in-page links.

---

## 8. Responsive

Mobile-first, four `@media` queries, all `min-width`. No breakpoint variables,
because there are only four and each is local to the thing it fixes:

- `640px`: the hero illustration appears, hidden below that
- `600px`: the piste layout goes two-column, and the piste number right-aligns
- `540px`: one layout switch in a later section

Below all of them the page is a single readable column.

---

## 9. Copy

The hardest part of the page and the part that took longest.

- **Tone: warm, personal, humble.** The page says "je suis encore junior" out
  loud. The whole thing is framed as thinking offered, not answers delivered.
- **No assertive product claims.** Not one sentence tells Dalma what to do.
- **Evidence is public and paraphrased.** Sourced from public Trustpilot
  reviews, reworded, never quoted verbatim, and never attributed to a named
  reviewer.
- **Every number is marked.** "60 000 assurés", "1 200 contrats" and the rest
  all carry "illustratif, à valider". No figure on the page is presented as
  something known.

That restraint is the reason the page works. It is an interview deliverable
from someone outside the company, and the fastest way to lose the room would
have been to arrive with confident numbers about their own business.

---

## 10. If you come back to it

- It is one file. Edit `index.html`, commit, push. Nothing to build.
- The fonts live at `/assets/fonts/` and the favicon at
  `/assets/images/dalmafavicon.png`, both outside this folder, shared with the
  main site. Moving the folder breaks those absolute paths.
- Keep `noindex, nofollow` unless you decide to make it public, and if you do,
  re-read section 9 first. The copy is written for a named reader.
