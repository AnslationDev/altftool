import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Infodrif — contact leads (projects/infodrif/contactLeads).
 *
 * These documents have NO `order` field — they are not manually sorted — so the
 * factory's default orderByField ("order") must be overridden with "createdAt",
 * otherwise the orderBy filters every lead out of the snapshot.
 *
 * The public contact form creates leads anonymously with EXACTLY these fields
 * (firestore.rules enforces it): name, email, message, status ("new"),
 * createdAt. The admin reads, updates status, and deletes — it never invents
 * other fields and never creates leads, so there is no `create` export here.
 */

const PROJECT_ID = "infodrif";
const CONTACT_LEADS_PATH = ["projects", PROJECT_ID, "contactLeads"];

export const LEAD_STATUSES = ["new", "contacted", "closed"];

const leadsService = createCollectionCrudService(CONTACT_LEADS_PATH, {
  orderByField: "createdAt",
});

export const subscribeContactLeads = leadsService.subscribe;
export const deleteContactLead = leadsService.remove;

export async function updateLeadStatus(id, status) {
  await leadsService.update(id, { status });
}
