# AltFTool Design System

Last updated: 2026-05-05

## Direction

AltFTool should feel like a clean Google product with Anslation/Fuse discipline:

- Geist typography.
- Cool grey/blue surfaces.
- Compact spacing.
- 8px baseline radius.
- Token-first colors through `--anslation-ds-*`.
- Light and dark themes from the same token contract.

## Token Sources

- Public app: `altftoolweb/src/app/globals.css`
- Admin app: `altftoolwebadmin/src/app/globals.css`
- Shared primitives: `packages/ui/src`

Core tokens:

- `--anslation-ds-page`, `--anslation-ds-surface`, `--anslation-ds-soft`
- `--anslation-ds-border`, `--anslation-ds-border-strong`
- `--anslation-ds-text`, `--anslation-ds-text-soft`, `--anslation-ds-muted`
- `--anslation-ds-primary`, `--anslation-ds-primary-soft`
- `--anslation-ds-success`, `--anslation-ds-warning`, `--anslation-ds-danger`
- `--anslation-ds-radius`, `--anslation-ds-shadow-*`, `--anslation-ds-focus-ring`

## Rules

- New UI should use tokens or existing aliases, not random hardcoded palettes.
- Keep buttons, inputs, cards, menus, tables, and admin shell controls compact.
- Use blue only for primary action and active navigation.
- Use status colors only for real states.
- Avoid heavy gradients, decorative blobs, and unrelated visual themes.
- Keep route/page typography smaller inside tools and dashboards; reserve large type for public page heroes.
- Prefer 8px radius. Larger radii need a reusable component reason.
- Repeated controls should start in `@altftool/ui` so public and admin interfaces do not drift.

## Verification

- Runtime: Node `24.15.0` from `.nvmrc` / `.node-version`.
- Full validation: `npm run validate`.
- Manual check: `http://localhost:3002` and `http://localhost:3001/login` after theme changes.
