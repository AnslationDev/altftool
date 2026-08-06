// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "vehicle-document-reminder",
  "title": "Vehicle Document Reminder",
  "description": "RC, insurance, PUC aur licence expiry track kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "India",
    "Productivity"
  ],
  "icon": "calendar-check",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "documents",
      "label": "Vehicle documents",
      "type": "textarea",
      "default": "RC | 2027-06-30 | MH01AB1234\nInsurance | 2026-08-15 | Policy POL-104\nPUC | 2026-08-02 | Certificate PUC-92\nDriving licence | 2029-04-20 | DL record",
      "hint": "Document | expiry date | reference"
    },
    {
      "key": "as_of",
      "label": "Review date",
      "type": "date",
      "default": "2026-07-24"
    },
    {
      "key": "warn_days",
      "label": "Warning window (days)",
      "type": "number",
      "default": 30,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Example vehicle",
      "values": {
        "documents": "RC | 2027-06-30 | MH01AB1234\nInsurance | 2026-08-15 | POL-104\nPUC | 2026-08-02 | PUC-92",
        "as_of": "2026-07-24",
        "warn_days": 30
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions.",
  "confirmReset": "Reset and clear your saved vehicle document list? This cannot be undone."
},
  compute: (values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const warnDaysNumber = Number(values.warn_days);
      const warning = Math.max(1, Number.isNaN(warnDaysNumber) ? 30 : warnDaysNumber);
      const rows = String(values.documents || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name = "Item", dateText = "", reference = "—"] = line.split("|").map((cell) => cell.trim());
        const date = new Date(dateText + "T00:00:00");
        const days = Math.ceil((date - asOf) / 86400000);
        const status = Number.isNaN(days) ? "Invalid date" : days < 0 ? Math.abs(days) + "d overdue" : days <= warning ? days + "d · renew soon" : days + "d";
        return [name, dateText || "—", reference, status];
      });
      const urgent = rows.filter((row) => /overdue|renew soon|Invalid/.test(row[3])).length;
      return { result: rows.length + " record(s) tracked", caption: urgent + " need attention", rows: [["Warning window", warning + " days"], ["Needs attention", urgent]], table: { headers: ["Item", "Expiry", "Reference", "Status"], rows } };
    },
};

export default spec;
