const seo = {
  title: "SSL Certificate Inspector: Decode PEM in Browser",
  metaDescription:
    "Paste a PEM certificate or chain to read subject, issuer, SANs, key size and expiry, with RFC 6125 hostname matching and the 398-day lifetime check.",
  steps: [
    "Paste the PEM block into Certificate or chain (PEM) — obtain one with openssl s_client -connect example.com:443 -showcerts.",
    "Type the Hostname to check, set Check against date, and set Renewal warning (days before expiry), which starts at 30.",
    "Read Days until expiry with Subject alternative names, Hostname match and Certificate lifetime, plus warnings on the 398-day maximum or a sub-2048-bit RSA key, then use Copy report.",
  ],
  intro:
    "The SSL Certificate Inspector decodes a PEM-encoded X.509 certificate or chain in your browser and reports its subject, issuer, validity window, subject alternative names, key size and signature algorithm, then flags anything that would fail a modern TLS client. Checks follow RFC 5280 for the certificate structure, RFC 6125 for hostname and wildcard matching, and the CA/Browser Forum Baseline Requirements for the 398-day maximum lifetime and 2048-bit minimum RSA key. It is for developers and sysadmins debugging a certificate before or after deployment.",
  useCases: [
    "Confirming a newly issued certificate really covers both example.com and *.example.com before swapping it in",
    "Diagnosing a chain that works in desktop browsers but fails on Android by spotting the missing intermediate",
    "Checking how many days remain before renewal, and whether the certificate exceeds the 398-day maximum",
  ],
  benefits: [
    ["Nothing leaves your machine", "The X.509 parser runs locally, so private-network and internal-CA certificates stay private."],
    ["Wildcard rules done correctly", "*.example.com matches www.example.com but not example.com or a.b.example.com, exactly as RFC 6125 requires."],
    ["Chain order validated", "Each certificate's issuer is compared with the next certificate's subject to catch a broken or reordered bundle."],
  ],
  faqs: [
    [
      "How long can an SSL certificate be valid?",
      "398 days maximum for a publicly trusted TLS certificate issued on or after 1 September 2020, under the CA/Browser Forum Baseline Requirements. Anything longer will be rejected by Apple, Google and Mozilla root programs, which is why most public certificates are now issued for 90 to 397 days.",
    ],
    [
      "Does a wildcard certificate cover subdomains of subdomains?",
      "No. Under RFC 6125 a wildcard is only valid as the complete leftmost label and matches exactly one label, so *.example.com covers www.example.com and api.example.com but not example.com itself and not a.b.example.com. Cover the bare domain by adding it as its own SAN entry.",
    ],
    [
      "Why does my certificate work in Chrome but fail on another device?",
      "Almost always a missing intermediate. Desktop browsers cache intermediates they have seen before, so a server that sends only the leaf still works there while a fresh device has nothing to build the path with. Paste the full bundle here — the chain check compares each certificate's issuer against the next one's subject.",
    ],
    [
      "Can this tool check a live website's certificate?",
      "No, and no browser-based tool can: no web API exposes the certificate a remote server presents on a TLS connection, so a live domain lookup has to run on a server. Fetch it yourself with openssl s_client -connect example.com:443 -showcerts and paste the PEM block here.",
    ],
  ],
};

export default seo;
