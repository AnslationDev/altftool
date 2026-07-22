import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Offerris — Team module data layer.
 *
 * Doc `projects/offerris/team/settings` holds the `/team` page hero copy
 * (badge + headline + subcopy, matching `data/pages.json.team`). Collection
 * `projects/offerris/team` holds the individual members, matching
 * `data/team.json` — `slug`, `name`, `role`, `department`, `image`, `bio`,
 * `experience`, `skills[]`, and a nested `social` object.
 */

const PROJECT_ID = "offerris";
const TEAM_SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];
const TEAM_PATH = ["projects", PROJECT_ID, "team"];

export const DEFAULT_TEAM_SETTINGS = {
  badge: "The Team",
  heroHeadline: "The current running through every project.",
  heroSubcopy:
    "Senior strategists, designers, and engineers — no juniors learning on your budget, no hand-offs between the pitch and the work.",
};

export const SOCIAL_KEYS = ["twitter", "linkedin", "github", "dribbble", "instagram"];

const cleanText = (value = "") => String(value).trim();

/** Accept either a string[] or a newline-joined string. */
function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Nested object of trimmed profile URLs — empty entries are dropped. */
function normalizeSocial(value) {
  const social = value && typeof value === "object" ? value : {};
  return SOCIAL_KEYS.reduce((out, key) => {
    const link = cleanText(social[key]);
    if (link) out[key] = link;
    return out;
  }, {});
}

function normalizeMember(payload) {
  return {
    slug: createSlug(payload.slug),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    department: cleanText(payload.department),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    bio: cleanText(payload.bio),
    experience: cleanText(payload.experience),
    skills: cleanLines(payload.skills),
    social: normalizeSocial(payload.social),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(TEAM_SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);
const membersService = createCollectionCrudService(TEAM_PATH, { normalize: normalizeMember });
const memberImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/team/member` });

export const subscribeTeamSettings = settingsService.subscribe;
export const saveTeamSettings = settingsService.save;

export const subscribeTeamMembers = membersService.subscribe;
export const createTeamMember = membersService.create;
export const updateTeamMember = membersService.update;
export const deleteTeamMember = membersService.remove;
export const toggleTeamMemberStatus = membersService.toggleActive;

export const uploadTeamImage = memberImageUploader.upload;
export const deleteTeamImage = memberImageUploader.remove;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
