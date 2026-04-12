# Agents

## Stack

- **Astro** (SSR/SSG) with **React** components
- **Tailwind CSS v4** (uses `@import "tailwindcss"`, not v3 config)
- **shadcn/ui** — style: `radix-vega`, icon library: `lucide`
- Path alias: `@/` resolves to project root

## Commands

**Always use `bun` — never npm, yarn, pnpm, or deno.**

```bash
bun dev          # start dev server (localhost:4321)
bun build        # production build
bun lint         # eslint
bun format       # prettier write
bun format:check # prettier check
bun check        # TypeScript type check (run after any update)
```

## Key Files

- `src/styles/global.css` — Tailwind v4 theme, CSS variables (light/dark), OKLCH colors
- `src/lib/utils.ts` — `cn()` utility (shadcn merge)
- `src/components/ui/` — shadcn components (button, etc.)
- `components.json` — shadcn config (style, aliases, baseColor)

## Design Context

See `.impeccable.md` for the project's design context (minimal/refined, light-mode only, WCAG-focused template for BearUang API).

## Skills

Skills are loaded from `.agents/skills/` directory (configured via `skills-lock.json`).
