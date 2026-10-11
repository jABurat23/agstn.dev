# AGSTN Portfolio

Personal developer portfolio for **AGSTN** — BSIT student and independent developer in the Philippines.

## Stack

- **Vite + React 19** (JavaScript/JSX)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Three.js + @react-three/fiber** for 3D (portrait, ambient background, project object)
- **GSAP + ScrollTrigger** for scroll-driven reveals
- **Lucide React** for icons

## Features

- **Experience Journey** — scroll-driven hero that transitions into an About section, then a timeline. Portrait slides left, opacity/focus shifts hand over between panels.
- **Biometric Portrait** — interactive 3D model (GLB) that blinks and follows the cursor while the pointer is over the hero; keeps last direction on leave.
- **Drift Background** — ambient Three.js scene with floating geometric shapes; color mood shifts with scroll; includes a pinned 3D **DocketObject** that appears alongside its project row.
- **Projects & Stack** — editorial project rows (linkified when real URLs exist), grouped technology stack.
- **Custom Cursor** — desktop-only, transform-only RAF loop, shrinks to a filled dot over interactive elements.
- **Wordmark** — `AG$TN` reveals letter-by-letter twice with a random replay delay, then stays visible.
- **RoleSwap** — GSAP-powered word cycle: `Developer + Builder / Explorer / Tinkerer`.
- **Theme Toggle** — View Transition API circle reveal from click position; respects `prefers-reduced-motion`.
- **Accessibility** — semantic HTML, ARIA labels, `inert`/`aria-hidden` during scroll transitions, visible focus styles, keyboard navigation.
- **Reduced Motion** — every animation respects `prefers-reduced-motion: reduce` (static fallbacks, no motion-dependent content).
- **Responsive** — mobile-first, breakpoints at 760px and 1023px; custom cursor only on `hover: hover` + `pointer: fine` + `min-width: 768px`.

## Project Structure

```
src/
├── App.jsx                 # Page composition, theme toggle, background lazy-load
├── index.css               # Design tokens, journey/timeline styles, responsive, reduced-motion
├── main.jsx                # Entry point
├── components/
│   ├── BiometricPortrait.jsx
│   ├── CustomCursor.jsx
│   ├── DriftBackground.jsx
│   ├── DocketObject.jsx
│   ├── ExperienceJourney.jsx
│   ├── ExperienceTimeline.jsx
│   ├── PortfolioSections.jsx
│   ├── ProjectCard.jsx
│   ├── ProjectsSection.jsx
│   ├── RoleSwap.jsx
│   ├── SectionHeading.jsx
│   ├── SiteFooter.jsx
│   ├── SiteNavigation.jsx
│   ├── SocialLink.jsx
│   ├── StackSection.jsx
│   ├── Wordmark.jsx
│   └── PortraitModel.jsx
├── data/
│   └── portfolioData.js    # Projects, stack groups, social links, credits
└── hooks/
    └── useScrollReveals.js # GSAP ScrollTrigger wrapper (data-* declarative reveals)
```

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Content

All copy lives in `src/data/portfolioData.js` and `src/components/ExperienceTimeline.jsx` — edit there, not in presentation components.

- **Projects**: add objects to `projects` array; include `href` to make a row a link.
- **Stack**: edit `stackGroups` (title + items).
- **Social**: edit `socialLinks` (label + href).
- **Timeline**: add milestone objects to `milestones` in `ExperienceTimeline.jsx`.
- **Credits**: edit `inspiredBy` in `portfolioData.js`.

## Design Tokens (CSS Custom Properties)

Defined in `src/index.css` under `:root` (light) and `.dark`:

| Token | Purpose |
|-------|---------|
| `--ink` | Page background |
| `--primary-text` | Headings, high-contrast text |
| `--secondary-text` | Body copy |
| `--muted-text` | Metadata, labels |
| `--primary-accent` | Cyan (glow, hover, focus) |
| `--secondary-accent` | Blue (secondary glow) |
| `--hairline` | Dividers, borders |
| `--portrait-halo` | Portrait radial glow |

## Deployment

Build output lands in `dist/`. Deploy to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

```bash
npm run build
# deploy dist/
```

## License

MIT — use freely for your own portfolio.