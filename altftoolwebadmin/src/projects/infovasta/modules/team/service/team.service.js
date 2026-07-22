import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "infovasta";
const TEAM_PATH = ["projects", PROJECT_ID, "team"];
const TEAM_PAGE_PATH = ["projects", PROJECT_ID, "pages", "team"];

const SOCIAL_KEYS = ["twitter", "linkedin", "facebook"];

export const DEFAULT_TEAM_PAGE_CONTENT = {
  meta: {
    title: "Our Team | Infovasta",
    description: "Meet the people behind Infovasta — the engineers, designers, and strategists who build our products.",
  },
  hero: {
    eyebrow: "The people",
    title: "Meet the team",
    highlight: "behind the work.",
    description: "A small, senior team of builders who partner closely with every client from kickoff to launch.",
  },
  detail: {
    breadcrumb: "Team",
    experienceSuffix: "years experience",
    skillsHeading: "Skills",
    backLabel: "Back to Team",
  },
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

function cleanSocials(payload) {
  const socials = {};
  SOCIAL_KEYS.forEach((key) => {
    const value = cleanText(payload?.socials?.[key]);
    if (value) socials[key] = value;
  });
  return socials;
}

function normalizeMember(payload) {
  return {
    slug: createSlug(payload.slug),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    initials: cleanText(payload.initials),
    color: cleanText(payload.color),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    experience: cleanText(payload.experience),
    skills: cleanLines(payload.skills),
    bio: cleanText(payload.bio),
    socials: cleanSocials(payload),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeTeamPageContent(payload) {
  return {
    meta: {
      title: cleanText(payload?.meta?.title),
      description: cleanText(payload?.meta?.description),
    },
    hero: {
      eyebrow: cleanText(payload?.hero?.eyebrow),
      title: cleanText(payload?.hero?.title),
      highlight: cleanText(payload?.hero?.highlight),
      description: cleanText(payload?.hero?.description),
    },
    detail: {
      breadcrumb: cleanText(payload?.detail?.breadcrumb),
      experienceSuffix: cleanText(payload?.detail?.experienceSuffix),
      skillsHeading: cleanText(payload?.detail?.skillsHeading),
      backLabel: cleanText(payload?.detail?.backLabel),
    },
  };
}

const membersService = createCollectionCrudService(TEAM_PATH, { normalize: normalizeMember });
const pageContentService = createSingletonDocService(TEAM_PAGE_PATH, DEFAULT_TEAM_PAGE_CONTENT);
const memberImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/team/photo` });

export const subscribeTeamMembers = membersService.subscribe;
export const createTeamMember = membersService.create;
export const updateTeamMember = membersService.update;
export const deleteTeamMember = membersService.remove;
export const toggleTeamMemberStatus = membersService.toggleActive;

export const uploadTeamImage = memberImageUploader.upload;
export const deleteTeamImage = memberImageUploader.remove;

export const subscribeTeamPageContent = pageContentService.subscribe;
export async function saveTeamPageContent(payload) {
  await pageContentService.save(normalizeTeamPageContent(payload));
}

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
