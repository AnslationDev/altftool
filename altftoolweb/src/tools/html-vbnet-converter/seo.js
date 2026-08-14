const seo = {
  title: "HTML to ASP.NET VB Converter (and Back to HTML)",
  metaDescription:
    "Turn {{ placeholders }} into Server.HtmlEncode expressions with a Page directive and Protected fields — or strip the server blocks back to plain HTML.",
  steps: [
    "Pick a direction — HTML to VB.NET or VB.NET to HTML — then paste into the Source code box, press Upload code to load a .html, .htm, .aspx, .ascx, .vb or .txt file, or press Load sample.",
    "Toggle the options for that direction: Page directive, Server block, Base-path assets and Safe expressions going to VB.NET; Strip server code, Expression placeholders, Logic as comments and Decode strings coming back to HTML.",
    "Read Generated VB.NET or Generated HTML in the output pane, then press Copy, or Download to save converted.aspx or converted.html; Swap feeds the output back in as the new input.",
  ],
  intro:
    "This converter moves markup between plain HTML and ASP.NET Web Forms with VB: HTML to VB.NET rewrites every {{ placeholder }} as <%= Server.HtmlEncode(name) %>, adds a <%@ Page Language=\"VB\" AutoEventWireup=\"false\" %> directive and a <script runat=\"server\"> block declaring each value as Protected name As String, and prefixes root-relative src/href/action paths with <%= basePath %>. VB.NET to HTML runs the same mapping backwards, stripping directives and server blocks, decoding Response.Write string literals, and turning encoded expressions back into {{ }} placeholders. It is for developers maintaining .aspx pages who want to edit the markup as ordinary HTML.",
  useCases: [
    "You need to hand an .aspx page to a designer and want the Server.HtmlEncode expressions replaced by readable {{ user.name }} placeholders first",
    "You have an approved HTML mockup and need it turned into a Web Forms page with the variables already declared as Protected fields",
    "You are rehosting an ASP.NET app under a virtual directory and want every /assets/... reference routed through <%= basePath %> instead of the site root",
  ],
  benefits: [
    ["Output is HTML-encoded by default", "Placeholders become Server.HtmlEncode(...) rather than a raw <%= name %>, so injected values cannot break out of the markup."],
    ["VB string quoting handled correctly", "Declared defaults escape a double quote as two double quotes, which is VB's rule, and Response.Write literals are decoded the same way on the return trip."],
    ["Server logic is preserved as comments", "Non-expression <% ... %> blocks such as If/End If come back as <!-- VB.NET logic removed: ... --> and are counted in the warnings instead of vanishing."],
  ],
  faqs: [
    [
      "What does the generated ASP.NET page look like?",
      "It opens with <%@ Page Language=\"VB\" AutoEventWireup=\"false\" %>, followed by a <script runat=\"server\"> block holding one Protected name As String = \"...\" line per placeholder, then your markup with <%= Server.HtmlEncode(name) %> in place of each {{ }}. Both the directive and the server block are optional toggles.",
    ],
    [
      "Which VB.NET expressions convert back to placeholders?",
      "Three forms: <%= Server.HtmlEncode(x) %>, <%= HttpUtility.HtmlEncode(x) %> and the bare <%= x %>. Each becomes {{ x }}, with underscores mapped back to dots so user_name reads as {{ user.name }}. References to basePath are removed rather than turned into placeholders, since they only existed to prefix paths.",
    ],
    [
      "Why did my links get a basePath prefix?",
      "Because they began with a single / , which only resolves correctly when the app sits at the domain root. Only src, href and action values starting with / are rewritten; //, https:, mailto:, tel:, data:, javascript:, # and values already containing <%= are left untouched, and basePath is declared as an empty string so nothing changes until you set it.",
    ],
    [
      "Does it convert VB If statements and loops?",
      "No. Only output expressions have an HTML equivalent. Control flow inside <% ... %> — If/Then, For Each, End If — is turned into an HTML comment recording the original code, and the number of blocks converted is reported as a warning so you can port them by hand.",
    ],
  ],
};

export default seo;
