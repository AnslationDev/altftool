import fs from "fs/promises";
import path from "path";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { PROJECTS } from "@/projects";
import { type } from "os";

export const ANALYTICS_STALE_DAYS = 5;
export const ANALYTICS_RECENT_LIMIT = 6;

const PROJECT_NAME_OVERRIDES = {
  altftool: "AltF Tools",
  leadtree: "Lead Tree",
};

const MODULE_LABEL_OVERRIDES = {
  buysmart: "BuySmart",
  images: "Media",
};

const SPECIAL_SOURCE_OVERRIDES = {
  "altftool/buysmart": {
    sources: [
      {
        type: "docArray",
        sourceLabel: "Hero banners",
        docPath: buySmartDocPath("hero"),
        arrayField: "banner",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "id"],
      },
      {
        type: "docArray",
        sourceLabel: "Categories",
        docPath: buySmartDocPath("categories"),
        arrayField: "banner",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "category", "id"],
      },
      {
        type: "docArray",
        sourceLabel: "Stores",
        docPath: buySmartDocPath("store"),
        arrayField: "banner",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "id"],
      },
      {
        type: "docArray",
        sourceLabel: "Rule sets",
        docPath: buySmartDocPath("ruleSet"),
        arrayField: "banner",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "id"],
      },
      {
        type: "docArray",
        sourceLabel: "Trending",
        docPath: buySmartDocPath("trending"),
        arrayField: "banner",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "id"],
      },
      {
        type: "docArray",
        sourceLabel: "Feature brands",
        docPath: buySmartDocPath("featureBrand"),
        arrayField: "features",
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["category", "id"],
      },
    ],
  },
  "altftool/images": {
    sources: [
      {
        type: "collection",
        sourceLabel: "Images",
        collectionPath: ["projects", "altftool", "images"],
        createdAtField: "uploadedAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Videos",
        collectionPath: ["projects", "altftool", "videos"],
        createdAtField: "uploadedAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      },
    ],
  },
  "altftool/trendingVideos": {
    sources: [
      {
        type: "collection",
        sourceLabel: "Trending Videos",
        collectionPath: ["projects", "altftool", "trendingvideos"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "videoTitle", "id"],
      },
    ],
  },
  "altftool/deals": {
    sources: [
      {
        type: "collection",
        sourceLabel: "Hero",
        collectionPath: ["projects", "altftool", "deals", "hero", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Upcoming Deal",
        collectionPath: ["projects", "altftool", "deals", "upcomingdeal", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Top Brand",
        collectionPath: ["projects", "altftool", "deals", "topbrand", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Trending Price",
        collectionPath: ["projects", "altftool", "deals", "trendingPrice", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Smart Saving",
        collectionPath: ["projects", "altftool", "deals", "smartSaving", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Brand Detail",
        collectionPath: ["projects", "altftool", "deals", "brandDetail", "items"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
    ],
  },
  "altftool/consumerrating": {
    sources: [
      {
        type: "collection",
        sourceLabel: "Hero",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "heroBanners"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Categories",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "categories"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Brands",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "brands"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "heading", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Faqs",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "faqs"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Product Images",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "productImages"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      },
      {
        type: "collection",
        sourceLabel: "Subcategories",
        collectionPath: ["projects", "altftool", "consumerrating", "data", "subcategories"],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["title", "name", "id"],
      }
    ],
  },
};

function titleize(value) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildDefaultModuleDefinition(projectId, moduleKey) {
  const projectConfig = PROJECTS[projectId];
  const configuredLabel = projectConfig?.modules?.[moduleKey]?.label;

  return {
    moduleKey,
    moduleLabel: configuredLabel ?? MODULE_LABEL_OVERRIDES[moduleKey] ?? titleize(moduleKey),
    sources: [
      {
        type: "collection",
        sourceLabel: configuredLabel ?? MODULE_LABEL_OVERRIDES[moduleKey] ?? titleize(moduleKey),
        collectionPath: ["projects", projectId, moduleKey],
        createdAtField: "createdAt",
        updatedAtField: "updatedAt",
        titleFields: ["heading", "name", "title", "slug", "id"],
      },
    ],
  };
}

export async function discoverAnalyticsRegistry() {
  const projectsRoot = path.join(process.cwd(), "src", "projects");
  const projectDirs = await fs.readdir(projectsRoot, { withFileTypes: true });

  const discoveredProjects = await Promise.all(
    projectDirs
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const projectId = entry.name;
        const modulesDir = path.join(projectsRoot, projectId, "modules");

        let moduleDirs = [];
        try {
          moduleDirs = await fs.readdir(modulesDir, { withFileTypes: true });
        } catch {
          moduleDirs = [];
        }

        const modules = moduleDirs
          .filter((moduleEntry) => moduleEntry.isDirectory())
          .map((moduleEntry) => {
            const moduleKey = moduleEntry.name;
            const override = SPECIAL_SOURCE_OVERRIDES[`${projectId}/${moduleKey}`];
            const base = buildDefaultModuleDefinition(projectId, moduleKey);

            return override
              ? { ...base, ...override }
              : base;
          })
          .sort((a, b) => a.moduleLabel.localeCompare(b.moduleLabel));

        if (!modules.length) return null;

        return {
          projectId,
          projectName: PROJECT_NAME_OVERRIDES[projectId] ?? titleize(projectId),
          modules,
        };
      }),
  );

  return discoveredProjects.filter(Boolean).sort((a, b) => a.projectName.localeCompare(b.projectName));
}
