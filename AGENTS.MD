# AGSTN Portfolio: Agent Instructions

Read this whole file first. It is the source of truth. If a request conflicts with it, stop and ask.

## Project

Personal developer portfolio for **AGSTN**, a BSIT student and independent developer in the Philippines.
Stack: Vite + React (JSX), Tailwind CSS v4 (`@tailwindcss/vite`), Three.js + `@react-three/fiber`, GSAP + ScrollTrigger, `lucide-react`.
Check: `npm run build`.

## How to work (most important)

1. **Do the simplest thing that meets the task.** No extra abstractions, helpers, config layers or libraries "for later."
2. **Stay on the task.** Edit only the files the user names. If another file needs a change, say so and wait.
3. **No refactors, renames, restyling or unrequested "improvements."** If you spot something unrelated, mention it at the end; don't fix it.
4. **No new dependencies** without explicit approval.
5. **Reuse existing components, hooks and data** instead of duplicating logic.
6. **Ask before major design or architecture decisions** that aren't written here.
7. **Preview first:** for new visuals, build a standalone HTML preview and wait for approval before touching the React app.
8. **If the user pastes finished files, apply them exactly.** Don't reinterpret or "fix" them.
9. **Don't move on to the next task or phase on your own.** Finish, report using the checklist at the bottom, and wait.

## Design rules

- Direction: cinematic editorial, minimal and clean. One focal point per section, generous space, open layouts with hairlines. No card grids, heavy shadows or glassmorphism.
- **No terminal or code-editor visuals:** no window-dot headers, `~/PATH` titles, `//` or `>` labels, shell prompts, block cursors, or HUD text.
- Fonts: **Changa One** for the wordmark, **Inter** for content, **JetBrains Mono** only for tiny metadata labels.
- Colors are CSS variables in `src/index.css` (`--ink`, `--primary-text`, `--secondary-text`, `--muted-text`, `--primary-accent` cyan, `--secondary-accent` blue, `--hairline`). Don't hard-code colors. Cyan and blue act as light sources, not large blocks.
- Light and dark themes must both work. Don't just invert dark for light. Dark mode is **class-based**: the app toggles `.dark` on its root element, and `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css` wires Tailwind's `dark:` utilities to that class (not the OS preference).

## Content rules

- Never invent biography, employers, metrics, dates, project URLs or links.
- Placeholder contact links (and the LinkedIn link and project URLs) stay placeholders until the user supplies real ones. Never present them as final.
- Timeline entries must be real. DOCKET is the only real project for now.
- Placeholder projects are allowed only when marked `placeholder: true`. They are dev-only samples with obviously fake content, carry no 3D object, and must never ship.
- Pre-publish check: confirm no placeholder content appears in `npm run build` + `npm run preview`.

## Quality bar

- Responsive from narrow phone to desktop. Semantic HTML, accessible names, keyboard access, visible focus, readable contrast.
- Respect `prefers-reduced-motion`; nothing important may depend on animation alone.
- The custom cursor is desktop-only. Never hide the pointer on touch devices.
- Keep 3D light: pause offscreen, cap pixel ratio, lazy-load, and keep a fallback if the model or WebGL fails. Small models, simpler or static on phones.

## Current structure (do not undo)

Page order: `SiteNavigation` → `ExperienceJourney` (hero → About → experience timeline, scroll-driven) → Projects → Stack → `SiteFooter` (Contact + footer).

- `App.jsx`: composes the page, theme toggle (circle-reveal view transition), lazy-loads the 3D background.
- `Wordmark.jsx`: `AG$TN`, no brackets. Letters reveal one by one, replay once, then stay visible. Static with reduced motion.
- `RoleSwap.jsx`: the "Developer + swapping word" line (GSAP).
- `CustomCursor.jsx`: 20px ring moved with `transform` in one animation-frame loop; shrinks to a dot over links and buttons. No `left`/`top` transitions or per-move React state.
- `BiometricPortrait.jsx` + `PortraitModel.jsx` + `portraitStates.js`: loads `public/models/portrait_animation_v2.glb`; looping blink; eased head-follow only while the pointer is over the hero. `portraitStates.js` holds the per-step pose, light and framing for the About and Experience steps.
- `DriftBackground.jsx` + `DocketObject.jsx`: ambient 3D shapes and the Docket object share one Canvas. The background reads scroll progress as a depth-travel/parallax layer (camera fixed).
- `useScrollReveals.js`: GSAP reveals driven by `data-*` attributes (`data-reveal`, `data-line`, `data-vl`, `data-mask`, `data-fade`). Use it for new reveals instead of writing new scroll code.
- `ExperienceJourney.jsx`: the hero → About → timeline progress logic. Reuse it for anything scroll-linked.
- Content lives in `src/data/portfolioData.js` and `ExperienceTimeline.jsx`, not inside presentation components.
- `previews/` holds the approved standalone HTML previews (kept for reference, not part of the build). `archive/` is historical — never import from it.

## Planned work (don't start unless the user asks for that item)

1. Portrait states: different pose, look and framing in the About vs Experience steps, procedural (no new GLB clips). - ` DONE `
2. Real contact links and real timeline entries.
3. Slim the portrait `.glb` (offline `gltf-transform`).
4. Lighthouse, keyboard, reduced-motion and phone checks.
5. Publish prep (title, description, favicon, share image, hosting).


## Before you finish any task

1. List exactly which files you changed and confirm you touched no others.
2. Run `npm run build` and report the real result. Don't claim it works if you didn't run it.
3. Give a **summary**: what was added or changed, in plain language, 3 to 5 lines.
4. Give **test instructions** so the user can check it themselves:
   - Where to look (section or page) and what to do (scroll, hover, click, resize, toggle the theme).
   - What they should see if it works.
   - Anything to check specifically: reduced motion, phone width, light and dark themes.
5. Give **feedback**: anything you're unsure about, tradeoffs you made, known limits, or unrelated issues you noticed but did not touch.
6. Stop and wait for the next instruction.