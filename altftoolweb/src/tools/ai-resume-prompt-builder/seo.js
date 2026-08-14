const seo = {
  title: "AI Resume Prompt Builder: XYZ Bullets, ATS-Safe",
  metaDescription:
    "Builds a resume-rewriting prompt for ChatGPT, Claude or Gemini using the XYZ formula, ATS format rules and your numbers, with a no-fabrication rule.",
  steps: [
    "Choose What should the AI do? — Rewrite my experience bullets, Write my professional summary, Tailor my resume to a job description or Restructure the full resume — and type your Target role and Industry.",
    "Set Seniority level and Tone, paste your real achievements and numbers plus comma-separated ATS keywords, and tick 'I will paste the job description along with my resume' when you are tailoring.",
    "Check the prompt word count, the Task, Target role, Seniority framing, Tone and ATS keywords included rows, and the Before you send it checklist, then press Copy prompt to paste it above your resume text.",
  ],
  intro:
    "This builder assembles a structured resume-rewriting prompt for ChatGPT, Claude, Gemini or any other assistant, combining a recruiter role frame, your target job and seniority, your real numbers, and the XYZ achievement formula — \"Accomplished [X] as measured by [Y], by doing [Z]\" — that Google's recruiting team popularised for bullet points. It also pins down applicant-tracking constraints: standard section headings, plain text, no tables or columns, and keywords mirrored from the job description. Every generated prompt carries an explicit no-fabrication rule, because inventing employers, dates and metrics is the main failure mode of AI resume editing.",
  useCases: [
    "A mid-level analyst turning eight flat duty statements into quantified XYZ bullets before applying to a fintech role",
    "A career changer asking an AI to rewrite a professional summary that leads with transferable skills instead of job titles",
    "An applicant tailoring one master resume to a specific job description and getting a list of requirements they cannot yet evidence",
  ],
  benefits: [
    ["XYZ formula built in", "Bullets are requested as achievement, measure and method rather than a list of duties."],
    ["ATS-safe by default", "The prompt bans tables, columns and graphics and asks for standard section headings parsers can read."],
    ["No invented facts", "A hard rule tells the model to ask you for a missing number instead of making one up."],
  ],
  faqs: [
    [
      "What is a good prompt to rewrite my resume with AI?",
      "A good prompt names four things: the role you are targeting, your seniority, the exact task (bullets, summary, or full restructure), and a format rule such as the XYZ formula with one strong action verb per bullet. Add your real metrics and a no-fabrication instruction, then paste your actual resume text below the prompt — the model cannot improve what it cannot see.",
    ],
    [
      "Will an AI-written resume get rejected by applicant tracking systems?",
      "Not because it was AI-written — ATS software parses text and keywords, not authorship. Rejections come from formatting: tables, multi-column layouts, images, headers and footers, and non-standard section names are what break parsing. Keep the file to plain single-column text with Summary, Skills, Experience and Education headings, and save as .docx or a text-based PDF.",
    ],
    [
      "How many keywords from the job description should I include?",
      "Aim for the five to ten terms the description repeats or lists under requirements, and only where you genuinely have that experience. Keyword stuffing backfires twice: modern parsers score context rather than raw counts, and a recruiter reads the same document a few seconds later.",
    ],
    [
      "Is it dishonest to use AI on a resume?",
      "Using AI to sharpen wording is generally treated the same as using a professional resume writer, and most employers have no rule against it. It becomes dishonest when the output contains achievements, tools, dates or credentials you do not have — so verify every claim and be ready to defend each number in an interview. If you are applying somewhere with an explicit AI-use policy, follow it.",
    ],
  ],
};

export default seo;
