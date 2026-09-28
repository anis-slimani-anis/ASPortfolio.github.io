# SNCF Connect case study: how it was built

A record of what this page is and how it is put together. Written for whoever
picks it up next, including you in three months.

Live at `anisslimani.com/sncf-notes/`. One file: `index.html`, HTML, CSS and
JS all inline. No build step, no dependencies.

---

## 1. What it is

A product case study written for an NTT DATA interview, documenting the
SNCF Connect journey-results redesign shipped at `anisslimani.com/sncf/`.
Not a portfolio piece. It carries `<meta name="robots" content="noindex,
nofollow">` and is shared by link only.

It isn't a spec or a deck. It's the process behind the redesign: where the
idea came from, an unusually long discovery phase for a topic that looked
simple at first glance, the decisions made and the ones deliberately dropped,
where AI actually helped and where it didn't, and the shipped prototype it
became.

---

## 2. Why it is a single file

Same reasoning as `dalma-malus/`: no framework, no build, no package.json.
The deliverable has to survive being opened by someone who wasn't expecting
it, on any device, with no explanation. It also drops into the GitHub Pages
site as a folder with no pipeline, exactly like the rest of the portfolio.

---

## 3. Type and tokens

Nunito Sans via Google Fonts, the same variable-font import the prototype
itself uses. The `:root` tokens are a subset lifted directly from
`sncf-redesign-src/src/styles/tokens.css` (blues, oranges, neutrals, radii),
plus two additions specific to this page:

```css
--best-price: #f1c83c   /* the "Meilleur prix" gold, reused sparingly */
--sky:        #8de8fe   /* the logo's toggle-icon cyan */
```

Reusing the product's real tokens rather than inventing a palette was the
point: the case study argues the design system holds up, so its own chrome
should be built from the same tokens as the thing it's describing.

---

## 4. Structure

```
Disclaimer bar (noindex notice)
Top row              byline + avatar
Hero                 navy card, logo, kicker, scenario chips, CTA
Section nav          desktop only, rail + dot, 1240px breakpoint
01  Where it started      Smartport, the Citymapper spark, Brief to Ship
02  The problem            the persona, the information/moment gap
03  Discovery               why the discovery phase ran long
04  The redesign            live-recreated card/chip/drawer, not screenshots
05  The slides              sky card, the deck's own visual language
06  Deliberately dropped    navy card, three cut ideas and why
07  Accessibility            the thesis, verified not eyeballed
08  What I tested            the 5-participant comparison, 0/5 vs 4/5
09  Where AI helped          honestly reported, tool by tool
10  Shipped, not just Figma  navy card, live lock-screen proof, CTA
Footer
```

Ten numbered sections, a `counter-reset: sect` on `.page` and
`counter-increment: sect` on `.section .eyebrow`, so the numbering is CSS-
driven rather than typed into every heading by hand.

---

## 5. The proof components

The redesign section, and the shipped section's lock-screen, are not
screenshots. They're the actual markup, classes and copy from the shipped
prototype (`sncf-redesign-src/src/styles/app.css` and the component files),
rebuilt inline against this page's own copy of the same tokens. That was a
deliberate choice over screenshots: no image-export pipeline to keep in sync,
and it doubles as proof the author can reproduce the design system by hand,
not just point at it.

---

## 6. Colour, used sparingly on purpose

First pass over-used the gold accent (`--best-price`): every section eyebrow
was a filled pill. Feedback was direct: the real deck uses gold once, as a
single kicker badge on the cover, not as a repeating device. Fixed by:

- Section eyebrows: a plain numeral (`counter()`) + quiet label, no fill.
- One `.kicker` badge, gold pill, used exactly once, in the hero.
- Three sections staged as full cards in the deck's own colours (`.card.navy`,
  `.card.sky`) for rhythm, not gold.

The lesson, if you're adding another repeating badge: reserve a saturated
accent for one moment, not once per section.

---

## 7. Section nav (the sidebar)

Desktop only, `min-width: 1240px`, positioned `fixed` in the page gutter
(`left: calc(50% + 482px)`), hidden entirely below that width rather than
attempting a mobile version — the page reads fine as a single column without
it.

First version was plain floating text links with a background-pill active
state; it read as unstyled. Rebuilt as a rail: a 1px vertical line, a dot per
section (`.toc-link::before`), the current one filled solid and the label
bold. `IntersectionObserver` with `rootMargin: '-45% 0px -45% 0px'` tracks
which section crosses the vertical centre of the viewport.

