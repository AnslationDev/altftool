export const QUESTIONS = [
  {
    id: 1,
    category: "Time Horizon",
    text: "How long do you plan to hold your investments before needing to liquidate them for major living expenses?",
    options: [
      { key: "A", text: "Less than 1 year (Short-term liquidity need)", score: 1 },
      { key: "B", text: "1 to 3 years (Medium-term plans)", score: 3 },
      { key: "C", text: "3 to 7 years (Long-term growth horizon)", score: 6 },
      { key: "D", text: "More than 7 years (Ultra long-term wealth generation)", score: 10 }
    ]
  },
  {
    id: 2,
    category: "Reaction to Dips",
    text: "Imagine your investment portfolio drops 30% in value over a single week due to a market correction. What is your reaction?",
    options: [
      { key: "A", text: "Panic immediately and sell all assets to preserve remaining capital", score: 1 },
      { key: "B", text: "Feel extremely anxious, hold but monitor closely with constant worry", score: 3 },
      { key: "C", text: "Remain calm, view it as a normal cycle, and stick to the original plan", score: 6 },
      { key: "D", text: "View it as a massive buying opportunity and double-down / buy the dip!", score: 10 }
    ]
  },
  {
    id: 3,
    category: "Investment Objective",
    text: "What is the primary objective of your investment portfolio?",
    options: [
      { key: "A", text: "Capital Preservation: Keep my initial capital absolutely safe with negligible risk", score: 1 },
      { key: "B", text: "Income & Yield: Generate steady interest, staking rewards, or dividend payouts", score: 4 },
      { key: "C", text: "Balanced Compounding: Achieve stable long-term growth with moderate risk exposure", score: 7 },
      { key: "D", text: "Aggressive Growth: Achieve high capital gains and exponential expansion", score: 10 }
    ]
  },
  {
    id: 4,
    category: "Experience Level",
    text: "How familiar are you with investment instruments, markets, or cryptocurrency technologies?",
    options: [
      { key: "A", text: "Beginner: Little to no experience; prefer simple accounts or standard funds", score: 1 },
      { key: "B", text: "Intermediate: Know basic assets (e.g. BTC, ETH, stocks), done spot buying", score: 4 },
      { key: "C", text: "Advanced: Experienced with staking, liquidity pools, option strategies, or technicals", score: 7 },
      { key: "D", text: "Expert: Actively participate in leveraged trading, yield farming, or early-stage speculation", score: 10 }
    ]
  },
  {
    id: 5,
    category: "Windfall Allocation",
    text: "If you unexpectedly received $10,000 to invest today, how would you allocate it?",
    options: [
      { key: "A", text: "100% into high-yield savings accounts or secure USD stablecoins", score: 1 },
      { key: "B", text: "70% stable yields/blue-chip assets, 30% moderate-risk assets", score: 4 },
      { key: "C", text: "50% blue-chip cryptocurrencies (BTC/ETH), 30% mid-caps, 20% cash", score: 7 },
      { key: "D", text: "80% high-potential altcoins / speculative plays, 20% blue-chips", score: 10 }
    ]
  },
  {
    id: 6,
    category: "Volatility Tolerance",
    text: "How do you feel about daily double-digit percentage swings (e.g. +/- 15%) in your portfolio value?",
    options: [
      { key: "A", text: "Completely intolerable; would cause significant distress and sleepless nights", score: 1 },
      { key: "B", text: "Uncomfortable; prefer smooth stable returns even if they are much lower", score: 4 },
      { key: "C", text: "Acceptable; understand that high volatility is necessary for high returns", score: 8 },
      { key: "D", text: "Excellent; thrive on volatility and look for active swings to exploit", score: 10 }
    ]
  },
  {
    id: 7,
    category: "Loss Preparedness",
    text: "What maximum percentage loss of your initial investment are you prepared to accept over a 12-month period?",
    options: [
      { key: "A", text: "0% to 5% loss (Absolutely low tolerance)", score: 1 },
      { key: "B", text: "5% to 15% loss (Moderate defensive posture)", score: 3 },
      { key: "C", text: "15% to 40% loss (Growth oriented posture)", score: 7 },
      { key: "D", text: "Up to 100% loss (Speculative high-risk play)", score: 10 }
    ]
  },
  {
    id: 8,
    category: "Stablecoin Exposure",
    text: "What percentage of your portfolio are you planning to hold in volatile assets (like Bitcoin, Altcoins, or Equities) as opposed to cash/stablecoins?",
    options: [
      { key: "A", text: "Less than 10% (Primarily cash / stablecoins)", score: 1 },
      { key: "B", text: "10% to 40% (Conservative mix)", score: 4 },
      { key: "C", text: "40% to 80% (Aggressive spot allocation)", score: 7 },
      { key: "D", text: "80% to 100% (Maximum exposure, fully invested)", score: 10 }
    ]
  },
  {
    id: 9,
    category: "Emergency Cushion",
    text: "Do you have accessible savings or emergency funds outside of this investment capital?",
    options: [
      { key: "A", text: "No: This investment is my primary reserve pool", score: 1 },
      { key: "B", text: "Yes: I have a modest buffer covering 1 to 2 months of living costs", score: 4 },
      { key: "C", text: "Yes: I have a robust reserve covering 3 to 6 months of expenses", score: 8 },
      { key: "D", text: "Yes: Outstanding liquidity covering 12+ months of financial needs", score: 10 }
    ]
  },
  {
    id: 10,
    category: "Security vs Opportunity",
    text: "When evaluating new DeFi protocols, nodes, or investment tokens, what is your stance?",
    options: [
      { key: "A", text: "Safety First: Only participate in multi-audited, highly regulated, long-standing channels", score: 1 },
      { key: "B", text: "Cautious Explorer: Stick to major platforms, avoiding highly speculative new projects", score: 4 },
      { key: "C", text: "Active Seeker: Willing to participate in emerging protocols for high returns", score: 8 },
      { key: "D", text: "Risk Defier: Happy to pool into un-audited, high-yield memecoins, new pools, or high-leverage positions", score: 10 }
    ]
  }
];

