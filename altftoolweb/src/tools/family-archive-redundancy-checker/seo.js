const seo = {
  title: "Family Photo Backup Checker: 3-2-1 Redundancy",
  metaDescription:
    "Tick where your photos actually live - copies sharing a house, provider or sign-in count once - and score the archive against the 3-2-1-1-0 rule.",
  steps: [
    "Name the collection in \"Which archive are you checking?\" - one at a time, so the wedding video is scored separately from the phone camera roll.",
    "Under \"1. Where this archive is stored\" tick every place holding the full archive, mark \"Checked in the last 12 months\" on the ones you have read back, then tick \"2. Habits already in place\".",
    "Read Independent failure domains, Total copies, Different storage media and Copies a delete cannot reach, then press Copy result.",
  ],
  intro:
    "The Family Photo Archive Redundancy Checker tests whether a photo or video collection genuinely exists in two independent places — copies that cannot be destroyed by the same fire, the same accidental delete or the same locked-out account. It scores your setup against the 3-2-1 backup rule (3 copies, 2 media types, 1 off site) and its 3-2-1-1-0 extension (1 offline or write-once copy, 0 unverified restores), and counts copies that share a failure domain only once. Built for families who assume the phone plus its own cloud sync is a backup, when structurally it is a single copy.",
  useCases: [
    "Find out whether your phone camera roll and its automatic iCloud or Google Photos sync count as one copy or two before you rely on them for twenty years of family pictures.",
    "Check a parent's or grandparent's scanned photo collection so someone other than them can still unlock and restore it.",
    "Audit a wedding video and a raw photo library separately, since the big files usually end up on a single external drive while the phone snaps get all the cloud protection.",
    "Decide which single copy to add first when you can only afford one more drive or one more cloud subscription this year.",
  ],
  benefits: [
    [
      "Counts failure domains, not folders",
      "Two copies in the same house or under the same sign-in are scored as one, which is how they behave in a real disaster.",
    ],
    [
      "Separates sync from backup",
      "Mirrored folders propagate deletions, so the checker tracks how many copies an accidental delete or ransomware run could not reach.",
    ],
    [
      "Forces the restore test",
      "The score only credits copies you have actually opened and read back in the last twelve months — the 0-errors half of 3-2-1-1-0.",
    ],
  ],
  faqs: [
    [
      "Is iCloud Photos or Google Photos a backup?",
      "No — it is a sync. Deleting a photo on your phone deletes it from the synced library too, usually with only a 30 to 60 day trash window before it is gone permanently. It protects you against a lost or broken phone, not against a mistaken delete, a bad import or an account lockout, so it should be counted as part of the same copy as the device it mirrors.",
    ],
    [
      "What is the 3-2-1 backup rule?",
      "Keep 3 copies of the data, on 2 different types of storage, with at least 1 copy off site. It was popularised by photographer Peter Krogh and is echoed in US-CERT and CISA data-backup guidance. The newer 3-2-1-1-0 version adds 1 copy that is offline, air-gapped or immutable, and 0 errors — meaning you have verified a restore rather than assumed one.",
    ],
    [
      "How often should I check that my photo backups still work?",
      "Once a year is a reasonable minimum for a family archive, and after any change of computer, drive or cloud provider. Open real files from the backup copy and confirm they display; an unreadable drive that has sat in a drawer for five years is common, and you only discover it at the moment you need it.",
    ],
    [
      "Do photo prints count as a backup copy?",
      "They count as a partial copy in a completely separate failure domain, which is unusually valuable — prints survive every digital failure at once, including account closures and file-format obsolescence. They will not preserve full resolution, metadata or video, so treat a photo book as insurance against total loss rather than as one of your three digital copies.",
    ],
  ],
};

export default seo;
