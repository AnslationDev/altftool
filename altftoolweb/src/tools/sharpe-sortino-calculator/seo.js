const seo = {
  title: "Sharpe & Sortino Calculator from a Return Series",
  metaDescription:
    "Paste periodic returns for annualised Sharpe and Sortino ratios, plus mean, standard deviation and downside deviation. Periods per year: 12 or 252.",
  steps: [
    "Paste your series into 'Periodic returns (%)' — comma, space or semicolon separated, at least two values.",
    "Set 'Risk-free return per period (%)' for Sharpe, 'Minimum acceptable return (%)' for Sortino, and 'Periods per year' to 12 for monthly or 252 for daily.",
    "Read the annualised Sharpe headline and Sortino caption, with observations, mean per period, standard deviation and downside deviation listed underneath.",
  ],
  intro:
    "The Sharpe ratio measures excess return per unit of total volatility, and the Sortino ratio measures it per unit of downside volatility only — this calculator computes both from a pasted series of periodic returns. It takes the mean of your returns, subtracts the risk-free rate (Sharpe) or your minimum acceptable return (Sortino), divides by the sample standard deviation or the downside deviation, and annualises by multiplying by the square root of the periods per year. It is for anyone comparing funds, strategies or their own portfolio track record on a like-for-like risk basis.",
  useCases: [
    "Paste 36 monthly returns from two mutual funds and see which one earned more per unit of volatility once you set periods per year to 12",
    "Check whether a strategy's low Sharpe is driven by upside swings rather than losses by comparing it against the Sortino ratio at a 0% minimum acceptable return",
    "Re-annualise a backtest correctly by switching periods per year from 12 to 252 when your return series is daily rather than monthly",
  ],
  benefits: [
    ["Both ratios from one series", "Sharpe and Sortino are computed from the same input, so the gap between them tells you how much of the volatility was upside."],
    ["Explicit annualisation factor", "You set periods per year — 12, 52, 252 — instead of the tool guessing the frequency of your data."],
    ["Separate risk-free and target inputs", "Sharpe uses the risk-free rate while Sortino uses your own minimum acceptable return, as the two definitions require."],
  ],
  faqs: [
    [
      "How do you calculate the Sharpe ratio from monthly returns?",
      "Subtract the periodic risk-free rate from the mean monthly return, divide by the sample standard deviation of those returns, then multiply by the square root of 12 to annualise. This tool uses the sample standard deviation with an n-1 denominator, so at least two observations are required.",
    ],
    [
      "What is the difference between Sharpe and Sortino?",
      "Sharpe divides by total standard deviation, Sortino divides only by downside deviation, so Sortino ignores volatility from gains. Sortino also measures excess return over a minimum acceptable return you choose rather than the risk-free rate, which is why the two ratios diverge for strategies with large upside spikes.",
    ],
    [
      "What counts as a good Sharpe ratio?",
      "There is no universal threshold, but a commonly cited rule of thumb treats above 1 as respectable, above 2 as strong and above 3 as exceptional for a diversified portfolio. Context matters far more than the number: a ratio is only comparable against another strategy measured over the same period, the same frequency and the same risk-free rate. This is general information, not investment advice.",
    ],
    [
      "Why do my numbers change when I switch periods per year?",
      "Because the annualisation factor is the square root of the periods per year, so daily data at 252 scales the ratio by about 15.87 while monthly data at 12 scales it by about 3.46. Set the value to match the actual frequency of the series you pasted, or the ratio will be off by that entire multiple.",
    ],
  ],
};

export default seo;
