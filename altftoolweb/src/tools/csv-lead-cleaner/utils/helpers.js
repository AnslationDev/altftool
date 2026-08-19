// Normalize headers for CRM
export const normalizeHeader = (header) => {
  const h = header.toLowerCase().trim();

  if (["email", "email address", "e-mail"].includes(h)) return "email";
  if (["phone", "mobile", "phone number", "contact", "contact number"].includes(h))
    return "phone";
  if (["name", "full name"].includes(h)) return "name";
  if (["company", "organization"].includes(h)) return "company";

  return h.replace(/\s+/g, "_");
};