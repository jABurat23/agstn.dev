# Master Prompt: AGSTN Interactive Developer Portfolio

You are helping me design and build my personal developer portfolio. Treat this document as the project brief and keep it as the source of truth as the portfolio evolves.

## How to work with me

- Work **preview-first and one step at a time**. Do not implement the entire portfolio or roadmap in one pass.
- At the start of a new task, inspect the current code and identify the smallest useful next step.
- Before changing the React app for a design or interaction step, create a standalone, openable HTML preview for that step. Let me review the visual direction and interaction concept in the browser first.
- Keep the preview self-contained in a clearly named HTML file (for example, `preview.html`) with its own CSS and only the JavaScript needed to demonstrate that specific step. Do not make the preview a replacement for the real app or add preview-only dependencies.
- Do not implement the preview in the production React app until I approve it. If I request changes, revise the HTML preview and show it again.
- After I approve a preview, port only that approved step into the existing app, preserve unrelated work, and verify it with the smallest relevant check. Do not automatically move to the next step.
- If I ask to plan, discuss options and tradeoffs only; do not create a preview or edit code until I approve that next action.
- Ask before making major design or architecture decisions not covered here.
- Keep explanations and code changes focused. Prefer reusable components and clear data/configuration over duplicated markup.

## Project

Create a distinctive, polished, responsive portfolio for **AGSTN**, a BSIT student and independent developer in the Philippines. The portfolio should communicate a focus on building lightweight digital systems, interfaces, and tools with an emphasis on performance, simplicity, and control.

It should feel personal, considered, and interactive—not like a generic developer portfolio template. Interactions should support the story and content rather than exist only as decoration.

## Visual direction

- Use a **cinematic editorial / digital-art** direction: bold typography, strong composition, tactile depth, and restrained technology-inspired detail. It should feel like an authored portfolio experience, not a dashboard, SaaS landing page, or generic developer template.
- Use the Blender-made biometric portrait as a potential visual anchor when I provide the current model. It is a work in progress; inspect the supplied asset before deciding how to integrate it. Do not invent a model path or assume the asset is complete.
- The current AGSTN wordmark/reveal is a key identity element. Keep the full `[AGSTN]` reveal visible after it completes; any continuing effect should be subtle and intentional.
- Give the wordmark and portrait a clear relationship in the hero, with enough breathing room for both. Do not shrink the identity just to fit decorative elements.
- Use an intentional visual system across the whole page: consistent color roles, type scale, spacing, grid, borders, radii, image treatment, and interaction states. Carry those choices through the navigation, hero, projects, experience, contact, and footer.
- Create a clear hierarchy, strong typography, generous negative space, deliberate color, and responsive layouts. Prefer a small number of memorable, well-composed sections over a large collection of cards.
- Avoid terminal/command-line visual tropes entirely: no faux terminal windows, shell prompts, command output, code-editor chrome, or terminal-inspired section headers. Do not carry forward that visual language from the existing implementation.
- Avoid generic template patterns and unnecessary visual effects. Propose a cohesive direction before a major redesign.
- Treat the palette below as the default design direction. A preview may refine it, but do not introduce unrelated accent colors or switch palettes without my approval.

## Color system

Use a dark-first, cool, cinematic palette inspired by deep space, illuminated glass, and a cyan holographic portrait. Keep the bright colors focused on identity details, the portrait, and meaningful interaction feedback.

| Role | Default color | Usage |
| --- | --- | --- |
| Ink / page background | `#070B12` | Main canvas; use near-black rather than pure black |
| Deep surface | `#0D1420` | Recessed areas and subtle section separation |
| Raised surface | `#121D2B` | Project or content surfaces when a surface is needed |
| Primary text | `#ECF4FA` | Headings and high-priority copy |
| Secondary text | `#A5B4C4` | Body copy and supporting information |
| Muted text | `#718398` | Metadata only; keep readable against its background |
| Primary accent | `#62E6F2` | Wordmark highlight, portrait glow, active state, and focus indicator |
| Secondary accent | `#5B8CFF` | Restrained depth, gradients, and selected interactive details |
| Hairline / border | `rgba(165, 180, 196, 0.16)` | Fine separators and outlines |

- Use cyan and blue as light sources, not as large blocks of saturated UI color. Avoid glowing every element.
- Keep gradients localized and atmospheric: a soft cyan-to-blue portrait halo is appropriate; full-page neon gradients are not.
- Preserve readable contrast for small text, borders, and focus indicators. Never use muted text as the only cue for important information.
- A light theme is optional, not a requirement. If explored, use a deliberate cool-paper palette (for example: canvas `#F3F6F8`, surface `#FFFFFF`, primary text `#101A27`, secondary text `#526274`) and verify the same semantic color roles and contrast. Do not just invert the dark theme.
- Define the final selected colors as reusable CSS custom properties in the implementation. HTML previews should use the same tokens so preview approval transfers consistently.

## Design language

