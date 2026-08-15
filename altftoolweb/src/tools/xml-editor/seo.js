const seo = {
  title: "XML Formatter and Minifier with Line-Number",
  metaDescription:
    "Pretty-print or minify XML in your browser. A mismatched tag is named with its line number, and comments, CDATA and the declaration survive.",
  intro:
    "This XML editor parses a document against the XML 1.0 well-formedness rules — every open tag closed by a matching close tag, exactly one root element, no text outside that root — and then either pretty-prints it with the indent you choose or strips it back to a single line. Comments, CDATA sections, the XML declaration, processing instructions and DOCTYPE internal subsets all survive the round trip. It is for developers reading an API response, a feed or a config file that arrived as one unreadable line.",
  useCases: [
    "Make a one-line SOAP response or RSS feed readable before hunting for the field you need",
    "Find which line a mismatched closing tag is on when a parser only reports \"unexpected end of input\"",
    "Minify an XML config before embedding it in a string literal or a shell script",
  ],
  benefits: [
    ["Errors with line numbers", "A mismatched or unclosed tag is named explicitly, with the line it was found on."],
    ["Structure at a glance", "Element count, unique tag names, attribute count and maximum nesting depth for the whole document."],
    ["Nothing is uploaded", "The parser is plain JavaScript running in your tab; the document never reaches a server."],
  ],
  faqs: [
    [
      "What makes an XML document well-formed?",
      "Four things: exactly one root element, every open tag matched by a close tag of the same name, correctly nested elements, and quoted attribute values. XML is case-sensitive, so <Book> and </book> do not match. Well-formed is not the same as valid — validity additionally means conforming to a DTD or XSD, which this tool does not check.",
    ],
    [
      "Why does my XML say \"found 2 root elements\"?",
      "Because XML 1.0 allows only one top-level element, unlike HTML. Two sibling elements at the top of a file — a common result of concatenating two responses — is a fatal error. The fix is to wrap them in a single container element.",
    ],
    [
      "Will minifying break my document?",
      "Only if whitespace between elements is meaningful to you, which is rare in data documents but common in mixed-content documents such as XHTML. Minifying here removes whitespace-only text nodes between elements and leaves text inside elements and CDATA sections untouched, so the parsed data is identical.",
    ],
    [
      "What is a CDATA section for?",
      "It lets you include characters that would otherwise have to be escaped — most often < and & — without entity references. Everything between <![CDATA[ and ]]> is passed through as literal text, so a snippet of code or HTML can sit inside an element unaltered. This editor preserves CDATA blocks exactly, in both formatting and minifying.",
    ],
  ],
};

export default seo;
