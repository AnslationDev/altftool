const seo = {
  title: "MIRR Calculator with Finance and Reinvestment Rates",
  metaDescription:
    "Discounts outflows at the finance rate, compounds inflows at the reinvestment rate, and returns one MIRR per period with the PV and FV used.",
  steps: [
    "In Cash flows from period 0 enter one value per period, negatives for outflows, e.g. -100000, 25000, 30000, 35000, 40000.",
    "Set Finance rate (%) for discounting the negative flows and Reinvestment rate (%) for compounding the positive ones.",
    "Read the % MIRR per period alongside Periods, PV of negative flows and FV of positive flows, then Copy or Download mirr-calculator.txt.",
  ],
  intro:
    "The MIRR Calculator computes the modified internal rate of return from a series of cash flows using two separate rates: negative flows are discounted to period 0 at the finance rate, positive flows are compounded to the final period at the reinvestment rate, and MIRR is the nth root of (future value of inflows / present value of outflows) minus 1. Unlike plain IRR it does not assume every interim cash inflow is reinvested at the project's own return. Analysts, finance students and anyone comparing projects get a rate that reflects the borrowing cost and the reinvestment yield they actually face.",
  useCases: [
    "You have two projects with almost identical IRRs but very different timing of inflows, and you want to rank them under a realistic reinvestment assumption instead of IRR's implicit one.",
    "Your finance textbook or CFA practice set gives a cash-flow series with separate finance and reinvestment rates, and you need to check the MIRR you worked out by hand.",
    "You are building an investment memo where capital costs 8% but idle cash only earns a money-market rate, and a single-rate IRR overstates what the project really returns.",
  ],
  benefits: [
    ["Two rates, stated separately", "Outflows are discounted at the finance rate and inflows compounded at the reinvestment rate, so the cost of capital and the reinvestment yield are never conflated."],
    ["One answer, always", "Because MIRR is a closed-form root rather than a polynomial solve, a series with several sign changes yields exactly one rate instead of the multiple IRRs Descartes' rule allows."],
    ["Shows its working", "The period count, present value of negative flows and future value of positive flows are listed alongside the rate, so a result can be checked line by line."],
  ],
  faqs: [
    [
      "What is the formula for MIRR?",
      "MIRR = (FV of positive cash flows at the reinvestment rate / -PV of negative cash flows at the finance rate)^(1/n) - 1, where n is the number of periods, i.e. one less than the number of cash-flow entries. With flows of -100000, 25000, 30000, 35000, 40000 at an 8% finance rate and 10% reinvestment rate, the future value of inflows is 148,075 over 4 periods, giving a MIRR of about 10.311% per period.",
    ],
    [
      "How is MIRR different from IRR?",
      "IRR is the single rate that sets NPV to zero, which implicitly assumes every interim inflow is reinvested at that same IRR. MIRR replaces that assumption with an explicit reinvestment rate and discounts outflows at a separate finance rate, which is why MIRR is normally lower than a high IRR and higher than a very low one.",
    ],
    [
      "What cash flows do I need to enter?",
      "Start at period 0 and enter one value per period in order, separated by commas, spaces or semicolons, using negative numbers for outflows. The series needs at least two entries with at least one negative and one positive flow — otherwise there is no outflow to finance or no inflow to reinvest, and no rate can be computed.",
    ],
    [
      "Is the result an annual rate?",
      "It is a rate per period, whatever period your cash flows are spaced at. Monthly flows give a monthly MIRR, which you would annualise as (1 + MIRR)^12 - 1; the calculator does no unit conversion, so keep the flow spacing and both input rates on the same basis.",
    ],
  ],
};

export default seo;
