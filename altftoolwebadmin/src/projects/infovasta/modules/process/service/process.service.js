import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Infovasta — Process module data layer.
 *
 * Collection `projects/infovasta/process`. Every doc carries a numeric
 * `order` and a boolean `active` (default true). `step` is a free-text label
 * (e.g. "01").
 */

const PROJECT_ID = "infovasta";
const PROCESS_PATH = ["projects", PROJECT_ID, "process"];

function normalizeProcess(payload) {
  return {
    step: String(payload.step || "").trim(),
    title: String(payload.title || "").trim(),
    text: String(payload.text || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const processService = createCollectionCrudService(PROCESS_PATH, {
  normalize: normalizeProcess,
  orderByField: "order",
});

export const subscribeProcess = processService.subscribe;
export const createProcess = processService.create;
export const updateProcess = processService.update;
export const deleteProcess = processService.remove;
export const toggleProcessStatus = processService.toggleActive;
