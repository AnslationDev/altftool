import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";
import { createSlug } from "../../services/service/services.service";

/**
 * Shophobia — Team module data layer.
 *
 * Collection CRUD at `projects/shophobia/team` plus a `team/settings`
 * singleton for the `/team` page hero and the detail page's related-members
 * strip (see CONTRACT.md). Members carry `expertise[]`, `longBio`, and a
 * `social` map of {linkedin, x, instagram}.
 */

const PROJECT_ID = "shophobia";
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

function normalizeMember(payload) {
  return {
    slug: createSlug(payload.slug || payload.name),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    image: cleanText(payload.image),
    bio: cleanText(payload.bio),
    longBio: cleanText(payload.longBio),
    expertise: cleanLines(payload.expertise),
    social: {
      linkedin: cleanText(payload.social?.linkedin),
      x: cleanText(payload.social?.x),
      instagram: cleanText(payload.social?.instagram),
    },
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
  badge: "The Collective",
  heroHeadline: "The Humans Behind The Holograms",
  heroSubcopy: "A small, senior team that stays hands-on from strategy to shipped pixel.",
  relatedHeading: "Rest Of The Collective",
  relatedAllCtaLabel: "All Team Members",
  relatedWorkCtaLabel: "Work With Us",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);

export const subscribeTeamSettings = settingsDoc.subscribe;

export function saveTeamSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    relatedHeading: cleanText(payload.relatedHeading),
    relatedAllCtaLabel: cleanText(payload.relatedAllCtaLabel),
    relatedWorkCtaLabel: cleanText(payload.relatedWorkCtaLabel),
  });
}

// ---------------------------------------------------------------------------
// Image upload — member portrait
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "shophobia/team/portrait" });

export const uploadTeamMemberImage = imageUploader.upload;
