const seo = {
  title: "Windows Child Account Setup: Family Safety",
  metaDescription:
    "Set up a Windows child account: standard-user rights first, screen-time schedules, Store age ratings, purchase approval, and the Edge-only catch.",
  steps: [
    "Enter the child's age in years (3-17) and the school-night and weekend limits in minutes a day; the table then lists each day's limit.",
    "Work through the four checklist groups — Create the child account, Set screen time and schedules, Filter web, apps and games, and Spending and review — ticking each step as you do it.",
    "The Setup score is held at 69% while a Critical step such as the standard-user account is open; read Screen time a week and Hours a year at this rate, then press Copy result.",
  ],
  intro:
    "The Windows Family Account Setup Guide walks through creating a child account in Microsoft Family Safety and making it stick: the child's own Microsoft account inside your family group, a standard-user Windows profile rather than an administrator, screen time and allowed-hours schedules, age rating limits for the Microsoft Store, and purchase approval. It is built around the two facts that catch most parents out — an administrator account can uninstall every control, and Microsoft's web filtering works only in Microsoft Edge, so switching it on blocks other browsers for that account by design. It also converts the weekday and weekend daily limits into the weekly and yearly totals they really mean.",
  useCases: [
    "Setting up a family laptop for a ten-year-old who has been using a parent's login until now.",
    "Working out why the filters keep being removed, and discovering the child account has administrator rights.",
    "Applying the same time limits to a PC and an Xbox so the play does not simply move rooms.",
    "Deciding on a weekday and weekend limit after seeing what they add up to over a year.",
  ],
  benefits: [
    [
      "Fixes the account type first",
      "Standard-user rights are treated as critical, because an administrator can undo everything else.",
    ],
    [
      "Explains the Edge trade-off",
      "Web filtering blocking Chrome and Firefox is flagged before you switch it on, not discovered mid-homework.",
    ],
    [
      "Limits in real numbers",
      "Two daily figures become a weekly total, a daily average and an annual figure worth discussing.",
    ],
  ],
  faqs: [
    [
      "Why can my child turn off Microsoft Family Safety?",
      "Almost always because their Windows account is an administrator. An administrator can uninstall filtering, create another local account and switch off Defender. Change the account to Standard user in Settings > Accounts > Family & other users, and the rest of the controls start holding.",
    ],
    [
      "Does Microsoft Family Safety block Chrome?",
      "Yes, when web and search filtering is on. Microsoft enforces filtering only inside Microsoft Edge, so it blocks other browsers on the child's account rather than letting them browse unfiltered. Tell the child before you turn it on, and check whether the school's tools work in Edge.",
    ],
    [
      "How do I set different screen time limits for weekdays and weekends?",
      "Family Safety takes a separate schedule for each day of the week, combining a daily total with a window of allowed hours. Set the school-night figure Monday to Friday and a longer one on Saturday and Sunday, and use the allowed-hours window rather than the total to protect sleep.",
    ],
    [
      "Can I stop my child buying games without asking?",
      "Turn on the requirement for organiser approval before anything is bought or downloaded from the Microsoft Store, including free items, and take saved cards off the child's account so gift-card balance is the only spending route. In-game currency inside a free title is the usual source of a surprise bill.",
    ],
  ],
};

export default seo;
