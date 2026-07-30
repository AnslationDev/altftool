const seo = {
  intro:
    "The Freelancer Privacy Starter Kit scores how well a solo professional keeps three things apart — personal identity, business identity and each client's data — across seventeen weighted controls covering accounts, devices, file sharing, contracts and invoicing. It also estimates blast radius: the number of client datasets a single compromised login could still reach, calculated from the datasets you admit to holding and the controls you have completed. Aimed at designers, developers, writers, consultants and anyone who is the processor for several clients at once with no IT department behind them.",
  useCases: [
    "Answer a client's security questionnaire honestly before signing a contract that includes data-protection terms.",
    "Decide what to fix first when one Google account currently holds every client's files, invoices and contracts.",
    "Set a retention rule and clear out archives from clients whose projects ended years ago.",
    "Get your home address off invoices, contracts and the public WHOIS record for your business domain.",
  ],
  benefits: [
    [
      "Blast radius, not just a tick list",
      "Shows how many client datasets one stolen login reaches, so the cost of skipping separation is visible.",
    ],
    [
      "Built around processor duties",
      "Covers written processing terms, a subprocessor list and an agreed breach process, not only device hygiene.",
    ],
    [
      "Ordered by impact",
      "Multi-factor authentication and per-client access carry the most weight; cosmetic steps carry the least.",
    ],
  ],
  faqs: [
    [
      "How do I keep my home address off client invoices?",
      "Use a registered business address, a coworking address or a post box on invoices, contracts and your website, and turn on WHOIS privacy at your domain registrar. Invoices get forwarded, filed and sometimes published, so an address on one is effectively permanent.",
    ],
    [
      "Am I a data controller or a data processor as a freelancer?",
      "When you decide why and how personal data is used — your own client list, your marketing — you are the controller. When you handle personal data on a client's instructions, such as editing their customer database, you are usually a processor, which normally requires a written processing agreement covering purpose, security measures, subprocessors and deletion.",
    ],
    [
      "How long should a freelancer keep client files?",
      "Set a written period and follow it: a common pattern is deleting working files a defined number of days after final payment while keeping invoices for the statutory tax retention period in your country. Data you no longer hold cannot be leaked or requested, so retention limits are a security control as well as a compliance one.",
    ],
    [
      "What do I do if I lose a laptop with client data on it?",
      "Trigger the process you agreed in the contract: tell the affected clients without undue delay, record what data was on the device, and confirm whether disk encryption was on, since an encrypted device is usually treated very differently from an unencrypted one. Under the GDPR a controller must notify its supervisory authority within 72 hours of becoming aware of a personal data breach, so clients typically require a much faster alert from you — take legal advice on your specific obligations.",
    ],
  ],
};

export default seo;
