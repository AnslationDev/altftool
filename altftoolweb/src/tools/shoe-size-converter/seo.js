const seo = {
  intro:
    "This converter maps a shoe size between the UK, US, EU and Indian systems and back to foot length in centimetres, using separate men's, women's and kids' charts built on standard Brannock last measurements. Indian sizes match UK numbering exactly, US men's run one size above UK and US women's run two above, while EU sizes follow Paris-point stepping. Enter any one value — including a measured foot length — and every equivalent is shown at once, so you can order from an overseas site without guessing.",
  useCases: [
    "Order trainers from a US site when you normally buy UK 8 and need to know that is a US 9 men's, EU 42, 26.2 cm",
    "Buy shoes for a child who has just been measured at 17.5 cm and find the UK, US 'C' and EU size that fits with growing room",
    "Convert a women's EU 38 listing on a European store into the UK 5 / US 7 you actually wear before checkout",
  ],
  benefits: [
    ["Separate men's, women's and kids' charts", "US women's sizing runs two numbers above UK, not one, so a single unisex table would put you a full size out."],
    ["Foot length as a first-class input", "Enter centimetres measured against a wall and get a size directly, instead of working backwards from a brand's chart."],
    ["Tells you when you fall between sizes", "A length that lands between two rows recommends sizing up rather than silently rounding to the nearest number."],
  ],
  faqs: [
    [
      "What is UK 8 in US and EU sizes?",
      "UK 8 men's is US 9 and EU 42, with a foot length of about 26.2 cm. For women, UK 8 is US 10 and EU 42, around 25.8 cm — the US number differs because US women's sizing sits two numbers above UK rather than one.",
    ],
    [
      "Is Indian shoe sizing the same as UK?",
      "Yes — Indian shoe sizes use the same numbering as UK sizes, so an Indian 9 is a UK 9. That is why this tool shows the IN and UK columns with identical values, and why Indian brands convert cleanly to UK charts but not to US ones.",
    ],
    [
      "How do I measure my foot length correctly?",
      "Stand with your heel against a wall on a sheet of paper, mark the tip of your longest toe, and measure from the wall to that mark in centimetres. Do it in the evening when feet have swollen, measure both feet and use the longer one, then add about 1 cm of toe room before entering the number.",
    ],
    [
      "Why does the same size fit differently across brands?",
      "Because size numbers describe the last, not the finished shoe, and every brand cuts its last differently. Nike and Puma commonly run about half a size small, Converse and Vans tend to run large, while adidas and New Balance are broadly true to size — so treat a converted size as your starting point and check the specific brand's own chart.",
    ],
  ],
};

export default seo;
