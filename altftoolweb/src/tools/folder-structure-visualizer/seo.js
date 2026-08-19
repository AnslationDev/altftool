const seo = {
  title: "Folder Structure Visualizer: Tree, Sizes, Stats",
  metaDescription:
    "Turn a picked folder or a pasted ASCII, indented or JSON tree into a searchable tree with rolled-up folder sizes, max depth and top extensions.",
  steps: [
    "Under Option 1 pick a directory with the folder picker, or paste a box-drawing tree, indented list or JSON under Option 2.",
    "Press Load structure, then search, filter to Files or Folders, and expand, collapse, zoom or pan the resulting tree.",
    "Read the stats panel for Files, Folders, Total size, Max depth and the eight most common extensions by count.",
  ],
  intro:
    "This visualizer turns a directory into a navigable tree, either from a folder you pick with the browser's directory picker or from a structure you paste as an ASCII box-drawing tree, an indented list or JSON. It rebuilds the hierarchy from the paths, sorts folders before files alphabetically, rolls file sizes up into their parent folders, and reports totals for files, folders, combined size, deepest nesting level and the eight most common extensions. Nothing is uploaded — the file picker reads names, paths and sizes locally and never opens the contents.",
  useCases: [
    "You are reviewing a repository someone sent you and want to see the shape of it — how deep it nests, which extension dominates — before opening a single file",
    "A README has an ASCII tree in it and you want it as something you can expand, collapse, search and filter instead of a wall of box-drawing characters",
    "You are documenting a proposed folder layout, so you type it as an indented list, paste it in, and check the nesting reads the way you intended",
  ],
  benefits: [
    ["Accepts four input shapes", "Directory picker, box-drawing ASCII trees, plain indented lists and JSON all parse into the same tree model, so you are not stuck reformatting first."],
    ["Rolls sizes up the hierarchy", "Each folder's size is the sum of everything beneath it, which is what tells you where the weight in a project actually sits."],
    ["Search auto-expands the matches", "Typing a query opens exactly the branches containing hits, so a match ten levels deep surfaces without expanding the whole tree."],
  ],
  faqs: [
    [
      "Are my files uploaded when I pick a folder?",
      "No. The directory input reads only each file's relative path and byte size in the browser; file contents are never opened and nothing is sent to a server. That is why it works on private or client repositories.",
    ],
    [
      "What paste formats does it understand?",
      "Three: box-drawing ASCII trees using │ ├ └ ─, plain lists nested by indentation, and JSON — either an array of paths, an array of objects with name and children, or a nested object map. Anything a folder in a README already looks like will usually parse as-is.",
    ],
    [
      "What statistics does it report?",
      "Total files, total folders, combined size, maximum depth, and the top eight file extensions by count. Folder sizes are computed bottom-up, so a folder's figure is the sum of every file inside it at any depth.",
    ],
    [
      "How do zoom and keyboard navigation work?",
      "Zoom runs from 0.4x to 2.5x in 0.2 steps, using the buttons or Ctrl/Cmd plus scroll wheel, and you can drag to pan. The tree itself is keyboard-navigable: Arrow Up and Down move between visible rows, Right and Left expand and collapse a folder, and Home and End jump to the first and last row.",
    ],
  ],
};

export default seo;
