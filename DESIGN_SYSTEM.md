# AltFTool Design System

Last updated: 2026-07-24

`master.md` is the policy source of truth. This document explains how that
policy is implemented in code.

## Product Direction

AltFTool is one product across the public web app and admin app:

- Calm teal and cyan identity on cool neutral surfaces.
- Compact, work-focused controls and predictable navigation.
- Geist typography and Lucide icons.
- Light, dark, and system theme modes using one semantic contract.
- WCAG AA contrast, visible keyboard focus, and reduced-motion support.
- Route-specific personality only where it helps the task; shells and controls
  remain consistent.

## Architecture

```text
packages/ui/src/tokens.css
  Raw primitives and light/dark values
        |
packages/ui/src/theme.css
  Tailwind semantic utility mapping
        |
packages/ui/src/*
  Brand, primitives, feedback, overlays, layout, data display, theme
        |
altftoolweb + altftoolwebadmin
  Product shells, feature composition, and legacy compatibility aliases
```

The reusable package is split by responsibility:

```text
packages/ui/src/
  brand/          Canonical AltFTool identity
  primitives/     Buttons, fields, cards, badges, toggles
  feedback/       Alerts, toasts, spinners
  overlays/       Modal and confirmation flows
  layout/         Page and section composition
  data-display/   Tables, stats, tabs, empty and loading states
  theme/          Shared light/dark/system controls
  lib/            Framework-light helpers
  tokens.css      Primitive values
  theme.css       Tailwind semantic map
  styles.css      Component recipes
  index.jsx       Stable public API
```

## Ownership Rules

- Put raw color, radius, shadow, spacing, motion, and control-size values only
  in `packages/ui/src/tokens.css`.
- Put reusable visual recipes in `packages/ui/src/styles.css`.
- Put reusable React behavior in the matching `packages/ui/src` module.
- Keep `altftoolweb/src/app/globals.css` and
  `altftoolwebadmin/src/app/globals.css` as compatibility adapters and
  product-specific composition, not alternate token sources.
- Put a component in `@altftool/ui` when both apps can use it, when three or
  more routes repeat it, or when accessibility behavior should be solved once.
- Keep route-specific business logic and domain-heavy widgets in the owning
  feature folder.
- Preserve existing imports through compatibility wrappers while migrating.

## Canonical Brand

`packages/ui/src/brand/brand.js` is the machine-readable brand source.
`BrandMark` and `BrandLogo` are the React components used by web and admin.

Static assets are generated from the same source:

```bash
npm run brand:sync
```

Generated files:

- `altftoolweb/public/brand/altftool-mark.svg`
- `altftoolwebadmin/public/brand/altftool-mark.svg`

Do not add another AltFTool raster logo. Product, partner, and customer brands
may keep separate assets when they represent a genuinely different identity.

## Public Components

Core actions and forms:

- `Button`, `IconButton`
- `Input`, `SearchInput`, `Select`, `Textarea`
- `Label`, `Field`, `Toggle`

Surfaces and data:

- `Card`, `Badge`, `StatusBadge`
- `StatCard`, table primitives, `Tabs`
- `Skeleton`, `SkeletonText`, `EmptyState`, `Kbd`, `BulkActionBar`

Feedback and overlays:

- `Alert`, `Toast`, `ToastHost`, `Spinner`
- `Modal`, `ConfirmModal`

Composition and identity:

- `BrandMark`, `BrandLogo`
- `PageShell`, `PageHeader`, `SectionHeader`, `Stack`, `Cluster`
- `ThemeProvider`, `useThemeMode`
- `ThemeModeMenu`, `ThemeModeSelector`

Import from the stable package surface:

```jsx
import {
  BrandLogo,
  Button,
  PageHeader,
  PageShell,
  ThemeModeMenu,
} from "@altftool/ui";
```

## Theme Contract

Components consume semantic tokens such as:

- `--anslation-ds-page`, `--anslation-ds-surface`, `--anslation-ds-soft`
- `--anslation-ds-text`, `--anslation-ds-text-soft`, `--anslation-ds-muted`
- `--anslation-ds-border`, `--anslation-ds-border-strong`
- `--anslation-ds-primary`, `--anslation-ds-primary-foreground`
- `--anslation-ds-success`, `--anslation-ds-warning`,
  `--anslation-ds-danger`, `--anslation-ds-info`
- `--anslation-ds-radius-*`, `--anslation-ds-shadow-*`,
  `--anslation-ds-motion-*`

The root `data-theme` attribute selects light or dark values. The `system`
preference follows `prefers-color-scheme` through each app's shared theme
provider. Components must not read OS theme directly.

## Accessibility Baseline

- Interactive controls expose names and states.
- Icon-only controls use an accessible label and tooltip/title.
- Dialogs trap focus, close on Escape when allowed, and return focus.
- Radio-like segmented controls support arrow, Home, and End keys.
- Focus rings remain visible in both themes.
- Motion tokens collapse under `prefers-reduced-motion`.
- Body text and action contrast meet WCAG AA.

## Guardrails

Run before merging design-system work:

```bash
npm run design:sync
npm run build:web
npm run build:admin
```

`npm run design:check` verifies:

- required tokens and dark/reduced-motion contracts;
- no raw colors in shared component recipes;
- no app-level raw primitive overrides;
- stable shared exports and workspace transpilation;
- canonical shell branding;
- generated brand assets and removal of legacy duplicate logos.

Both Next.js apps must continue to build with `next build --webpack`.
