const seo = {
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
      "Do I need to paste the whole certificate chain, or just one certificate?",
      "Either works. Paste just the leaf and you still get its subject, issuer, validity, key size and signature algorithm; paste the leaf followed by each intermediate (and optionally the root) and the tool also checks that every certificate's issuer matches the next one's subject, which is what catches a missing intermediate. Get the chain with openssl s_client -connect example.com:443 -showcerts, or export it from your browser's certificate viewer.",
    ],
  ],
};

export default seo;
