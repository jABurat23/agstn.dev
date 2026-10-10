# AGSTN Portfolio: Agent Instructions

Read this whole file before doing anything. It is the source of truth for this project.
If a request conflicts with this file, stop and ask instead of guessing.

## Project

Personal developer portfolio for **AGSTN**, a BSIT student and independent developer in the Philippines.
Stack: Vite + React (JavaScript/JSX), Tailwind CSS v4 (`@tailwindcss/vite`), Three.js + `@react-three/fiber`, `lucide-react`.
Production check: `npm run build`.

## How to work (most important)

1. **Edit only the files the user names.** If another file seems to need a change, say so and wait.
2. **No refactors, renames, restyling, or "improvements" the user did not ask for.**
3. **No new dependencies** unless the user explicitly approves. Update the lockfile through the package manager if one is approved.
4. **Do not move on to the next task.** Finish the one requested change, show the diff, and stop.
5. **Ask before major design or architecture decisions** that are not written here.
6. **Reuse existing components and code** instead of duplicating logic.
7. If the user pastes finished files, **apply them exactly as given.** Do not reinterpret or "fix" them.
8. After a change, run `npm run build` and report the result. Do not claim something works if you did not run it.

## Design rules

- Direction: cinematic editorial, minimal and clean. One focal point per section, generous empty space, open layouts with hairlines. Avoid card grids, heavy shadows and glassmorphism.
- **No terminal or code-editor visuals anywhere:** no window-dot headers, `~/PATH` titles, `//` or `>` labels, shell prompts, blinking block cursors, or HUD text (BIO_SCAN, THERMAL, and similar). `TerminalHeader.jsx` is legacy and is being removed. Do not reuse it.
- Fonts: **Changa One** for the wordmark and logo, **Inter** for all content, **JetBrains Mono** only for tiny metadata labels.
- Colors are CSS custom properties in `src/index.css` (`--ink`, `--primary-text`, `--secondary-text`, `--muted-text`, `--primary-accent` cyan, `--secondary-accent` blue, `--hairline`). Use them; do not hard-code new colors. Cyan and blue are light sources (portrait glow, focus, hover), not large blocks.
- Dark and light themes both must work. Do not invert the dark theme for light.

## Content rules

- Do **not** invent biography, employers, metrics, dates, project URLs, or links.
- Contact links (`hello@example.com` and `#`) are placeholders until the user supplies real ones. Never present them as final.
- Timeline entries must be real. One entry exists today (Independent Developer, 2024 to present).

## Quality bar

- Responsive from narrow phone to desktop. Semantic HTML, accessible names, keyboard access, visible focus, readable contrast.
- Respect `prefers-reduced-motion`. Nothing important may depend on animation alone.
- Never hide the pointer on touch devices. The custom cursor is desktop-only (`md:` and up).
- Keep 3D efficient: pause when offscreen, cap pixel ratio, keep a fallback if the model or WebGL fails.

## Current structure and decisions (do not undo)

Page order: `SiteNavigation` → `ExperienceJourney` (hero + scroll-driven experience timeline) → `PortfolioSections` (Projects, then Stack under it) → `SiteFooter` (Contact + footer together).

- `src/App.jsx` composes the page and handles the theme toggle (circle-reveal view transition).
- `src/components/Wordmark.jsx`: wordmark text is **`AG$TN` with no brackets**. Letters reveal one by one, replay once after 3 to 4.2 seconds (two reveals total), then stay visible. Static with reduced motion.
- `src/components/CustomCursor.jsx`: thin 20px ring, moves with `transform` in one animation-frame loop (no React state per move), shrinks to a small filled dot over links and buttons. Do not reintroduce `left`/`top` transitions or per-move state.
- `src/components/BiometricPortrait.jsx` + `PortraitModel.jsx`: loads `public/models/portrait_animation.glb`. The Blender blink clip plays on a loop; the head follows the cursor with eased motion **only while the pointer is over the hero section** and keeps its last direction when the pointer leaves. Reload returns it to facing forward.
- `src/index.css`: journey, timeline, responsive and reduced-motion styles. The journey stage background is transparent on purpose.
- Content data lives in `src/data/portfolioData.js` and `ExperienceTimeline.jsx`. Keep content editable there, not inside presentation components.

## Planned work (do NOT start unless the user asks for that phase)

1. Remove the terminal look from Projects and Stack, with a preview first.
2. Add real contact links and any real timeline entries.
3. GSAP + ScrollTrigger for the scroll journey (eased scrub, transform-only movement, staggered timeline reveals). Do not add GSAP before this phase is approved.
4. Optimize the `.glb` with `gltf-transform` (offline tool, not shipped to visitors).
5. Lighthouse, keyboard, reduced-motion and phone checks.
6. Publish prep (title, description, favicon, share image, hosting).

## Before you finish any task

- List exactly which files you changed.
- Confirm you did not touch any other file.
- Confirm `npm run build` passes.
- Stop and wait for the next instruction.