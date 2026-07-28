const seo = {
  title: "Free Resume Maker — ATS Score & PDF Builder",
  h1: "Resume Maker with Live ATS Score",
  metaDescription:
    "Free resume maker with a live ATS score out of 100, real-time A4 preview, and one-click PDF download. Runs in your browser; nothing is uploaded.",
  intro:
    "The Resume Maker is a browser-based resume builder with five tabs — Personal Info, Experience, Education, Skills and Projects — feeding a live A4 preview rendered at 210 × 297 mm with 20 mm margins. As you type, a built-in ATS check scores the draft out of 100 using 13 weighted rules (a 100-plus character summary is worth 15 points, the first work-experience entry 15, one education entry 10, five or more skills 5) and lists the exact items still missing. Download PDF captures that preview with html2canvas at 2× scale, converts it to a JPEG at 0.98 quality, and places it on a jsPDF A4 portrait page saved as resume.pdf. Every step runs client-side in your own tab — there is no account, no upload, and no server call anywhere in the tool.",
  useCases: [
    "Building a first resume for internship or graduate applications, using the Projects tab to compensate for a short work history",
    "Auditing an existing resume against a completeness checklist before you start applying — summary length, number of roles, skill count, education entry",
    "Producing a clean one-page A4 PDF in a few minutes without installing Word, LaTeX, or a desktop resume app",
  ],
  benefits: [
    [
      "Live ATS score with a fix list",
      "The score recalculates on every keystroke and sits beside a checklist of up to nine specific gaps — \"Write a detailed summary (100+ characters)\", \"Add 5+ skills\" — so you always know what to change next. Above 80 it turns green, 60-79 yellow, below 60 red.",
    ],
    [
      "A preview that is the export",
      "The preview block is a true A4 page: 210 mm × 297 mm with 20 mm padding. What you see is exactly what html2canvas captures, so there is no surprise reflow between screen and PDF.",
    ],
    [
      "Skills grouped the way recruiters scan",
      "Each skill is tagged Technical, Soft Skills, Tools, Languages, or Frameworks, and the preview prints one compact line per category instead of a single undifferentiated blob.",
    ],
    [
      "Nothing leaves your device",
      "All resume data lives in React state in the open tab. The tool makes no network requests, writes nothing to storage, and needs no sign-up — your employment history is never transmitted.",
    ],
  ],
  faqs: [
    [
      "Is this resume maker actually free, no sign-up?",
      "Yes — free, with no account, no email, no watermark, and no download limit. The page is a self-contained client-side app; you can fill it in and export a PDF without ever identifying yourself.",
    ],
    [
      "How is the ATS score calculated?",
      "By a 13-check rubric that sums to exactly 100. Contact block: full name 5, a job title over 5 characters 10, an email containing @ 5, a phone of 10 or more characters 5. Summary: 15 points past 100 characters, 5 more past 200. Experience: 15 for the first entry, 5 for a second, 10 if any description exceeds 50 characters, 5 if a description contains \"achieved\", \"increased\" or \"improved\". Education: 10 for one entry. Skills: 5 at five, 5 more at ten. It measures how complete your draft is — it is not a reading from any employer's real applicant tracking system.",
    ],
    [
      "How do I raise my ATS score to 100%?",
      "Hit every threshold: a summary over 200 characters, at least two work experiences, at least one description longer than 50 characters, one education entry, and ten or more skills. The action-word check is case-sensitive and matches lowercase text, so phrase a bullet as \"Led a rebuild that increased retention\" rather than opening it with a capitalised \"Increased\".",
    ],
    [
      "What format does the resume download in?",
      "A single A4 portrait PDF saved as resume.pdf. It is built by capturing the preview with html2canvas at 2× scale, encoding it as a JPEG at 0.98 quality, and adding that image to a jsPDF page — so the page is a high-resolution picture of your layout rather than selectable text. If an application asks you to paste plain text, copy it from the form fields.",
    ],
    [
      "Why is the bottom of my resume cut off in the PDF?",
      "Because the export scales one captured image to the page width and places it on a single A4 page, so anything taller than that page is clipped. Keep the content to one page — trim the summary, cut older roles, or shorten descriptions until the preview fits within the 297 mm page height.",
    ],
    [
      "Does the tool save my progress if I close the tab?",
      "No. There is no autosave, no localStorage, and no account, so refreshing or closing the tab clears everything you typed. Download the PDF before you leave the page.",
    ],
    [
      "Is my resume data uploaded to a server?",
      "No. The tool contains no fetch, upload, or API calls — your name, contact details, and employment history stay in the browser tab and are used only to render the preview and generate the PDF on your own device.",
    ],
    [
      "What sections can I include?",
      "Six: a header with name, job title, email, phone, address, LinkedIn, GitHub and website; a Professional Summary; Work Experience with a \"currently work here\" toggle that prints \"Present\"; Education; Skills grouped by category; and Projects with a name, description, technologies list, and link. Empty sections are omitted from the preview automatically.",
    ],
  ],
  steps: [
    "Work through the Personal Info, Experience, Education, Skills and Projects tabs — the ATS score and the checklist beside it update as you type.",
    "Click Show Preview to see the live A4 page (210 × 297 mm, 20 mm margins) and confirm the content fits on one page.",
    "Click Download PDF to save resume.pdf to your device.",
  ],
};

export default seo;
