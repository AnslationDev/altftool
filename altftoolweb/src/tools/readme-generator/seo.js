const seo = {
  title: "README Generator — Free README.md Maker for GitHub",
  h1: "README Generator: Build a README.md From Plain Notes",
  metaDescription:
    "Turn plain project notes into a formatted README.md — nine sections, badges, live preview, drag-to-reorder. Free, runs in your browser, nothing uploaded.",
  intro:
    "The README Generator turns plain project notes into a formatted README.md by reading your text one line at a time and matching each line against fixed keyword lists: \"install\", \"setup\" or \"getting started\" routes a line into Installation, \"stack\" or \"built with\" into Tech Stack, \"endpoint\" or \"route\" into API Endpoints, and so on across nine sections. It is deterministic string matching in JavaScript, not a language model — no API is called and nothing is uploaded, so the whole thing runs client-side in your browser. The first line becomes the H1 title, lines beginning with - or * are carried through as Features bullets, and Installation and Folder Structure lines are wrapped in fenced code blocks.",
  useCases: [
    "Turn a scratch list of setup commands, features and dependencies into a proper README.md before pushing a side project to GitHub.",
    "Give a hackathon entry or coursework repo a title, overview, tech stack and usage block in under a minute, then check the score before submitting.",
    "Draft a consistent house-style README for several internal repos by loading one of the seven starter templates and swapping in your own details.",
  ],
  benefits: [
    [
      "Nine sections from one text box",
      "Overview, Features, Tech Stack, Installation, Usage, API Endpoints, Folder Structure, Contributing and License are each detected from your own wording. Checkboxes let you drop Installation, Usage, Contributing or License from the output.",
    ],
    [
      "A score before you publish",
      "The README Score awards 20 points each for a title, an Overview, Installation steps, Usage instructions and at least one image or screenshot, and lists whatever is missing as a suggestion.",
    ],
    [
      "Reorder, restyle, then export",
      "Drag detected sections into the order you want, preview the Markdown in GitHub Dark, Minimal Clean, Gradient Dev or Hacker themes, then copy to clipboard or download as README.md.",
    ],
    [
      "Your draft stays on your device",
      "Input autosaves to your browser's local storage half a second after you stop typing and the last five generations are kept in history — both clearable with one click. No account, no upload, no server round-trip.",
    ],
  ],
  faqs: [
    [
      "How do I write a README.md file for GitHub?",
      "Start with an H1 project title, then an overview, features, tech stack, installation commands, usage, and a licence line. In this tool you type those as plain lines — for example \"Overview: a task manager\", \"Tech: React, Node.js\", \"Installation: npm install\" — and each line is matched to a heading by keyword, so you never write Markdown syntax yourself.",
    ],
    [
      "Does this README generator use AI?",
      "No. It is plain keyword matching in JavaScript — each line of your input is tested against fixed word lists like install / setup / getting started, or api / endpoint / route, and filed under the matching heading. Nothing is invented: the only text you did not write is the standard \"Contributions are welcome!\" sentence in the Contributing section.",
    ],
    [
      "Is the README generator free, and do I need to sign up?",
      "It is free with no account and no sign-up. The generator runs entirely in your browser — there is no API call and your project details are never sent to a server. Drafts are saved only to your own browser's local storage, under the keys readme_data and readme_history, and both can be cleared from the interface.",
    ],
    [
      "What sections does it generate?",
      "Nine: Overview, Features, Tech Stack, Installation, Usage, API Endpoints, Folder Structure, Contributing and License. A section only appears if one of its keywords shows up in your text, so a note with no \"license\" or \"MIT\" line simply won't get a License heading. Installation and Usage, plus Contributing and License, can also be switched off with the Sections to Include checkboxes.",
    ],
    [
      "How is the README score calculated?",
      "Out of 100, in five 20-point checks: the file starts with an H1 (# ), contains ## Overview, contains ## Installation, contains ## Usage, and includes an image — any ![ ... ] embed or the word \"screenshot\". Anything missing is listed underneath as a suggestion, and 100/100 shows a completion badge.",
    ],
    [
      "Can I add shields.io badges to my README?",
      "Yes. The Badge Generator builds three badge lines — License (MIT, Apache or GPL), Version (v1.0, v2.0 or v3.0) and Status (Active, Beta or Deprecated) — as img.shields.io Markdown and inserts them directly under the title. The badge markup is generated locally, but the badge images themselves are served by shields.io when the README is viewed.",
    ],
    [
      "Can it read my GitHub repository or package.json?",
      "No. It never connects to GitHub and does not parse package.json, requirements.txt or your file tree. Everything in the output comes from the text you paste in, which is why the folder structure and dependency lines have to be typed out or pulled from a template.",
    ],
    [
      "How do I download the generated README.md?",
      "Open the export menu and choose Download .md — the file is written from a text/markdown Blob and saved as README.md, ready to drop into the root of your repo. Copy puts the same content on your clipboard, and Ctrl + Enter regenerates from the input box at any time.",
    ],
  ],
  steps: [
    "Type your project details into the Project Details box, one item per line, leading lines with words like Overview, Features, Tech, Installation, Usage, API or License — or load one of the seven starter templates (Portfolio, E-commerce, Blog, SaaS, Mobile, AI, CLI) and edit it.",
    "Untick any of the Installation, Usage, Contributing or License toggles you don't want, then press Generate README or hit Ctrl + Enter.",
    "Check the README Score, drag sections into your preferred order, optionally add licence, version and status badges, then Copy or Download .md.",
  ],
};

export default seo;
