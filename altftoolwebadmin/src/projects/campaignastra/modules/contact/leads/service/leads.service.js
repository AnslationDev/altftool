import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "campaignastra";
// No "order" field on this collection — leads aren't manually ordered, so we
// must override the factory's default orderByField ("order") with "createdAt".
const CONTACT_LEADS_PATH = ["projects", PROJECT_ID, "contactLeads"];

export const LEAD_STATUSES = ["new", "contacted", "closed"];

const leadsService = createCollectionCrudService(CONTACT_LEADS_PATH, {
  orderByField: "createdAt",
});

// Read/status-update/delete only — the public contact form (built elsewhere)
// is the one calling `create` on this collection. No create export here.
export const subscribeContactLeads = leadsService.subscribe;
export const deleteContactLead = leadsService.remove;

export async function updateLeadStatus(id, status) {
  await leadsService.update(id, { status });
}
