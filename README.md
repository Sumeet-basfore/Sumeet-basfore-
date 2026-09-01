# Sumeet Basfore — Personal Portfolio

Personal portfolio for Sumeet Basfore, a software developer building across local AI tools, mobile applications, systems, and hardware experiments.

The site is designed to feel like an engineer’s workspace: projects and evidence lead, while the visual system stays quiet enough to let the work speak.

## What is included

- Server-rendered portfolio content with the Next.js App Router.
- Selected work sourced from the GitHub API when available.
- Curated fallback data so the page remains complete when GitHub is unavailable.
- A lazy-loaded Three.js / React Three Fiber hero artifact representing software-to-device systems.
- Responsive layouts for phones, tablets, and desktop screens.
- Semantic HTML, keyboard navigation, visible focus states, reduced-motion support, and WebGL fallback handling.
- SEO metadata, Open Graph and Twitter metadata, a favicon, `robots.txt`, and a sitemap.
- Security headers and no client-exposed GitHub credentials.

## Featured work

The portfolio currently gives priority to these public repositories:

- [ThermalGuard](https://github.com/Sumeet-basfore/ThermalGuard) — ESP32 thermal and current monitoring prototype with a web dashboard.
- [FrameCoach](https://github.com/Sumeet-basfore/FrameCoach) — offline Android camera assistant using CameraX, MediaPipe, Kotlin, and Compose.
- [promptvox](https://github.com/Sumeet-basfore/promptvox) — voice-to-prompt workflow for structured, reviewable coding-agent instructions.
- [LACE](https://github.com/Sumeet-basfore/LACE) — local-first code editor with model-assisted edits, terminal workflows, and native system access.
- [BharatQuest](https://github.com/Sumeet-basfore/BharatQuest) — multilingual mobile game for learning to recognize digital-payment scams.

Repository metadata comes from GitHub. Project summaries and technical notes live in [`src/data/portfolio.ts`](src/data/portfolio.ts), keeping editorial decisions separate from UI components.

## Tech stack

- Next.js and React
- TypeScript
- CSS with local design tokens
- Three.js and React Three Fiber
- GitHub REST API
- ESLint and TypeScript strict checking

There are no external font or image dependencies in the portfolio. The 3D scene uses small procedural geometries rather than downloaded models or textures.

## Architecture

```text
src/
  app/
    globals.css       Design tokens, layout, responsive styles, motion rules
    layout.tsx        Metadata and root layout
    page.tsx          Server-rendered portfolio composition
    loading.tsx       Loading state
    robots.ts         Robots metadata route
    sitemap.ts        Sitemap metadata route
  components/
    project-card.tsx  Project presentation
    github-signal.tsx GitHub summary metrics
    site-header.tsx   Responsive navigation
    three/            Isolated lazy-loaded 3D scene
  data/
    portfolio.ts      Personal configuration and editorial project notes
  lib/
    github.ts         Server-only GitHub fetching, validation, caching, and fallback logic
  types/
    portfolio.ts      Shared portfolio and GitHub data types
```

## GitHub integration

GitHub is used as a metadata source, not as a hard dependency for rendering.

- Requests run on the server through [`src/lib/github.ts`](src/lib/github.ts).
- Optional `GITHUB_TOKEN` is never sent to the browser.
- Responses are cached with a one-hour revalidation window.
- Requests have a five-second timeout.
- Profile and repository requests are handled independently.
- Invalid repository records, forks, archived repositories, empty repositories, and the profile README repository are filtered out.
- If GitHub fails, curated fallback profile and repository data keep the portfolio usable.

## 3D layer

The 3D hero is decorative and optional. It does not contain essential information.

- Loaded with a client-only dynamic import so it does not block the initial HTML render.
- Uses a low-poly core, one signal collar, and a small number of signal traces.
- Responds subtly to pointer position and scroll without continuous spinning.
- Uses reduced geometry, DPR `1`, and a low-power GPU preference on smaller or constrained devices.
- Pauses its render loop when the hero is outside the viewport.
- Falls back to a CSS treatment when WebGL is unavailable.
- Is hidden from assistive technology with `aria-hidden="true"`.

## Local development

Requirements: Node.js 20 or newer is recommended.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` when needed:

```env
GITHUB_USERNAME=Sumeet-basfore
GITHUB_TOKEN=
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

`GITHUB_USERNAME` defaults to `Sumeet-basfore`.

`GITHUB_TOKEN` is optional. It can raise GitHub API limits, but must remain server-side and must never use a `NEXT_PUBLIC_` prefix.

`NEXT_PUBLIC_SITE_URL` should be set to the real HTTPS production URL. It controls canonical metadata, Open Graph URLs, `robots.txt`, and the sitemap.

## Production checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Start the production build locally:

```bash
npm run start
```

## Deployment

This is a standard Next.js application and can be deployed to a Node-compatible hosting provider.

Before launch:

1. Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS domain.
2. Add `GITHUB_TOKEN` only if the public unauthenticated API limit is not sufficient.
3. Confirm the GitHub, LinkedIn, and email values in [`src/data/portfolio.ts`](src/data/portfolio.ts).
4. Run the production checks above.
5. Test the deployed page on a real mobile device and with keyboard navigation.

## License

The portfolio source is personal work by Sumeet Basfore. Repository-specific project licenses apply to the linked projects.
