const seo = {
  intro:
    "Paste one deep link and this page works out what it actually asks a phone to do. Android intent:// URIs are taken apart in the format Intent.parseUri reads for URI_INTENT_SCHEME: the target scheme, action, categories, package, component, selector, typed extras (S. for String, i. for int, B. for boolean and the rest), and the launchFlags bitmask decoded bit by bit against the real android.content.Intent constants — so FLAG_GRANT_READ_URI_PERMISSION or FLAG_ACTIVITY_FORWARD_RESULT is named rather than left as a hex number. The browser_fallback_url is followed, redirect parameters inside it are percent-decoded layer by layer until they stop changing, and the authority is checked for the userinfo trick, backslashes, encoded null bytes and raw non-ASCII. Custom schemes, https App Links and Universal Links each get the treatment appropriate to them. Nothing is fetched and nothing is opened.",
  useCases: [
    "A QR code or SMS gives you an intent:// link and you want to know which app it opens, with what extras, before anyone taps it.",
    "Review your own app's deep links in a security pass: check that no access token rides in the query, that launchFlags does not grant URI permissions, and that the fallback goes to a host you own.",
    "Explain to a colleague why the link they were sent is not from the bank — the real host is what follows the last @, and this shows it separately from the part that was meant to be read.",
  ],
  benefits: [
    [
      "launchFlags decoded, not displayed",
      "Every set bit is matched against the documented Intent constants and explained. Bits that are set but not documented are reported as unnamed rather than guessed at.",
    ],
    [
      "The fallback is where the risk usually is",
      "browser_fallback_url is the page every device without the app will load. It is decoded, its own redirect parameters are traced, and a javascript:, data: or nested intent: destination is treated as the high-severity finding it is.",
    ],
    [
      "Honest about what a link cannot prove",
      "The tool says which checks depend on things only a live lookup could answer — whether the app is installed, whether the fallback page exists, whether the .well-known files list the app — instead of implying a verdict it cannot reach.",
    ],
  ],
  faqs: [
    [
      "What is an intent:// URL and why is it more dangerous than a normal link?",
      "It is Android's text form of an Intent object, produced by Intent.toUri and read back by Intent.parseUri. Unlike an ordinary URL it can carry an action, a target package, an explicit component class, a bitmask of launch flags and arbitrary typed extras — so a web page can hand a specific activity in a specific app a specific payload. Chrome does defend the common case: before firing an intent from a web page it clears the component and the selector and adds the BROWSABLE category. An app that calls Intent.parseUri itself, for example inside a WebView's shouldOverrideUrlLoading, gets no such protection, and that is where intent-redirection vulnerabilities live.",
    ],
    [
      "What is browser_fallback_url and why does it deserve its own section?",
      "It is a String extra Chrome reads from an intent URI: if no installed app handles the intent, Chrome navigates to that URL instead. On any device without the target app — most devices, for most links — the fallback is the only thing that happens. A fallback pointing at javascript: turns the link into script execution in whatever page performed the navigation; a fallback pointing at another intent: chains past whatever restrictions applied to the first. This page decodes it and follows any redirect parameter inside it.",
    ],
    [
      "Why is a custom scheme like myapp:// weaker than an https App Link?",
      "Nothing owns a private-use scheme. Any app can declare myapp in its manifest or Info.plist, and the operating system has no way to decide which claim is real — Android shows a chooser, and iOS behaviour when two apps declare the same scheme is undefined. An https App Link or Universal Link is different: the OS fetches an association file from the domain (/.well-known/assetlinks.json on Android, /.well-known/apple-app-site-association on iOS) and only routes the link to an app the domain owner has listed. That is why RFC 8252 requires PKCE whenever an OAuth authorization code is delivered to a private-use scheme, and why this page flags an authorization redirect with no code_challenge.",
    ],
    [
      "Does this open the link or check whether the app exists?",
      "No. The link is parsed as text and nothing is requested, resolved or launched. That means three things stay unknown: whether the target app is installed, whether the fallback page is live and says what it claims, and whether the host's association files actually name the app. The tool tells you the exact URLs to check for the last of those instead of pretending to have checked them.",
    ],
  ],
};

export default seo;
