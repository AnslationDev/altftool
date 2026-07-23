import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";
import { createSlug } from "../../services/service/services.service";

/**
 * Snapagee — Team module data layer.
 *
 * Collection CRUD at `projects/snapagee/team` plus a `team/settings`
 * singleton for the `/team` page header and the member-detail page's
 * related-members strip + CTA button (see CONTRACT.md).
 *
 * Snapagee differences vs the TheStyleLife template:
 *   - NO `quote` field (no pull-quote block on Snapagee's member detail page).
 *   - NO `social` field (Snapagee's `data/team.json` carries neither quote
 *     nor social links, unlike TheStyleLife) — do not invent either.
 *   - `initials` is a plain text field (used as an avatar fallback on the
 *     frontend when no portrait image is set).
 *   - `team/settings` has no `badge`/hero fields — just `pageHeading` +
 *     `pageDescription` for the `/team` index, plus the related-strip
 *     eyebrow/heading and the detail page's own `detailCtaLabel` ("Start a
 *     Project" button, independent from `site.ctaPrimaryLabel`).
 *   - The `team` collection starts EMPTY — the frontend's bundled
 *     `data/team.json` already carries all 6 real members; admin only
 *     adds/overrides on top via the per-field merge in `lib/mergeContent.js`.
 */

const PROJECT_ID = "snapagee";
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
    focus: cleanLines(payload.focus),
    initials: cleanText(payload.initials),
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
// /team page header + related strip + detail CTA — doc team/settings
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_SETTINGS = {
  pageHeading: "Senior operators, not a rotating cast",
  pageDescription:
    "The people who scope your project are the same people who ship it — no account-manager layer, no junior hand-offs.",
  relatedEyebrow: "The Rest of the Team",
  relatedHeading: "More senior operators",
  detailCtaLabel: "Start a Project",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_TEAM_SETTINGS);

export const subscribeTeamSettings = settingsDoc.subscribe;

export function saveTeamSettings(payload) {
  return settingsDoc.save({
    pageHeading: cleanText(payload.pageHeading),
    pageDescription: cleanText(payload.pageDescription),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
    detailCtaLabel: cleanText(payload.detailCtaLabel),
  });
}

// ---------------------------------------------------------------------------
// Image upload — member portrait
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "snapagee/team/portrait" });

export const uploadTeamMemberImage = imageUploader.upload;
