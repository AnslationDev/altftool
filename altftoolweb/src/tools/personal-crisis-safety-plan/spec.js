// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "personal-crisis-safety-plan",
  "title": "Personal Crisis Safety Plan",
  "description": "Organize coping steps, trusted contacts and the actions you choose in advance.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Health & Wellness",
    "Productivity"
  ],
  "icon": "heart-handshake",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "warning",
      "label": "Personal warning signs",
      "type": "textarea",
      "default": "Not sleeping, withdrawing, racing thoughts"
    },
    {
      "key": "coping",
      "label": "Self-selected grounding or coping steps",
      "type": "textarea",
      "default": "Move to a shared safe place\nDrink water and slow breathing\nAvoid driving and major decisions"
    },
    {
      "key": "people",
      "label": "Trusted contacts and how to reach them",
      "type": "textarea",
      "default": "Trusted person — phone saved as Favourite\nClinician — appointment portal"
    },
    {
      "key": "safe_place",
      "label": "Safer place",
      "type": "text",
      "default": "Trusted person's home"
    },
    {
      "key": "reduce_risk",
      "label": "User-chosen ways to reduce immediate risk",
      "type": "textarea",
      "default": "Hand over keys and risky items to a trusted person; stay with someone."
    },
    {
      "key": "immediate",
      "label": "Immediate danger right now",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "There may be immediate danger or inability to stay safe"
    }
  ],
  "presets": [
    {
      "label": "Private starter",
      "values": {
        "warning": "Not sleeping and withdrawing",
        "coping": "Go to a shared safe place\nCall a trusted person",
        "people": "Trusted person — saved contact",
        "safe_place": "Trusted person's home",
        "reduce_risk": "Stay with someone and reduce access to risky items",
        "immediate": false
      }
    }
  ],
  "note": "Private planning aid, not emergency care or treatment. If there is immediate danger, use local emergency services or a trusted in-person support route now. This tool deliberately does not guess country-specific hotline numbers."
},
  compute: (values) => {
      const split = (text) => String(text || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      const warnings = split(values.warning), coping = split(values.coping), people = split(values.people), risk = split(values.reduce_risk);
      const list = [
        ...(values.immediate ? ["Immediate action: move to a safer shared place, contact a trusted person in person, and use local emergency services if needed."] : []),
        ...warnings.map((item) => "Warning sign: " + item),
        ...coping.map((item) => "Coping step: " + item),
        "Safer place: " + values.safe_place,
        ...people.map((item) => "Contact: " + item),
        ...risk.map((item) => "Reduce risk: " + item),
      ];
      return { result: values.immediate ? "Immediate-support plan" : "Personal safety plan", caption: list.length + " private plan item(s)", rows: [["Warning signs", warnings.length], ["Coping steps", coping.length], ["Trusted contacts", people.length], ["Risk-reduction steps", risk.length]], list };
    },
};

export default spec;
