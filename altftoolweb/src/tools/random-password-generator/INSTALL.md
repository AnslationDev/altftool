# Random Password Generator — Install

Drop the `random-password-generator/` folder into:

    altftoolweb/src/tools/random-password-generator/

So the final structure is:

    altftoolweb/src/tools/random-password-generator/
      ├─ tool.config.js
      ├─ entry.jsx
      └─ pages/index.jsx

Then regenerate the auto-generated registries (run from the `altftoolweb/` folder):

    node scripts/generate-tool-runtime-map.mjs
    node scripts/generate-tool-meta.mjs

Restart dev and open:

    npm run dev:web
    http://localhost:3002/tools/all/random-password-generator

Notes:
- Uses Web Crypto (crypto.getRandomValues) — secure, bias-free, nothing stored.
- Imports "@/shared/utils/clipboard" (safeCopyText) and lucide-react icons — both already in altftoolweb.
- Surfaces/text use the app's CSS tokens, so light + dark both work.
