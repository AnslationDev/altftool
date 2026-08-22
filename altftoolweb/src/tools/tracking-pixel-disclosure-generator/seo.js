const seo = {
  title: "Tracking Pixel Disclosure Generator",
  metaDescription:
    "Tick the pixels your site loads and get disclosure text, a vendor table with cookie names and purposes, and a real opt-out list.",
  steps: [
    "Fill in Site name, 'Legal entity (controller)', 'Main audience / regime' (EU / EEA, United Kingdom, India (DPDP Act, 2023), California (CCPA/CPRA) or Global audience), 'Lawful basis claimed', 'Your retention period (months)' and a Privacy contact email.",
    "Under 'Pixels and tags on your site', tick the tags you actually load from the ten in the catalogue: Google Analytics 4, Google Ads conversion and remarketing tag, Meta Pixel, LinkedIn Insight Tag, Microsoft Advertising UET tag, TikTok Pixel, Pinterest Tag, Hotjar tracking code, Microsoft Clarity and the Email open-tracking pixel.",
    "Read the Pixel / Vendor / Purpose / Identifiers table, the 'How to opt out' links and the 'Obligations these pixels bring with them' warnings, then press Copy disclosure for the plain-text version.",
  ],
  intro:
    "The Tracking Pixel Disclosure Generator turns a checklist of the advertising and analytics tags on your site into publishable disclosure text: a plain-language explanation of what a pixel is, a table naming each vendor, purpose and stored identifier, and a working opt-out list. It follows GDPR Art. 13(1)(e), which requires the categories of recipients to be disclosed at collection, and flags where ePrivacy Directive Art. 5(3) forces consent before a pixel may store anything on the device. Built for site owners writing or refreshing the tracking section of a privacy policy.",
  useCases: [
    "Write the tracking section of a privacy policy after adding the Meta Pixel and Google Ads conversion tag to a storefront.",
    "Audit which of your tags actually store an identifier in the browser, and therefore need consent rather than legitimate interests.",
    "Prepare the vendor table an auditor or enterprise customer asks for during a security and privacy review.",
  ],
  benefits: [
    ["Vendor detail included", "Each pixel comes with its legal entity, documented cookie names and a real opt-out URL, not a generic placeholder."],
    ["Catches the knock-on duties", "Selecting an advertising pixel surfaces the CPRA sharing opt-out link duty; selecting session replay surfaces input masking."],
    ["Consistency check on retention", "Compares the retention period you claim against each vendor's own default so the policy matches the configuration."],
  ],
  faqs: [
    [
      "Do I have to disclose tracking pixels in my privacy policy?",
      "Yes. GDPR Art. 13(1)(e) requires you to name the recipients or categories of recipients of personal data at the point of collection, and a pixel sends the visitor's IP address, page URL and device details to the vendor. India's DPDP Act, 2023 s.5 requires an itemised notice of the data and purpose, and the CCPA requires disclosure of the categories of personal information shared with third parties.",
    ],
    [
      "Do tracking pixels need consent, or is legitimate interests enough?",
      "Any pixel that stores or reads an identifier on the device needs prior consent under ePrivacy Directive Art. 5(3), implemented in the UK as PECR reg. 6, regardless of which GDPR lawful basis you pick for the processing that follows. Legitimate interests can cover the later analysis but never the act of writing the cookie itself, so the consent gate still has to come first.",
    ],
    [
      "Is a Meta Pixel a sale of personal information under the CCPA?",
      "Sending identifiers to an advertising vendor so it can target ads elsewhere is defined as sharing for cross-context behavioural advertising in Cal. Civ. Code s.1798.140(ah), which carries the same opt-out duty as a sale. That means a homepage link titled Do Not Sell or Share My Personal Information, or the combined Your Privacy Choices link, and honouring the Global Privacy Control browser signal.",
    ],
    [
      "How long should I keep data collected through tracking pixels?",
      "Keep it only as long as the stated purpose requires. Google Analytics 4 free properties allow 2 or 14 months of user-level retention, most advertising platforms default to 13 to 24 months, and periods beyond roughly 26 months attract regulator questions without a documented justification. State a period you have actually configured in each platform. This is informational guidance, not legal advice; consult a privacy lawyer for your specific stack.",
    ],
  ],
};

export default seo;
