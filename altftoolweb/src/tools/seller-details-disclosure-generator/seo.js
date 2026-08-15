const seo = {
  title: "Seller Details Disclosure Generator",
  metaDescription:
    "Build the e-commerce seller identity block Rules 4(2) and 5(3) require, with the GSTIN checksum, PAN pattern and 21-character CIN checked as you type.",
  steps: [
    "Pick your Legal form and Where you sell, then fill Legal name, Website address and the Registered or principal place of business.",
    "Add the Customer care email, phone and hours, then the GSTIN (15 characters), PAN (10) and CIN (21) — the fifteenth GSTIN character is recomputed from the first fourteen by the mod-36 algorithm and flagged if it disagrees.",
    "The \"Fields in the disclosure block\" counter names any mandatory particular still missing; switch the output between Plain text and HTML, then press Copy block.",
  ],
  intro:
    "The Seller Details Disclosure Generator builds the identity block an online store must publish — legal name, legal form, principal and branch addresses, website, customer care email, phone and hours, plus GSTIN, PAN and CIN. Rules 4(2) and 5(3) of the Consumer Protection (E-Commerce) Rules, 2020 make those particulars mandatory for e-commerce entities and for sellers listing on a marketplace. It also validates the GSTIN against its mod-36 check character, the PAN against its five-letters-four-digits-one-letter pattern, and the CIN against its 21-character structure.",
  useCases: [
    "Fill the 'Seller information' section a marketplace demands before your listings go live.",
    "Create the footer or About block for your own Shopify or WooCommerce store in a copy-paste HTML snippet.",
    "Catch a typo in a GSTIN before it goes on an invoice template, using the check character rather than eyeballing it.",
    "Confirm the PAN on file matches the entity type — a company PAN carries C in the fourth position, a firm carries F.",
  ],
  benefits: [
    [
      "Real checksum validation",
      "Recomputes the fifteenth character of the GSTIN from the first fourteen, so a transposed digit is caught immediately.",
    ],
    [
      "Cross-checks the numbers",
      "Compares the PAN embedded inside the GSTIN with the PAN you entered and flags any mismatch.",
    ],
    [
      "Two output formats",
      "Gives plain text for a marketplace form and a semantic HTML fragment for your own site.",
    ],
  ],
  faqs: [
    [
      "What seller details must be displayed on an e-commerce website in India?",
      "Under Rule 4(2) of the Consumer Protection (E-Commerce) Rules, 2020 an e-commerce entity must display its legal name, the principal geographic address of its headquarters and all branches, the name and details of its website, and customer care contact details. Rule 5(3) applies the same requirement to sellers listing on a marketplace, with GSTIN and PAN where applicable.",
    ],
    [
      "How is a GSTIN structured?",
      "Fifteen characters: a two-digit state code, the ten-character PAN of the registered person, a one-character entity code for that PAN in the state, the letter Z, and a check character computed by a mod-36 algorithm over the first fourteen. So 27 at the start means the registration is in Maharashtra.",
    ],
    [
      "Does a private limited company have to publish its CIN on the website?",
      "Yes. Section 12(3)(c) of the Companies Act, 2013 requires a company to print its name, registered office address, Corporate Identity Number, telephone number and email on all business letters, billheads and other official publications, and a website is treated as such a publication in practice.",
    ],
    [
      "Does this tool confirm my GSTIN is genuine?",
      "No. It checks that the number is well-formed and that the checksum is internally consistent, which catches typing errors. Whether the registration is active and belongs to you can only be confirmed on the GST portal's search facility, and company details on the MCA portal.",
    ],
  ],
};

export default seo;
