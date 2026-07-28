/**
 * ONE preset table. The spec sheet rendered on the page and the resizer preset
 * that the client tool consumes are both generated from these records, so the
 * published numbers and the tool's target can never drift apart.
 *
 * Every record carries its own provenance:
 *   source.doc      - the document the figures were read out of
 *   source.issued   - the date printed on that document (the notification date)
 *   source.url      - where that document lives
 *   source.confidence
 *      "primary"     figures were extracted from the official PDF text itself
 *      "derived"     the conducting body's block was read from a sibling notice
 *                    of the same cycle (the upload block is boilerplate across
 *                    that body's notices) - the exam's own PDF was not readable
 *      "unconfirmed" only secondary listings were reachable; the number is
 *                    reported as-published elsewhere and flagged on the page
 *
 * SPECS_READ_ON stamps the day the documents were opened. A row that goes stale
 * therefore degrades into a dated fact ("this is what the 21-05-2026 notice
 * said") rather than into a wrong fact.
 */

export const SPECS_READ_ON = "2026-07-28";

/** Re-exported so the table and the tool share one scan-resolution constant. */
export { DEFAULT_SCAN_DPI as DERIVED_DPI } from "../lib/specMath";

const SSC_LIVE_PHOTO_NOTE =
  "SSC does not accept a photo file. The application form captures a live photograph through the webcam or the mobile camera (QR code option), so there is no KB limit and no pixel size to hit. The notice states that capturing a photograph of an already-printed photograph gets the application rejected.";