export const PROFILES = [
  {
    scoreRange: [0, 25],
    name: "Conservative",
    description: "Your priority is preserving your initial capital and avoiding downside. You favor stable yields, cash equivalents, and highly secure stablecoins over market speculation.",
    allocation: [
      { name: "Cash / Stablecoins", pct: 70, color: "#10b981" },
      { name: "Staked Blue-Chips (ETH/BTC)", pct: 20, color: "#3b82f6" },
      { name: "Low-Risk TradFi / DeFi Yields", pct: 10, color: "#6366f1" }
    ],
    advice: [
      "Prioritize high-yield stablecoin savings (e.g. USDC/USDT staking on top tier platforms).",
      "Keep exposure to volatile assets below 20% of your total net assets.",
      "Explore low-volatility yield strategies like standard treasury bills or stable automated market makers."
    ]
  },
  {
    scoreRange: [26, 50],
    name: "Moderate / Balanced",
    description: "You seek a balance between steady capital appreciation and capital preservation. You can tolerate mild daily price fluctuations in exchange for better rewards.",
    allocation: [
      { name: "Stablecoins & Cash", pct: 40, color: "#10b981" },
      { name: "Blue-Chip Cryptos (BTC/ETH)", pct: 45, color: "#3b82f6" },
      { name: "Major Altcoins & L1s", pct: 15, color: "#a78bfa" }
    ],
    advice: [
      "Use Dollar-Cost Averaging (DCA) to build your core positions in BTC and ETH.",
      "Rebalance your portfolio quarterly to keep your stable asset cushion around 40%.",
      "Participate in low-to-medium risk DeFi stakings on well-established layer-1 systems."
    ]
  },
  {
    scoreRange: [51, 75],
    name: "Active Growth",
    description: "Your objective is long-term capital growth. You are comfortable with substantial price swings and volatile drawdowns as long as the upward trend remains intact.",
    allocation: [
      { name: "Blue-Chip Cryptos (BTC/ETH)", pct: 50, color: "#3b82f6" },
      { name: "High-Growth Altcoins / Layer 2s", pct: 30, color: "#a78bfa" },
      { name: "Stablecoins & Cash Reserves", pct: 15, color: "#10b981" },
      { name: "Emerging Sectors (DePIN/AI)", pct: 5, color: "#ec4899" }
    ],
    advice: [
      "Emphasize strong ecosystems and foundational layer-1/layer-2 networks.",
      "Prepare for drawdowns of 30-50% during cyclical bear markets without panic selling.",
      "Keep a small 15% stable cash reserve to purchase premium assets during steep market corrections."
    ]
  },
  {
    scoreRange: [76, 100],
    name: "Aggressive Speculator",
    description: "You are chasing high-impact, exponential wealth expansion. You have high volatility tolerance, deep knowledge of market cycles, and are willing to take extreme risks with a significant part of your capital.",
    allocation: [
      { name: "High-Growth Altcoins / L2s", pct: 45, color: "#a78bfa" },
      { name: "Micro-Caps / DePIN / Memes", pct: 25, color: "#ec4899" },
      { name: "Blue-Chip Cryptos (BTC/ETH)", pct: 20, color: "#3b82f6" },
      { name: "High-Yield Speculative DeFi Pools", pct: 10, color: "#ef4444" }
    ],
    advice: [
      "Only deploy capital that you are prepared to lose completely.",
      "Strictly enforce take-profit targets to lock in massive gains during exponential pumps.",
      "Keep transaction security high; use hardware wallets or dedicated burner accounts for early-stage smart contract interactions."
    ]
  }
];

export function getProfileByScore(score) {
  return PROFILES.find(p => score >= p.scoreRange[0] && score <= p.scoreRange[1]) || PROFILES[PROFILES.length - 1];
}

export const fmt = (n, d = 0) => (+n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
