const seo = {
  title: "Beta Tester NDA Generator: Feedback, Telemetry, CFAA",
  metaDescription:
    "Build a closed-beta NDA with a perpetual feedback licence, a CFAA safe harbour for good-faith security testing and GDPR notice for crash telemetry.",
  steps: [
    "Enter the Company running the beta, the Programme or build name, Where bugs and questions go, the Governing law, and the Programme starts and Programme ends dates.",
    "Tick the Programme profile boxes that apply — testers in the EU or UK, build sends crash logs or usage telemetry, testers may be under 18, physical prototype hardware is loaned out — and each one adds the clauses it makes necessary.",
    "Set the Confidentiality tail (months after end), Vulnerability disclosure window (days) and Uninstall and delete within (days), clear anything under \"Required clauses missing\", then press Copy NDA.",
  ],
  intro:
    "A beta tester NDA is the agreement that keeps a pre-release build confidential while settling three things a generic template misses: who owns the ideas testers send back, what the build reports home about them, and whether poking at its security is permitted. This generator assembles one from clauses tied to identifiable rules — a perpetual feedback licence, a Computer Fraud and Abuse Act safe harbour for good-faith research, GDPR Article 13 transparency for crash telemetry and the 18 U.S.C. section 1833(b) trade secret immunity notice. It is aimed at product and developer-relations teams running closed betas of software or prototype hardware.",
  useCases: [
    "Open a closed beta of an unreleased app to 200 external testers with a single agreement that covers screenshots, streaming and public bug trackers.",
    "Authorise security researchers on a beta explicitly, so testing the build is not unauthorised access, and fix a 90-day coordinated disclosure window.",
    "Ship prototype hardware to reviewers with a return deadline and a ban on disassembly and competitive benchmarking.",
    "Check an existing beta agreement for the feedback licence that lets you implement a tester's suggestion without a permission question.",
  ],
  benefits: [
    [
      "Feedback ownership settled",
      "A perpetual, royalty-free licence plus a waiver, so an implemented suggestion is not a later dispute.",
    ],
    [
      "Security research made lawful",
      "An express safe harbour turns unauthorised access into permitted testing under 18 U.S.C. section 1030.",
    ],
    [
      "Telemetry disclosed properly",
      "Crash logs and watermarked builds are named as personal data, with the privacy notice pointed to rather than replaced.",
    ],
  ],
  faqs: [
    [
      "Do beta testers actually need to sign an NDA?",
      "Only if you need the build kept secret — an open or public beta usually runs on ordinary terms of service instead. A closed beta of unannounced features is where an NDA earns its place, because without one there is no contractual duty stopping a tester from posting screenshots on the day they get access.",
    ],
    [
      "Who owns feedback and bug reports a tester sends?",
      "The tester owns the copyright in what they wrote unless the agreement says otherwise, which is why a beta NDA grants the company a perpetual, irrevocable, royalty-free licence to use it. Ideas themselves are not protected by copyright — 17 U.S.C. section 102(b) excludes ideas and methods of operation — but a tester who contributes to conceiving a patented feature can still raise a joint-inventor question under 35 U.S.C. section 100(f).",
    ],
    [
      "Can a tester get in trouble for finding a security bug in a beta?",
      "They can, unless the agreement authorises the testing. The Computer Fraud and Abuse Act, 18 U.S.C. section 1030, turns on what the operator authorises, so an express safe harbour with defined limits — your own accounts only, no data exfiltration, no denial of service, report rather than exploit — is what makes good-faith research permitted rather than risky.",
    ],
    [
      "How long should a beta NDA keep information confidential after the beta ends?",
      "Two years after the programme closes is a common tail, since most unreleased detail is public by then, and trade secrets stay protected for as long as they remain secret regardless of the stated term. Set the tail against your release cycle rather than copying a number, and take legal advice before relying on it.",
    ],
  ],
};

export default seo;
