const seo = {
  intro:
    "This board turns a list of filing dates, limitation dates and reply dates into a single ranked countdown, showing calendar days left, working days left and the date drafting should begin. Working days are counted as every day after today up to and including the due date that is not a Saturday, Sunday or a registry holiday you enter, which is how a docketing clerk counts time. It is built for advocates, in-house counsel, paralegals and compliance officers who juggle several matters at once.",
  useCases: [
    "A litigation associate tracking a written statement, a rejoinder and an appeal limitation across three matters on one screen",
    "A company secretary checking how many working days remain before a filing window closes when a court vacation falls in between",
    "A paralegal setting a start-drafting date fourteen days before a trademark opposition deadline and seeing which files are already late to start",
  ],
  benefits: [
    ["Working days, not just dates", "Weekends and the holiday dates you list are removed from the count."],
    ["Start-by date, not only due date", "Each row shows when drafting must begin for the lead time you set."],
    ["Ranked by urgency", "Overdue and same-day items sort to the top with colour-coded bands."],
  ],
  faqs: [
    [
      "How do I calculate how many days are left until a legal deadline?",
      "Subtract today's date from the due date in whole calendar days — a due date of the 10th counted from the 1st leaves 9 days. For procedural purposes also count the working days, since weekends and court holidays inside that span reduce the time you actually have to draft and file.",
    ],
    [
      "Do weekends count towards a court filing deadline?",
      "Weekends usually count towards the calendar period fixed by statute, but they are not days on which you can file. Many procedural codes also extend a period that ends on a holiday to the next working day, so track both counts and confirm the extension rule in the statute that governs your matter.",
    ],
    [
      "How far in advance should I start drafting before a deadline?",
      "Set the lead time to the realistic drafting and review effort — commonly 2 to 3 days for a short reply and 10 to 14 days for a pleading needing client sign-off. The board converts that lead time into a start-by date and flags any matter whose start date has already passed.",
    ],
    [
      "Is this a substitute for a docketing system or legal advice?",
      "No. It is an informational planning aid that counts days from the dates you enter; it does not know the limitation statute, service dates or condonation rules that apply to your case. Verify every critical date against the governing rules or with your advocate.",
    ],
  ],
};

export default seo;
