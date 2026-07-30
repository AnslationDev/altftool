const seo = {
  intro:
    "This converter moves an API payload between the four shapes a request can take — nested JSON, a query string, a form-data key list and an x-www-form-urlencoded body — and back again. Nested objects are flattened with dot notation (`user.role`), arrays are emitted in whichever of three conventions your backend expects (`tags[]`, a repeated `tags`, or indexed `tags[0]`), and parsing in the reverse direction rebuilds the nesting and coerces `true`, `false`, `null` and numeric strings back to real JSON types. Each conversion also produces the matching Content-Type header and a ready-to-run cURL command.",
  useCases: [
    "You have a working JSON request body and the endpoint you are now calling only accepts x-www-form-urlencoded, so you need the equivalent encoded body without hand-escaping it",
    "A colleague sent a long query string from a browser network tab and you want it as structured JSON, with `user.active=true` becoming a real nested boolean",
    "Your API rejects array parameters and you need to try `tags[]`, plain repeated `tags` and `tags[0]` to find out which convention its framework actually parses",
  ],
  benefits: [
    ["Three array conventions, one click", "Switch between bracket, repeated-key and indexed array encoding instead of rewriting every element by hand."],
    ["Round-trips with types intact", "Going back from parameters to JSON restores nesting from dot and bracket paths and converts `true`, `false`, `null` and numeric strings to their JSON types."],
    ["cURL and headers come with it", "Every mode emits the right Content-Type and a matching cURL command — GET with the query appended, POST with the body attached."],
  ],
  faqs: [
    [
      "How do nested objects become flat parameters?",
      "By dot notation: `{\"user\":{\"role\":\"admin\"}}` flattens to `user.role=admin`, at any depth. Parsing back splits on dots and brackets and rebuilds the object, choosing an array container when the next path segment is numeric or empty.",
    ],
    [
      "Which array format should I use?",
      "It depends on the server, which is why all three are offered. PHP and Rails-style stacks generally expect `tags[]`, many Node and Go routers read repeated plain `tags` keys, and explicitly indexed `tags[0]` is the safest when order matters. Try the request against your own endpoint rather than assuming.",
    ],
    [
      "What Content-Type header does each mode use?",
      "form-data mode emits `multipart/form-data`, urlencoded mode emits `application/x-www-form-urlencoded`, and both JSON modes emit `application/json`. Query-parameter mode sends no body, so it emits `Accept: application/json` instead.",
    ],
    [
      "Why did \"25\" come back as a number instead of a string?",
      "Because query strings carry no type information, so parsing back applies coercion: a value that is exactly `true`, `false`, `null`, or matches a plain integer or decimal becomes that JSON type. If an ID like a zip code or an account number must stay a string, check it after conversion and quote it.",
    ],
  ],
};

export default seo;
