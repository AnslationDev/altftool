# @altftool/ui

Shared visual foundations and accessible React primitives for AltFTool web and
admin.

## Usage

Each app imports the shared stylesheet once from its root `globals.css`:

```css
@import "@altftool/ui/styles.css";
```

Components are imported from the package root:

```jsx
import { Button, Card, SearchInput, ThemeModeMenu } from "@altftool/ui";
```

Both Next.js configs must include `@altftool/ui` in `transpilePackages`.

## Module Boundaries

- `tokens.css`: raw theme values and scales.
- `theme.css`: semantic Tailwind mapping.
- `styles.css`: reusable component recipes.
- `brand`: canonical AltFTool identity.
- `primitives`: low-level controls and surfaces.
- `feedback`: status and loading communication.
- `overlays`: focus-managed dialogs.
- `layout`: reusable page composition.
- `data-display`: tables, stats, tabs, empty/loading states.
- `theme`: system/light/dark controls.

Keep the root `index.jsx` backward compatible. Move implementations between
modules without breaking existing named imports.

## Adding A Component

1. Confirm the behavior is reused or accessibility-sensitive.
2. Build against semantic tokens only.
3. Support light and dark themes with the same markup.
4. Use Lucide for familiar interface icons.
5. Export through `src/index.jsx`.
6. Add the component to the admin design-system catalog.
7. Run `npm run design:check` and both app builds.

Generate static brand assets with `npm run brand:sync`. Never maintain a
separate raster copy of the AltFTool logo.
