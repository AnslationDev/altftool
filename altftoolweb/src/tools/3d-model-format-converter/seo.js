const seo = {
  intro:
    "This tool normalises a text OBJ mesh in the browser: it parses every v vertex line and every f face line, strips the texture and normal index groups so each face token keeps only its vertex index, and writes the result back out as a clean OBJ you can download. Alongside the file it reports the mesh statistics that matter before an import — total vertices, total faces, duplicate vertices matched to eight decimal places, and degenerate faces with fewer than three distinct indices. The file never leaves your machine; parsing and rebuilding happen in the page.",
  useCases: [
    "An OBJ exported from one package fails to load in another because of its f v/vt/vn index groups, and you need a plain vertex-index-only version",
    "You are handed a model and want its real vertex and face counts before deciding whether it is light enough to drop into a scene or a print job",
    "A mesh imports with visible artefacts and you want to check whether it carries collapsed faces or doubled vertices before spending time debugging the importer",
  ],
  benefits: [
    ["Flattens the face index syntax", "Faces written as v/vt/vn are rewritten to bare vertex indices, which is the form the strictest OBJ readers accept."],
    ["Statistics come with the conversion", "The same pass reports vertex and face totals, duplicate vertices and degenerate faces, so you see what you are converting."],
    ["Deterministic text output", "The rebuilt file is plain ASCII OBJ — all vertices, then all faces — so you can diff it or hand-edit it afterwards."],
  ],
  faqs: [
    [
      "Which formats can it convert between?",
      "Text OBJ in, text OBJ out. It matches lines starting with v and f, so a binary STL, glTF, GLB or FBX will parse to zero vertices and report that no OBJ geometry was found. Export to ASCII OBJ from your modelling tool first.",
    ],
    [
      "Will my textures and materials survive the conversion?",
      "No. The normalised output keeps vertex positions and face connectivity only — UV coordinates, vertex normals, smoothing groups, object and group names and the .mtl material reference are all dropped. Keep the original file if you need any of those; this output is for geometry.",
    ],
    [
      "What does the duplicate vertex count mean?",
      "It is the number of vertex lines whose x, y and z values match another line once rounded to eight decimal places. A high count usually means the exporter split vertices per face rather than welding shared corners, which is expected for render-ready meshes but worth merging before sculpting or printing.",
    ],
    [
      "Is my model uploaded anywhere?",
      "No. The file is read with the browser's own file reader, parsed in the page, and the rebuilt OBJ is created as a local blob download. Nothing is transmitted, which is the point if the asset is client work or unreleased.",
    ],
  ],
};

export default seo;
