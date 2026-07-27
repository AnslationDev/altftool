const seo = {
  intro:
    "This checker tells you whether your activity needs an Importer-Exporter Code (IEC) from DGFT under section 7 of the Foreign Trade (Development and Regulation) Act, 1992 and Para 2.05 of the Foreign Trade Policy 2023. It applies the full exemption list — personal-use imports, government departments, small border-trade consignments and service exports that claim no FTP benefit — and flags SCOMET items, which are never exempt. It is meant for first-time exporters, freelancers and small traders deciding whether to file form ANF-2A.",
  useCases: [
    "A seller planning a first commercial export shipment confirming an IEC is mandatory before customs clearance",
    "A freelance software developer billing overseas clients checking whether services need an IEC at all",
    "A trader moving small consignments to Nepal testing their CIF value against the Rs 25,000 border-trade exemption",
  ],
  benefits: [
    ["Complete exemption list", "Personal use, government departments and the Nepal, Myanmar and China border-trade ceilings are all applied, not just the headline rule."],
    ["Services handled correctly", "Distinguishes service exports that need no IEC from those that do because FTP benefits are claimed."],
    ["Action plan included", "Shows the ANF-2A route, the Rs 500 fee and the April-June annual update duty when an IEC is needed."],
  ],
  faqs: [
    [
      "Is an IEC code mandatory for exporting goods from India?",
      "Yes for any commercial export or import of goods — customs will not clear a commercial shipment without an IEC. The exceptions are goods for purely personal use, Central and State Government ministries and departments, and small border-trade consignments with Nepal, Myanmar or China within Rs 25,000 CIF per consignment (Rs 1,00,000 through Nathula).",
    ],
    [
      "Do I need an IEC to export services or freelance for foreign clients?",
      "Not usually. Under FTP 2023 Para 2.05, service and technology exporters need an IEC only when they take benefits under the Foreign Trade Policy or deal in SCOMET items. Banks credit foreign remittances against your PAN and an RBI purpose code, though some banks and marketplaces ask for an IEC anyway, so many freelancers obtain one voluntarily.",
    ],
    [
      "How much does an IEC cost and how long does it take?",
      "The DGFT fee is Rs 500, paid online with form ANF-2A on dgft.gov.in, and the code is normally auto-generated the same day. You need a PAN, a bank account in the firm's name and an address proof. Since 2017 the IEC issued is the same as your PAN.",
    ],
    [
      "Does an IEC expire or need renewal?",
      "An IEC has no expiry, but FTP 2023 Para 2.05(e) requires every holder to confirm or update it electronically between April and June each year; miss the window and the IEC is deactivated until you update it. This tool is informational — confirm current DGFT notifications or ask a customs broker for your specific case.",
    ],
  ],
};

export default seo;
