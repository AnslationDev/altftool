const seo = {
  title: "Cookie Viewer: Add, Edit & Delete Browser Cookies",
  metaDescription:
    "List every cookie document.cookie exposes for this domain with decoded values, add one with an expiry in days, or delete it with the 1970 expiry trick.",
  intro:
    "Cookie Viewer reads `document.cookie` for the current domain and lists every name and URL-decoded value it can see, then lets you add a cookie with a chosen expiry in days, overwrite an existing value, or delete one by re-setting it with an expiry of 1 January 1970. New cookies are written with `path=/` and the value URL-encoded. It is for developers and QA testers who want to flip a feature flag or clear a session marker without opening the browser's devtools panel.",
  useCases: [
    "A feature is gated behind a cookie flag and you want to set it to the on value for 7 days to see the variant, then delete it to check the default path again.",
    "You are reproducing a bug that only appears once a preference cookie exists, and need to read its exact decoded value rather than the percent-encoded string in the network tab.",
    "A stale consent or session cookie is putting the page into a bad state and you want to clear everything for this domain in one action and reload.",
  ],
  benefits: [
    ["Values are shown decoded", "The list runs `decodeURIComponent` on each value, so a JSON or path-bearing cookie reads as itself instead of a wall of %7B and %2F escapes."],
    ["Expiry set in days, not a UTC string", "You enter a number of days and the correct `expires` header string is generated, avoiding the malformed date that silently turns a cookie into a session cookie."],
    ["Delete uses the standard expiry trick", "Removal re-sets the cookie with a 1970 expiry on `path=/`, which is the only way a script can delete a cookie — there is no delete API."],
  ],
  faqs: [
    [
      "Can I see cookies from other websites here?",
      "No. `document.cookie` is scoped to the current origin, so this page can only list cookies belonging to this domain. Cookies for other sites are inaccessible by design — that isolation is the same-origin policy, and no page-level tool can work around it.",
    ],
    [
      "Why are some cookies missing from the list?",
      "Cookies marked HttpOnly are deliberately hidden from JavaScript, so session and auth cookies usually will not appear. Cookies scoped to a different path or subdomain than the current page are also excluded. Use the browser's own Application panel to see those.",
    ],
    [
      "How big can a cookie be?",
      "Around 4 KB per cookie in practice — RFC 6265 asks browsers to support at least 4096 bytes for the name, value and attributes combined, and most cap it there. Browsers also limit how many cookies one domain may hold, so store an identifier and keep the data server-side.",
    ],
    [
      "How do you delete a cookie in JavaScript?",
      "Set it again with the same name and a past expiry: `document.cookie = \"name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/\"`. The path must match the one the cookie was created with, which is why a cookie set on a narrower path can appear undeletable from the site root.",
    ],
  ],
};

export default seo;
