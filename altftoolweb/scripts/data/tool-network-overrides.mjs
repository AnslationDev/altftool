/**
 * Hand-verified network disclosures the scanner cannot derive on its own,
 * merged into generated/toolNetworkMap.js by generate-tool-network-map.mjs.
 *
 * An entry belongs here only when the tool's live code provably contacts the
 * host but the URL is assembled in a way static resolution can't follow
 * (e.g. fetch(built.url) where a builder function returns the URL). Every
 * entry MUST cite file:line evidence — this list feeds the "sends your input
 * to X" sentence on the tool's public page, so an unverified entry publishes
 * a false claim.
 *
 * Re-check the citation when touching the tool; delete the entry if the call
 * is gone. Overrides are listed before scanned hosts and survive the 3-host
 * cap.
 *
 * DELIBERATELY ABSENT — tools whose fetch destination is user-editable
 * (api-tester pages/index.jsx:158 fetch(finalUrl); json-compare
 * components/Main.jsx:130,147 fetch(urlA/urlB); api-documentation-maker
 * components/HealthChecker.jsx:25 fetch(baseUrl)): the destination is
 * whatever the visitor types, so "sends your input to X" cannot name a host
 * truthfully. api-tester does ship default/sample targets
 * (jsonplaceholder.typicode.com at pages/index.jsx:87, dog.ceo in SAMPLES
 * at :50-53) that a bare click on Send would contact — but they are
 * placeholders the user is meant to replace, not the tool's service, so
 * naming them would misdescribe where input goes. Nothing fires without a
 * click; absence keeps the copy silent rather than wrong.
 *
 * ALSO OUT OF SCOPE — hosts contacted only through <img src> asset loads
 * (flagcdn.com flags in country-quiz/flag-quiz/currency-converter, Giphy's
 * media CDN and cdn.jsdelivr.net emoji art in emoji-hub): this map covers
 * the programmatic fetch/axios channel; the copy it feeds says "sends your
 * input to X", which image loads do not do. emoji-hub's hand-written
 * seo.js intro already discloses its CDNs accurately.
 */
export const TOOL_NETWORK_OVERRIDES = {
  // fetch(built.url) at pages/index.jsx:68; buildAirQualityUrl assembles the
  // URL from OPEN_METEO_ENDPOINT ("https://air-quality-api.open-meteo.com/…")
  // at lib.js:214.
  "aqi-today": ["air-quality-api.open-meteo.com"],

  // fetch(target.url) at pages/index.jsx:80; the default target list is built
  // from RDAP_BOOTSTRAP_BASE ("https://rdap.org/domain/") at lib.js:23. A
  // visitor may point the tool at a custom RDAP server; rdap.org is the
  // shipped default every query starts from.
  "whois-lookup": ["rdap.org"],

  // components/Main.jsx: fetchJson (fetch(url) at :268) is called with the
  // typed IP/domain against ipwho.is (:299), ipinfo.io (:306) and ipapi.co
  // (:312) in a fallback chain, and dns.google (:277-278) resolves typed
  // domains first; api.ipify.org (:427) fetches the visitor's own IP. The
  // scanner misses the wrapper because an unrelated local `const url` (:49)
  // shadows the param evidence. Three-host cap: the primary lookup chain.
  "ip-geolocation-lookup": ["ipwho.is", "ipinfo.io", "dns.google"],

  // pages/index.jsx: the four SAMPLES entries hardcode
  // https://images.unsplash.com/... URLs (:17,:24,:31,:38); loadSample
  // fetch()es the clicked sample (:209), and the sample strip renders them
  // as <img src> on first paint (:430). The scanner can't follow the
  // sample.url property access.
  "image-compressor": ["images.unsplash.com"],

  // pages/index.jsx: API_BASE = "https://api.screenshotmachine.com" (:21);
  // buildScreenshotUrl (:37-50) appends the URL the visitor typed as a
  // query param, handleCapture loads it via img.src (:138) and
  // handleDownload fetch()es it via downloadImage (:151 -> :63). The
  // scanner can't resolve the state variable carrying the built URL. The
  // visitor's target URL is genuinely transmitted to this third party.
  "screenshot-tool-animated": ["api.screenshotmachine.com"],

  // pages/index.jsx:18-20 and components/BatchProcessing.jsx:10-12 call
  // @imgly/background-removal's removeBackground() with no config; the
  // package's default publicPath downloads its onnx model and wasm from
  // https://staticimgly.com/@imgly/background-removal-data/<ver>/dist/ on
  // first use (node_modules/@imgly/background-removal/dist/index.mjs).
  // The fetch lives in node_modules, outside the scanner's per-tool walk.
  "bg-remover": ["staticimgly.com"],
};
