# CLAUDE.md

## ⛔ READ FIRST — before any code change

**Before doing ANYTHING in this repository, open and follow [`master.md`](./master.md).**

`master.md` is the single source of truth for the ALTFTool design language, theming rules, design tokens (Primary **Teal-500 `#14B8A6`**, Secondary **Cyan-400 `#22D3EE`**, light + dark navy), component standards, and engineering rules. Every section of ALTFTool (web, admin, tools, blog, news, dashboard, auth, settings, errors — and every future feature) must follow it so the platform stays one unified, premium product.

Do not introduce hardcoded colours/radius/shadows/spacing or any style that contradicts `master.md`. When `master.md` and any other doc conflict, **`master.md` wins**.

Quick rules (full detail in `master.md`):
- Theme only via semantic tokens / Tailwind utilities (`bg-primary`, `var(--surface)`, `rounded-lg`, `shadow-md`) — never inline hex.
- Support **light AND dark** on every screen; meet **WCAG AA** (contrast, focus, keyboard, reduced-motion).
- Keep changes backward-compatible; the SEO engine stays inert behind `ALTFT_SEO_ENGINE_ENABLED`.
- Build both apps with **`next build --webpack`** (Turbopack can't resolve the `@altftool/*` workspace packages).
- Companion docs: `ALTFTool-Design-System.pdf`, `ALTF_ENGINE_PLATFORM_ARCHITECTURE.md`.

> Workflow: **read `master.md` → use existing tokens/components → light+dark → AA → build with `--webpack` → verify → ship.**
