const seo = {
  intro:
    "The Query String Parser splits a URL query string into one readable \"key = value\" line per parameter, using the browser's own URLSearchParams so percent-encoding is decoded and \"+\" becomes a space exactly as a real server would read it. A leading \"?\" is stripped for you, so you can paste straight from the address bar, and the output updates as you type. It is for developers and marketers picking apart a long tracking or callback URL without writing a throwaway script.",
  useCases: [
    "A campaign link arrives with a dozen utm_ and gclid parameters mashed together and you need to read which source, medium and campaign it actually carries.",
    "An OAuth callback fails and you want to see the decoded state, code and redirect_uri values instead of squinting at %2F and %3D in the address bar.",
    "You are reproducing a bug from a support ticket and need to confirm which filter parameters the customer's URL really set before you rebuild the request.",
  ],
  benefits: [
    ["Decodes the way a server does", "Parsing goes through URLSearchParams, so %20, %2F and + are resolved to real characters rather than shown raw."],
    ["Repeated keys stay visible", "A string like tags=a&tags=b produces two separate lines instead of silently collapsing into one value, which is how array-style parameters are usually sent."],
    ["Paste from the address bar directly", "A leading question mark is removed automatically, and the result list refreshes on every keystroke with a one-click copy of the whole output."],
  ],
  faqs: [
    [
      "Can I paste a whole URL, or just the query string?",
      "Paste the query string - everything from the \"?\" onward. A leading \"?\" is stripped automatically, but a full URL including the scheme and path will be read as if the path were part of the first parameter name.",
    ],
    [
      "Does it decode percent-encoded characters?",
      "Yes. It uses the standard URLSearchParams parser, so %20 becomes a space, %2F becomes a slash, and a literal \"+\" is decoded as a space per the application/x-www-form-urlencoded rules.",
    ],
    [
      "What happens to duplicate parameter names?",
      "Each occurrence gets its own line in the output. Parsing tags=a&tags=b returns two lines both keyed tags, preserving the order they appeared in the string.",
    ],
    [
      "Is the URL I paste sent anywhere?",
      "No. Parsing happens in your own browser tab with a built-in JavaScript API and nothing is uploaded, which matters when the string contains a session token or an auth code.",
    ],
  ],
};

export default seo;
