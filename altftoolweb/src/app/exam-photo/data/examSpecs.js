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

export const SPECS_READ_ON = "2026-07-29";

/** Re-exported so the table and the tool share one scan-resolution constant. */
export { DEFAULT_SCAN_DPI as DERIVED_DPI } from "../lib/specMath";

const SSC_LIVE_PHOTO_NOTE =
  "SSC does not accept a photo file. The application form captures a live photograph through the webcam or the mobile camera (QR code option), so there is no KB limit and no pixel size to hit. The notice states that capturing a photograph of an already-printed photograph gets the application rejected.";

/** Printed verbatim in all three SSC notices read here (CGL 2026 para 9.4,
 *  CHSL 2025 para 9.4, GD 2026 para 8.4). No background COLOUR is specified in
 *  any of them - the word the notices use is "plain". */
const SSC_BACKGROUND =
  "Plain background and good light. Candidates are told not to wear a cap, mask or glasses/spectacles, and the frontal view of the face must be clearly visible. The notice specifies no background colour - it says only \"plain\".";

/** CGL 2026 para 9.3, CHSL 2025 para 9.3, GD 2026 para 8.3 - a standing SSC
 *  policy rather than a per-exam one. Stated as the conditional it is. */
const SSC_AADHAAR_NOTE =
  "If you opt for Aadhaar-based authentication, SSC states your application will not be rejected on the ground that the uploaded photograph and/or signature are not as per the prescribed standards. The notice's words: applications of candidates who opt for Aadhaar Authentication \"will not be rejected on the ground that photograph and/or signature uploaded by the candidate are not as per prescribed standards\". This is a concession for candidates who opt for Aadhaar authentication - it is not a statement that the signature size stops mattering.";

/** SSC prints two different signature boxes in the same notice. Neither figure
 *  carries supersession language, so both are published and the main-body rule
 *  is the one the resizer targets. */
const SSC_SIGNATURE_CONFLICT_NOTE =
  "The same notice prints two different signature boxes: about 6.0 cm x 2.0 cm in the main rules paragraph, and about 4.0 cm x 2.0 cm in the Annexure-IV how-to-apply walkthrough. Neither is marked as superseding the other. This page uses the main-body figure, 6.0 cm x 2.0 cm. The file size, 10 to 20 KB, is identical in both places, and that is the figure the upload gate actually measures.";

