const seo = {
  intro:
    "The Land Area Converter converts Indian land units — bigha, katha, biswa, kanal, marla, guntha, cent, decimal, ground, ankanam and more — using the value that the state you select actually uses, not one national average. Everything is normalised through square feet, so a bigha entered under Uttar Pradesh (27,000 sq ft) and one entered under Madhya Pradesh (12,000 sq ft) give different answers, as they should. It covers 22 states, shows the arithmetic behind each unit, converts plot dimensions in feet to area, and compares the same unit side by side across every state that uses it.",
  useCases: [
    "A broker quotes a plot at 'two bigha' and you need to know whether that means roughly 0.62 acre in UP or 0.33 acre in West Bengal before you agree a price per bigha.",
    "You are buying in Rajasthan, Punjab, Haryana or Delhi where pucca and kacha bigha are both in daily use, and you want to see exactly how much land the difference costs you — in Delhi and Punjab the kacha bigha is one-third of the pucca.",
    "You have a plot measured 40 ft by 60 ft and want it expressed in gaj, cent, guntha and acre for the sale deed and the loan file, then copied out as text.",
  ],
  benefits: [
    ["State-specific values, not one average", "Each of the 22 states carries its own unit table, so a bigha, katha or biswa is converted with the local revenue definition instead of a generic figure."],
    ["The basis is shown for every unit", "Each conversion states its derivation — 8 kanal to the acre, 40 guntha to the acre, 100 cent to the acre — so you can check the number rather than trust it."],
    ["Cross-state comparison built in", "Pick a unit and see its smallest and largest values across every state that uses it, which is how the four-fold spread in the bigha becomes visible."],
  ],
  faqs: [
    [
      "How many square feet is 1 bigha?",
      "It depends entirely on the state: 27,225 sq ft in Rajasthan (pucca), 27,220 in Bihar, 27,000 in Uttar Pradesh, 14,400 in West Bengal, 12,000 in Madhya Pradesh, 8,712 in Himachal Pradesh and 6,804 in Uttarakhand. The bigha was never standardised by central law, so it survives at whatever size the local revenue settlement fixed — a four-fold spread for the same word.",
    ],
    [
      "Which Indian land units are the same everywhere?",
      "Acre, hectare, square foot, square metre and gaj (square yard) are fixed nationally, and so are the units derived directly from the acre: cent is 435.6 sq ft (100 to the acre), guntha is 1,089 sq ft (40 to the acre), kanal is 5,445 sq ft (8 to the acre) and marla is 272.25 sq ft. These cannot drift between districts the way a bigha does.",
    ],
    [
      "What is the difference between pucca and kacha bigha?",
      "Pucca is the full revenue bigha and kacha is a fraction of it — one-third in Delhi and Punjab, and 1/1.5625 in Rajasthan, where pucca is 27,225 sq ft and kacha is 17,424 sq ft. A price per bigha that looks unusually low is often quoted against the kacha bigha, so it is worth asking which one is meant.",
    ],
    [
      "Which unit should be written in the sale deed?",
      "Write the area in square feet or square metres, and put the local unit in brackets only. A deed that says 'two bigha' with no square-foot figure is genuinely ambiguous, since definitions vary by state and sometimes by district. Cross-check the figure against the khasra, 7/12 or RTC record, and have the document reviewed by a property lawyer.",
    ],
  ],
};

export default seo;