export const EXAM_SPECS = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    fullName: "Combined Graduate Level Examination, 2026",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC CGL 2026 Notice (F. No. HQ-C11018/1/2026), Instructions + How-to-Apply annexure",
      issued: "2026-05-21",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf",
      confidence: "primary",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto: "Not required. The 2026 notice asks for a live capture only and prints no name/date rule.",
    background: "Plain background, good light, no cap, no mask, no spectacles.",
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 4.0, height: 2.0, unit: "cm" },
        pixels: null,
        notes: [
          "The same notice prints the signature box twice: about 4.0 cm x 2.0 cm in the How-to-Apply annexure and about 6.0 cm x 2.0 cm in the instructions paragraph. The KB range, 10 to 20 KB, is identical in both.",
          "Blurred or miniature signatures are rejected summarily. PwD (VH) candidates may upload a thumb impression instead.",
        ],
      },
    ],
    extras: [],
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    fullName: "Combined Higher Secondary (10+2) Level Examination",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC CGL 2026 Notice - SSC's upload block is common boilerplate across its notices; no CHSL 2026 notice had been published when this was read",
      issued: "2026-05-21",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf",
      confidence: "derived",
      note: "Read from the CGL 2026 notice, not from a CHSL notice. The last CHSL cycle on the SSC notice board when this was read was CHSLE 2025.",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto:
      "Not required. SSC's upload block captures the photograph live inside the form and prints no rule about the candidate's name or the date of the photograph appearing on the image.",
    background: "Plain background, good light, no cap, no mask, no spectacles.",
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 4.0, height: 2.0, unit: "cm" },
        pixels: null,
        notes: ["Blurred or miniature signatures are rejected summarily."],
      },
    ],
    extras: [],
  },
  {
    slug: "ssc-gd-constable",
    name: "SSC GD Constable",
    fullName: "Constable (GD) in CAPFs, SSF, Rifleman (GD) in Assam Rifles and Sepoy in NCB, 2026",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC CGL 2026 Notice - SSC upload block; the GD 2026 notice PDF (74 pages) would not open for text extraction on the day this was read",
      issued: "2026-05-21",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf",
      confidence: "derived",
      note: "The GD 2026 notice exists on the SSC notice board but could not be machine-read on 28 Jul 2026; the figures below are SSC's common upload block taken from the CGL 2026 notice.",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto:
      "Not required. SSC's upload block captures the photograph live inside the form and prints no rule about the candidate's name or the date of the photograph appearing on the image.",
    background: "Plain background, good light, no cap, no mask, no spectacles.",
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 4.0, height: 2.0, unit: "cm" },
        pixels: null,
        notes: ["Blurred or miniature signatures are rejected summarily."],
      },
    ],
    extras: [],
  },
  {
    slug: "ibps-po",
    name: "IBPS PO",
    fullName: "Common Recruitment Process for Probationary Officers / Management Trainees",
    body: "Institute of Banking Personnel Selection (IBPS)",
    portal: "ibps.in",
    source: {
      doc: "IBPS CRP PO/MT-XV detailed advertisement, Annexure: Guidelines for scanning and upload of documents",
      issued: "2025-06-01",
      url: "https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XV.pdf",
      confidence: "unconfirmed",
      note: "ibps.in did not resolve from this machine on 28 Jul 2026, so the PDF text was not extracted. Every figure below is identical to the SBI CRPD scanning block, which was extracted from the SBI advertisement PDF and is shown on the SBI PO page. The issue date shown is the CRP PO/MT-XV cycle month, not a line read off the PDF.",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. The scanning annexure sets background, ink, pixel and DPI rules only; it prints no line asking for the candidate's name or the date of the photograph on the image.",
    background: "Light-coloured, preferably white background. No caps, hats or dark glasses; religious headwear must not cover the face.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 200, height: 230 },
        physical: null,
        notes: ["Recent passport-style colour photograph."],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 20,
        pixels: { width: 140, height: 60 },
        physical: null,
        notes: ["Black ink on white paper. A signature in capital letters is not accepted."],
      },
      {
        id: "thumb",
        label: "Left thumb impression",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 240, height: 240 },
        physical: null,
        notes: ["Black or blue ink on white paper, scanned at 200 DPI."],
      },
      {
        id: "declaration",
        label: "Handwritten declaration",
        format: "JPG / JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 800, height: 400 },
        physical: { width: 10, height: 5, unit: "cm" },
        notes: ["Written in English in black ink. Capital letters are not accepted. Scanned at 200 DPI."],
      },
    ],
    extras: [],
  },
  {
    slug: "ibps-clerk",
    name: "IBPS Clerk",
    fullName: "Common Recruitment Process for Customer Service Associates (Clerical Cadre)",
    body: "Institute of Banking Personnel Selection (IBPS)",
    portal: "ibps.in",
    source: {
      doc: "IBPS CRP Clerical Cadre detailed advertisement, Annexure: Guidelines for scanning and upload of documents",
      issued: "2025-06-01",
      url: "https://www.ibps.in/index.php/clerical-cadre-xv/",
      confidence: "unconfirmed",
      note: "ibps.in did not resolve from this machine on 28 Jul 2026. IBPS publishes one scanning annexure across its CRP advertisements; the figures below match that annexure and the SBI CRPD block extracted from the SBI advertisement PDF.",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. The scanning annexure sets background, ink, pixel and DPI rules only; it prints no line asking for the candidate's name or the date of the photograph on the image.",
    background: "Light-coloured, preferably white background. No caps, hats or dark glasses.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 200, height: 230 },
        physical: null,
        notes: ["Recent passport-style colour photograph."],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 20,
        pixels: { width: 140, height: 60 },
        physical: null,
        notes: ["Black ink on white paper. A signature in capital letters is not accepted."],
      },
      {
        id: "thumb",
        label: "Left thumb impression",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 240, height: 240 },
        physical: null,
        notes: ["Black or blue ink on white paper, scanned at 200 DPI."],
      },
      {
        id: "declaration",
        label: "Handwritten declaration",
        format: "JPG / JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 800, height: 400 },
        physical: { width: 10, height: 5, unit: "cm" },
        notes: ["Written in English in black ink. Capital letters are not accepted."],
      },
    ],
    extras: [],
  },
  {
    slug: "sbi-po",
    name: "SBI PO",
    fullName: "Recruitment of Probationary Officers",
    body: "State Bank of India, Central Recruitment & Promotion Department (CRPD)",
    portal: "sbi.co.in / bank.sbi careers",
    source: {
      doc: "SBI CRPD Detailed Advertisement for Probationary Officers, section 'Guidelines for scanning and upload of documents'",
      issued: "2025-06-23",
      url: "https://sbi.bank.in/documents/77530/52947104/1_Detailed_Adv.2025_23.06.2025.pdf",
      confidence: "primary",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. The scanning annexure sets background, ink, pixel and DPI rules only; it prints no line asking for the candidate's name or the date of the photograph on the image.",
    background:
      "Light background with no reflections and the eyes clearly visible. Caps, hats and dark glasses are not acceptable; religious headwear is allowed but must not cover the face.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 200, height: 230 },
        physical: null,
        notes: [
          "The advertisement adds that if the file lands above 50 KB the scanner settings (DPI, number of colours) are to be adjusted rather than the photo replaced.",
          "It also asks candidates to keep about 8 printed copies of the same photograph for later stages.",
        ],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 20,
        pixels: { width: 140, height: 60 },
        physical: null,
        notes: [
          "A signature in capital letters is not accepted.",
          "If the signature on the answer script does not match the one on the call letter, the applicant is disqualified.",
        ],
      },
      {
        id: "thumb",
        label: "Left-hand thumb impression",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 240, height: 240 },
        physical: null,
        notes: ["Black or blue ink on white paper, 200 DPI."],
      },
      {
        id: "declaration",
        label: "Hand-written declaration",
        format: "JPG / JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 800, height: 400 },
        physical: { width: 10, height: 5, unit: "cm" },
        notes: [
          "Written in English on white paper with black ink, 200 DPI (10 cm x 5 cm).",
          "A declaration written in CAPITAL LETTERS is not accepted.",
        ],
      },
    ],
    extras: [
      "The advertisement warns that photo, signature, thumb impression and declaration must each be uploaded in their own slot; a file placed in the wrong slot counts as a defective application.",
    ],
  },
  {
    slug: "sbi-clerk",
    name: "SBI Clerk",
    fullName: "Recruitment of Junior Associates (Customer Support & Sales)",
    body: "State Bank of India, Central Recruitment & Promotion Department (CRPD)",
    portal: "sbi.co.in / bank.sbi careers",
    source: {
      doc: "SBI CRPD scanning-and-upload block, read from the SBI Probationary Officer detailed advertisement of the same department",
      issued: "2025-06-23",
      url: "https://sbi.bank.in/documents/77530/52947104/1_Detailed_Adv.2025_23.06.2025.pdf",
      confidence: "derived",
      note: "CRPD prints one scanning block across its advertisements. These figures were extracted from the PO advertisement PDF, not from a Junior Associates advertisement.",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. The scanning annexure sets background, ink, pixel and DPI rules only; it prints no line asking for the candidate's name or the date of the photograph on the image.",
    background: "Light background, eyes clearly visible, no caps, hats or dark glasses.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 200, height: 230 },
        physical: null,
        notes: ["Recent passport-style colour photograph."],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 20,
        pixels: { width: 140, height: 60 },
        physical: null,
        notes: ["Black ink on white paper. Capital letters are not accepted."],
      },
      {
        id: "thumb",
        label: "Left-hand thumb impression",
        format: "JPG / JPEG",
        minKB: 20,
        maxKB: 50,
        pixels: { width: 240, height: 240 },
        physical: null,
        notes: ["Black or blue ink on white paper, 200 DPI."],
      },
      {
        id: "declaration",
        label: "Hand-written declaration",
        format: "JPG / JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 800, height: 400 },
        physical: { width: 10, height: 5, unit: "cm" },
        notes: ["Written in English in black ink; capital letters are not accepted."],
      },
    ],
    extras: [],
  },
  {
    slug: "upsc-cse",
    name: "UPSC CSE",
    fullName: "Civil Services Examination, 2026 (Examination Notice No. 05/2026-CSE)",
    body: "Union Public Service Commission (UPSC)",
    portal: "upsconline.nic.in",
    source: {
      doc: "UPSC, Instructions for Uploading the Photo & Signature (the document the CSE 2026 notice points to for photo and signature rules)",
      issued: "2026-02-04",
      url: "https://upsconline.nic.in/ngrp/assets/PDF/instruction-photo-signature-upload-upsc.pdf",
      confidence: "primary",
      note: "Both documents were read: the CSE 2026 notice dated 04.02.2026 defers the photo and signature rules to this instruction sheet, and the figures below come from the instruction sheet itself.",
    },
    photoMode: "upload+live",
    photoNote:
      "UPSC needs two photographs. A passport-size photo file is uploaded, and a live photograph is captured in the form (webcam or QR-code mobile capture). The two are matched; on a mismatch the application cannot proceed.",
    nameDateOnPhoto:
      "Not required by the instruction sheet. It sets face coverage, background and format rules, and states the photograph is NOT to be signed. There is no name-and-date printing line in it.",
    background:
      "Plain white background, frontal full face with both ears visible, eyes open and not covered by hair, no shadows, no uniform, no dark glasses.",
    assets: [
      {
        id: "photo",
        label: "Passport-size photograph",
        format: "JPG",
        minKB: 20,
        maxKB: 200,
        pixels: null,
        physical: null,
        notes: [
          "The face must cover at least 75% (three-quarters) of the photo area.",
          "The file must be named 'photo'.",
          "The instruction sheet sets no pixel dimensions for the photograph, only the KB range and the face-coverage rule.",
        ],
      },
      {
        id: "signature",
        label: "Signature (three signatures in one image)",
        format: "JPG",
        minKB: 20,
        maxKB: 100,
        pixels: null,
        longEdgePx: 400,
        statedPixels: "350 to 500 px (the instruction sheet does not name the axis)",
        physical: null,
        notes: [
          "Sign three times vertically, one below the other, on plain white paper with black ink, then scan all three into a single image.",
          "The instruction sheet states 'Image dimensions: 350 - 500 pixels' without naming an axis; this tool targets 400 px on the long edge, inside that band.",
          "The file must be named 'signature'.",
        ],
      },
    ],
    extras: [
      "Capture of the live photograph is mandatory for submitting the application for any UPSC examination.",
    ],
  },
  {
    slug: "rrb-ntpc",
    name: "RRB NTPC",
    fullName: "Non-Technical Popular Categories (Graduate), CEN 06/2025",
    body: "Railway Recruitment Boards (RRB)",
    portal: "rrbapply.gov.in",
    source: {
      doc: "CEN 06/2025 (NTPC - Graduate) detailed centralised employment notification",
      issued: "2025-10-21",
      url: "https://rrbsecunderabad.gov.in/wp-content/uploads/2025/10/Final-CEN-06-2025-21-10-2025-Publish.pdf",
      confidence: "unconfirmed",
      note: "The CEN 06/2025 PDF is larger than this machine could pull on 28 Jul 2026, so its upload annexure was not extracted. Secondary listings report 30 to 70 KB for the photograph, which disagrees with the 50 to 100 KB printed in RRB's own CEN 08/2024, the most recent RRB notice whose text was extracted here. The figures below are RRB's verified CEN 08/2024 block; if the CEN you are applying under prints different numbers, the CEN wins.",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. CEN 08/2024 sets studio, background, dress, pixel and DPI rules for the photograph and prints no name-or-date line.",
    background:
      "White or light-coloured background, non-white dress, no cap, no dark glasses. RRB CEN 08/2024 states the photograph must come from a professional studio and that mobile or self-composed portraits may cause rejection.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 320, height: 240 },
        physical: { width: 35, height: 45, unit: "mm" },
        notes: [
          "Minimum 100 DPI scan resolution.",
          "Figures carried over from RRB CEN 08/2024; the CEN 06/2025 annexure was not readable here.",
        ],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPEG",
        minKB: 30,
        maxKB: 50,
        pixels: { width: 140, height: 60 },
        physical: { width: 50, height: 20, unit: "mm" },
        notes: [
          "Black ink pen only, running letters, never block or capital letters.",
          "Minimum 100 DPI scan resolution.",
        ],
      },
    ],
    extras: [],
  },
  {
    slug: "rrb-group-d",
    name: "RRB Group D",
    fullName: "Various posts in Level 1 of the 7th CPC Pay Matrix, CEN 08/2024",
    body: "Railway Recruitment Boards (RRB)",
    portal: "rrbapply.gov.in",
    source: {
      doc: "CEN 08/2024 (Level-1) detailed centralised employment notification, 'Documents to be kept ready before filling the application'",
      issued: "2025-01-22",
      url: "https://rrbsecunderabad.gov.in/wp-content/uploads/2025/01/CEN-08-2024.pdf",
      confidence: "primary",
      note: "Indicative notice 28.12.2024; date of publication 22.01.2025.",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required. CEN 08/2024 sets studio, background, dress, pixel and DPI rules for the photograph and prints no name-or-date line.",
    background:
      "Plain white or light-coloured background, non-white dress, no cap, no dark glasses. The CEN states the photograph must be taken in a professional studio and that mobile or self-composed portraits may result in rejection.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 320, height: 240 },
        physical: { width: 35, height: 45, unit: "mm" },
        notes: [
          "The CEN prints both figures side by side: 35 mm x 45 mm, or 320 x 240 pixels. Those two are not the same shape - 35 x 45 mm is portrait, 320 x 240 px is landscape. The resizer uses the pixel figure, since that is what the upload gate measures.",
          "Minimum 100 DPI scan resolution.",
          "Candidates are asked to keep spare copies of the same photograph that was uploaded.",
        ],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPEG",
        minKB: 30,
        maxKB: 50,
        pixels: { width: 140, height: 60 },
        physical: { width: 50, height: 20, unit: "mm" },
        notes: [
          "White paper, black ink pen only, running letters, NOT in block or capital letters.",
          "Minimum 100 DPI; the complete signature must sit inside its box in the form.",
        ],
      },
    ],
    extras: [
      "A scribe's passport photograph, where a scribe is used, carries the same 50 to 100 KB JPEG rule.",
    ],
  },
  {
    slug: "neet-ug",
    name: "NEET UG",
    fullName: "National Eligibility cum Entrance Test (UG) 2026",
    body: "National Testing Agency (NTA)",
    portal: "neet.nta.nic.in",
    source: {
      doc: "Information Bulletin NEET (UG) 2026, 'Scanned images and documents to be uploaded'",
      issued: "2026-02-08",
      url: "https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602081576322299.pdf",
      confidence: "primary",
    },
    photoMode: "upload",
    photoNote: "",
    nameDateOnPhoto:
      "Not required by the 2026 bulletin. Its upload rules ask only for 80% face coverage against a white background; there is no line requiring the candidate's name or the date of the photograph to be printed on it.",
    background: "White background, 80% of the image area must be the candidate's face, ears visible, no mask.",
    assets: [
      {
        id: "photo",
        label: "Passport-size photograph",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 200,
        pixels: null,
        physical: null,
        notes: [
          "May be colour or black and white.",
          "The bulletin fixes the KB range and the face-coverage rule but prints no pixel dimensions.",
        ],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 100,
        pixels: null,
        physical: null,
        notes: ["The 2026 bulletin range is 10 to 100 KB."],
      },
      {
        id: "thumb",
        label: "Left and right hand fingers and thumb impressions",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 200,
        pixels: null,
        physical: null,
        notes: ["Both hands are uploaded for NEET (UG)."],
      },
    ],
    extras: [
      "The 4\" x 6\" postcard-size photograph is not an upload for NEET (UG) 2026. The bulletin asks candidates to carry one postcard-size colour photograph with a white background to the centre, to be pasted on the proforma printed with the admit card, plus 4 to 6 identical passport-size copies.",
      "Certificates uploaded alongside (Class X, category, PwBD, address proof) are PDFs of 50 to 300 KB.",
    ],
  },
  {
    slug: "jee-main",
    name: "JEE Main",
    fullName: "Joint Entrance Examination (Main) 2026",
    body: "National Testing Agency (NTA)",
    portal: "jeemain.nta.nic.in",
    source: {
      doc: "Information Bulletin JEE (Main) 2026, application procedure - scanned images to be uploaded",
      issued: "2025-10-31",
      url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/10/202510311145384616.pdf",
      confidence: "primary",
    },
    photoMode: "upload+live",
    photoNote:
      "JEE (Main) 2026 takes both: a live photograph captured while the form is being filled (webcam, or QR-code capture on a phone) and a scanned passport-size photograph file.",
    nameDateOnPhoto:
      "Not required by the 2026 bulletin. The upload rule is 80% face coverage in colour against a white background; no name or date line is printed on the photograph.",
    background: "White background, colour photograph, 80% face visible including ears, no mask.",
    assets: [
      {
        id: "photo",
        label: "Passport-size photograph",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 200,
        pixels: null,
        physical: null,
        notes: [
          "Must be in colour (unlike NEET, where black and white is allowed).",
          "The bulletin fixes the KB range and the face-coverage rule but prints no pixel dimensions.",
        ],
      },
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 10,
        maxKB: 100,
        pixels: null,
        physical: null,
        notes: ["The 2026 bulletin range is 10 to 100 KB."],
      },
    ],
    extras: [
      "The Class X certificate or marksheet is uploaded separately as a PDF of 50 to 300 KB.",
      "For the live capture, the bulletin asks for a light-coloured background and the device camera or webcam switched on.",
    ],
  },
];

export const EXAM_SLUGS = EXAM_SPECS.map((exam) => exam.slug);

export function getExamBySlug(slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase();
  return EXAM_SPECS.find((exam) => exam.slug === key) || null;
}

export function getOtherExams(slug, limit = 6) {
  return EXAM_SPECS.filter((exam) => exam.slug !== slug).slice(0, limit);
}

const CONFIDENCE_LABEL = {
  primary: "Read from the official PDF",
  derived: "Read from a sibling notice of the same body",
  unconfirmed: "Not verified against the official PDF",
};

export function confidenceLabel(confidence) {
  return CONFIDENCE_LABEL[confidence] || CONFIDENCE_LABEL.unconfirmed;
}
