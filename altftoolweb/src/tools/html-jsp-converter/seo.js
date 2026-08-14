const seo = {
  title: "HTML to JSP Converter with EL and Context Path",
  metaDescription:
    "Turn HTML into JSP: {{ }} becomes ${...} EL, root-relative src and href gain ${pageContext.request.contextPath}, plus page and JSTL taglib directives.",
  intro:
    "This converter takes plain HTML and produces a JSP page — turning {{ placeholders }} into ${...} Expression Language, rewriting root-relative src, href and action attributes to ${pageContext.request.contextPath}/…, and prepending the page and JSTL core taglib directives when they are missing. Reversed, it strips the <%@ %> directives, rewrites <%= %> expressions and EL into {{ }} tokens, and demotes scriptlets, jsp:include and c:if / c:forEach blocks into HTML comments so the markup opens in a browser. It is aimed at Java web developers moving a static template into a Servlet/JSP app, or pulling a JSP back out for design work.",
  useCases: [
    "A front-end handed you a finished static page and you need it as a JSP in /WEB-INF/views, with asset paths that survive being deployed under a context path instead of at the root",
    "Handing a legacy JSP to a designer who has no Tomcat, by converting it to browsable HTML where the dynamic regions are visible as comments and {{ }} tokens",
    "Auditing an old page for scriptlets, since JSP→HTML lists every <% ... %> block it converted so you can see how much Java logic is sitting in the view layer",
  ],
  benefits: [
    ["Context path handled correctly", "Only genuinely root-relative paths are rewritten — http(s):, //, mailto:, tel:, data:, javascript: and # anchors are left exactly as written."],
    ["Nothing dynamic is silently deleted", "Scriptlets, jsp:include and JSTL tags become labelled HTML comments on the way back, so the logic that was there is still visible in the output."],
    ["Directives added only when absent", "The page and taglib directives are inserted only if the source has no <%@ page %> or c-prefixed taglib already, so re-running the conversion does not duplicate them."],
  ],
  faqs: [
    [
      "How do I convert an HTML page to JSP?",
      "Paste the HTML and run HTML to JSP. Placeholders such as {{user.name}} become ${user.name}, root-relative asset paths gain the ${pageContext.request.contextPath} prefix, and two directives are added at the top: the page directive with contentType text/html; charset=UTF-8 and the JSTL core taglib bound to prefix c.",
    ],
    [
      "Why does my href get ${pageContext.request.contextPath} in front of it?",
      "Because a JSP deployed to a named context serves under /myapp, so a link written as /assets/css/app.css resolves to the wrong place. Prefixing with ${pageContext.request.contextPath} makes it correct whether the app runs at the root or under a context. Absolute URLs and mailto:, tel:, data: and # links are skipped.",
    ],
    [
      "What happens to JSP scriptlets when converting back to HTML?",
      "They are not executed or translated — each <% ... %> block becomes an HTML comment reading 'JSP scriptlet removed:' followed by the collapsed code, and the count is reported as a warning. The same applies to jsp:include and to c:if, c:forEach and c:choose blocks, which become paired comments so you can see where each region began and ended.",
    ],
    [
      "Is the converted JSP ready to deploy?",
      "It is a starting point, not a finished page. The tool rewrites markup and directives, but it cannot know which beans your EL expressions resolve against, whether JSTL is actually on the classpath, or that inline <script> blocks are safe — a warning is raised when script tags are present. Compile and run it in your container before shipping.",
    ],
  ],
};

export default seo;
