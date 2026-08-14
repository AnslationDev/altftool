const seo = {
  title: "ROAS Calculator with Break-Even ROAS & Profit Check",
  metaDescription:
    "Revenue ÷ spend is only half the story — enter your margin to get break-even ROAS (3.33× at 30%), estimated profit, ROI and CPA/CPC/AOV/CR.",
  steps: [
    "In the 'ROAS Calculator' tab enter 'Ad spend' and 'Campaign revenue' (currency PLN, INR, USD or EUR) and set 'Gross margin (%)' with the slider or a 15–70% preset.",
    "Press 'Add optional data: conversions and clicks' to include Conversions and Clicks for the funnel metrics.",
    "Read the ROAS, ROI and Break-even ROAS cards plus the estimated result after costs; 'Show supporting metrics: CPA, CPC, AOV and CR' reveals the rest.",
  ],
  intro:
    "The ROAS Calculator divides attributed revenue by ad spend to give Return on Ad Spend, then uses your product margin to work out the break-even ROAS — 1 ÷ net margin — that separates a campaign that looks good from one that actually makes money. At a 30% net margin the break-even is 3.33×, so a 2.5× ROAS is a loss even though the ads returned more revenue than they cost. It is for performance marketers and store owners who need the profit answer, not just the revenue multiple.",
  useCases: [
    "A campaign returns 50,000 in revenue on 10,000 of spend and the 5× ROAS looks strong, until you enter a 30% margin and see whether it clears the 3.33× break-even.",
    "Finance asks how much you can spend next month to hit a revenue target at an agreed ROAS, and you need the maximum budget that satisfies both.",
    "You are comparing several campaigns that all report a positive ROAS and need CPA, CPC, AOV and conversion rate side by side to see which one is actually carrying the account.",
  ],
  benefits: [
    ["Break-even, not just the multiple", "It converts your margin into the minimum ROAS for zero profit, so every result is judged against a threshold instead of against zero."],
    ["Profit and ROI in the same view", "Estimated profit is revenue × net margin − spend, and ROI is that profit over spend, so a revenue-positive campaign that destroys money is visible immediately."],
    ["Funnel metrics from the same inputs", "Add clicks and conversions and it derives CPA, CPC, average order value and conversion rate, showing where a weak ROAS is actually coming from."],
  ],
  faqs: [
    [
      "How do you calculate ROAS?",
      "ROAS = attributed revenue ÷ ad spend. Spend 10,000 and attribute 50,000 in revenue and the ROAS is 5×, usually written as 5:1 or 500%. It measures revenue returned per unit of spend and says nothing about profit on its own.",
    ],
    [
      "What is a good ROAS?",
      "Anything above your break-even ROAS, which is 1 ÷ net margin. At a 50% margin break-even is 2×, at 30% it is 3.33×, and at 20% it is 5× — which is why one advertiser's excellent 4× is another's loss. The calculator computes the threshold from the margin and variable costs you enter.",
    ],
    [
      "What is the difference between ROAS and ROI?",
      "ROAS is a revenue-to-spend ratio; ROI is a profit percentage. Here profit is revenue × net margin − spend and ROI is profit ÷ spend × 100, so a campaign can post a 4× ROAS and a negative ROI whenever margin is thinner than 25%.",
    ],
    [
      "How much can I spend and still hit my target?",
      "Maximum spend = target revenue ÷ target ROAS, and the revenue you need from a given budget = spend × target ROAS. The budget planner reports both plus the ROAS implied by a spend and revenue pair, so you can sanity-check a target before committing to it.",
    ],
  ],
};

export default seo;