- **Typography:** Pair a confident display face for `[AGSTN]` and major headlines with a highly legible sans-serif for content. Use a mono face only sparingly for compact metadata or technical labels, never to create a faux terminal. Keep heading sizes fluid and line lengths comfortable.
- **Composition:** Use an editorial grid with asymmetric balance, large quiet areas, and one clear focal point per section. The desktop hero should place the name and Blender portrait together; on narrow screens, stack them in a deliberate reading order without clipping the wordmark.
- **Surfaces:** Favor open layout, image-led composition, and subtle hairlines. Use cards only where they clarify project content. Avoid repeated rounded-card grids, excessive borders, heavy drop shadows, and generic glassmorphism.
- **Portrait treatment:** Treat the Blender portrait as authored artwork. Preserve its form and material character; use a restrained cyan/blue rim light, atmospheric halo, and optional technical overlays that frame rather than obscure it. Inspect the asset before selecting framing, background, lighting, or animation.
- **Motion:** Make motion purposeful, smooth, and low amplitude. Persistent wordmark treatment should be quiet after its reveal. Keep hover/focus transitions quick and legible; avoid constant high-frequency flicker, camera shake, gratuitous parallax, or motion that interferes with reading.
- **Interaction states:** Provide coherent default, hover, active, focus-visible, and disabled states. Prefer clear visual feedback over cursor tricks. Any pointer-responsive portrait effect must have a touch-friendly equivalent or remain purely decorative.
- **Iconography:** Use a consistent, minimal icon style only when it helps identify an action or destination. Do not use icons as filler.
- **Imagery and texture:** Use texture, scanlines, grain, or HUD marks only as subtle supporting details and only when they suit the approved preview. Keep text and the portrait legible; do not let overlays dominate the page.

## Content currently in the codebase

Use these details as the current draft, not verified biography. Preserve them unless I ask to change them, and do not invent credentials, employers, project URLs, metrics, or personal facts.

- **Name / wordmark:** AGSTN
- **Profile:** BSIT student and developer; Philippines; currently building; focus on software and web
- **About:** Builds lightweight digital systems, interfaces, and tools with emphasis on performance, simplicity, and control.
- **Experience:** Independent Developer, 2024–present. Builds experimental applications, device tooling, web interfaces, and local-first utilities while studying information technology.
- **Projects:**
  - **ANCHOR** — Device management and telemetry platform. Stack: React, Fastify, WebSocket.
  - **DEVLENS** — GitHub-inspired developer activity intelligence. Stack: Next.js, Tailwind, MySQL.
  - **UDB_LINK** — Local-first USB reverse tethering utility. Stack: Rust, USB, Network.
- **Technologies:** JavaScript, React, Next.js, Node.js, Tailwind, Rust, Git, Linux.
- **Contact/social links:** Email, LinkedIn, GitHub. Existing destinations are placeholders (`hello@example.com` and `#`); do not present them as production-ready. Ask me for the real destinations before publishing or wiring these links.

## Interaction goals

Build interactions incrementally and make them work well on touch and keyboard as well as pointer devices. Potential directions to explore include:

- A 3D portrait rendered with Three.js / React Three Fiber, with restrained pointer-responsive motion.
- A persistent wordmark reveal and subtle ambient motion.
- Carefully chosen scroll, hover, and navigation behavior that helps visitors understand and explore the work.
- A graceful static fallback when WebGL is unavailable, and reduced-motion behavior for visitors who request it.

These are directions, not permission to add every effect at once. Agree on the next interaction before implementing it.

## Existing technical foundation

- Vite + React, using JavaScript and JSX.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Three.js and `@react-three/fiber` are installed for 3D work.
- `lucide-react` is available for interface icons.
- The app entry is `src/main.jsx`, which renders `src/App.jsx`.
- Reusable UI currently lives under `src/components/`; portfolio content currently lives in `src/data/portfolioData.js`.
- The portrait is currently a procedural Three.js bust in `src/components/PortraitModel.jsx`, loaded by `src/components/BiometricPortrait.jsx`. Replace or adapt it only after inspecting the Blender asset I supply.
- `src/components/TerminalHeader.jsx` and terminal-styled areas are legacy visuals. Do not reuse them in a redesign; remove or replace them only as part of an approved preview implementation.
- `npm run build` is the production build check.

Follow existing project conventions where they remain suitable. Keep expensive 3D assets and code from blocking the initial page, avoid unnecessary dependencies, and keep mobile performance in mind. If a change affects dependencies, update the lockfile through the package manager.

## Quality bar

- The page must be responsive and usable at narrow mobile, tablet, and desktop sizes.
- Maintain semantic HTML, accessible names, keyboard access, visible focus states, and sufficient contrast.
- Respect `prefers-reduced-motion`; do not rely on animation alone to communicate information.
- Do not hide the pointer globally on touch devices or make pointer-only controls essential.
- Keep 3D animation efficient: pause or reduce work when offscreen, cap rendering cost appropriately, and provide a useful fallback.
- Avoid broken, placeholder, or misleading links in a published experience.
- Keep content editable without searching through large presentation components.
- Do not add unrelated features, dependencies, assets, or documentation.

## Preview-first workflow

For each design milestone:

1. State the specific screen, section, or interaction being explored.
2. Create or update a standalone HTML preview for only that scope; do not change the production app yet.
3. Make the preview easy to open locally and include responsive behavior for the relevant screen sizes. Use placeholder media only when the real asset is unavailable, and label it clearly.
4. Present the preview for my review. Revise the preview based on my feedback until I approve it.
5. After approval, implement only that approved scope in the existing React app, then verify it. Keep the preview available unless I ask to remove it.

Never treat a preview as approval to build the full portfolio. Never bundle several unreviewed milestones into one preview or implementation.

## Suggested milestones

Work on only the milestone I explicitly choose or approve:

1. **Visual direction:** agree on the page concept, composition, palette, typography, and how the Blender portrait should fit.
2. **Portrait asset integration:** inspect the supplied Blender file, determine/export an appropriate web format, and render it in the existing portrait area with a fallback.
3. **Hero composition:** place the persistent `[AGSTN]` identity and portrait together in a responsive hero.
4. **Interaction pass:** add one agreed interaction at a time and test keyboard, touch, reduced-motion, and performance behavior.
5. **Content and polish:** verify real profile/social details, refine remaining sections, and prepare the production experience.

At each milestone, summarize what changed and what is still pending. Do not continue automatically to the next milestone.
