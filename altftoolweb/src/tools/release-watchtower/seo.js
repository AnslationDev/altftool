const seo = {
  intro:
    "Release Watchtower looks up the newest published release of any public GitHub repository through the GitHub REST endpoint /repos/{owner}/{repo}/releases/latest and reports the tag, publish timestamp, prerelease flag and attached asset count. It is for developers and release managers who need to confirm what version a dependency is currently on without cloning the repo or logging into GitHub. Paste either an owner/repo pair such as vercel/next.js or a full github.com URL and you get the current answer plus a link to the release page.",
  useCases: [
    "A dependency alert says you are behind, and you want to see the actual latest tag and publish date for that repo before deciding whether the upgrade is urgent.",
    "You are writing release notes or a changelog entry and need the exact tag string and publication timestamp of an upstream project you depend on.",
    "You are waiting on a fix that was merged upstream and want to check whether it has been cut into a tagged release yet, and whether that release carries downloadable assets.",
  ],
  benefits: [
    ["One field, one answer", "Accepts a bare owner/repo or a pasted github.com URL and normalises it before querying, so you do not have to hunt through the Releases tab."],
    ["Reports the metadata that decides upgrades", "Tag, publish time, prerelease status and asset count sit in one table instead of being spread across the release page."],
    ["Always shows its source", "Every result carries the fetch timestamp and a direct link to the GitHub release it came from, so you can verify it in one click."],
  ],
  faqs: [
    [
      "How do I find the latest release version of a GitHub repo?",
      "Enter the repository as owner/repo — for example vercel/next.js — and request a current reading; the tool returns the release tag, its published date and a link to the release page. It reads GitHub's own latest-release endpoint, so the answer matches what the Releases page shows.",
    ],
    [
      "Does the latest release include prereleases and betas?",
      "No. GitHub's latest-release endpoint returns the most recent release that is neither a draft nor a prerelease, sorted by creation date, so beta and release-candidate tags are excluded. The result table still shows a Prerelease row so you can see how the release is flagged.",
    ],
    [
      "Will this notify me when a new release ships?",
      "No — it checks on demand when you request a reading, and does not run in the background or send alerts. Each result is stamped with the time it was fetched, so re-run the check whenever you need a fresh answer.",
    ],
    [
      "Why did a repository return no result?",
      "Usually because the repository is private, has no published releases at all, or the owner/repo spelling is wrong. Projects that only push git tags without creating GitHub Releases return nothing from this endpoint even though tags exist; GitHub's public API rate limits can also cause a temporary failure.",
    ],
  ],
};

export default seo;
