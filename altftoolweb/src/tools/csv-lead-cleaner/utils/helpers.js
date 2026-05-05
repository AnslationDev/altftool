// Normalize headers for CRM
export const normalizeHeader = (header) => {
  const h = header.toLowerCase().trim();

  if (["email", "email address", "e-mail"].includes(h)) return "email";
  if (["phone", "mobile", "contact", "contact number"].includes(h))
    return "phone";
  if (["name", "full name"].includes(h)) return "name";
  if (["company", "organization"].includes(h)) return "company";

  return h.replace(/\s+/g, "_");
};

// Parse CSV text
export const parseCSV = (text) => {
  const rows = text.split("\n").filter(Boolean);
  const rawHeaders = rows[0].split(",");
  const headers = rawHeaders.map(normalizeHeader);

  const data = rows.slice(1).map((row) => {
    const values = row.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() || "";
    });
    return obj;
  });

  return { headers, data };
};

// Clean + deduplicate leads
export const cleanLeads = (data) => {
  const seen = new Set();
  const cleaned = [];

  data.forEach((lead) => {
    const email = lead.email?.toLowerCase() || "";
    const phone = lead.phone || "";
    const name = lead.name?.toLowerCase() || "";

    if (!email && !phone && !name) return;

    const key = `${email}|${phone}|${name}`;

    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(lead);
    }
  });

  return cleaned;
};

// Generate CSV for download
export const generateCSV = (headers, data) => {
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => `"${row[h] || ""}"`).join(",")
    ),
  ];

  return csvRows.join("\n");
};