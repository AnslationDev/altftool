# AGENTS.md

**Before any task in this repo, read and follow [`master.md`](./master.md) — the single source of truth.**

It defines the ALTFTool design language, theming rules, and design tokens (Primary **Teal-500 `#14B8A6`**, Secondary **Cyan-400 `#22D3EE`**, light + dark navy) that **every** section of ALTFTool must follow so the platform stays one unified, premium product.

Rules (full detail in `master.md`):
- Theme only via semantic tokens / Tailwind utilities — never hardcode colours, radius, shadows, or spacing.
- Every screen supports **light AND dark**; meet **WCAG AA**.
- Keep changes backward-compatible; SEO engine stays inert behind `ALTFT_SEO_ENGINE_ENABLED`.
- Build both apps with **`next build --webpack`**.

When `master.md` conflicts with anything else, **`master.md` wins.**
