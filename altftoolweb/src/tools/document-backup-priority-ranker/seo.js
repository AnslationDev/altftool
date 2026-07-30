const seo = {
  intro:
    "The Document Backup Priority Ranker orders household paperwork by how hard each document is to replace, how quickly you would need it under pressure, and how many other reissues depend on it — then fits the top of that list into the time you actually have today. Replaceability is weighted heaviest, because an e-PAN reprint takes minutes online while a duplicate degree certificate needs an affidavit, a police report and a university fee. Useful for anyone who knows they should scan the family file but has never worked out where to start.",
  useCases: [
    "Spend a focused 45 minutes on the papers that matter instead of scanning the whole cupboard and never finishing.",
    "Work out what a spouse or adult child would need on day one if you were suddenly in hospital and could not answer questions.",
    "Prepare before a house move or a long trip abroad, when originals are in transit and a scan is the only copy you have.",
    "Separate the documents that must live in encrypted storage from the ones that can sit in an ordinary shared folder.",
  ],
  benefits: [
    [
      "Anchored to real reissue effort",
      "Ranking reflects the actual replacement route — online reprint, registrar application, or nothing at all.",
    ],
    [
      "Fits your real session length",
      "Each document carries a realistic find-scan-file time, so the plan matches the minutes you have rather than an ideal day.",
    ],
    [
      "Flags what a scan cannot fix",
      "Wills, sale deeds and share certificates are marked because probate and transfer processes still demand the original.",
    ],
  ],
  faqs: [
    [
      "Which documents should I back up first?",
      "Start with your account recovery kit — 2FA backup codes, recovery email and phone list — because losing it closes the online route to reissuing everything else. Then take the papers that are both slow to replace and needed fast: health insurance details, medical history, passport, will and property deeds. Aadhaar and PAN rank lower than people expect, precisely because both can be re-downloaded or reprinted quickly.",
    ],
    [
      "Is a scanned copy legally valid in India?",
      "It depends on the process. Section 65B of the Indian Evidence Act allows electronic records as evidence with the required certificate, and many banks, insurers and government portals accept self-attested scans or DigiLocker-issued documents. But probate of a will, registration of a property transfer and the transfer of physical share certificates still turn on the original, so treat a scan as a fast-track and a proof of existence rather than a substitute.",
    ],
    [
      "Where should I store scans of sensitive documents?",
      "In encrypted storage whose key is not held in the same account as the files — an encrypted archive, a password manager's secure notes, or an encrypted drive kept off site. Anything that can be used to impersonate you, such as identity documents, bank and demat lists or a full medical history, should never sit in a plain shared cloud folder or an email to yourself.",
    ],
    [
      "How is the priority score calculated?",
      "Each document is rated 1 to 5 on replaceability, urgency and dependency. Those ratings are multiplied by weights of 4, 3 and 2 respectively and normalised to a 0-100 score, so a document that is irreplaceable, needed within hours and blocks everything else scores 100. Anything scoring 70 or above is Tier 1 and should be done today. The ratings are consistent editorial judgements about real reissue processes, not measured statistics.",
    ],
  ],
};

export default seo;
