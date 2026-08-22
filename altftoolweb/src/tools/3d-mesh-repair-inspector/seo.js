const seo = {
  title: "3D Mesh Inspector for OBJ: Duplicate Vertices",
  steps: [
    "Choose your ASCII OBJ file under \"Local file(s)\" — the parser reads v vertex and f face lines, so a binary STL, glTF or FBX reports that no OBJ vertices were found.",
    "Press \"Run local workbench\" to compare vertex coordinates at eight decimal places and flag faces that reference fewer than three distinct vertices.",
    "Read the Verified result panel: vertex and face totals plus Duplicate vertices and Degenerate faces counts — inspection only, no file is rewritten.",
  ],
  metaDescription:
    "Inspect text OBJ meshes locally for duplicate vertices and degenerate faces, with clear counts and no file rewriting or upload.",
  intro:
    "This inspector reads a text OBJ mesh in the browser and reports the two defects that most often break a slicer or a game import: duplicate vertices and degenerate faces. It parses every v line into an x/y/z coordinate and every f line into its vertex indices, compares coordinates at eight decimal places to find points that occupy the same position twice, and flags any face that references fewer than three distinct vertices. It is read-only — you get counts and a verdict, not a rewritten file.",
  useCases: [
    "A print keeps failing to slice and you want to know before opening Blender whether the OBJ has collapsed triangles or a pile of doubled-up vertices",
    "You exported the same model from two different packages and want to compare their vertex and face counts to see which one welded the seams",
    "A downloaded asset seems heavier than it should be, and you want to check how much of the vertex count is duplicated points sitting on top of each other",
  ],
  benefits: [
    ["Counts duplicates by position, not by index", "Vertices are compared on their coordinates rounded to eight decimals, so points written twice under different indices are caught."],
    ["Names the exact defect", "You get separate figures for duplicate vertices and degenerate faces rather than a single pass/fail score."],
    ["Read-only by design", "Nothing is rewritten or re-exported, so the file you inspect is byte-for-byte the file you keep."],
  ],
  faqs: [
    [
      "What counts as a degenerate face here?",
      "A face whose index list contains fewer than three distinct vertices. That covers a triangle that names the same vertex twice and any face that has collapsed to a line or a point — geometry with zero area, which is what causes slicers and renderers to produce holes or artefacts.",
    ],
    [
      "Does it repair the mesh or just report on it?",
      "It only reports. The inspection returns vertex and face totals plus the duplicate and degenerate counts, and writes no output file. Use the findings to run the matching operation in your modelling tool — merge by distance for duplicates, delete loose or degenerate geometry for zero-area faces.",
    ],
    [
      "Which file formats does it accept?",
      "Text-based OBJ. It matches lines beginning with v for vertices and f for faces, so ASCII OBJ works directly and any format without those lines — binary STL, glTF, FBX, 3MF — will report that no OBJ vertices were found. Export to ASCII OBJ first if your model is in one of those.",
    ],
    [
      "Why does my model show thousands of duplicate vertices?",
      "Usually because the exporter split vertices per face so each triangle carries its own normals or UVs, which is normal for a rendering-ready mesh and harmless. It matters when you are about to sculpt, subdivide or print, since unwelded points leave the surface open — that is when merging by distance is worth doing.",
    ],
  ],
};

export default seo;
