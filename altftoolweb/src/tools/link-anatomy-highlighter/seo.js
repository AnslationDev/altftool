const seo = {
  title: "Link Anatomy Highlighter: See a URL's Real Domain",
  metaDescription:
    "Colour-codes a URL's scheme, userinfo, subdomain, registered domain, path and query, and flags @ tricks, xn-- punycode and redirect params. Never fetched.",
  steps: [
    "Type a link into 'Link to inspect', or load one of the Genuine, Userinfo trick, Punycode and Shortened samples.",
    "The link is only read as text and never fetched; each part is coloured and the row 'Registered domain — the part that matters' names the real destination.",
    "Read the Attention score out of 100 with findings for userinfo before @, xn-- punycode hosts and redirect parameters, then press Copy result.",
  ],
  intro:
    "Link Anatomy Highlighter splits a URL into its RFC 3986 parts — scheme, user info, subdomain, registered domain, port, path, query and fragment — and colours each one so you can see which piece actually decides where the click goes. It then flags the structures used in phishing: text before an @ sign, punycode (xn--) hosts, brand names parked in a subdomain, redirect parameters carrying a second URL, and paths ending in an executable. The whole analysis happens in the browser, so the link is read as text and never opened or sent to a server.",
  useCases: [
    "Teach a team the one habit that catches most phishing: find the first single slash and read the two labels immediately to its left.",
    "Check a link from an SMS or WhatsApp message before tapping it, when the visible text and the real destination may differ.",
    "Show why https://support.paypal.com@198.51.100.7/verify connects to an IP address and not to PayPal.",
    "Spot a tracking or redirect parameter that would bounce a trusted domain onward to somewhere else.",
  ],
  benefits: [
    ["Structure, not reputation", "Works offline on the text of the link, so it flags brand-new domains that no blocklist has seen yet."],
    ["Explains every flag", "Each finding names the exact part of the URL it came from and why that part is abused."],
    ["Nothing leaves the browser", "The link is parsed locally, never fetched, so inspecting a hostile URL cannot trigger it."],
  ],
  faqs: [
    [
      "Which part of a URL tells you where a link really goes?",
      "The two labels immediately before the first single slash — the registered domain. In https://login.secure.example.com/account the destination is example.com; everything to the left of it is a subdomain the same owner can invent at will, and everything after the slash is a path they also control.",
    ],
    [
      "What does the @ symbol in a link mean?",
      "Everything before an @ in the address is the userinfo field from RFC 3986, and browsers ignore it when deciding where to connect. In https://www.bank.com@203.0.113.9/login the browser goes to 203.0.113.9; the bank name is decoration, which is why this remains one of the most common link disguises.",
    ],
    [
      "What is a punycode or xn-- domain?",
      "It is the ASCII encoding of an internationalised domain name, always beginning xn--. It matters because letters from Cyrillic or Greek can render identically to Latin ones, so a homograph domain looks like the real brand in the address bar while resolving somewhere else. Reading the xn-- form shows what was actually registered.",
    ],
    [
      "Does a padlock or https mean a link is safe?",
      "No. HTTPS only proves the connection is encrypted and the certificate matches the domain you are visiting — and free certificates take minutes to obtain, so most phishing sites now have one. Judge the registered domain, not the padlock. This tool is educational and does not replace your bank or employer's own reporting process.",
    ],
  ],
};

export default seo;
