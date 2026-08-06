// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "lost-phone-response-planner",
  "title": "Lost Phone Response Planner",
  "description": "Prioritize the account-security steps to take in the first hour after losing a phone.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "smartphone-off",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "platform",
      "label": "Phone platform",
      "type": "select",
      "default": "android",
      "choices": [
        {
          "value": "android",
          "label": "Android"
        },
        {
          "value": "ios",
          "label": "iPhone / iOS"
        },
        {
          "value": "other",
          "label": "Other"
        }
      ]
    },
    {
      "key": "locked",
      "label": "Screen lock enabled",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Phone had PIN/password/biometric lock"
    },
    {
      "key": "financial",
      "label": "Financial apps or cards",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Banking, wallet, UPI, or saved cards are present"
    },
    {
      "key": "work",
      "label": "Work or sensitive accounts",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Work email, admin, health, or other sensitive access is present"
    },
    {
      "key": "number",
      "label": "Mobile number / SIM reference",
      "type": "text",
      "default": "Primary SIM"
    }
  ],
  "presets": [
    {
      "label": "Android with banking",
      "values": {
        "platform": "android",
        "locked": true,
        "financial": true,
        "work": false,
        "number": "Primary SIM"
      }
    }
  ],
  "note": "Prioritization aid only. Use a safe device/network and official provider contacts. Do not confront a suspected thief or travel to an unsafe location based on tracking."
},
  compute: (values) => {
      const steps = [
        "From a safe device, open the official " + (values.platform === "ios" ? "Apple Find My" : values.platform === "android" ? "Google Find My Device" : "device-account") + " service; mark the phone lost and show a safe callback message.",
        "Call the mobile operator through an independently verified number to suspend " + values.number + " and request a replacement SIM/eSIM.",
        "Preserve the device serial/IMEI, last known location, time, screenshots, and police/insurer reference where appropriate.",
        "Change the primary email/account password, review active sessions, and protect the recovery email and authenticator.",
      ];
      if (values.financial) steps.splice(2, 0, "Contact banks/wallets through official channels, freeze risky cards/UPI access, and review recent transactions.");
      if (values.work) steps.splice(2, 0, "Notify the employer/security team so work tokens, MDM, VPN, and sessions can be revoked.");
      if (!values.locked) steps.unshift("Highest priority: the phone lacked a screen lock; revoke account sessions and financial access immediately.");
      steps.push("Remote-erase only after weighing evidence, location tracking, backups, and recovery needs; erase can be irreversible.");
      return { result: (values.locked ? "Urgent" : "Critical") + " response plan", caption: steps.length + " prioritized actions", rows: [["Platform", values.platform], ["Screen lock", values.locked ? "Enabled" : "Not enabled"], ["Financial apps", values.financial ? "Yes" : "No"], ["Sensitive work access", values.work ? "Yes" : "No"]], list: steps };
    },
};

export default spec;
