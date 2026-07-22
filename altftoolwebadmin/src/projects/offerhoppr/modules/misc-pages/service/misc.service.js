import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const NOT_FOUND_PATH = ["projects", PROJECT_ID, "misc", "notFound"];
const LOADING_PATH = ["projects", PROJECT_ID, "misc", "loading"];

export const DEFAULT_NOT_FOUND = {
  digits: "404",
  sticker: "Oops!",
  heading: "This page hopped away.",
  body: "The page you're looking for doesn't exist or may have moved. Let's get you back to the good deals.",
  buttonLabel: "Back to Home",
  buttonHref: "/",
  secondaryLabel: "Browse Offers",
  secondaryHref: "/offers",
};

export const DEFAULT_LOADING = {
  message: "Hopping to the best offers...",
};

const notFoundService = createSingletonDocService(NOT_FOUND_PATH, DEFAULT_NOT_FOUND);
const loadingService = createSingletonDocService(LOADING_PATH, DEFAULT_LOADING);

export const subscribeNotFound = notFoundService.subscribe;
export const saveNotFound = notFoundService.save;

export const subscribeLoading = loadingService.subscribe;
export const saveLoading = loadingService.save;
