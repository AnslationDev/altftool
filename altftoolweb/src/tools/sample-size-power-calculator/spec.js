// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "sample-size-power-calculator",
  "title": "Sample Size & Power Calculator",
  "description": "Effect size aur power target se required sample estimate kare.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "flask-conical",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "effect",
      "label": "Standardized effect size (Cohen d)",
      "type": "number",
      "default": 0.5,
      "min": 0.0001
    },
    {
      "key": "power",
      "label": "Target power (%)",
      "type": "select",
      "default": "80",
      "choices": [
        {
          "value": "80",
          "label": "80%"
        },
        {
          "value": "90",
          "label": "90%"
        },
        {
          "value": "95",
          "label": "95%"
        }
      ]
    },
    {
      "key": "alpha",
      "label": "Two-sided alpha",
      "type": "select",
      "default": "0.05",
      "choices": [
        {
          "value": "0.10",
          "label": "0.10"
        },
        {
          "value": "0.05",
          "label": "0.05"
        },
        {
          "value": "0.01",
          "label": "0.01"
        }
      ]
    },
    {
      "key": "groups",
      "label": "Independent groups",
      "type": "select",
      "default": "2",
      "choices": [
        {
          "value": "1",
          "label": "One mean / paired difference"
        },
        {
          "value": "2",
          "label": "Two equal independent groups"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "d=0.5, 80% power",
      "values": {
        "effect": 0.5,
        "power": "80",
        "alpha": "0.05",
        "groups": "2"
      }
    }
  ],
  "note": "Large-sample normal approximation for a standardized mean effect. Attrition, unequal groups, clustering, repeated measures, noncompliance, multiple outcomes, and discrete tests require a tailored power analysis."
},
  compute: (values) => {
      const d = Math.abs(Number(values.effect)), zAlpha = { "0.10": 1.644854, "0.05": 1.959964, "0.01": 2.575829 }[values.alpha] || 1.959964, zPower = { "80": 0.841621, "90": 1.281552, "95": 1.644854 }[values.power] || 0.841621, groups = Number(values.groups);
      if (!(d > 0)) return { result: "—", caption: "Effect size must be positive" };
      const multiplier = groups === 2 ? 2 : 1;
      const perGroup = Math.ceil(multiplier * Math.pow((zAlpha + zPower) / d, 2));
      return { result: perGroup + (groups === 2 ? " per group" : " observations"), caption: groups === 2 ? (perGroup * 2) + " total for two equal groups" : "One-sample / paired approximation", rows: [["Effect size", d], ["Power", values.power + "%"], ["Two-sided alpha", values.alpha], ["z alpha", zAlpha], ["z power", zPower], ["Suggested +15% attrition", Math.ceil(perGroup / 0.85) + (groups === 2 ? " per group" : "")]] };
    },
};

export default spec;
