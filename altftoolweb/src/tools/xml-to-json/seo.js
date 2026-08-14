const seo = {
  title: "XML to JSON Converter: Arrays, @_ Attribute Prefix",
  metaDescription:
    "Convert XML to JSON in the browser: repeated tags become arrays, attributes take an @_ prefix, mixed text sits under #text. CDATA and entities decoded.",
  steps: [
    "Paste your XML into the XML input box, or use Upload .xml for a file up to the 8 MB limit — the box opens with a sample document already in it.",
    "Set Indentation (Minified, 2 spaces or 4 spaces), the Attribute prefix (@_ by default) and the Text key for mixed content (#text), and untick Keep attributes, Parse numbers and true/false or Keep the root element as a key as needed.",
    "The JSON output panel updates live alongside Elements converted, Root element, Attributes, Deepest nesting and JSON size; press Copy JSON, or Download .json to save a file named after the uploaded document or the root element.",
  ],
  intro:
    "This XML to JSON converter parses an XML 1.0 document — elements, attributes, CDATA, comments and character entities — and rewrites it as JSON using the conventions every mainstream library shares: repeated sibling tags become arrays, attributes are prefixed with @_ so they cannot collide with a child of the same name, and mixed text sits under a #text key. It is aimed at developers moving a legacy SOAP or RSS payload into a JavaScript codebase, and it runs entirely in the page, so payloads with customer data never leave the machine.",
  useCases: [
    "Paste a SOAP or legacy API response and get JSON you can drop straight into a fetch-based client.",
    "Convert an RSS or sitemap feed into JSON for a static site build step.",
    "Inspect a large config file by reading it as JSON instead of counting closing tags.",
  ],
  benefits: [
    ["Repeated tags become arrays", "Two or more siblings with the same name collapse into a JSON array, so downstream code can map over them without checking the shape first."],
    ["Leading zeros survive", "Number parsing is skipped for values with a significant leading zero, so a code like 0071 stays the string \"0071\" rather than becoming 71."],
    ["Runs offline in the browser", "Parsing and serialisation are plain JavaScript in the page — no upload, no API key, no size charge."],
  ],
  faqs: [
    [
      "How are XML attributes represented in the JSON?",
      "Each attribute becomes a key prefixed with @_ by default — an isbn attribute gives \"@_isbn\". The prefix follows the fast-xml-parser convention and exists so an attribute named title cannot overwrite a child element named title. You can change it to @ or anything else, or drop attributes entirely.",
    ],
    [
      "Why did my single item not become an array?",
      "Because JSON has no way to say \"this is a list of one\". A tag that appears once is emitted as an object, and only the second occurrence turns the key into an array. If your consumer needs a consistent array, normalise it after conversion, or check Array.isArray before mapping.",
    ],
    [
      "What is the #text key for?",
      "Mixed content. When an element has both text and child elements — or has attributes plus text — the text cannot be the value of that key, so it is stored under #text. A plain leaf element with no attributes collapses to its string value instead.",
    ],
    [
      "Does this handle CDATA and entities?",
      "Yes. CDATA sections are read verbatim, and the five XML 1.0 predefined entities (&amp; &lt; &gt; &quot; &apos;) plus decimal and hexadecimal character references such as &#65; and &#x41; are decoded. Comments, processing instructions and the DOCTYPE declaration are skipped.",
    ],
  ],
};

export default seo;
