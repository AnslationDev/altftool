const seo = {
  title: "Subscription Wind-Down Planner for Digital Inheritance",
  metaDescription:
    "List recurring charges and get an ordered cancellation sheet: next renewal date, cost per year, and whether Apple, Google Play, a card or UPI bills it.",
  steps: [
    "Add each recurring charge with its service name, amount per charge in INR, billing cycle, last charged date and whether it is billed through Apple, Google Play, a card mandate or UPI AutoPay.",
    "Set Plan from this date and the Unattended window (months), then tick the box on any subscription holding files, photos or a domain the family would lose.",
    "Read the Wind-down order for each next charge date, cost per year and cancellation route, then press Copy sheet to save the handover list.",
  ],
  intro:
    "Subscription Wind-Down Planner converts a list of recurring charges into an ordered cancellation sheet, showing the next renewal date, the annualised cost and the exact channel each subscription can be stopped through. Renewal dates are projected with calendar-month arithmetic and end-of-month clamping, so a 31st anchor correctly falls to the 28th or 29th in February and returns to the 31st afterwards. It is built for anyone preparing a digital-inheritance file, an executor working through someone's accounts, or a person who has just lost the card every mandate was tied to.",
  useCases: [
    "Prepare the subscription page of a digital-inheritance folder so an executor knows what is billing and where to stop each one.",
    "Work out what a year of unattended renewals would cost while an estate is still in probate.",
    "Separate accounts that hold photos, documents or a domain — which need a data export first — from accounts that can simply be cancelled.",
    "Audit your own recurring spend after a card reissue, when forgotten mandates quietly resume.",
  ],
  benefits: [
    [
      "Cancellation route, not just a name",
      "Records whether a charge is billed by Apple, Google, a card mandate, UPI AutoPay or an invoice — because each is cancelled somewhere different.",
    ],
    [
      "Accurate renewal dates",
      "Month-end anchors are clamped the way real billing behaves instead of drifting a day earlier every February.",
    ],
    [
      "Export-before-close flagging",
      "Accounts holding irreplaceable content are ordered ahead of pure money drains so nothing is destroyed by an early cancellation.",
    ],
  ],
  faqs: [
    [
      "How do I cancel a subscription bought inside an app?",
      "If it was bought through the App Store or Google Play, it can only be cancelled in that store account — Settings > Apple Account > Subscriptions on Apple devices, or play.google.com/store/account/subscriptions on Android. The app publisher cannot cancel it for you, and deleting the app does not stop billing.",
    ],
    [
      "Does blocking or cancelling the card end a subscription?",
      "No. Blocking a card stops the payment but not the contract, so the provider can still treat the account as active and pursue arrears, and a reissued card number can revive the mandate. Cancel the service itself and keep the confirmation email as proof.",
    ],
    [
      "Why do small subscriptions survive longer than large ones?",
      "Under the Reserve Bank of India's e-mandate framework, recurring debits above Rs 15,000 need fresh authentication from the cardholder at each debit, so they fail once nobody can approve them. Mandates under that limit keep charging automatically and are the ones that run for years unnoticed.",
    ],
    [
      "What should go in a digital-inheritance file besides subscriptions?",
      "Alongside this list, note where account recovery is set up, which accounts hold irreplaceable files, and any legacy-contact settings the provider offers. This planner is informational only; how accounts and money actually pass on depends on your will and local law, so confirm the arrangement with a lawyer.",
    ],
  ],
};

export default seo;
