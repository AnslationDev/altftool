# My Lucky Deals — Admin Panel Module

Self-contained admin panel for the My Lucky Deals website. Own styles (prefixed `.mla-*`),
own Firebase wiring (reuses the host app's default Firebase app when present).
Full spec: `build.md` · Ad placements: frontend repo `ADS_PLACEMENTS.md`.

## Already registered in the ALTFTool panel ✅

This project is wired into the host app's project system (same pattern as Lead Tree):

- `config.js` — project id `myluckydeal`, name "My Lucky Deal", logo, 13 modules
- Registered in `src/projects/index.js` (`PROJECTS`)
- Route keys in `src/lib/adminModuleRouteKeys.js`
- Lazy loaders in `src/lib/adminModuleLoaders.js`
- Module pages in `modules/<key>/page.jsx` → each renders `ModuleShell` inside the host chrome

Open the panel and pick **My Lucky Deal** from the project switcher (top-left) —
routes live at `/myluckydeal/<module>` (e.g. `/myluckydeal/deals`).

**Permissions:** superadmins see it immediately. Other admins need project-scoped
permissions via Admin Management (`projectAccess.myluckydeal.permissions.<module>`)
— the existing permissions UI picks the new project up automatically from the registry.

### Data location

All content lives under the project-scoped Firestore subtree
`projects/myluckydeal/<collection>` and Storage prefix `projects/myluckydeal/media/…`
— consistent with the platform architecture (no top-level collection collisions with
AltFTool/Lead Tree). `firestore.rules` grants public read + active-admin write there.

**Requirements:** the host app must have the `firebase` npm package installed.
Configuration is **never hardcoded** — the module resolves Firebase in this order:

1. Reuses the host app's already-initialized default Firebase app, if one exists.
2. Otherwise initializes from the host's environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

If neither is available the panel renders a setup screen (it never crashes and never
falls back to embedded keys).

## Modules

| Module | Firestore | Notes |
|---|---|---|
| Dashboard | all | Live counts + content-health warnings |
| Seed Migration | all | One-click import of frontend seed → Firestore (safe / overwrite modes) |
| Deals | `deals` | Full product form, dynamic category/store dropdowns, specs editor |
| Categories | `categories` | Delete-guard: blocked while deals reference it |
| Stores | `stores` | Logo upload; delete-guard for deals & coupons |
| Coupons | `coupons` | Code auto-uppercase |
| Blog Posts | `blogs` | Block editor (paragraph / `## heading` / `- bullet`) |
| FAQs / Hero / Featured Offers / Collections | own collections | CRUD |
| Ads | `ads` | 14 fixed placements, active toggle, priority |
| Settings | `settings/*` | site · trendingSearches · seo · ui · home |

Every save writes `createdAt / updatedAt / updatedBy` automatically. Images upload to
Firebase Storage under `media/<folder>/…` and the download URL is stored on the record.

## First run — test flow

1. Mount the route and open it. Sign in with a Firebase Auth (email/password) user —
   or click **Continue without sign-in** if your Firestore rules are open (dev only).
2. Go to **Seed Migration → Import (empty only)**. All 10 collections + 4 settings docs
   are written to Firestore. Counts update in the table.
3. Open the website (`myluckdeal` with the same `.env.local` project) and refresh — it now
   renders Firestore data.
4. Test the loop: edit a deal's price in the panel → refresh the site → price changes.
   Toggle an ad's `active` off → its slot disappears. Edit `settings/ui` nav labels →
   header updates.
5. Production: deploy the security rules from `build.md` §12 and create real admin users.

## Firestore rules (dev quick-start)

For local testing only (open writes — do NOT ship):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if true; }
  }
}
```

Production rules: see `build.md` §12 (role-based via custom claims).
Storage: allow public read on `/media/**`, authenticated write.
