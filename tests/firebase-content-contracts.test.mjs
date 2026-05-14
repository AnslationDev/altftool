import assert from "node:assert/strict";
import test from "node:test";
import {
  ALTFT_ACADEMY_COLLECTION_PATH,
  ALTFT_EXTENSIONS_COLLECTION_PATH,
  ALTFT_TRENDING_VIDEOS_COLLECTION_PATH,
} from "@altftool/core/firebasePaths";
import {
  isDisplayableAcademy,
  isDisplayableExtension,
  isDisplayableTrendingVideo,
  normalizeAcademy,
  normalizeExtension,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";

test("shared Firebase collection paths keep admin and web on the same project root", () => {
  assert.deepEqual(ALTFT_EXTENSIONS_COLLECTION_PATH, ["projects", "altftool", "extensions"]);
  assert.deepEqual(ALTFT_ACADEMY_COLLECTION_PATH, ["projects", "altftool", "academy"]);
  assert.deepEqual(ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, [
    "projects",
    "altftool",
    "trendingvideos",
  ]);
});

test("extension documents written by admin normalize into public cards", () => {
  const extension = normalizeExtension(
    {
      name: "  Test Extension  ",
      category: "",
      description: " Helpful browser tool ",
      rating: "9",
      features: "Capture, Share",
      chromeUrl: "chrome.google.com/not-valid-without-protocol",
      image: "blob:http://localhost/preview",
    },
    "test-extension",
  );

  assert.equal(extension.id, "test-extension");
  assert.equal(extension.slug, "test-extension");
  assert.equal(extension.name, "Test Extension");
  assert.equal(extension.category, "Utilities & Calculators");
  assert.equal(extension.rating, 5);
  assert.deepEqual(extension.features, ["Capture", "Share"]);
  assert.equal(extension.chromeUrl, "");
  assert.equal(extension.image, "");
  assert.equal(isDisplayableExtension(extension), true);
});

test("academy documents normalize missing optional values before public render", () => {
  const academy = normalizeAcademy(
    {
      title: "Skill Lab",
      rating: "-1",
      price: "free",
      features: [" Projects ", "", "Mentors"],
      url: "https://example.com/skill-lab",
    },
    "skill-lab",
  );

  assert.equal(academy.id, "skill-lab");
  assert.equal(academy.name, "Skill Lab");
  assert.equal(academy.category, "Online Learning");
  assert.equal(academy.rating, 0);
  assert.equal(academy.price, 0);
  assert.deepEqual(academy.features, ["Projects", "Mentors"]);
  assert.equal(academy.academyUrl, "https://example.com/skill-lab");
  assert.equal(isDisplayableAcademy(academy), true);
});

test("trending video documents normalize video type, counters, and URLs", () => {
  const video = normalizeTrendingVideo(
    {
      title: "Daily Tool Tip",
      type: "reel",
      views: "1200",
      likes: "44",
      link: "https://www.youtube.com/shorts/abc123",
      thumbnail: "/images/thumb.jpg",
    },
    "daily-tool-tip",
  );

  assert.equal(video.firestoreId, "daily-tool-tip");
  assert.equal(video.name, "Daily Tool Tip");
  assert.equal(video.type, "shorts");
  assert.equal(video.viewCount, 1200);
  assert.equal(video.likeCount, 44);
  assert.equal(video.videoUrl, "https://www.youtube.com/shorts/abc123");
  assert.equal(video.thumbnail, "/images/thumb.jpg");
  assert.equal(isDisplayableTrendingVideo(video), true);
});
