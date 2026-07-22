import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "campaignastra";
const TEAM_SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];
const TEAM_MEMBERS_PATH = ["projects", PROJECT_ID, "teamMembers"];

export const DEFAULT_TEAM_SETTINGS = {
  eyebrow: "Our people",
  title: "Meet the Team",
  subtitle: "The strategists, designers, and engineers behind Campaignastra.",
  seoTitle: "",
  seoDescription: "",
};

const cleanText = (value = "") => String(value).trim();

function normalizeTeamMember(payload) {
  return {
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    socials: {
      linkedin: cleanText(payload.socials?.linkedin),
      x: cleanText(payload.socials?.x),
      instagram: cleanText(payload.socials?.instagram),
    },
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(TEAM_SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);
const membersService = createCollectionCrudService(TEAM_MEMBERS_PATH, { normalize: normalizeTeamMember });
const memberImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/team/member` });

export const subscribeTeamSettings = settingsService.subscribe;
export const saveTeamSettings = settingsService.save;

export const subscribeTeamMembers = membersService.subscribe;
export const createTeamMember = membersService.create;
export const updateTeamMember = membersService.update;
export const deleteTeamMember = membersService.remove;
export const toggleTeamMemberStatus = membersService.toggleActive;

export const uploadTeamMemberImage = memberImageUploader.upload;
export const deleteTeamMemberImage = memberImageUploader.remove;
