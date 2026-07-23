import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";
import { createSlug } from "../../services/service/services.service";

/**
 * TheStyleLife — Team module data layer.
 *
 * Collection CRUD at `projects/thestylelife/team` plus a `team/settings`
 * singleton for the `/team` page hero and the detail page's related-members
 * strip (see CONTRACT.md).
 *
 * TheStyleLife differences vs the Shophobia template:
 *   - `focus[]` (not `expertise[]`)
 *   - `social` is an ARRAY of `{label, href}` pairs (not a fixed
 *     {linkedin, x, instagram} map) — variable length, e.g. LinkedIn/
 *     Instagram/X/Dribbble
 *   - `quote` — a plain text pull-quote shown on the member detail page
 */

const PROJECT_ID = "thestylelife";
const TEAM_PATH = ["projects", PROJECT_ID, "team"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];

const cleanText = (value = "") => String(value ?? "").trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanSocial(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      label: cleanText(item?.label),
      href: cleanText(item?.href),
    }))
    .filter((item) => item.label || item.href);
}

function normalizeMember(payload) {
  return {
    slug: createSlug(payload.slug || payload.name),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    image: cleanText(payload.image),
    bio: cleanText(payload.bio),
    longBio: cleanText(payload.longBio),
    focus: cleanLines(payload.focus),
    quote: cleanText(payload.quote),
    social: cleanSocial(payload.social),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const membersService = createCollectionCrudService(TEAM_PATH, { normalize: normalizeMember });

export const subscribeTeamMembers = membersService.subscribe;
export const createTeamMember = membersService.create;
export const updateTeamMember = membersService.update;
export const deleteTeamMember = membersService.remove;
export const toggleTeamMemberStatus = membersService.toggleActive;

// ---------------------------------------------------------------------------
// /team page hero + related strip — doc team/settings
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_SETTINGS = {
  badge: "The People",
  heroHeadline: "The Editors Behind the Work.",
  heroSubcopy:
    "A studio of strategists, designers, and engineers who all still get their hands dirty on every project.",
  relatedEyebrow: "The Rest of the Studio",
  relatedHeading: "Other Editors",
  relatedCtaLabel: "View Full Studio",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);

export const subscribeTeamSettings = settingsDoc.subscribe;

export function saveTeamSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
    relatedCtaLabel: cleanText(payload.relatedCtaLabel),
  });
}

// ---------------------------------------------------------------------------
// Image upload — member portrait
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "thestylelife/team/portrait" });

export const uploadTeamMemberImage = imageUploader.upload;
