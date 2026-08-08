const seo = {
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
      "Max resolution, standard, high quality and medium render together as live previews, so you can see immediately which sizes the video actually has before you commit to one.",
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
      "Why does the max resolution thumbnail look wrong for some videos?",
      "Because maxresdefault only exists when the video was uploaded at 720p or higher. Older or low-resolution uploads don't have a 1280x720 file, so YouTube serves a small, low-resolution placeholder image at that URL instead of leaving it empty — it will look blurry or pixelated when stretched to fill the preview card, while standard, high quality and medium still load normally.",
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
