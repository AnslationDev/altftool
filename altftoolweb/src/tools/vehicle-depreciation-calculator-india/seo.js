const seo = {
  title: "Car Depreciation Calculator India: IDV and Tax WDV",
  metaDescription:
    "Ex-showroom price and age in months give the motor tariff value, 5% under six months to 50% at five years, beside the 15% or 30% written down value.",
  steps: [
    "Enter the ex-showroom or listed price when new and the age of the vehicle in months.",
    "Pick the income tax depreciation block, motor car at 15% or bus, lorry or taxi on hire at 30%, and set your condition adjustment.",
    "Compare the value on the motor tariff schedule against the year-by-year written down value table, then press Copy result.",
  ],
  intro:
    "This calculator applies the two depreciation schedules that are written down in Indian rules rather than estimated: the motor tariff schedule of depreciation, which reduces a vehicle's listed price by 5% under six months rising to 50% at five years and is what insurers use to fix insured value, and the income tax written down value method at 15% for a motor car or 30% for a bus, lorry or taxi run on hire. Enter the ex-showroom price and the vehicle's age to see both figures side by side, along with a year-by-year table. Beyond five years the tariff table stops and value is mutually agreed, so the model continues at a rate you choose.",
  useCases: [
    "Checking whether the insured declared value an insurer has offered at renewal matches the tariff table for the car's age",
    "Working out the written down value of a company car for the balance sheet after three years of 15% depreciation",
    "Setting a realistic asking price when selling a five-year-old vehicle privately",
  ],
  benefits: [
    ["Two schedules, one screen", "Insurance value and income tax book value from the same inputs."],
    ["Exact age slabs", "Handles the six-month and one-year boundaries the tariff table turns on."],
    ["Half-year rule included", "Applies half depreciation when the vehicle was used under 180 days in year one."],
  ],
  faqs: [
    [
      "What is the depreciation rate for a car in India?",
      "It depends which rule you are applying. For insured declared value the motor tariff schedule uses 5% up to six months, 15% up to one year, 20% up to two years, 30% up to three, 40% up to four and 50% up to five years. For income tax, a motor car not used in a hire business is a 15% written-down-value block, while buses, lorries and taxis run on hire get 30%.",
    ],
    [
      "How is a vehicle valued after five years?",
      "The tariff schedule of depreciation only runs to five years. Beyond that the insured declared value is mutually agreed between the insurer and the owner, usually by continuing to reduce the value each year or by taking a dealer's assessment, which is why two insurers can quote different figures for the same old car.",
    ],
    [
      "Is depreciation calculated on the ex-showroom price or the on-road price?",
      "On the manufacturer's listed selling price of the vehicle, that is the ex-showroom price of the model and variant. Registration charges, road tax and insurance are not part of the base, because they are not recoverable on a sale and never form part of the insured value.",
    ],
    [
      "What is the 180 day rule for vehicle depreciation under income tax?",
      "If an asset is put to use for less than 180 days in the financial year it is acquired, only half the normal depreciation is allowed in that year under the second proviso to section 32(1). A car bought in January and used from February therefore gets 7.5% instead of 15% in year one, with the full rate resuming from the next year.",
    ],
  ],
};

export default seo;
