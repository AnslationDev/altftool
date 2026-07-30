const seo = {
  intro:
    "This is a drag-and-drop flowchart canvas that builds diagrams from the eight standard flowchart symbols — terminator, process, decision, input/output, database, document, subprocess and comment — and connects them with directional arrows. Drag a shape from the palette onto the canvas, double-click any node to rename it, then drag from one node's handle to another to draw a smoothstep arrow between them. It is for anyone who needs to map a process visually without learning diagramming software: the canvas ships with a worked example you can study before you start your own.",
  useCases: [
    "You are documenting an approval process for a handover doc and need to show where a request branches on a yes/no decision before it reaches two different owners",
    "You are explaining an app's signup flow to a designer and want boxes for each screen, a diamond where the email check fails, and a cylinder for where the record is written",
    "You are preparing a training walkthrough and need a clean picture of the steps, including which ones are subprocesses documented elsewhere",
  ],
  benefits: [
    ["Correct shape for each meaning", "Decisions are diamonds, input/output is a parallelogram, storage is a cylinder — the conventional flowchart vocabulary rather than a page of identical boxes."],
    ["Decision nodes branch three ways", "A diamond exposes outgoing connection points on its bottom, left and right edges, so a yes/no/else split routes cleanly without crossing lines."],
    ["Rename in place, no dialogs", "Double-click a node, type the label, press Enter — editing happens on the canvas so you keep your place in the diagram."],
  ],
  faqs: [
    [
      "What do the different flowchart shapes mean?",
      "Each shape carries a fixed meaning: an oval is the start or end point, a rectangle is a process step, a diamond is a decision that splits the path, a parallelogram is input or output, a cylinder is a database or stored data, and a shape with a wavy bottom edge is a printed or generated document. This tool provides all of those plus a subprocess block for a step detailed in its own chart and a comment box for annotations.",
    ],
    [
      "How do I connect two boxes together?",
      "Drag from the small circular handle on the edge of one node to a handle on another, and an arrow is drawn between them. Connections come out as smoothstep lines with a closed arrowhead so direction is unambiguous, and the diamond decision node offers three separate outgoing handles for branching.",
    ],
    [
      "Do I need an account or any software installed?",
      "No. The canvas runs in the browser tab with nothing to install and no sign-in, and the diagram you build stays in the page while you work on it. Because there is no server-side project storage, treat a session as temporary and rebuild or capture the chart if you need it later.",
    ],
    [
      "Can I use this for a swimlane or UML diagram?",
      "Not directly — this is a classic flowchart editor, so it gives you the eight process symbols and arrows rather than lanes, actors or UML class notation. You can approximate a swimlane by grouping nodes visually, but for formal UML you want a notation-specific tool.",
    ],
  ],
};

export default seo;
