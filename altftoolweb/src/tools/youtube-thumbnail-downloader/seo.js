const seo = {
  title: "YouTube Thumbnail Downloader — All 4 Sizes with URLs",
  metaDescription:
    "Paste any YouTube link — watch, youtu.be, Shorts or embed — to preview all four thumbnail sizes with direct img.youtube.com image URLs.",
  steps: [
    "Paste a YouTube link — watch, youtu.be, Shorts or embed URL — or a bare 11-character video ID into the 'YouTube URL or video ID' box.",
    "Confirm the detected ID on the 'Video ID:' line; the four previews (Max resolution, HD, Standard, Medium) load live from img.youtube.com.",
    "On any size card, click 'Copy' for the direct image URL or 'Open' to load the raw thumbnail JPG in a new tab and save it.",
  ],
  intro:
    "The YouTube Thumbnail Downloader pulls the 11-character video ID out of any YouTube link and shows you the four thumbnail sizes YouTube stores for it — maxresdefault, hqdefault, sddefault and mqdefault — as live previews with copyable direct image URLs. It accepts watch, youtu.be, Shorts and embed links, or a bare video ID. Each result is the image straight from img.youtube.com, so what you preview is exactly what you copy or open.",
  useCases: [
    "Grab the exact thumbnail a competitor used so you can study the framing and text placement before designing your own.",
    "Recover the high-resolution artwork for one of your own uploads when the original PSD or export is gone.",
    "Fetch a clean 1280x720 still to embed in a blog post, newsletter or slide deck that links back to the video.",
  ],
  benefits: [
    [
      "Handles every YouTube link shape",
      "Watch URLs, youtu.be short links, /shorts/ and /embed/ paths and raw 11-character IDs all resolve, and the detected ID is shown so you can confirm it matched the right video.",
    ],
    [
      "All four sizes side by side",
      "Max resolution, HD, standard and medium render together as live previews, so you can see immediately which sizes the video actually has before you commit to one.",
    ],
    [
      "Copy the URL or open the file",
      "Every card gives a one-click copy of the direct image address for pasting into a CMS or CSS, plus an open button that loads the raw JPEG in a new tab to save.",
    ],
  ],
  faqs: [
    [
      "What sizes are YouTube thumbnails available in?",
      "YouTube serves four standard stills per video: maxresdefault at 1280x720, sddefault at 640x480, hqdefault at 480x360 and mqdefault at 320x180. All four are shown here as previews with their direct URLs.",
    ],
    [
      "Why is the max resolution thumbnail blank for some videos?",
      "Because maxresdefault only exists when the video was uploaded at 720p or higher. Older or low-resolution uploads simply have no 1280x720 file, so that preview stays empty while HD, standard and medium still load.",
    ],
    [
      "Can I get the thumbnail from a YouTube Shorts link?",
      "Yes. A /shorts/ URL is matched by the same pattern as a normal watch link, and the 11-character ID is extracted from it. The thumbnail returned is the one YouTube generated for that video.",
    ],
    [
      "Can I use someone else's YouTube thumbnail?",
      "Only with care — the thumbnail is part of the uploader's copyrighted work, and this tool retrieves a publicly served image rather than granting you any rights to it. Reuse is generally safe for reference, commentary or linking back to the source, but check with the rights holder before using one commercially.",
    ],
  ],
};

export default seo;
