const seo = {
  title: "Icon Naming Checker: kebab, snake, camel, Pascal",
  metaDescription:
    "Audit icon file names against one convention, flag case-only collisions, illegal characters and reserved device names, and get git mv commands.",
  steps: [
    "Paste your list into 'Icon file names (one per line)'; the sample loads ArrowLeft.svg, arrow-right.svg, arrow_up.svg, chevronDown-24.svg, Chevron-Down-24.svg, user profile.svg and con.svg.",
    "Choose the Naming convention — kebab-case, snake_case, camelCase or PascalCase — set 'Required extension (blank to allow any)' and 'Required prefix (blank for none)', list the allowed final tokens such as 16, 24, 32, and tick 'Treat a digit run as its own word' if arrowLeft24 should become arrow-left-24.",
    "Read the conforming percentage and the Current name / Suggested / Problems table, check the collision, case-clash and reserved-device-name warnings, then press 'Copy rename plan' to take the git mv commands.",
  ],
  intro:
    "The Icon Naming Consistency Checker audits a list of icon file names against a single convention - kebab-case, snake_case, camelCase or PascalCase - and returns the corrected name for each one. It tokenises each name at separator, camel-hump and acronym boundaries, then re-joins it in the target style, and separately flags names that collide after renaming, differ only by letter case, exceed the 255 character path-component limit, contain characters Windows or POSIX forbid, or match a reserved MS-DOS device name. The output includes a ready-to-run list of git mv commands.",
  useCases: [
    "Normalise an icon directory that has accumulated ArrowLeft.svg, arrow-right.svg and arrow_up.svg from three different contributors.",
    "Enforce a required icon- prefix and a size suffix of 16, 24 or 32 across a design system export.",
    "Catch two icons whose names differ only by capitalisation before they silently overwrite each other on a macOS checkout.",
    "Generate the rename commands for a bulk cleanup instead of retyping several hundred file names by hand.",
  ],
  benefits: [
    ["Real tokenisation", "Splits at separators, camel humps and acronym boundaries, so APIKey becomes api-key rather than apikey."],
    ["Cross-platform safety", "Checks the Windows reserved device names, forbidden punctuation and the 255 character component limit."],
    ["Collision aware", "Warns when two source names normalise to one target, before a bulk rename destroys a file."],
  ],
  faqs: [
    [
      "What is the best naming convention for icon files?",
      "kebab-case is the most common for files served over HTTP, because URLs are case-sensitive and hyphens survive every file system and CDN. PascalCase is normal when each icon is also a component name. What matters most is picking one and applying it to the whole set.",
    ],
    [
      "Why do two icon file names that differ only by capitalisation cause problems?",
      "Default macOS (APFS case-insensitive) and Windows volumes treat Icon.svg and icon.svg as the same file, while Linux and git do not. The result is a repository where one file silently replaces the other on checkout, which is why this tool flags case-only differences as an error.",
    ],
    [
      "What characters are illegal in a file name?",
      "Windows forbids the nine characters < > : \" / \\ | ? * plus every control character below U+0020, and POSIX forbids the forward slash and the null byte. Whitespace is technically legal everywhere but breaks unquoted shell commands and URLs, so it is flagged too.",
    ],
    [
      "How long can a file name be?",
      "255 characters per path component on ext4, APFS and NTFS. That is a per-component limit, not a whole-path limit; Windows additionally caps the full path at 260 characters unless long paths are enabled.",
    ],
  ],
};

export default seo;
