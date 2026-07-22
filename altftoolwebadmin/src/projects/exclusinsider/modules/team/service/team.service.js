import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * ExclusInsider — Team module data layer.
 *
 * Doc `projects/exclusinsider/team/settings` holds the `/team` page hero
 * copy. Collection `projects/exclusinsider/team` holds the individual
 * members.
 */

const PROJECT_ID = "exclusinsider";
const TEAM_SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];
const TEAM_PATH = ["projects", PROJECT_ID, "team"];

export const DEFAULT_TEAM_SETTINGS = {
  heroHeadline: "",
  heroSubcopy: "",
};

const cleanText = (value = "") => String(value).trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeMember(payload) {
  return {
    slug: createSlug(payload.slug),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    initials: cleanText(payload.initials),
    bio: cleanText(payload.bio),
    focus: cleanLines(payload.focus),
    quote: cleanText(payload.quote),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(TEAM_SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);
const membersService = createCollectionCrudService(TEAM_PATH, { normalize: normalizeMember });
const memberImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/team/photo` });

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
