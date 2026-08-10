const seo = {
  title: "Google Takeout Planner: Archive Size, Parts, Risk",
  metaDescription:
    "Pick the Google products to export and see the likely archive size, how many parts at 1, 2, 4, 10 or 50 GB, and how sensitive the bundle is.",
  steps: [
    "Under 'Pick the products to export', tick the Google products you want, or use Select all / Deselect all.",
    "In 'Describe the account', set Account age (years), how much media is stored (Light, Typical consumer account or Heavy), and the 'Maximum part size Takeout should use' — 1, 2, 4, 10 or 50 GB per file.",
    "Read the estimated archive size and part count, the sensitivity score out of 100, and the roughly 7-day link validity; work through the 'How to make the request' checklist and press Copy plan.",
  ],
  intro:
    "This guide plans a Google Takeout export: you choose which Google products to include, and it estimates the archive size, how many part files Takeout will produce at your chosen split size, and how sensitive the resulting bundle is. Takeout is Google's self-service data-portability tool at takeout.google.com, covering 50-plus products from Gmail and Photos to My Activity and Maps Timeline. It is aimed at anyone migrating accounts, keeping an offline backup, or auditing what Google actually holds before deleting anything.",
  useCases: [
    "Estimate whether a ten-year Gmail plus Google Photos export will fit on a laptop before starting a download that runs for days.",
    "Export only My Activity and Maps Timeline to review what search and location data Google has retained, without pulling gigabytes of photos.",
    "Set the maximum part size to 2 GB so every file opens on an older machine or a FAT32 external drive.",
    "Build a migration checklist before closing a Google account, so nothing is lost when the account is deleted.",
  ],
  benefits: [
    ["Size before you start", "See the likely archive total and part count instead of discovering it mid-download."],
    ["Risk-ranked selection", "Each product is rated 1-5 for how much it exposes, so you can drop the riskiest items you do not need."],
    ["Real Takeout options", "Uses Takeout's actual choices: 1, 2, 4, 10 or 50 GB parts, one-off or every-two-months scheduling."],
  ],
  faqs: [
    [
      "How do I download all my data from Google?",
      "Go to takeout.google.com while signed in, click Deselect all, tick only the products you want, then choose delivery method, file type and maximum part size. Google emails a link when the archive is ready, which can take minutes for small selections and hours or days for large Photos or Drive libraries.",
    ],
    [
      "How long is the Google Takeout download link valid?",
      "Roughly seven days, and the number of downloads is limited, so save the archive as soon as the email arrives. If the link expires you have to run the export again from scratch.",
    ],
    [
      "Why is my Google Takeout archive split into several files?",
      "Takeout caps each part at the maximum size you pick in the wizard: 1, 2, 4, 10 or 50 GB. A 40 GB Photos export at a 2 GB cap therefore arrives as about twenty numbered files, and you need every one of them to extract the archive correctly.",
    ],
    [
      "Does Google Takeout include my saved passwords and Timeline?",
      "Passwords are not in Takeout; export those separately from passwords.google.com. Maps Timeline moved to on-device storage from 2024, so recent location history may have to be exported from the phone's Maps app rather than from Takeout. This page is informational only and not legal advice.",
    ],
  ],
};

export default seo;
