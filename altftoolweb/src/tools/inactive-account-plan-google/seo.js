const seo = {
  intro:
    "Google's Inactive Account Manager lets you decide in advance what happens to a Google Account that stops being used: it waits 3, 6, 12 or 18 months of inactivity, warns you by email and SMS one month before the period ends, then notifies up to 10 trusted contacts and gives them 3 months to download the data you chose for them. This builder turns those intervals into real dates from an assumed last-activity date, and checks off the setup steps that people usually miss — recovery details, per-contact data selection and telling the contacts they have been named.",
  useCases: [
    "Setting up a digital legacy plan for the first time and wanting to see how long relatives would actually wait.",
    "Comparing a 3-month and an 18-month inactivity period before choosing one.",
    "Checking whether the download window would realistically be used, given how long probate can take.",
    "Recording, alongside a will, which trusted contacts receive which Google products.",
  ],
  benefits: [
    ["Real dates, not intervals", "Warning, trigger, download deadline and deletion dates are calculated with proper month-end handling."],
    ["Flags the silent failure modes", "No trusted contacts plus deletion means everything is destroyed and nobody receives a copy."],
    ["Covers what Google cannot", "Two-factor recovery, a Takeout backup and a note in your will sit outside the account but decide whether the plan works."],
  ],
  faqs: [
    [
      "How long does Google wait before triggering an inactive account plan?",
      "You choose 3, 6, 12 or 18 months of inactivity. One month before that period ends, Google sends a warning to your recovery email address and a text message to your phone, so the plan only fires if you do not respond to either.",
    ],
    [
      "How many trusted contacts can Google notify?",
      "Up to 10, and you choose separately for each one which products they may download — so one person can receive Photos without receiving Gmail. Once notified, a contact has 3 months to download the data before the link stops working.",
    ],
    [
      "Does Inactive Account Manager delete my Google Account?",
      "Only if you ask it to. If you switch deletion on, it happens 3 months after the trusted contacts are notified, and it removes Gmail, Photos, Drive and YouTube permanently. Separately from any plan, Google's inactivity policy allows removal of an account unused for 2 years.",
    ],
    [
      "Should I just give a family member my Google password instead?",
      "Sharing passwords breaches Google's terms and usually fails at the two-factor step anyway. The supported routes are Inactive Account Manager set up in advance, or a request to Google about a deceased user's account afterwards, which is reviewed case by case with no guaranteed outcome. This is general information, not legal advice — raise digital assets with your solicitor when you write your will.",
    ],
  ],
};

export default seo;
