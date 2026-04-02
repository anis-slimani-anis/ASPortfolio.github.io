# Claude Code Handoff

Updated: April 2, 2026

## Purpose
This document captures the recent styling, QA, fallback, and cleanup work completed on the portfolio so future Claude Code sessions can understand what changed, why it changed, and what still needs visual judgment.

## Scope of recent work
- Shared header behavior and appearance were normalized across:
  - homepage
  - all 3 work pages
  - light and dark themes
  - desktop and mobile
  - English and French states
- CTA polish was iterated across desktop nav, mobile nav, and page-level return CTAs.
- Light-mode accent colors were shifted away from the older eggplant purple toward a cooler indigo/periwinkle family.
- Numeric typography was moved off Syne to avoid warped figures.
- Mobile navigation behavior was hardened so the menu fully owns the viewport when open.
- JS fallbacks and reduced-motion handling were improved site-wide.
- Several inline styles and page-local style blocks were centralized into shared CSS.

## Main changes by area

## 1. Theme, color, and shared tokens
- Added shared theme variables in `assets/css/style.css` for:
  - `--accent-rgb`
  - header background/border/shadow/link/control tokens
  - numeric font token
- Light mode accent was updated to a cooler indigo that better matches the periwinkle accent system.
- Light-mode numeric values were changed away from accent-colored emphasis to calmer dark text tones.
- Favicon was updated to match the new accent family.

## 2. Header and navigation consistency
- Headers were made fully opaque across all variants after earlier translucent/blur experiments.
- Shared header tokens now drive:
  - homepage header
  - work-page header
  - mobile menu controls
- "Back to work" was shortened to "Back" / "Retour" everywhere on project pages.
- Hamburger CTA styling was unified so typography, spacing, icon sizing, and hover behavior match more closely.

## 3. Mobile menu behavior
- Opening the mobile menu now locks body scroll and preserves the scroll position.
- The mobile overlay is solid instead of letting page content show through.
- Added close behavior for:
  - overlay click
  - Escape key
- Added `inert` handling where supported for better interaction isolation.

## 4. CTA and hero styling
- CTA glow effects were reduced to feel cleaner and less dramatic.
- Light-mode primary CTAs use the black "night sky" fill with stars.
- The hero title filled line in light mode was iterated several times to better echo the CTA star treatment.
- Current state:
  - the hero title uses a CTA-inspired star fill in the filled words only
  - the outlined `em` line remains separate
  - this area is still the most subjective visual tuning zone in the project

## 5. Typography
- Number-heavy UI elements now use `DM Sans` with tabular/lining numeric features instead of `Syne`.
- This applies to stats, metrics, outcomes, score tables, and decision numbers.

## 6. JavaScript quality, fallbacks, and motion
- Added a shared reduced-motion helper in `assets/js/main.js`.
- Starfield now:
  - stops running for reduced-motion users
  - uses dynamic density instead of a flat heavy count
  - caps device pixel ratio to reduce canvas cost
- Reveal logic now degrades gracefully when `IntersectionObserver` is unavailable.
- Active nav and case-nav logic now safely no-op without `IntersectionObserver`.
- Page transitions now avoid intercepting:
  - modified clicks
  - same-page navigation
  - reduced-motion sessions
  - `tel:` links
  - download links
- Theme changes skip fancy animation when reduced motion is enabled.

## 7. Contact form cleanup
- Contact form button state handling was cleaned up so it no longer overwrites the entire button node.
- The state label now updates through a dedicated label path, which plays better with EN/FR content.
- Added `aria-busy` handling for submission states.
- Success and error messages now use shared CSS classes instead of inline styles.

## 8. Work-page cleanup
- Added lazy loading and async decoding to case-study images.
- Removed repeated inline spacing styles from work pages and replaced them with shared classes.
- Standardized footer copyright text across work pages.
- Moved the large page-local `<style>` block from `work/ai-workflows.html` into shared `style.css`.

## QA improvements completed
- Reduced duplication in CSS by centralizing repeated page styles.
- Reduced brittle inline styling in HTML.
- Improved accessibility and UX around motion preferences.
- Improved mobile navigation ownership and scroll behavior.
- Improved resilience when browser APIs are missing.
- Reduced unnecessary JS work for reduced-motion users.
- Improved consistency of header, CTA, and footer behavior across pages.

## Files changed during this round
- `assets/css/style.css`
- `assets/js/main.js`
- `index.html`
- `work/legalstart.html`
- `work/lafoy.html`
- `work/ai-workflows.html`
- `assets/images/favicon.svg`

## Known residuals / recommended next checks
- The light-mode hero title star fill has been iterated several times and may still need visual tuning by eye.
- No full live browser matrix was run inside this terminal session.
- Recommended manual pass:
  - homepage in light/dark
  - all 3 work pages in light/dark
  - desktop header
  - mobile menu
  - EN/FR language toggle
  - hero title star fill in light mode

## Guidance for future Claude Code sessions
- Prefer changing shared tokens and shared selectors before introducing page-specific overrides.
- Keep homepage nav, work-page header, and mobile nav styles aligned.
- Preserve reduced-motion behavior when adding new animations.
- Avoid moving numerics back to `Syne`.
- If touching the hero title star fill again, compare directly against the light-mode primary CTA so the visual language stays coherent.
