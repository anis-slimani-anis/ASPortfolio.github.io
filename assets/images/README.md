# Images — What to Add and Where

This file tells you exactly what images to produce,
what specs they need, and where to put them.

---

## assets/images/portrait.jpg
Used in: Hero section (right column)

What it should be:
- You, from roughly chest up, or head + shoulders
- Vertical crop — the slot is roughly 3:2 portrait
- Plain, dark, or blurred background works best
  (the starfield behind it creates atmosphere — you don't need a busy bg)
- Good natural or studio lighting, sharp focus on face
- Expression: confident, natural — not stiff corporate headshot

Technical:
- Minimum 840 × 1040px
- JPEG, quality 85–90
- Keep file under 300KB

Once you have it, open index.html and replace:
  <div class="hero-photo-placeholder">...</div>
with:
  <img class="hero-photo" src="assets/images/portrait.jpg" alt="Anis Slimani">

The CSS already handles the mask fade at the bottom.

---

## assets/images/about.jpg
Used in: About section (left column above bio)

Can be the same photo as portrait.jpg, or a second shot
(slightly more relaxed, different angle works well here).

Specs:
- Minimum 600 × 800px, aspect ratio 3:4
- Same style guidelines as portrait

Once you have it, open index.html and replace the about-photo-wrap placeholder.

---

## assets/images/legalstart-cover.jpg or .png
Used in: work/legalstart.html cover

What it should be:
Best option — a side-by-side before/after of one representative screen
(e.g. the associates page which you showed in your brief — old left, new right).
If you can't show before/after, a clean mockup of the rebranded interface
on a dark background works well.

Anonymise: blur or replace any real user data, real names, real formality numbers.

Technical:
- Minimum 1600 × 800px
- Aspect ratio 16:8
- JPEG 85 quality

---

## assets/images/legalstart-timeline.jpg
Used in: legalstart.html — timeline component section (optional, adds quality)

A side-by-side showing timeline wireframes on left, final component on right.
Export directly from Figma as PNG, then convert.
Minimum 1200 × 600px.

---

## assets/images/legalstart-before-after.jpg
Used in: legalstart.html — flow rebranding section (optional, high impact)

2–3 screens shown before and after, arranged horizontally.
This is the single highest-impact image for the case study.
Shows real product work, shows scale, shows improvement.
Minimum 1600 × 900px.

---

## assets/images/lafoy-cover.jpg
Used in: work/lafoy.html cover

Options:
- A landing page mockup before/after
- A funnel visualisation (could be a clean diagram or screenshot)
- A screenshot of an Amplitude funnel chart (with data anonymised)

Minimum 1600 × 800px.

---

## assets/images/lafoy-before-after.jpg
Used in: lafoy.html — design principles section (optional)

A landing page before/after showing hierarchy improvement.
Even a partial screenshot works — doesn't need to be full page.
Minimum 1200 × 700px.

---

## What NOT to add

- Stock device mockups from mockup generators (looks generic)
- Tool logos (Figma, Notion, etc.) in a grid — adds nothing
- Screenshots of your Figma workspace unless they clearly show something specific
- Abstract 3D renders or decorative visuals unrelated to your work
- Team photos or photos of other people without consent

---

## Format tips

- Use JPEG for photos and interface screenshots (smaller file size)
- Use PNG for diagrams, wireframes, anything with text or sharp edges
- Run all images through https://squoosh.app before adding them — aim for under 200KB each
- Use descriptive alt text for accessibility

---

## Adding images to HTML

For case study images, use the .case-image component:

  <div class="case-image wide">
    <img src="../assets/images/your-image.jpg" alt="Descriptive caption">
    <div class="case-image-caption">Your caption here.</div>
  </div>

Use class="wide" for full-width images that should break out of the prose column.
Remove "wide" for images that sit within the text width.
