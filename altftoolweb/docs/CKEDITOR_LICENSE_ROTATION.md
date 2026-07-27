# CKEditor License Key Rotation — Instant Fix Guide

> **Use this file every time the CKEditor trial key expires.**
> The blog editor becomes read-only (or shows the raw-HTML fallback) when the key dies.
> Total fix time: ~5 minutes. **No code changes are needed — only the env value changes.**

---

## TL;DR (the whole fix)

1. Generate a new trial key at <https://portal.ckeditor.com> (login with any account → **License keys** → copy the key).
2. Open `altftoolwebadmin/.env.local` and replace the value of:
   ```
   NEXT_PUBLIC_CKEDITOR_LICENSE_KEY=<paste new key here>
   ```
   Keep the old key on a commented line above it with its expiry date (history of dead keys).
3. Restart / rebuild:
   - Local dev: stop and re-run `npm run dev` (env is read at startup).
   - **Production: you MUST rebuild and redeploy** — `NEXT_PUBLIC_*` vars are baked into the JS bundle at build time (`npm run build` → deploy). Also update the env var in the hosting dashboard (Vercel/Firebase/etc.) if the build runs there.
4. Verify (see checklist below). Done.

---

## Where the key is used

| Location | What |
|---|---|
| `altftoolwebadmin/.env.local` → `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` | **The only place the key value lives.** |
| `altftoolwebadmin/src/components/admin/CkeditorAssets.jsx` | Loads CKEditor 48.0.1 from CDN. Only touch if upgrading the CKEditor **version**, never for key rotation. |
| `altftoolwebadmin/src/projects/altftool/modules/blogs/components/BlogEditor.jsx` | Reads the env var, passes it as `licenseKey`. Never needs edits for rotation. |

The public web app (`altftoolweb`) does **not** use CKEditor at runtime — nothing to do there.

---

## How to check a key's expiry date

```bash
node -e "const k=process.argv[1];const p=JSON.parse(Buffer.from(k.split('.')[1],'base64').toString());console.log('type:',p.licenseType,'| expires:',new Date(p.exp*1000).toISOString())" "<PASTE_KEY>"
```

Trial keys last **14 days** and are validated online by CKEditor's server (`proxy-event.ckeditor.com`) on every editor load — so a key can also die early if the trial account hits its usage limit, not just at the expiry date.

---

## What happens automatically when a key dies (already built-in)

The code is rotation-proof. On ANY license failure (`expired`, `invalid`, `trial/usage limit`, `domain limit`, etc.) `BlogEditor.jsx` automatically:

- detects the editor being switched to read-only (the exact mechanism CKEditor uses for all license blocks),
- swaps in an **editable raw-HTML textarea fallback** with the current content preserved (zero data loss),
- shows a warning banner telling the admin to renew `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY`.

So an expired key never blocks blog work — admins can keep editing raw HTML until the new key is deployed.

---

## Verification checklist after swapping the key

Open **Admin → Blogs → Add Blog** and confirm:

- [ ] Rich editor (toolbar) loads — no "raw HTML" warning banner.
- [ ] Typing, bold/italic, undo/redo work.
- [ ] Console shows the purple **"CKEditor 5 Trial License"** info (normal for trial keys) and **no** `license-key-*` errors.
- [ ] Dark mode: editor follows the theme.
- [ ] Edit an existing blog — same checks.

If the rich editor still doesn't load after the swap: the new key wasn't picked up → you edited the env but didn't **rebuild/redeploy** (production) or restart dev server (local). That is the cause 99% of the time.

---

## Dead key history

| Key (jti) | Expired | Note |
|---|---|---|
| `811fce63-…` | 2026-05-06 | first trial key |
| `82d9d48b-…` | 2026-07-20 | rotated out 2026-07-14 |
| `acbac65e-…` | 2026-07-28 | current key (as of 2026-07-14) |

Add a row every time you rotate.

---

## Long-term note

Trial rotation works but each key needs a fresh portal account and dies every 14 days (or earlier on usage limits). Permanent options when ready: buy a production key (no rotation, no limits), or migrate to the self-hosted npm build with the free `GPL` key (open-source features only, GPL terms apply). Until then, this guide + the built-in fallback keep the blog module safe.
