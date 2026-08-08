const seo = {
  title: "Webcam Background Privacy Scanner: Freeze & Cover",
  metaDescription:
    "Freeze a webcam frame, let the contrast scan flag documents and screens behind you, drop opaque covers, and download webcam-background-covered.png.",
  steps: [
    "Press Start camera preview to grant the browser camera permission, then Freeze frame — the stream stops and the rest of the work happens on that still image.",
    "Press Suggest regions to run the local contrast scan, which lists candidates with a Heuristic score out of 100, and press Add cover on the ones you accept. Draw privacy zone lets you drag your own rectangle, and Adjust selected zone sets Left, Top, Width and Height as percentages.",
    "Use Show cover preview to confirm nothing sensitive is still visible, then press Download covered PNG. The file saves as webcam-background-covered.png with the zones painted as opaque fills; the uncovered frame is never exported.",
  ],
  intro:
    "Webcam Background Privacy Scanner freezes a single frame from your camera, scores it cell by cell for high-contrast, high-edge patterns — the visual signature of text on paper, whiteboards, screens and labels — and lets you drop opaque rectangles over anything sensitive before exporting a covered PNG. The scan combines edge density, contrast range, light/dark balance and luminance deviation into one confidence score and surfaces the strongest regions as suggestions you review rather than trust. It is for anyone about to go on camera from a room that also contains documents, sticky notes, a second monitor, or a delivery label.",
  useCases: [
    "You are joining a client call from a home office and want to check what the camera actually picks up behind you before the meeting starts, not after someone mentions the parcel on the shelf",
    "You need a profile or team-directory photo taken at your desk, and the whiteboard behind you has a roadmap on it that has to be covered before the picture goes anywhere",
    "A colleague says your last recording showed a sticky note on your monitor bezel, and you want to grab a frame and check the same angle at zoom before the next session",
  ],
  benefits: [
    [
      "The frame is frozen and the camera released first",
      "Analysis and covering happen on a still image with the camera stream stopped, so you can zoom in and take your time instead of scanning a moving preview.",
    ],
    [
      "Suggestions are ranked and reviewable, not auto-applied",
      "Each candidate region carries a confidence percentage and is drawn as a hint; covers only exist where you accept or draw them.",
    ],
    [
      "Opaque covers, not blur",
      "The exported PNG has the marked regions painted over rather than blurred or pixelated, so there is no residual signal for someone to try to reconstruct.",
    ],
  ],
  faqs: [
    [
      "How does it decide which parts of my background are risky?",
      "It divides the frame into square cells — about one ninth of the shorter edge by default, minimum 24 pixels — and scores each on edge density (45%), contrast range (20%), light/dark pixel balance (20%) and luminance spread (15%). A cell is flagged only if the combined score reaches 0.42, its contrast range is at least 0.45 and its edge density is at least 0.08, and the top six flagged cells are shown.",
    ],
    [
      "Will it find every private thing behind me?",
      "No. It looks for high-contrast textured patterns, so it reliably highlights printed text, screens and whiteboards but will miss anything low-contrast — a pale label, a photo of a person, a soft-focus object, or a document lying in shadow. Always review the whole frame yourself; the suggestions narrow where to look, they do not clear the rest.",
    ],
    [
      "Does my camera image get uploaded anywhere?",
      "No. The camera stream is requested through your browser's getUserMedia permission, the frame is drawn to a local canvas, and the covered copy is generated as a PNG blob and downloaded directly. Nothing is sent to a server or stored by the tool, and the original uncovered frame is never exported.",
    ],
    [
      "Can the covered areas be recovered from the exported file?",
      "Not from the exported PNG — the covers are drawn as opaque fills onto the export canvas, so the pixels underneath are replaced rather than obscured, and there is no hidden layer. That is different from blurring or pixelating, which leave a degraded version of the original signal in the file.",
    ],
  ],
};

export default seo;
