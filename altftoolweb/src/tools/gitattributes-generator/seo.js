const seo = {
  title: ".gitattributes Generator: text=auto, LFS & binary",
  metaDescription:
    "Build a .gitattributes with the exact git syntax: text=auto, the binary macro, filter=lfs diff=lfs merge=lfs -text, export-ignore and custom diff drivers.",
  steps: [
    "Pick a Line-ending policy — \"Normalize — LF in repo, native line endings on checkout\", \"LF everywhere\" or \"No global rule\" — and tick \"Keep .bat / .cmd / .ps1 as CRLF\" and \"Force .sh scripts to LF\".",
    "List your Binary patterns, Git LFS patterns, export-ignore paths and linguist-generated patterns, and use \"Add diff driver\" for each pattern to driver-name pair.",
    "Check the \"Attribute rules generated\" count and press Copy file to take the finished .gitattributes.",
  ],
  intro:
    "This generator builds a .gitattributes file using the exact attribute syntax from the official git documentation: text=auto for line-ending normalization, the binary macro for images and archives, filter=lfs diff=lfs merge=lfs -text for Git LFS tracking, export-ignore for git archive, and diff=<driver> for custom diff drivers. It is aimed at developers on mixed Windows, macOS and Linux teams who want line endings and binary handling settled once, at the repository level, instead of per-machine core.autocrlf settings.",
  useCases: [
    "Stopping CRLF/LF churn in a repository where Windows and macOS developers keep flipping each other's line endings",
    "Writing the LFS tracking rules for Photoshop files and video assets before the first large file is committed",
    "Excluding tests and CI configuration from the release tarballs GitHub builds with git archive",
  ],
  benefits: [
    ["Repo-level, not per-machine", "text=auto in .gitattributes overrides everyone's core.autocrlf, so behaviour is identical on every clone."],
    ["Correct LFS syntax", "Emits the exact filter=lfs diff=lfs merge=lfs -text line that git lfs track writes."],
    ["Script-safe exceptions", "One click keeps .bat/.cmd files CRLF and shell scripts LF so nothing breaks at execution time."],
  ],
  faqs: [
    [
      "What does * text=auto do in .gitattributes?",
      "It tells git to detect which files are text and store them with LF line endings in the repository, converting to the platform's native ending on checkout. Because it lives in the repository, it applies to every contributor and overrides their personal core.autocrlf setting — GitHub's own documentation recommends this as the baseline line-ending rule.",
    ],
    [
      "How do I mark files as binary in .gitattributes?",
      "Add the pattern followed by the binary macro, for example *.png binary. That macro expands to -text -diff -merge, so git will never normalize the file's bytes, show a text diff for it, or attempt a content merge — preventing corruption of images, fonts and archives.",
    ],
    [
      "What line does Git LFS add to .gitattributes?",
      "Running git lfs track \"*.psd\" writes *.psd filter=lfs diff=lfs merge=lfs -text. The filter attribute routes the file through the LFS clean/smudge filter so only a small pointer file is stored in git, while -text stops any line-ending conversion of the pointer's target.",
    ],
    [
      "Do I need to do anything after adding .gitattributes to an existing repo?",
      "Yes — run git add --renormalize . and commit. Attributes only affect files as they are added, so files already in the index keep their old line endings until they are renormalized. Expect a one-time commit that touches every file whose stored line endings change.",
    ],
  ],
};

export default seo;
