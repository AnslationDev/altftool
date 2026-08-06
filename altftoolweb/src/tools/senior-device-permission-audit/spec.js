// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "senior-device-permission-audit",
  "title": "Senior Device Permission Audit",
  "description": "A senior-friendly walkthrough for reviewing and cleaning up phone app permissions.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Security & Privacy",
    "Lifestyle"
  ],
  "icon": "shield-question",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "permissions",
      "label": "Apps and permissions",
      "type": "textarea",
      "default": "Flashlight | Camera, microphone, contacts, location | Rarely used\nBanking app | SMS, notifications | Used weekly\nVideo call | Camera, microphone, contacts | Used daily",
      "hint": "App | permissions | usage note"
    },
    {
      "key": "explain",
      "label": "Use plain-language guidance",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Add senior-friendly action wording"
    }
  ],
  "presets": [
    {
      "label": "Example phone",
      "values": {
        "permissions": "Flashlight | Camera, microphone, contacts, location | Rarely used\nVideo call | Camera, microphone, contacts | Used daily",
        "explain": true
      }
    }
  ],
  "note": "Permission-cleanup guide only. Do not remove accessibility, emergency, authenticator, banking, caregiver, or medical permissions without understanding the impact and having a recovery plan."
},
  compute: (values) => {
      const sensitive = ["microphone", "camera", "contacts", "location", "sms", "phone", "accessibility", "files", "photos"];
      const rows = String(values.permissions || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [app = "App", list = "", usage = ""] = line.split("|").map((cell) => cell.trim());
        const found = sensitive.filter((permission) => list.toLowerCase().includes(permission));
        const rarely = /rare|never|unused/.test(usage.toLowerCase());
        const score = found.length + (rarely ? 2 : 0);
        const action = score >= 5 ? "Review now" : score >= 3 ? "Review" : "Lower concern";
        return [app, list || "—", usage || "—", found.length, values.explain ? action + (rarely ? " — ask why an unused app still needs access" : " — confirm this access matches the app's job") : action];
      });
      return { result: rows.filter((row) => /Review/.test(row[4])).length + " app(s) to review", caption: "Nothing is changed automatically", rows: [["Apps listed", rows.length], ["Sensitive permissions tracked", sensitive.length]], table: { headers: ["App", "Permissions", "Usage", "Sensitive count", "Suggested conversation"], rows } };
    },
};

export default spec;
