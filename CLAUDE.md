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
