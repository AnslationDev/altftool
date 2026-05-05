# AltFTool Security Audit

Last updated: 2026-05-05

## Completed

- Moved third-party service credentials out of browser code into server-only API routes.
- Added security headers to both Next.js apps.
- Added `.env.example` files for required public and server-only environment variables.
- Updated Next.js, React, Firebase, Axios, PostCSS, and related dependencies.
- Replaced vulnerable `face-api.js` with `@vladmandic/face-api`.
- Removed unused CKEditor package tree from the admin app and updated CDN assets to CKEditor `48.0.1`.
- Replaced vulnerable `xlsx` import parsing with `read-excel-file` for `.xlsx` imports.
- Added admin import limits: max 2 MB files and max 1000 imported rows.
- Optimized oversized public images so no public asset is above 10 MB.
- Made Firebase Admin initialization lazy so production builds do not require service-account env vars at import time.

## Environment

Use `altftoolweb/.env.example` and `altftoolwebadmin/.env.example` as deployment templates. Keys without `NEXT_PUBLIC_` must stay server-only.

Any key that was previously committed or shipped in client code must be rotated in the provider console.

## Verification

- `altftoolweb`: `npm audit --audit-level=moderate` passes with 0 vulnerabilities.
- `altftoolwebadmin`: `npm audit --audit-level=moderate` passes with 0 vulnerabilities.
- `altftoolweb`: `npm run build` passes.
- `altftoolwebadmin`: `npm run build` passes.

## Remaining Quality Debt

- `altftoolweb` still has legacy ESLint debt: React hook/compiler issues, missing keys, unescaped entities, and `<img>` optimization warnings.
- Admin rich-text editing still depends on remote CKEditor CDN scripts; self-hosting those assets would be a stronger supply-chain posture.
