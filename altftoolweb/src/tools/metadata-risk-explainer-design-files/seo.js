const seo = {
  intro:
    "Design File Metadata Explainer shows how client work escapes through the export rather than the presentation: layer and artboard names become SVG element ids and PDF layer names, hidden layers and masked image data stay in the file, linked assets record the full path to your client folders, and the XMP packet on a Photoshop export can list the document ancestry of everything pasted into it. Pick a hand-off method — source file, live link, SVG, raster, PDF or a flattened and stripped export — and see which of those signals still reaches the recipient. For studios and freelancers juggling several clients out of one folder.",
  useCases: [
    "Check an SVG logo pack before sending it, when the layer names still carry the internal project codename.",
    "Work out why a client can see a rejected concept that was only switched off, not deleted.",
    "Decide between sharing a live design link and duplicating the page into its own file for a client review.",
    "Audit a print PDF for slug information, job numbers and swatch names before it leaves the studio.",
  ],
  benefits: [
    [
      "Export-format aware",
      "SVG, raster, PDF and live links each leak a different set of signals, and the tool separates them.",
    ],
    [
      "Covers XMP ancestry",
      "Flags photoshop:DocumentAncestors, the field that quietly lists the other files an asset came from.",
    ],
    [
      "Hand-off hygiene",
      "Every item names the concrete step — delete, detach, embed, outline or strip — that removes it.",
    ],
  ],
  faqs: [
    [
      "Do layer names show up in an exported SVG?",
      "Yes. Vector exporters turn layer and group names into element ids or class names, so an SVG is readable as text in any editor. Rename layers in the hand-off copy or use an export preset that generates neutral ids.",
    ],
    [
      "What is photoshop:DocumentAncestors and why does it matter?",
      "It is an XMP field that records an identifier for every document an element was pasted from. On a shared export it can list the other client files, mockups and stock comps used to assemble the artwork, which is why it has caused real leaks. Strip XMP before delivery.",
    ],
    [
      "Does sharing a design link only share the frame I linked to?",
      "Usually not. Link permissions are normally granted at file level, so the recipient can open every page in that file plus the version history and comment threads. Duplicate the relevant page into a separate file and share that.",
    ],
    [
      "Does exporting a PNG remove everything sensitive?",
      "It removes structure — layers, hidden objects, link paths — because the artwork is flattened to pixels. It does not remove the metadata packet the exporter writes, which can carry your name, the creator tool, timestamps and document ancestry, so run a metadata stripper on the final PNG as well.",
    ],
  ],
};

export default seo;