**The bug worth knowing about:** the first version of that observer only
ever added `.active`, on the assumption a newly-intersecting section would
always replace the old one. Scroll back above the first section entirely
(nothing intersecting) and the last-active link stayed lit forever. Fixed by
toggling per-entry instead of clear-then-set:

```js
tocObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const link = tocLinks.get(e.target.id);
    if (link) link.classList.toggle('active', e.isIntersecting);
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
```

Toggle-per-entry is the correct pattern any time "highlight whichever thing
is currently true" is the goal; clear-then-set-on-match silently breaks the
moment nothing matches.

---

## 8. Images

- `logo-sncf-connect.svg` — the hero lockup. Also, unexpectedly, contains the
  author's own avatar: a circular badge in the logo is filled via an SVG
  pattern with an embedded raster (a personal AI-generated portrait, Google
  C2PA-signed metadata and all). That's why the logo needs a **dark**
  background — the "connect" half of the wordmark is white fill, invisible
  on light surfaces. Confirmed intentional, not a mistake.
- `avatar.png` — a circular crop of that same embedded portrait, used in the
  byline and footer. Extracted from the SVG's base64 payload with Pillow.
- `MiniAnis.svg` — a second, purpose-cropped illustration of the same
  portrait (transparent background, head-and-shoulders), placed beside the
  heading in section 01 only.
- `slide-fare-card.webp`, `slide-night-mode.png`, `slide-night-train.png` —
  reference images for section 05, **not** additional shipped scope. They
  illustrate the presentation-format inspiration (paired before/after cards,
  a day/night toggle), sourced from an SNCF Connect design book, not from
  this project's own Figma file. Framing them as "the redesign extends
  further" would have overclaimed; framing them as aesthetic reference is
  what actually happened.
- Favicon — deliberately **not** a custom mark. Copied directly from
  `sncf-redesign-src/public/` (`favicon-32.png`, `favicon.png`,
  `apple-touch-icon.png`) so the case study and the prototype it describes
  share one visual identity in the browser tab.

---

## 9. Copy conventions

- Case-study prose: English. Anything reproducing the actual product UI
  (the recreated card, chips, drawer, lock screen): French, verbatim from the
  shipped app. Set by the original brief and followed throughout.
- No em dashes anywhere, replaced with commas, colons, periods or
  parentheses. Checked with `grep -n "—"` before calling any pass done.
- Long paragraphs get a short bold "lead" sentence first
  (`.prose p.lead`, ~19px), then the normal-weight explanation. Added in the
  UI pass as the hierarchy device in place of more imagery — there wasn't
  more imagery to add, so the fix was typographic, not visual.

---

## 10. A real bug this page's QA caught in the prototype

Testing the "Suivre ce trajet" flow on a real phone surfaced a layout bug in
`sncf-redesign-src/src/styles/app.css`: `.lock__sheet` used
`var(--space-32)`, a token that doesn't exist in `tokens.css` (the scale
jumps `--space-30` → `--space-40`). One unresolved `var()` inside a shorthand
invalidates the **whole** `padding` declaration, not just that one side — so
the card rendered edge-to-edge, square-cornered, on every real device, while
looking fine in local dev tools that happened to mask it. Fixed by using
`--space-30`, the nearest value actually on the scale. Worth a sanity sweep
(`grep -o` every `var(--x)` against every defined token) any time a shorthand
property looks like it's silently not applying.

---

## 11. URL

Originally `sncf-connect-case-study/`. Renamed to `sncf-notes/` (and the
prototype from `sncf-redesign/` to `sncf/`) because the original slugs were
unwieldy to say or share out loud. Every cross-link between the two pages,
and the build docs in `sncf-redesign-src/`, were updated to match; see that
folder's own `BUILD_RECAP.md` for the prototype side of the rename.

---

## 12. If you come back to it

- It's one file. Edit `index.html`, commit, push. Nothing to build.
- Images live in `sncf-notes/images/`, referenced with relative paths.
- Keep `noindex, nofollow` unless this becomes a public portfolio piece —
  and if it does, the tone (informal admissions like "the topic looked
  simple at first glance") is written for a named interviewer, so re-read it
  first.
- The prototype it links to lives in `sncf-redesign-src/` (source) and
  `sncf/` (deployed build). If you change the prototype's mobile alert
  screen, drawer, or card again, re-check this page's recreated proof
  components still match — they're hand-kept in sync, not generated.
