const seo = {
  intro:
    "This converter turns a block of HTML into a JavaScript template literal — escaping backticks, backslashes and ${ so the markup survives, rewriting {{ mustache }} placeholders into ${escapeHtml(variableName)}, and emitting the variable declarations, an escapeHtml helper and the innerHTML mount code alongside it. Run it the other way and it pulls the template literal back out of a const html = `…`, .innerHTML = `…` or return `…` assignment and turns every ${expression} back into a readable {{ placeholder }}. It is for front-end developers moving markup between a static file and generated JS without hand-escaping every character.",
  useCases: [
    "You have a designer's static HTML page and need it as a JS render function, with the dynamic bits already wired to variables instead of retyping the markup inside backticks",
    "Reading a legacy widget where the whole UI is buried in one giant template literal, and you want the markup back as plain HTML you can open in a browser and edit",
    "Turning a Mustache or Handlebars-style partial into vanilla JS, so {{user.name}} becomes an escaped ${escapeHtml(userName)} rather than an unguarded interpolation",
  ],
  benefits: [
    ["Escaping is handled in both directions", "Backticks, backslashes and ${ are escaped going into the literal and decoded coming back out, which is exactly the part that breaks when done by hand."],
    ["Output is XSS-safe by default", "Placeholders are wrapped in a generated escapeHtml helper that encodes &, <, >, \" and ', instead of dropping raw values straight into innerHTML."],
    ["Every transform is a toggle", "Strip script tags, add the mount code, route root-relative asset paths through a basePath variable or convert JS comments to HTML notes — each is independently switchable."],
  ],
  faqs: [
    [
      "How do I convert an HTML file into a JavaScript string?",
      "Paste it and switch to HTML to JS: the markup is wrapped in a template literal as const html = `…`, with backticks, backslashes and ${ escaped so the string stays valid. You also get the mount snippet that assigns it to document.querySelector(\"#app\").innerHTML.",
    ],
    [
      "What happens to {{ placeholders }} in my HTML?",
      "Each {{ key }} becomes ${escapeHtml(key)} with the key camel-cased into a valid identifier — {{user.name}} turns into ${escapeHtml(userName)} — and a const declaration is generated for every unique placeholder so the output runs as-is. Going the other way, ${escapeHtml(userName)} converts back to {{ user.name }}.",
    ],
    [
      "Why were my script tags removed?",
      "The strip script tags option is on by default, because inline <script> blocks inside a template string are a common source of broken quoting and are re-executed on every innerHTML assignment. Turn the option off if you need them preserved, and the count of removed blocks is reported in the warnings either way.",
    ],
    [
      "How does JS to HTML find the markup in my file?",
      "It looks for the first template literal assigned to a variable named html, markup or template, then for a .innerHTML = `…` assignment, then for a return `…`. If none of those match, the whole input is treated as markup and a warning says so — so wrap the markup in one of those three forms for a clean extraction.",
    ],
  ],
};

export default seo;
