const seo = {
  title: "GitHub Profile README Generator with Stats & Badges",
  metaDescription:
    "Build a GitHub profile README with shields.io skill badges, up to 10 projects, github-readme-stats widgets and contact links. Copy-paste ready Markdown.",
  steps: [
    "Fill in your name, GitHub username, headline, about text, skills (comma separated, max 30) and projects — one per line as 'Name | description | URL', up to 10.",
    "Tick 'Include GitHub stats card' and 'Include top-languages card' to embed github-readme-stats widgets keyed to your username.",
    "Press 'Copy README' and paste the Markdown into README.md in the repository named exactly after your username — github.com/username/username.",
  ],
  intro:
    "This generator builds a complete GitHub profile README — the README.md that renders on your profile when placed in a repository named exactly after your username — with shields.io skill badges, a project list, github-readme-stats widgets and contact links. It is aimed at developers polishing their GitHub for job applications, and it validates your username against GitHub's actual rules (1–39 alphanumeric characters or single hyphens) before generating widget URLs.",
  useCases: [
    "A developer preparing for a job hunt turns a blank GitHub profile into a structured page with skills, two flagship projects and live stats in five minutes",
    "A student creates their first profile README and gets the special username/username repository convention explained and pre-filled",
    "An open-source maintainer refreshes an outdated profile by regenerating the skills and projects sections and pasting the new Markdown over the old",
  ],
  benefits: [
    ["Real GitHub conventions", "Uses the documented username/username profile-README feature and validates usernames against GitHub's naming rules."],
    ["Live widgets, no tokens", "Stats and top-language cards come from the open-source github-readme-stats service, which needs no authentication for public data."],
    ["Everything stays local", "The README is assembled in your browser — nothing you type is uploaded anywhere."],
  ],
  faqs: [
    [
      "How do I make a GitHub profile README?",
      "Create a public repository with exactly the same name as your username — for example github.com/octocat/octocat — and add a README.md to it. GitHub then renders that README at the top of your profile page; this generator produces the Markdown to paste in.",
    ],
    [
      "How do I add my GitHub stats to my profile README?",
      "Embed an image from the open-source github-readme-stats project: ![stats](https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true). It works without any token for public repositories; private-repo stats require deploying your own instance with a personal access token.",
    ],
    [
      "What should a developer profile README include?",
      "A one-line headline, a short bio, a skills section, two to five highlighted projects with links, and a way to reach you — roughly in that order, since recruiters skim top-down. Keep it under one screen; a profile README is a landing page, not a résumé.",
    ],
    [
      "What are the rules for a GitHub username?",
      "Up to 39 characters, using only letters, digits and hyphens; hyphens cannot lead, trail or repeat consecutively. This tool applies that exact rule before building your stats-widget and profile URLs, so a typo surfaces immediately instead of as a broken image.",
    ],
  ],
};

export default seo;
