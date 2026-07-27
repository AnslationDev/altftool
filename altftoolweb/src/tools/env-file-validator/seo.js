const seo = {
  intro:
    "This tool lints a .env file line by line, reporting syntax errors, unclosed quotes, duplicate keys, invalid variable names and multiline values before they break a deployment. Because the .env format has no single standard, it validates against both the dotenv (npm) parsing rules and the stricter POSIX name rule [A-Za-z_][A-Za-z0-9_]* used by shells and docker --env-file, flagging every construct the parsers treat differently.",
  useCases: [
    "Check the production .env in a deploy pipeline for duplicate keys or an unclosed quote that would silently swallow every following line.",
    "Debug a 'works locally, breaks in Docker' issue caused by quoted values, export prefixes or inline # comments that docker --env-file reads literally.",
    "Review a teammate's .env changes for names that dotenv accepts but a POSIX shell will reject, like keys containing hyphens or leading digits.",
  ],
  benefits: [
    ["Errors vs warnings", "Hard failures (unclosed quotes, malformed lines) are separated from portability warnings, each with a line number."],
    ["Cross-parser checks", "Flags exactly where dotenv, POSIX shells and docker --env-file disagree: quoting, multiline values, export prefixes, inline comments."],
    ["Duplicate and drift detection", "Duplicate keys are reported with both line numbers and dotenv's last-assignment-wins rule spelled out."],
  ],
  faqs: [
    [
      "What makes a .env file invalid?",
      "The hard failures are lines that are not KEY=VALUE assignments, empty keys, unclosed quotes, and stray text after a closing quote. An unclosed quote is the worst one: dotenv-style parsers absorb every following line into that value, so variables defined below it disappear.",
    ],
    [
      "What is a valid environment variable name?",
      "The portable POSIX rule (IEEE Std 1003.1, section 8.1) is a letter or underscore followed by letters, digits or underscores — [A-Za-z_][A-Za-z0-9_]*. The npm dotenv parser is looser and also accepts dots and hyphens, but shells and docker --env-file will reject such names, so the tool flags them as portability warnings.",
    ],
    [
      "Why does my .env work with Node but break in docker --env-file?",
      "Because docker --env-file does not implement dotenv semantics: it keeps quotes as literal characters, keeps # inside values instead of treating it as a comment, reads only single-line values, and treats an 'export ' prefix as part of the key. The validator flags each of these constructs so you can rewrite them portably.",
    ],
    [
      "What happens when a key is defined twice in a .env file?",
      "With dotenv's parser the last assignment wins and the earlier value is dead configuration. The validator reports the duplicate with both line numbers; note that dotenv's config() call additionally never overrides variables already present in process.env unless the override option is set.",
    ],
  ],
};

export default seo;
