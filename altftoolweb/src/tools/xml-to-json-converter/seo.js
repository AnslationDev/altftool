const seo = {
  intro:
    "There is no single correct JSON representation of XML, which is why fast-xml-parser, xml2js and xml-js all hand you a different object for the same file. This converter parses XML 1.0 once and then emits it in whichever of five documented conventions you choose — fast-xml-parser's @_ prefix and #text, xml2js's $ and _ with explicitArray, xml-js compact's _attributes and _text, the BadgerFish convention's @ and $, or plain keys with no markers at all. It is for developers who need converted output to drop straight into code already written against one of those shapes.",
  useCases: [
    "Produce fixture JSON that matches what xml2js returns in your Node test suite, without running the parser.",
    "Check how an XML payload will look after fast-xml-parser before wiring it into a frontend.",
    "Force a tag that sometimes appears once and sometimes many times to always be an array, so mapping code stops branching.",
  ],
  benefits: [
    ["Five real conventions", "Each preset matches the documented default of its library, so you get the same keys and nesting your code already handles."],
    ["Force-array list", "Name the tags that must always be arrays and single occurrences stop collapsing into a lone object."],
    ["Warns before it loses data", "Plain mode flags any attribute whose name clashes with a sibling element, instead of silently merging them."],
  ],
  faqs: [
    [
      "Which JSON convention should I pick?",
      "Match whatever consumes the output. If your Node service already uses xml2js with explicitArray, pick xml2js so every child is an array under $ and _. For a browser app using fast-xml-parser, pick its default with @_ and #text. Choose Plain only when nothing downstream depends on the attribute-versus-element distinction.",
    ],
    [
      "What is the BadgerFish convention?",
      "A 2007 XML-to-JSON mapping that prefixes every attribute with @ and stores element text under a $ key — so <alice charlie=\"1\">bob</alice> becomes {\"alice\":{\"@charlie\":\"1\",\"$\":\"bob\"}}. It never collapses an element to a bare string, which makes the shape uniform but verbose.",
    ],
    [
      "Why does a tag that appears once not become an array?",
      "Because JSON cannot express \"a list that happens to have one item\" from XML alone — the second occurrence is the first evidence of a list. Add that tag name to the force-array box, or use the xml2js preset, which wraps every child in an array regardless.",
    ],
    [
      "Is anything lost in the conversion?",
      "In Plain mode, yes: attributes become ordinary keys, so an attribute and a child element with the same name collide, and the tool warns you when that happens. The other four conventions are lossless for elements, attributes and text; comments, processing instructions and the DOCTYPE declaration are dropped in every mode.",
    ],
  ],
};

export default seo;
