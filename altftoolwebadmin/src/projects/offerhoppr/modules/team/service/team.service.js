import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "offerhoppr";
const TEAM_SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];
const TEAM_PATH = ["projects", PROJECT_ID, "team"];

const SOCIAL_KEYS = ["linkedin", "twitter"];

export const DEFAULT_TEAM_SETTINGS = {
  heroHeadline: "",
  heroSubcopy: "",
};

const cleanText = (value = "") => String(value).trim();

function cleanSocial(payload) {
  const social = {};
  SOCIAL_KEYS.forEach((key) => {
    const value = cleanText(payload?.social?.[key]);
    if (value) social[key] = value;
  });
  return social;
}

function normalizeMember(payload) {
  const specialties = (
    Array.isArray(payload.specialties) ? payload.specialties : String(payload.specialties || "").split("\n")
  )
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    slug: createSlug(payload.slug),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    experience: cleanText(payload.experience),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    bio: cleanText(payload.bio),
    specialties,
    social: cleanSocial(payload),
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
