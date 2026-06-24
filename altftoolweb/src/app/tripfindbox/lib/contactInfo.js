import { DEFAULT_HOME_CONTENT, fetchHomeContent } from "./homeContent";

export function contactFromHomeContent(content = DEFAULT_HOME_CONTENT) {
  const header = content?.header || DEFAULT_HOME_CONTENT.header;
  const hero = content?.hero || DEFAULT_HOME_CONTENT.hero;

  return {
    phone: header.phone || DEFAULT_HOME_CONTENT.header.phone,
    callSubtext: header.callSubtext || DEFAULT_HOME_CONTENT.header.callSubtext,
    mobileCallText: hero.mobileCallText || DEFAULT_HOME_CONTENT.hero.mobileCallText,
  };
}

export const DEFAULT_TRIPFINDBOX_CONTACT = contactFromHomeContent(DEFAULT_HOME_CONTENT);

export function normalizePhoneForTel(phone = DEFAULT_TRIPFINDBOX_CONTACT.phone) {
  return String(phone || DEFAULT_TRIPFINDBOX_CONTACT.phone).replace(/[^\d+]/g, "");
}

export function telHref(phone) {
  return `tel:${normalizePhoneForTel(phone)}`;
}

export async function getTripFindBoxContactInfo() {
  try {
    const content = await fetchHomeContent();
    return contactFromHomeContent(content);
  } catch {
    return DEFAULT_TRIPFINDBOX_CONTACT;
  }
}