export const EXAM_SPECS = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    fullName: "Combined Graduate Level Examination, 2026",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC CGL 2026 Notice (F. No. HQ-C11018/1/2026-C-1), paras 9.3 to 9.6 and Annexure-IV",
      issued: "2026-05-21",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf",
      confidence: "primary",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto: "Not required. The 2026 notice asks for a live capture only and prints no name/date rule.",
    background: SSC_BACKGROUND,
    aadhaarNote: SSC_AADHAAR_NOTE,
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 6.0, height: 2.0, unit: "cm" },
        pixels: null,
        notes: [
          SSC_SIGNATURE_CONFLICT_NOTE,
          "Blurred or miniature signatures are rejected summarily. PwD (VH) candidates may upload a thumb impression instead.",
        ],
      },
    ],
    extras: [],
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    fullName: "Combined Higher Secondary (10+2) Level Examination, 2025",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC CHSL 2025 Notice (F. No. HQ-C1102/9/2025-C-1), paras 9.3 to 9.6 and Annexure-IV",
      issued: "2025-06-23",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2025.pdf",
      confidence: "primary",
      note: "This is the CHSL 2025 cycle - the most recent CHSL notice published when this was read. A CHSL 2026 notice had not been issued. Check the current notice before you apply.",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto:
      "Not required. SSC captures the photograph live inside the form and prints no rule about the candidate's name or the date of the photograph appearing on the image.",
    background: SSC_BACKGROUND,
    aadhaarNote: SSC_AADHAAR_NOTE,
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 6.0, height: 2.0, unit: "cm" },
        pixels: null,
        notes: [
          SSC_SIGNATURE_CONFLICT_NOTE,
          "Blurred or miniature signatures are rejected summarily.",
        ],
      },
    ],
    extras: [],
  },
  {
    slug: "ssc-gd-constable",
    name: "SSC GD Constable",
    fullName: "Constable (GD) in CAPFs and SSF, and Rifleman (GD) in Assam Rifles, 2026",
    body: "Staff Selection Commission (SSC)",
    portal: "ssc.gov.in",
    source: {
      doc: "SSC Constable (GD) 2026 Notice (F. No. HQ-C-3007/10/2025-C-3), paras 8.3 to 8.7 and Annexure-IV",
      issued: "2025-12-01",
      url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf",
      confidence: "primary",
    },
    photoMode: "live-capture",
    photoNote: SSC_LIVE_PHOTO_NOTE,
    nameDateOnPhoto:
      "Not required. SSC captures the photograph live inside the form and prints no rule about the candidate's name or the date of the photograph appearing on the image.",
    background: SSC_BACKGROUND,
    aadhaarNote: SSC_AADHAAR_NOTE,
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPEG / JPG",
        minKB: 10,
        maxKB: 20,
        physical: { width: 6.0, height: 2.0, unit: "cm" },
        pixels: null,
        dpi: 300,
        notes: [
          "Unlike the CGL and CHSL notices, the GD notice prints 6.0 cm x 2.0 cm consistently in both the main rules paragraph and the Annexure-IV walkthrough, so there is no conflicting figure to reconcile here.",
          "Annexure-IV adds a scan resolution of 300 DPI for the signature - the only one of the three SSC notices read here that states a DPI figure.",
          "Poor quality, miniature and blurred photographs or side-facing photographs are rejected.",
        ],
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
      doc: "IBPS CRP PO/MT-XVI notification, Annexure III: Guidelines for Scanning and Upload of Documents",
      issued: "2026-07-01",
      url: "https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf",
      confidence: "primary",
      note: "The date shown is the one printed above the Director's signature inside the notification (01.07.2026). The PDF's own filename carries 30.06.2026; where the two disagree, the printed date is the one used here.",
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
        dpi: 200,
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
        dpi: 200,
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
      doc: "IBPS CRP CSA-XV notification, Annexure IV: Guidelines for scanning and Upload of Documents",
      issued: "2025-08-01",
      url: "https://www.ibps.in/wp-content/uploads/DetailedNotification_CRP_CSA_XV_Final_for_Website.pdf",
      confidence: "primary",
      note: "IBPS does not print an advertisement number on this notification; the only identifier it carries is the cycle name, CRP CSA-XV. This is the CSA-XV cycle - the most recent Clerk notification published when this was read.",
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
        dpi: 200,
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
        dpi: 200,
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
      doc: "SBI CRPD Detailed Advertisement for Probationary Officers (Advertisement No. CRPD/PO/2025-26/04), section 'Guidelines for scanning and Upload of Photograph, Signature, Left-Hand Thumb Impression & Hand-Written Declaration'",
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
        dpi: 200,
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
        dpi: 200,
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
      doc: "SBI Junior Associates Detailed Advertisement (Advertisement No. CRPD/CR/2025-26/06), section 'Guidelines for scanning and Upload of Photograph, Signature, Left Hand Thumb Impression and Hand-written Declaration'",
      issued: "2025-08-06",
      url: "https://sbi.bank.in/documents/77530/52947104/JA+2025+-Detailed+Advt.pdf",
      confidence: "primary",
      note: "This is the 2025 Junior Associates cycle - the most recent SBI Clerk advertisement published when this was read.",
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
        dpi: 200,
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
        dpi: 200,
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
      note: "The CSE 2026 notice defers the photo and signature rules to this instruction sheet, and the figures below were read from the instruction sheet itself. The sheet prints no date in its own text; the date shown is the PDF's creation date, 04.02.2026, which matches the date of the CSE 2026 notice.",
    },
    photoMode: "upload+live",
    photoNote:
      "UPSC needs two photographs. A passport-size photo file is uploaded, and a live photograph is captured in the form (webcam or QR-code mobile capture). The two are matched; on a mismatch the application cannot proceed.",
    photoAge:
      "The instruction sheet asks for a photograph that is \"clear, recent\" but sets no cut-off date after which it must have been taken.",
    nameDateOnPhoto:
      "Not required by the instruction sheet. It sets face coverage, background and format rules, and states in as many words that the photograph is NOT to be signed. There is no name-and-date printing line in it.",
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
      doc: "RRB CEN 06/2025 (NTPC - Graduate) detailed centralised employment notification, paras 14.4 and 14.5",
      issued: "2025-10-21",
      url: "https://rrbsecunderabad.gov.in/wp-content/uploads/2025/10/Final-CEN-06-2025-21-10-2025-Publish.pdf",
      confidence: "primary",
      note: "Read from the copy published by RRB Secunderabad; the central rrbcdg.gov.in portal did not respond when this was checked. The CEN 06/2025 PDF carries no text layer - it is a scanned document - so its pages were read as images rather than extracted as text. CEN 07/2025 (NTPC Under Graduate) prints the same rules.",
    },
    photoMode: "live-capture",
    photoNote:
      "RRB NTPC no longer takes a photograph file. Para 14.4 of CEN 06/2025 states that candidates \"are not required to upload a pre-existing photograph while applying\" and that the application module captures a live photograph at the time of filling the form, through a webcam or the phone's front camera. Para 14.5 lists only two uploads: the signature and, for those requesting a free travel pass, an SC/ST certificate. Photographing an already-printed or on-screen photograph gets the application summarily rejected.",
    nameDateOnPhoto:
      "There is no photograph file to print a name or date on. The photograph is captured live inside the application form.",
    background:
      "For the live capture: non-white clothing, preferably dark, to contrast with the background; camera at eye level; the whole face centred in the frame; no cap, mask or glasses/spectacles; eyes fully open, or the photo will not be captured.",
    assets: [
      {
        id: "signature",
        label: "Signature",
        format: "JPG / JPEG",
        minKB: 30,
        maxKB: 49,
        pixels: { width: 140, height: 60 },
        pixelsAreMinimum: true,
        physical: { width: 35, height: 20, unit: "mm" },
        dpi: 100,
        notes: [
          "The CEN prints 30 to 49 KB, not 30 to 50 KB. RRB Group D's CEN 08/2024 does say 30 to 50 KB - the two notices differ by 1 KB, so do not carry a figure across from one to the other.",
          "140 x 60 px is the stated MINIMUM, not a fixed target; the signature must sit inside a 35 mm x 20 mm box on the form.",
          "Black ink pen on white paper, in running handwriting - not in block, capital or disjointed letters.",
          "Listed grounds for rejection include a non-white background, non-black ink, block or capital letters, poor resolution, an incomplete signature, a blank upload, an image that is not the signature, and a thumb impression in place of a signature.",
        ],
      },
    ],
    extras: [
      "The SC/ST certificate, uploaded only by candidates requesting a free railway travel pass, is a PDF of less than 400 KB.",
      "A colour passport photograph not older than two months is still needed as a printed photograph carried to the CBT, document verification and medical examination - it is carried, not uploaded.",
    ],
  },
  {
    slug: "rrb-group-d",
    name: "RRB Group D",
    fullName: "Various posts in Level 1 of the 7th CPC Pay Matrix, CEN 08/2024",
    body: "Railway Recruitment Boards (RRB)",
    portal: "rrbapply.gov.in",
    source: {
      doc: "RRB CEN 08/2024 (Level-1) detailed centralised employment notification, para 16.0(c)",
      issued: "2025-01-22",
      url: "https://rrbsecunderabad.gov.in/wp-content/uploads/2025/01/CEN-08-2024.pdf",
      confidence: "primary",
      note: "Indicative notice 28.12.2024; date of publication 22.01.2025. Read from the copy published by RRB Secunderabad; the central rrbcdg.gov.in portal did not respond when this was checked.",
    },
    photoMode: "upload",
    photoNote:
      "RRB Group D still takes an uploaded photograph file. This is the opposite of RRB NTPC, whose current CEN captures the photograph live in the form and takes no photo file at all - do not carry the rules across between the two.",
    photoAge:
      "Yes. CEN 08/2024 states the colour photograph must not be older than two months with respect to the last date for submission of the online application, and that it must be a latest photograph taken in a professional studio.",
    nameDateOnPhoto:
      "The opposite of required - it is forbidden. CEN 08/2024 states in as many words that the photograph \"should be free from signature/name/dates or any other marks\". A name or date written on the photograph is a ground for rejection here, so do not carry that habit over from forms that ask for it.",
    background:
      "Colour passport photograph on a white or light-coloured background, in non-white dress, preferably dark. No cap or hat, no sunglasses or dark glasses. The face must occupy at least 50% of the photograph, with a full-face view looking straight at the camera, forehead, eyes, cheeks, nose, neck, chin and both shoulders clearly visible, and no hair, cloth or shadow across the main features. The CEN states the photograph must be taken in a professional studio and that mobile or self-composed portraits may result in rejection.",
    assets: [
      {
        id: "photo",
        label: "Photograph",
        format: "JPEG",
        minKB: 50,
        maxKB: 100,
        pixels: { width: 320, height: 240 },
        physical: { width: 35, height: 45, unit: "mm" },
        dpi: 100,
        notes: [
          "The CEN prints both figures side by side: 35 mm x 45 mm, or 320 x 240 pixels. Those two are not the same shape - 35 x 45 mm is portrait, 320 x 240 px is landscape. The resizer uses the pixel figure, since that is what the upload gate measures.",
          "Minimum 100 DPI scan resolution.",
          "Must not be older than two months with respect to the last date for submission, and must be free from signature, name, dates or any other marks.",
          "Candidates are asked to keep at least 12 copies of the same photograph that was uploaded, for document verification and the medical test.",
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
        dpi: 100,
        notes: [
          "White paper, black ink pen only, running letters, NOT in block or capital letters.",
          "Minimum 100 DPI; the complete signature must sit inside its box in the form.",
          "Group D's range is 30 to 50 KB. RRB NTPC's current CEN prints 30 to 49 KB - the two differ by 1 KB.",
        ],
      },
    ],
    extras: [
      "A scribe's passport photograph, where a scribe is used, carries the same 50 to 100 KB JPEG rule.",
      "The SC/ST certificate, uploaded only by candidates requesting a free railway travel pass, is a PDF of up to 500 KB.",
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
    photoMode: "upload+live",
    photoNote:
      "NEET (UG) 2026 takes both: a scanned passport-size photograph file, and a live photograph captured while the application form is being filled. The bulletin states the candidate \"will have to upload his/her live photograph at the time of filling of the application form\".",
    photoAge:
      "Yes. The 2026 bulletin asks for a recent passport-size photograph taken after 01 January 2026. This is a real cut-off date, and it is specific to NEET - the JEE (Main) 2026 bulletin sets no equivalent rule.",
    nameDateOnPhoto:
      "Not required by the 2026 bulletin. Its upload rules ask only for 80% face coverage against a white background; there is no line requiring the candidate's name or the date of the photograph to be printed on it. The full text of the bulletin was searched for such a rule and none exists - the requirement that many coaching sites still repeat is out of date for this cycle.",
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
          "Must have been taken after 01 January 2026.",
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
        notes: [
          "Both hands are uploaded for NEET (UG).",
          "The 2026 bulletin contradicts itself on this one file. The spec list gives 10 to 200 KB; a later page, under its own heading, gives 50 to 300 KB. Both figures are printed in the same official document and neither is marked as superseding the other. An image between 50 and 200 KB satisfies both readings, which is the safest target to aim for.",
        ],
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
    photoAge:
      "No. The JEE (Main) 2026 bulletin sets no date after which the photograph must have been taken. NEET (UG) 2026 does set one; JEE (Main) does not.",
    nameDateOnPhoto:
      "Not required by the 2026 bulletin. The upload rule is 80% face coverage in colour against a white background; no name or date line is printed on the photograph. The full 90-page bulletin was searched for such a rule and none exists - the requirement that many coaching sites still repeat is out of date for this cycle.",
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
      "JEE (Main) asks for no thumb or finger impression at all. The words \"thumb\" and \"finger\" do not appear anywhere in the 2026 bulletin. NEET (UG) does require them, which is a common source of confusion between the two NTA exams.",
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
