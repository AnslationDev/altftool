const seo = {
  title: "Online HTML, CSS & JavaScript Compiler with Live",
  metaDescription:
    "Write HTML, CSS and JS in a Monaco editor; the sandboxed preview re-renders 600 ms after you stop typing. Console panel included, export as a .zip.",
  steps: [
    "Write in the HTML, CSS and JavaScript tabs of the Monaco editor, or open Templates to start from one of the built-in starter layouts.",
    "Leave Auto on and the sandboxed preview re-renders 600 ms after you stop typing, or press Run (Ctrl+S); console.log, warnings and uncaught errors land in the Console panel.",
    "Choose Download → Download .zip to save index.html, style.css and script.js as one archive named after the project.",
  ],
  intro:
    "The Online Code Compiler is a three-pane HTML, CSS and JavaScript playground: you write in a Monaco editor, and 600 ms after you stop typing the three files are assembled into one document and rendered in a sandboxed iframe. A console panel mirrors every console.log, warning and error from the preview, including uncaught exceptions with line and column numbers and unhandled promise rejections. Projects save to your browser and export as a ZIP containing index.html, style.css and script.js ready to open anywhere.",
  useCases: [
    "You want to test whether a CSS grid idea actually behaves the way you think before touching the real codebase, and you need to see the change as you type rather than after a rebuild.",
    "You are teaching or learning front-end basics on a machine where you cannot install Node or a code editor, and you need a working console for debugging exercises.",
    "Someone sent you a snippet that throws an error, and you want to paste it into an isolated page and read the exact line number where it fails.",
  ],
  benefits: [
    ["A real console, not just a preview", "console.log, info, warn and error from the iframe are forwarded to a panel in the page, along with uncaught errors carrying line:column and unhandled promise rejections."],
    ["Monaco, the editor from VS Code", "You get the same syntax highlighting, bracket matching, minimap and word-wrap controls, with adjustable font size and tab width."],
    ["Leaves with a runnable project", "Export downloads a ZIP with index.html, style.css and script.js already linked, so the thing you prototyped runs by double-clicking a file."],
  ],
  faqs: [
    [
      "Does the preview update automatically as I type?",
      "Yes — auto-run is on by default with a 600 ms debounce, so the preview re-renders shortly after you stop typing. You can change the delay or turn auto-run off entirely in settings and trigger runs manually instead.",
    ],
    [
      "Is the code I run isolated from the rest of the page?",
      "Yes. The preview runs in an iframe with a restrictive sandbox that permits scripts, modals, popups and presentation mode but withholds same-origin access, so preview code cannot read the surrounding page or its storage.",
    ],
    [
      "Where is my work saved and will I lose it?",
      "Autosave writes the current HTML, CSS and JS to your browser's localStorage, and named projects are stored there too — nothing is uploaded. Because it is browser storage, clearing site data or using a different browser loses it, so export a ZIP for anything you want to keep.",
    ],
    [
      "Can I use React, TypeScript or npm packages?",
      "Not directly — this compiles plain HTML, CSS and JavaScript with no build step or bundler. You can still pull in a library over a CDN with a script tag in the HTML pane, and there are 13 built-in starting templates covering layouts such as landing pages, dashboards, navbars, modals and responsive grids.",
    ],
  ],
};

export default seo;
