const seo = {
  title: "FSSAI Licence Selector: Basic, State or Central",
  metaDescription:
    "Apply the Rs 12 lakh and Rs 20 crore turnover bands, Schedule 1 capacity and central triggers to get your FSSAI category, Form A or B, fee and checklist.",
  steps: [
    "Choose \"What kind of food business is it\" and enter your annual turnover in INR.",
    "Enter the figure the Capacity field asks for, such as kg or litres produced per day or MT of storage capacity, then tick anything under \"Does any of this apply?\" like importing food.",
    "Read the category under \"You need\", the form to file on the FoSCoS portal, the government fee a year and the \"Documents to keep ready\" checklist.",
  ],
  intro:
    "This selector tells a food business operator whether it needs FSSAI basic registration, a state licence or a central licence under the Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations, 2011. It applies the turnover ladder — petty registration up to Rs 12 lakh, state licence up to Rs 20 crore, central licence above that — together with the Schedule 1 capacity thresholds and the categories that force a central licence irrespective of turnover. It is built for restaurant owners, cloud kitchens, traders and food manufacturers preparing a FoSCoS application.",
  useCases: [
    "A home baker or cloud kitchen with under Rs 12 lakh turnover checking whether Form A basic registration is enough",
    "A snacks manufacturer producing 150 kg a day discovering that capacity, not turnover, pushes them into a state licence",
    "An importer or e-commerce food seller confirming they need a central licence even at a small turnover",
  ],
  benefits: [
    ["Full Schedule 1 logic", "Capacity thresholds, importer and e-commerce triggers and the Rs 30 crore wholesaler band are all applied, not just turnover."],
    ["Reasoned verdict", "Every answer lists the exact regulation-based reasons that produced the category."],
    ["Application-ready", "Shows the form (A or B), the authority, the annual fee band and a document checklist for the category."],
  ],
  faqs: [
    [
      "What is the turnover limit for FSSAI basic registration?",
      "Rs 12 lakh a year. Regulation 2.1.1 treats an operator with annual turnover up to Rs 12 lakh as a petty food business that registers in Form A instead of taking a licence — provided its production capacity also stays within the petty limits, such as 100 kg or litres a day for a manufacturing unit.",
    ],
    [
      "When is a central FSSAI licence required instead of a state licence?",
      "When annual turnover exceeds Rs 20 crore (Rs 30 crore for wholesalers and transporters), when capacity crosses the Schedule 1 ceiling — for example over 2 MT a day of manufacturing or over 50,000 litres of milk a day — or when the business falls in a listed central category such as importer, 100% export oriented unit, e-commerce food platform, an outlet at an airport, seaport, railway or defence premises, or the head office of a multi-state operation.",
    ],
    [
      "How much does an FSSAI licence cost per year?",
      "Basic registration costs Rs 100 a year, a state licence Rs 2,000 to Rs 5,000 a year depending on the Schedule 3 category, and a central licence Rs 7,500 a year. A licence can be taken for 1 to 5 years at a time, and renewing after expiry attracts a late fee of Rs 100 per day.",
    ],
    [
      "Can a small business still need a licence if its turnover is below Rs 12 lakh?",
      "Yes. The petty definition caps capacity as well as turnover, so a unit producing more than 100 kg or litres of food a day, handling more than 500 litres of milk a day, or slaughtering above the petty limits needs at least a state licence whatever it earns. Schedule 1 central categories like importing also override turnover entirely. This tool is informational — confirm the final category on the FoSCoS portal or with a compliance professional.",
    ],
  ],
};

export default seo;
