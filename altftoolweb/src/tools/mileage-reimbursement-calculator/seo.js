const seo = {
  title: "Mileage Reimbursement Calculator: HMRC 45p/25p Tiers",
  metaDescription:
    "Two-tier rates handled properly: 45p to 10,000 miles then 25p, with miles already claimed deducted. IRS and per-km presets, tolls, parking, fuel check.",
  steps: [
    "Choose a Rate preset — UK · HMRC car or van (45p / 25p), US · IRS business, or India · typical employer car rate (₹12/km) — or set Rate per km/mi and Threshold distance (0 = flat rate) yourself.",
    "Enter One-way distance per trip and Number of trips, tick Return journey (double the distance), and put your year-to-date total in Distance already claimed this year so the higher-rate allowance is reduced correctly.",
    "Read Total distance split into At the first rate and Above the threshold, with the passenger supplement, Tolls paid, Parking paid and Fuel used at your rate, then press Copy result.",
  ],
  intro:
    "Mileage reimbursement is distance multiplied by an approved per-unit rate, plus out-of-pocket costs like tolls and parking, and this calculator does that with the tiering real schemes use. It handles a two-rate structure such as HMRC's Approved Mileage Allowance Payments — 45p per mile for the first 10,000 business miles of the tax year and 25p after that — by tracking the miles already claimed, and it supports flat rates such as the IRS standard mileage rate or an employer's own per-kilometre figure. Enter your fuel price and efficiency and it also shows how much of the payment is left once fuel is paid for.",
  useCases: [
    "A UK employee at 9,000 business miles working out how much of the next trip still qualifies for 45p a mile.",
    "An Indian sales executive claiming 45 km each way for eight client visits at the company's ₹12 per kilometre policy rate.",
    "Checking whether a low per-kilometre rate actually covers fuel, before agreeing to use your own car for work.",
  ],
  benefits: [
    [
      "Threshold handled properly",
      "Miles already claimed this year are deducted from the higher-rate allowance, so a claim that straddles the threshold splits correctly.",
    ],
    [
      "More than just distance",
      "Passenger supplements, tolls and parking are added separately, and the blended rate per unit is shown.",
    ],
    [
      "Fuel reality check",
      "Fuel cost for the same distance is calculated so you can see what is left to cover tyres, servicing and depreciation.",
    ],
  ],
  faqs: [
    [
      "What is the HMRC mileage rate?",
      "For cars and vans the approved rate is 45p per mile for the first 10,000 business miles in the tax year and 25p per mile beyond that; motorcycles are 24p and bicycles 20p with no threshold. A further 5p per mile per passenger may be paid where colleagues travel on the same business journey. Payments at or below these rates are free of tax and National Insurance.",
    ],
    [
      "Is there a government mileage rate in India?",
      "No. There is no statutory per-kilometre reimbursement rate in India, so employers set their own — commonly ₹8 to ₹15 per kilometre for a self-owned car. What the Income-tax Rules do fix is the perquisite value where the employer provides the car: Rule 3(2) values it at ₹1,800 a month for engines up to 1.6 litres and ₹2,400 a month above that, with ₹900 a month more if a driver is provided.",
    ],
    [
      "How do I calculate mileage reimbursement for a round trip?",
      "Double the one-way distance, multiply by the number of trips, then apply the rate: 120 miles each way for one return trip is 240 miles, which at 45p comes to £108. Add tolls and parking separately, since those are actual costs rather than part of the per-mile allowance.",
    ],
    [
      "Is mileage reimbursement taxable?",
      "It depends on the rate. In the UK, amounts up to the HMRC approved rates are not taxed and anything above them is treated as taxable pay. In the United States an accountable-plan reimbursement at or below the IRS standard mileage rate is not income to the employee. Treatment varies by country and by how your employer's scheme is set up, so confirm it with your payroll team or a tax adviser.",
    ],
  ],
};

export default seo;
