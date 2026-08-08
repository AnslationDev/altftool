const seo = {
  title: "Subprocessor List Page Generator for GDPR Art. 28",
  metaDescription:
    "Build a public subprocessor page with vendor, purpose, data, hosting country and transfer mechanism, flagging non-adequate countries with no SCCs.",
  steps: [
    "Fill Publishing company, Product or service name, Change-notice subscription email, Advance notice before a new subprocessor (days) and Last updated.",
    "Press Add subprocessor for each row, then complete Vendor, Contracting entity, Purpose of processing, Data processed, Hosting country and Transfer mechanism.",
    "Switch the output between Markdown, HTML and CSV, check the Transfers with no documented tool count, then press Copy page.",
  ],
  intro:
    "A subprocessor page is the public list of third parties a processor uses to handle customer personal data, and this generator builds it with the five columns customers and auditors look for: vendor, purpose of processing, data processed, hosting location and the transfer mechanism. It applies GDPR Article 28(2) — a general written authorisation requires you to announce new subprocessors so the controller can object — and checks every non-EEA destination against the European Commission adequacy list, flagging any row that needs Standard Contractual Clauses, Binding Corporate Rules or another Chapter V tool. Output copies out as Markdown, HTML or CSV.",
  useCases: [
    "Publishing the /subprocessors page that a SaaS data processing agreement links to before an enterprise security review.",
    "Answering a customer vendor questionnaire that asks which sub-processors touch personal data and under what transfer safeguard.",
    "Spotting a support or analytics vendor hosted in a third country that has no SCCs recorded against it.",
    "Exporting the list to CSV to reconcile it against your Article 30 record of processing activities.",
  ],
  benefits: [
    ["Adequacy list built in", "Each hosting country is classified as EEA, covered by an adequacy decision, or a third country needing a transfer tool."],
    ["Flags undocumented transfers", "Rows sending data outside the EEA with no mechanism recorded are called out before you publish."],
    ["Three export formats", "Markdown for a docs site, semantic HTML for a CMS, CSV to reconcile against your processing records."],
  ],
  faqs: [
    [
      "What is a subprocessor under GDPR?",
      "A subprocessor is another processor engaged by your processor to carry out part of the processing on the controller's behalf. Article 28(2) allows this only with the controller's prior specific or general written authorisation, and Article 28(4) requires the same data protection obligations to be imposed on the subprocessor by contract.",
    ],
    [
      "How much notice must I give before adding a new subprocessor?",
      "The GDPR sets no fixed number of days — Article 28(2) only says the processor must inform the controller of intended changes so the controller has an opportunity to object. Thirty days is the common contractual figure and the default here; whatever period your DPA promises is what binds you.",
    ],
    [
      "Do I need SCCs for a subprocessor in the United States?",
      "Only if the organisation is not certified under the EU-US Data Privacy Framework. Transfers to DPF-certified organisations rely on the adequacy decision under Article 45; transfers to any other US recipient need the Standard Contractual Clauses adopted by Commission Implementing Decision (EU) 2021/914 or another Chapter V safeguard.",
    ],
    [
      "Does a subprocessor list have to be public?",
      "It does not have to sit on a public URL, but it must reach the controller, and publishing a dated page with an email subscription for change notices is the simplest way to satisfy the notice duty for many customers at once. Confirm what your own data processing agreement commits you to, and take legal advice before relying on a template.",
    ],
  ],
};

export default seo;
