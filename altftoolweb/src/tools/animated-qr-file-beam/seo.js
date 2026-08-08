const seo = {
  title: "Animated QR File Beam: Send a File Across an Air Gap",
  metaDescription:
    "Split a file up to 256 KiB into numbered QR frames, loop them on screen, and rebuild it on another device's camera. CRC-32 verified, no server, no upload.",
  steps: [
    "On the \"Send a file\" tab, choose \"Pick a small file\" (up to 256 KiB) or the text pad, then set the QR version, error-correction level and frames per second.",
    "Press \"Play loop\" to cycle the numbered QFB1 frames on screen, then on the receiving device open \"Receive a file\" and press \"Start camera\".",
    "Watch \"Frames captured\" fill; once every numbered frame is in and the rebuilt CRC-32 matches the declared one, press \"Save file\".",
  ],
  intro:
    "This tool carries a small file across an air gap using nothing but a screen and a camera. It chops the file into fixed-size chunks, Base64-encodes each chunk into a numbered frame of the form QFB1|fileId|seq|total|data, and plays those frames as a QR loop with a header frame — file name, byte count and CRC-32 — repeated throughout so a late-joining receiver still learns what it is catching. On the receiving device the same page reads frames with the camera, ignores duplicates, accepts them out of order, and rebuilds the file only when every sequence number is present and the CRC-32 matches. Frame sizing is not guesswork: it uses the ISO/IEC 18004 byte-mode capacity table, so a version-12 M symbol is treated as exactly 287 bytes and the payload per frame is the largest multiple of 3 whose Base64 form still fits after the frame header. There is no upload, no server, no pairing code and no network request of any kind.",
  useCases: [
    "Move a WireGuard config, SSH key or recovery seed from a laptop to a phone that is deliberately kept off the network.",
    "Get a short config file off an air-gapped or camera-only machine in a lab where USB ports are blocked.",
    "Hand a colleague a small file across a desk when both devices are on captive-portal Wi-Fi that blocks AirDrop and local sharing.",
  ],
  benefits: [
    [
      "Real frames, not a mock-up",
      "Every frame shown is a scannable QR whose text is the actual chunk; the same page can read them back and reproduce the file byte for byte.",
    ],
    [
      "Verified, not assumed",
      "The header frame carries a CRC-32 of the original bytes, and the receiver reports match or mismatch rather than silently saving a corrupt file.",
    ],
    [
      "Honest capacity maths",
      "Frame counts and loop times come from the published QR byte-mode capacity table for the chosen version and error-correction level, not from an estimate.",
    ],
  ],
  faqs: [
    [
      "How much data fits in one QR frame?",
      "A version-12 symbol at error-correction level M holds 287 bytes of byte-mode data. After the 22-byte frame header and the 4:3 expansion of Base64 that leaves 198 raw file bytes per frame. Version 40 at level L is the ceiling at 2,953 bytes per symbol.",
    ],
    [
      "What size of file is realistic?",
      "This tool caps beaming at 256 KiB and is happiest well under that. At 198 bytes per frame and 5 frames a second, a 4 KiB file is a 21-frame loop of about four seconds, while 256 KiB would be over 1,300 frames and several minutes of steady scanning.",
    ],
    [
      "Is the transfer encrypted?",
      "No. The frames are plain Base64 inside a QR symbol, so anyone who can photograph the screen can reconstruct the file. Encrypt the file first — with age, GPG or a password-protected archive — if the content is sensitive.",
    ],
    [
      "What does this tool not do?",
      "It never contacts a server, so there is no cloud relay, no link to share and no history. Camera scanning needs browser camera permission; if that is refused or unavailable you can still paste decoded frame text from any QR scanner app and the file is rebuilt from those lines instead.",
    ],
  ],
};

export default seo;
