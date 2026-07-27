/**
 * GitHub profile README generation.
 *
 * A repository named exactly after the username (github.com/<user>/<user>)
 * with a README.md renders on the profile page — GitHub's documented
 * "profile README" feature. Badges use shields.io static badges and the
 * stats widgets use the open-source github-readme-stats project
 * (github.com/anuraghazra/github-readme-stats), both standard for profile
 * READMEs.
 */

/**
 * GitHub username rule (GitHub signup validation): alphanumerics and single
 * hyphens, no leading/trailing hyphen, max 39 characters.
 */
export const GITHUB_USERNAME_PATTERN = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;

/** Hard caps so the generated file stays a README, not a novel. */
export const MAX_SKILLS = 30;
export const MAX_PROJECTS = 10;
export const MAX_NAME_LENGTH = 80;

/**
 * shields.io static-badge escaping: in the path segment a literal dash is
 * written "--" and a literal underscore "__"; spaces become underscores.
 */
export function escapeShieldsText(text) {
  return String(text)
    .trim()
    .replace(/-/g, "--")
    .replace(/_/g, "__")
    .replace(/\s+/g, "_");
}

/** Static skill badge URL (flat style, informational default colour). */
export function skillBadgeUrl(skill) {
  const label = escapeShieldsText(skill);
  if (label === "") return "";
  return `https://img.shields.io/badge/${encodeURIComponent(label)}-informational?style=flat`;
}

const clean = (value) => String(value == null ? "" : value).trim();

/** Split a comma/newline separated list into trimmed unique items. */
export function parseList(raw) {
  const seen = new Set();
  return String(raw == null ? "" : raw)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => {
      if (item === "") return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Build the profile README markdown.
 *
 * @param {object} input
 * @param {string}  input.name            Display name (required).
 * @param {string}  input.headline        One-line role/tagline.
 * @param {string}  input.about           Short bio paragraph.
 * @param {string}  input.githubUsername  Needed for stats widgets; validated.
 * @param {string[]} input.skills         Skill names for badges.
 * @param {Array<{name:string,description:string,url:string}>} input.projects
 * @param {string}  input.currentWork     "currently building…" line.
 * @param {string}  input.learning        "currently learning…" line.
 * @param {boolean} input.showStats       Include github-readme-stats card.
 * @param {boolean} input.showTopLangs    Include top-languages card.
 * @param {string}  input.linkedin        LinkedIn profile URL or handle.
 * @param {string}  input.website         Personal site URL.
 * @param {string}  input.email           Contact email.
 * @returns {{error:string}|{markdown:string, skillCount:number, projectCount:number}}
 */
export function generateProfileReadme(input = {}) {
  const {
    name,
    headline,
    about,
    githubUsername,
    skills = [],
    projects = [],
    currentWork,
    learning,
    showStats = true,
    showTopLangs = true,
    linkedin,
    website,
    email,
  } = input;

  const displayName = clean(name);
  if (displayName === "") return { error: "Enter your name — it becomes the README heading." };
  if (displayName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }

  const username = clean(githubUsername);
  const wantsWidgets = showStats || showTopLangs;
  if (username !== "" && !GITHUB_USERNAME_PATTERN.test(username)) {
    return {
      error: "GitHub usernames are 1–39 alphanumeric characters or single hyphens, with no leading or trailing hyphen.",
    };
  }
  if (wantsWidgets && username === "") {
    return { error: "Enter your GitHub username, or turn off the stats widgets." };
  }

  const skillList = skills.slice(0, MAX_SKILLS);
  const projectList = projects
    .map((project) => ({
      name: clean(project.name),
      description: clean(project.description),
      url: clean(project.url),
    }))
    .filter((project) => project.name !== "")
    .slice(0, MAX_PROJECTS);

  const lines = [`# Hi, I'm ${displayName} 👋`, ""];

  if (clean(headline) !== "") {
    lines.push(`**${clean(headline)}**`, "");
  }
  if (clean(about) !== "") {
    lines.push(clean(about), "");
  }

  const nowLines = [];
  if (clean(currentWork) !== "") nowLines.push(`- 🔭 Currently working on ${clean(currentWork)}`);
  if (clean(learning) !== "") nowLines.push(`- 🌱 Currently learning ${clean(learning)}`);
  if (nowLines.length > 0) lines.push(...nowLines, "");

  if (skillList.length > 0) {
    lines.push("## Skills", "");
    lines.push(
      skillList.map((skill) => `![${skill}](${skillBadgeUrl(skill)})`).join(" "),
      "",
    );
  }

  if (projectList.length > 0) {
    lines.push("## Projects", "");
    projectList.forEach((project) => {
      const title = project.url !== "" ? `[${project.name}](${project.url})` : project.name;
      const tail = project.description !== "" ? ` — ${project.description}` : "";
      lines.push(`- **${title}**${tail}`);
    });
    lines.push("");
  }

  if (wantsWidgets) {
    lines.push("## GitHub stats", "");
    if (showStats) {
      lines.push(
        `![${displayName}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=true)`,
        "",
      );
    }
    if (showTopLangs) {
      lines.push(
        `![Top languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(username)}&layout=compact)`,
        "",
      );
    }
  }

  const contactLines = [];
  if (username !== "") contactLines.push(`- GitHub: [@${username}](https://github.com/${username})`);
  if (clean(linkedin) !== "") {
    const handle = clean(linkedin).replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/+$/, "");
    contactLines.push(`- LinkedIn: [${handle}](https://www.linkedin.com/in/${handle})`);
  }
  if (clean(website) !== "") {
    const url = /^https?:\/\//i.test(clean(website)) ? clean(website) : `https://${clean(website)}`;
    contactLines.push(`- Website: ${url}`);
  }
  if (clean(email) !== "") contactLines.push(`- Email: ${clean(email)}`);
  if (contactLines.length > 0) {
    lines.push("## Reach me", "", ...contactLines, "");
  }

  return {
    markdown: `${lines.join("\n").trim()}\n`,
    skillCount: skillList.length,
    projectCount: projectList.length,
    username,
  };
}
