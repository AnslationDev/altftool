import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  ANALYTICS_RECENT_LIMIT,
  ANALYTICS_STALE_DAYS,
  discoverAnalyticsRegistry,
} from "./moduleRegistry";
import {
  buildSourceId,
  clampList,
  daysSince,
  pickDisplayTitle,
  sortByTimestampDesc,
  toMillis,
  uniqueBy,
} from "./analytics.utils";

function docRefFromPath(path) {
  let ref = adminDb;
  path.forEach((segment, index) => {
    ref = index % 2 === 0 ? ref.collection(segment) : ref.doc(segment);
  });
  return ref;
}

function collectionRefFromPath(path) {
  let ref = adminDb;
  path.forEach((segment, index) => {
    ref = index % 2 === 0 ? ref.collection(segment) : ref.doc(segment);
  });
  return ref;
}

async function getCollectionCount(ref) {
  try {
    const snap = await ref.count().get();
    return snap.data().count ?? 0;
  } catch {
    const snap = await ref.get();
    return snap.size;
  }
}

async function getRecentCollectionDocs(ref, field, limitCount) {
  if (!field) return [];

  try {
    const snap = await ref.orderBy(field, "desc").limit(limitCount).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

async function getRecentCollectionCount(ref, field, days) {
  if (!field) return 0;

  try {
    const cutoff = Timestamp.fromMillis(
      Date.now() - days * 86400000,
    );
    const snap = await ref.where(field, ">=", cutoff).count().get();
    return snap.data().count ?? 0;
  } catch {
    return 0;
  }
}

async function getCollectionDocsSince(ref, field, days) {
  if (!field) return [];

  try {
    const cutoff = Timestamp.fromMillis(
      Date.now() - days * 86400000,
    );
    const snap = await ref.where(field, ">=", cutoff).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

function createDailyBuckets(days = 7) {
  const buckets = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    buckets.push({ key, count: 0 });
  }
  return buckets;
}

function buildDailySeries(items, field, days = 7) {
  const buckets = createDailyBuckets(days);
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  items.forEach((item) => {
    const millis = toMillis(item?.[field]);
    if (!millis) return;
    const date = new Date(millis);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) bucket.count += 1;
  });

  return buckets;
}

function buildRecentItem({
  item,
  projectId,
  projectName,
  moduleKey,
  moduleLabel,
  sourceLabel,
  timestampMs,
  kind,
  titleFields,
  coverage,
}) {
  return {
    id: buildSourceId([
      projectId,
      moduleKey,
      sourceLabel,
      item.id,
      kind,
      timestampMs,
    ]),
    projectId,
    projectName,
    moduleKey,
    moduleLabel,
    sourceLabel,
    coverage,
    title: pickDisplayTitle(item, titleFields),
    timestampMs,
    kind,
  };
}

async function analyzeCollectionSource({
  projectId,
  projectName,
  moduleKey,
  moduleLabel,
  moduleCoverage,
  source,
}) {
  const ref = collectionRefFromPath(source.collectionPath);
  const count = await getCollectionCount(ref);
  const recentCreatedDocs = await getRecentCollectionDocs(
    ref,
    source.createdAtField,
    ANALYTICS_RECENT_LIMIT,
  );
  const recentUpdatedDocs = await getRecentCollectionDocs(
    ref,
    source.updatedAtField,
    ANALYTICS_RECENT_LIMIT,
  );
  const recentCreatedCount = await getRecentCollectionCount(
    ref,
    source.createdAtField,
    7,
  );
  const recentCreatedWindow = await getCollectionDocsSince(
    ref,
    source.createdAtField,
    7,
  );
  const recentUpdatedWindow = await getCollectionDocsSince(
    ref,
    source.updatedAtField,
    7,
  );

  const recentCreated = recentCreatedDocs
    .map((item) => {
      const timestampMs = toMillis(item[source.createdAtField]);
      if (!timestampMs) return null;

      return buildRecentItem({
        item,
        projectId,
        projectName,
        moduleKey,
        moduleLabel,
        sourceLabel: source.sourceLabel,
        timestampMs,
        kind: "created",
        titleFields: source.titleFields,
        coverage: moduleCoverage,
      });
    })
    .filter(Boolean);

  const recentUpdated = recentUpdatedDocs
    .map((item) => {
      const timestampMs = toMillis(item[source.updatedAtField]);
      if (!timestampMs) return null;

      return buildRecentItem({
        item,
        projectId,
        projectName,
        moduleKey,
        moduleLabel,
        sourceLabel: source.sourceLabel,
        timestampMs,
        kind: "updated",
        titleFields: source.titleFields,
        coverage: moduleCoverage,
      });
    })
    .filter(Boolean);

  const lastActivityAtMs = Math.max(
    ...[...recentUpdated, ...recentCreated].map((entry) => entry.timestampMs),
    0,
  ) || null;

  return {
    count,
    recentCreatedCount,
    recentCreated,
    recentUpdated,
    lastActivityAtMs,
    dailyCreatedSeries: buildDailySeries(recentCreatedWindow, source.createdAtField),
    dailyUpdatedSeries: buildDailySeries(recentUpdatedWindow, source.updatedAtField),
  };
}

async function analyzeDocArraySource({
  projectId,
  projectName,
  moduleKey,
  moduleLabel,
  moduleCoverage,
  source,
}) {
  try {
    const snap = await docRefFromPath(source.docPath).get();
    const data = snap.exists ? snap.data() : null;
    const items = Array.isArray(data?.[source.arrayField]) ? data[source.arrayField] : [];
    const count = items.length;
    const recentCreatedCount = items.filter((item) => {
      const createdAtMs = toMillis(item[source.createdAtField]);
      return createdAtMs && createdAtMs >= Date.now() - 7 * 86400000;
    }).length;

    const recentCreated = sortByTimestampDesc(
      items
        .map((item, index) => {
          const timestampMs = toMillis(item[source.createdAtField]);
          if (!timestampMs) return null;

          return buildRecentItem({
            item: { ...item, id: item.id ?? `${source.sourceLabel}-${index}` },
            projectId,
            projectName,
            moduleKey,
            moduleLabel,
            sourceLabel: source.sourceLabel,
            timestampMs,
            kind: "created",
            titleFields: source.titleFields,
            coverage: moduleCoverage,
          });
        })
        .filter(Boolean),
    ).slice(0, ANALYTICS_RECENT_LIMIT);

    const recentUpdated = sortByTimestampDesc(
      items
        .map((item, index) => {
          const timestampMs = toMillis(item[source.updatedAtField]);
          if (!timestampMs) return null;

          return buildRecentItem({
            item: { ...item, id: item.id ?? `${source.sourceLabel}-${index}` },
            projectId,
            projectName,
            moduleKey,
            moduleLabel,
            sourceLabel: source.sourceLabel,
            timestampMs,
            kind: "updated",
            titleFields: source.titleFields,
            coverage: moduleCoverage,
          });
        })
        .filter(Boolean),
    ).slice(0, ANALYTICS_RECENT_LIMIT);

    const lastActivityAtMs = Math.max(
      ...items.flatMap((item) => [
        toMillis(item[source.updatedAtField]) ?? 0,
        toMillis(item[source.createdAtField]) ?? 0,
      ]),
      0,
    ) || null;

    return {
      count,
      recentCreatedCount,
      recentCreated,
      recentUpdated,
      lastActivityAtMs,
      dailyCreatedSeries: buildDailySeries(items, source.createdAtField),
      dailyUpdatedSeries: buildDailySeries(items, source.updatedAtField),
    };
  } catch {
    return {
      count: 0,
      recentCreatedCount: 0,
      recentCreated: [],
      recentUpdated: [],
      lastActivityAtMs: null,
      dailyCreatedSeries: createDailyBuckets(),
      dailyUpdatedSeries: createDailyBuckets(),
    };
  }
}

function mergeModuleUsage(moduleStats) {
  const groupedModules = new Map();

  moduleStats
    .forEach((module) => {
      const current = groupedModules.get(module.moduleKey) ?? {
        moduleKey: module.moduleKey,
        moduleLabel: module.moduleLabel,
        projects: [],
        latestActivityAtMs: null,
        recordCount: 0,
        recentCreatedCount: 0,
        recentUpdatedCount: 0,
      };

      current.projects = [...new Set([...current.projects, ...module.projectNames])];
      current.recordCount += module.totalRecords;
      current.recentCreatedCount += module.recentCreatedCount;
      current.recentUpdatedCount += module.recentUpdatedCount ?? 0;
      current.latestActivityAtMs = Math.max(
        current.latestActivityAtMs ?? 0,
        module.lastActivityAtMs ?? 0,
      ) || null;

      groupedModules.set(module.moduleKey, current);
    });

  return [...groupedModules.values()]
    .map((module) => ({
      ...module,
      activityScore:
        module.recentCreatedCount * 3 +
        module.recentUpdatedCount * 2 +
        Math.min(module.recordCount, 25),
    }))
    .sort((a, b) => {
      if ((b.activityScore ?? 0) !== (a.activityScore ?? 0)) {
        return (b.activityScore ?? 0) - (a.activityScore ?? 0);
      }

      return (b.latestActivityAtMs ?? 0) - (a.latestActivityAtMs ?? 0);
    });
}

function mergeDailySeries(seriesList, keyName) {
  const merged = new Map();

  seriesList.forEach((series) => {
    (series || []).forEach((item) => {
      const current = merged.get(item.key) ?? { dateKey: item.key, [keyName]: 0 };
      current[keyName] += item.count ?? 0;
      merged.set(item.key, current);
    });
  });

  return [...merged.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export async function getAnalyticsDashboardData() {
  const registry = await discoverAnalyticsRegistry();
  const moduleResults = [];

  for (const project of registry) {
    for (const module of project.modules) {
      const baseModule = {
        projectId: project.projectId,
        projectName: project.projectName,
        moduleKey: module.moduleKey,
        moduleLabel: module.moduleLabel,
        totalRecords: 0,
        recentCreatedCount: 0,
        recentCreated: [],
        recentUpdated: [],
        lastActivityAtMs: null,
      };

      const sourceResults = [];
      for (const source of module.sources) {
        const result = source.type === "collection"
          ? await analyzeCollectionSource({
              projectId: project.projectId,
              projectName: project.projectName,
              moduleKey: module.moduleKey,
              moduleLabel: module.moduleLabel,
              moduleCoverage: "tracked",
              source,
            })
          : await analyzeDocArraySource({
              projectId: project.projectId,
              projectName: project.projectName,
              moduleKey: module.moduleKey,
              moduleLabel: module.moduleLabel,
              moduleCoverage: "tracked",
              source,
            });

        sourceResults.push(result);
      }

      const totalRecords = sourceResults.reduce((sum, source) => sum + source.count, 0);
      const recentCreatedCount = sourceResults.reduce(
        (sum, source) => sum + source.recentCreatedCount,
        0,
      );
      const recentCreated = clampList(
        uniqueBy(
          sortByTimestampDesc(sourceResults.flatMap((source) => source.recentCreated)),
          (item) => item.id,
        ),
        12,
      );
      const recentUpdated = clampList(
        uniqueBy(
          sortByTimestampDesc(sourceResults.flatMap((source) => source.recentUpdated)),
          (item) => item.id,
        ),
        12,
      );
      const lastActivityAtMs = Math.max(
        ...sourceResults.map((source) => source.lastActivityAtMs ?? 0),
        0,
      ) || null;
      const dailyCreatedSeries = mergeDailySeries(
        sourceResults.map((source) => source.dailyCreatedSeries),
        "count",
      );
      const dailyUpdatedSeries = mergeDailySeries(
        sourceResults.map((source) => source.dailyUpdatedSeries),
        "count",
      );

      moduleResults.push({
        ...baseModule,
        totalRecords,
        recentCreatedCount,
        recentCreated,
        recentUpdated,
        recentUpdatedCount: recentUpdated.length,
        lastActivityAtMs,
        dailyCreatedSeries,
        dailyUpdatedSeries,
      });
    }
  }

  const projects = registry.map((project) => {
    const modules = moduleResults.filter((item) => item.projectId === project.projectId);
    const staleModules = modules.filter(
      (item) =>
        (!item.lastActivityAtMs || daysSince(item.lastActivityAtMs) >= ANALYTICS_STALE_DAYS),
    );

    return {
      projectId: project.projectId,
      projectName: project.projectName,
      totalModules: modules.length,
      staleModules: staleModules.length,
      totalRecords: modules.reduce((sum, item) => sum + item.totalRecords, 0),
      lastActivityAtMs: Math.max(...modules.map((item) => item.lastActivityAtMs ?? 0), 0) || null,
      dailyCreatedSeries: mergeDailySeries(
        modules.map((item) => item.dailyCreatedSeries),
        "count",
      ),
      dailyUpdatedSeries: mergeDailySeries(
        modules.map((item) => item.dailyUpdatedSeries),
        "count",
      ),
      modules: modules.map((item) => ({
        ...item,
        daysSinceUpdate: daysSince(item.lastActivityAtMs),
      })),
    };
  });

  const alerts = moduleResults
    .filter(
      (module) =>
        (!module.lastActivityAtMs || daysSince(module.lastActivityAtMs) >= ANALYTICS_STALE_DAYS),
    )
    .map((module) => {
      const age = daysSince(module.lastActivityAtMs);
      return {
        id: buildSourceId([module.projectId, module.moduleKey, "stale"]),
        severity: "danger",
        title: `${module.projectName} / ${module.moduleLabel} needs attention`,
        message:
          age == null
            ? `${module.moduleLabel} does not have a detectable recent update signal yet.`
            : `${module.moduleLabel} has not been updated in ${age} day${age === 1 ? "" : "s"}.`,
      };
    });

  const recentEntries = clampList(
    sortByTimestampDesc(moduleResults.flatMap((module) => module.recentCreated)),
    10,
  );
  const recentUpdates = clampList(
    sortByTimestampDesc(
      moduleResults.flatMap((module) =>
        module.recentUpdated.map((item) => ({
          ...item,
          actionLabel: "Updated content",
        })),
      ),
    ),
    12,
  );

  const moduleUsage = mergeModuleUsage(
    moduleResults.map((item) => ({
      moduleKey: item.moduleKey,
      moduleLabel: item.moduleLabel,
      projectNames: [item.projectName],
      totalRecords: item.totalRecords,
      recentCreatedCount: item.recentCreatedCount,
      recentUpdatedCount: item.recentUpdated.length,
      lastActivityAtMs: item.lastActivityAtMs,
    })),
  );

  return {
    generatedAt: Date.now(),
    staleDaysThreshold: ANALYTICS_STALE_DAYS,
    summary: {
      totalProjects: projects.length,
      totalModules: moduleResults.length,
      totalRecords: moduleResults.reduce((sum, item) => sum + item.totalRecords, 0),
      recentAdditions7d: moduleResults.reduce((sum, item) => sum + item.recentCreatedCount, 0),
      staleModules: alerts.length,
      activeModules24h: moduleResults.filter(
        (item) => (item.lastActivityAtMs ?? 0) >= Date.now() - 86400000,
      ).length,
    },
    projects,
    alerts,
    recentEntries,
    recentUpdates,
    moduleUsage,
  };
}
