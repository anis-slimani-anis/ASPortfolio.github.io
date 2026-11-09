# Portfolio – CLAUDE.md

## Project overview
Personal portfolio website for Anis Slimani — full-stack product designer based in Paris.
Static site: HTML + CSS + JavaScript, no build tool or framework.

## Structure
```
index.html              # Main single-page site (hero, work, about, services, contact)
work/
  legalstart.html       # Case study: SaaS rebranding at Legalstart
  lafoy.html            # Case study: CRO / acquisition funnels
  ai-workflows.html     # Case study: Design system & AI-assisted workflows
assets/
  css/style.css         # All styles
  js/main.js            # Starfield canvas, scroll reveals, contact form (Formspree)
  images/               # portrait.jpg, about.jpg
```

## Owner
- **Name:** Anis Slimani
- **Email:** anisslimani013@gmail.com
- **LinkedIn:** linkedin.com/in/anisslimani
- **Location:** Paris, open to remote

## Key details
- Fonts: Syne (headings) + DM Sans (body) via Google Fonts
- Contact form uses Formspree — endpoint configured in `assets/js/main.js`
- No framework, no package manager, no build step — plain files only
- Three case studies linked from the work section

## Recent handoff
- See `CLAUDE-HANDOFF.md` for the April 2, 2026 QA and styling handoff.
- That file summarizes recent theme, header, mobile nav, CTA, fallback, and cleanup work plus current follow-up notes.

## Mobile work rules (always follow when working on the mobile version)
- **Never commit to `main`.** Do all mobile work on a dedicated branch, then open a pull request.
- **Never merge the PR yourself.** Wait for Anis to review and explicitly approve before anything is merged.
- **Do not break the existing website.** Desktop is the reference and must stay visually and functionally unchanged:
  - Scope mobile changes inside mobile media queries (e.g. `@media (max-width: 860px)` / `600px`, the breakpoints already used in `assets/css/style.css`) rather than editing base/desktop rules.
  - Prefer additive CSS; don't rename or remove existing classes, IDs, or JS hooks used by `assets/js/main.js`.
  - Keep both light and dark themes, EN/FR states, the mobile menu (scroll lock, overlay, Escape close), and reduced-motion behavior working.
- **Check before opening the PR:** compare desktop (~1440px) and mobile (~390px) on the homepage and the work pages, and note in the PR what was checked.
