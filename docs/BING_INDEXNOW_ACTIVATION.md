# Bing / IndexNow Activation Checklist

All the code for Bing + IndexNow already exists in the repo and is dormant —
every piece is gated on env vars that are unset everywhere. Nothing below is a
code change; it is entirely console work plus one script run. Operator: site
owner.

**The plumbing (already shipped, verify nothing, just know it exists):**

| Piece | File | Gated on |
|---|---|---|
| Per-publish IndexNow ping | `altftoolweb/src/platform/seo/indexNow.js` (called from `src/app/api/revalidate/route.js`) | `ALTFT_INDEXNOW_KEY` |
| Key file at `/indexnow-key.txt` | `altftoolweb/src/app/indexnow-key.txt/route.js` (404 until the key is set) | `ALTFT_INDEXNOW_KEY` |
| Bulk post-deploy submission | `altftoolweb/scripts/submit-indexnow.mjs` | `ALTFT_INDEXNOW_KEY` |
| Bing verification meta (`msvalidate.01`) | `altftoolweb/src/platform/seo/generateMetadata.js` | `ALTFT_VERIFY_BING` |

Production deploys run from AWS Amplify off the AltFTool org repos; env vars
are set in the **Amplify console** (App settings → Environment variables), not
in `amplify.yml` and not in this monorepo.

## 1. Set the IndexNow key

1. Generate a key locally:
   ```sh
   openssl rand -hex 16
   ```
   (Anything 8–128 chars of `[A-Za-z0-9-]` is accepted; a malformed value is
   silently ignored by the code, so stick to the command above.)
2. In the Amplify console for the web app, add env var
   `ALTFT_INDEXNOW_KEY=<that value>`. Save it somewhere safe too — the bulk
   script needs the same value locally.
3. Redeploy (env var changes need a new build to take effect).
4. Verify: `curl -s https://www.altftool.com/indexnow-key.txt` returns the key
   with HTTP 200. Until the var is set it returns 404 by design.

From this point on, every publish that flows through `/api/revalidate`
auto-pings IndexNow for the changed URLs. No further action needed for
incremental publishes.

## 2. Bing Webmaster Tools

1. Go to Bing Webmaster Tools and add `https://www.altftool.com`.
2. Easiest path: **Import from Google Search Console** — one OAuth click,
   verification and sitemaps carry over, no env var needed.
3. Alternative (only if not importing from GSC): choose the meta-tag
   verification method, copy the `msvalidate.01` content token, set it as
   `ALTFT_VERIFY_BING` in the Amplify console, redeploy, then click Verify.
   The tag is emitted site-wide by `generateMetadata.js`.
4. Submit `https://www.altftool.com/sitemap.xml` under Sitemaps (even after a
   GSC import, confirm it is listed).

## 3. After each significant deploy: bulk submission

The per-publish ping only covers URLs that go through `/api/revalidate`. A
release that adds or reworks many pages needs the bulk script, which reads the
**live** sitemap. Run it only **after** the deploy is confirmed live — never in
the build pipeline — otherwise it submits URLs that still 404 and burns quota
(the script's header comment explains this).

From `altftoolweb/`:

```sh
# Dry run first — reads the live sitemap, submits nothing, needs no key:
node scripts/submit-indexnow.mjs --dry-run

# Real submission:
ALTFT_INDEXNOW_KEY=<key> node scripts/submit-indexnow.mjs
```

Sanity-check the dry run's URL count against expectations before the real run.
The script follows one level of sitemap-index nesting, dedupes, and batches at
IndexNow's 10,000-URL cap.

Why bother: DuckDuckGo, Microsoft Copilot and ChatGPT search all answer from
Bing's index, so this one submission feeds all of them. Yandex, Seznam and
Naver also consume IndexNow.

## 4. Google side (separate track)

IndexNow does **not** cover Google — Google does not participate. Google
coverage stays on the normal path: sitemap submitted in Google Search Console
plus organic recrawl. Nothing above replaces that.

If GSC verification ever needs re-doing via meta tag (e.g. DNS verification is
lost), `ALTFT_VERIFY_GOOGLE` already exists in `generateMetadata.js` — set it
in the Amplify console and redeploy, same mechanism as the Bing token.
(`ALTFT_VERIFY_YANDEX` exists too.)

## 5. How to verify it's working

1. `curl -i https://www.altftool.com/indexnow-key.txt` → HTTP 200, body is the
   key.
2. Run the bulk script (real, not dry-run) → each batch logs
   `HTTP 200` or `HTTP 202` from `api.indexnow.org`. 202 means accepted, key
   not yet verified — fine on first run. 403 means the key file does not match
   the submitted key; 422 means URLs don't belong to the host; 429 is rate
   limiting.
3. In Bing Webmaster Tools, watch **IndexNow / URL submissions** — submitted
   URLs appear there within a day or so.
4. Ongoing: server logs from `/api/revalidate` warn with
   `[api/revalidate] IndexNow submission failed` if the per-publish ping ever
   fails; silence there is good news.
