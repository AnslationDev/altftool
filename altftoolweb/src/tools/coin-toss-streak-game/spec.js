// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "coin-toss-streak-game",
  "title": "Coin Toss Streak Game",
  "description": "Calculate the probability of getting a specific number of consecutive heads or tails in coin tosses.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "coin",
  "iconColor": "text-amber-600",
  "modes": [
    {
      "id": "heads",
      "label": "Heads Streak"
    },
    {
      "id": "tails",
      "label": "Tails Streak"
    }
  ],
  "fields": [
    {
      "key": "tosses",
      "label": "Number of Tosses",
      "type": "number",
      "default": "100",
      "suffix": "tosses"
    },
    {
      "key": "streak",
      "label": "Desired Streak",
      "type": "number",
      "default": "3",
      "suffix": "consecutive"
    },
    {
      "key": "probability",
      "label": "Probability",
      "type": "select",
      "default": "exact",
      "choices": [
        {
          "value": "exact",
          "label": "Exact Probability"
        },
        {
          "value": "atLeast",
          "label": "At Least Probability"
        }
      ]
    },
    {
      "key": "mode",
      "label": "Mode",
      "type": "select",
      "default": "heads",
      "choices": [
        {
          "value": "heads",
          "label": "Heads Streak"
        },
        {
          "value": "tails",
          "label": "Tails Streak"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "tosses": "100",
        "streak": "3",
        "probability": "exact",
        "mode": "heads"
      }
    }
  ],
  "note": "This tool calculates the probability of achieving a specific streak of heads or tails in a series of coin tosses."
},
  compute: (values, mode) => { let tosses = values.tosses; let streak = values.streak; let probabilityMode = values.probability; let modeType = values.mode; if (tosses < streak || streak <= 0) return { result: 'Invalid input' }; let p = Math.pow(0.5, streak); let q = 1 - p; let exactProb = Math.pow(p, tosses / streak - 1) * q; let atLeastProb = 1 - Math.pow(q, Math.floor(tosses / streak)); let result = probabilityMode === 'exact' ? `Exact Probability: ${exactProb.toFixed(4)}` : `At Least Probability: ${atLeastProb.toFixed(4)}`; return { result: result }; },
};

export default spec;
