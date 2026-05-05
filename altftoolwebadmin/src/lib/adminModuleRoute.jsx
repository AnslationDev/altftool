import { notFound, redirect } from "next/navigation";
import {
  getCanonicalModuleRoute,
  isSafeAdminPathSegment,
  resolveProjectModule,
} from "@/config/adminRoutes";

function isDynamicLeaf(segment = "") {
  return !Number.isNaN(Number(segment)) || /^[a-z0-9_-]{16,}$/i.test(segment);
}

function createRouteCandidates(subPath) {
  const exact = subPath.join("/");
  const candidates = exact ? [exact] : [""];

  if (subPath.length > 0 && isDynamicLeaf(subPath[subPath.length - 1])) {
    candidates.push([...subPath.slice(0, -1), "[id]"].join("/"));
  }

  return candidates;
}

async function loadRouteComponent(projectId, moduleKey, subPath) {
  const candidates = createRouteCandidates(subPath);

  for (const candidate of candidates) {
    try {
      return (
        await import(
          `@/projects/${projectId}/modules/${moduleKey}/${candidate ? `${candidate}/` : ""}page.jsx`
        )
      ).default;
    } catch {}
  }

  return null;
}

async function loadModuleLayout(projectId, moduleKey) {
  try {
    return (await import(`@/projects/${projectId}/modules/${moduleKey}/layout.jsx`)).default;
  } catch {
    return null;
  }
}

export async function renderAdminModuleRoute({ projectId, moduleSegment, subPath = [] }) {
  if (
    !isSafeAdminPathSegment(projectId) ||
    !isSafeAdminPathSegment(moduleSegment) ||
    subPath.some((segment) => !isSafeAdminPathSegment(segment))
  ) {
    notFound();
  }

  const resolvedModule = resolveProjectModule(projectId, moduleSegment);
  if (!resolvedModule) notFound();

  const canonicalRoute = getCanonicalModuleRoute(resolvedModule, subPath);
  const requestedRoute = `/${projectId}/${moduleSegment}${subPath.length ? `/${subPath.join("/")}` : ""}`;

  if (requestedRoute !== canonicalRoute) {
    redirect(canonicalRoute);
  }

  const Page = await loadRouteComponent(projectId, resolvedModule.moduleKey, subPath);
  if (!Page) notFound();

  const Layout = await loadModuleLayout(projectId, resolvedModule.moduleKey);

  if (Layout) {
    return (
      <Layout>
        <Page />
      </Layout>
    );
  }

  return <Page />;
}
