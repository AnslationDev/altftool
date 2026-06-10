import { notFound, redirect } from "next/navigation";
import {
  getCanonicalModuleRoute,
  isSafeAdminPathSegment,
  resolveProjectModule,
} from "@/config/adminRoutes";
import AdminModuleLazyRoute from "@/components/admin/AdminModuleLazyRoute";
import {
  hasAdminModuleLayout,
  resolveAdminModuleRouteKey,
} from "@/lib/adminModuleRouteKeys";

function createRouteCandidates(subPath) {
  const exact = subPath.join("/");
  const candidates = exact ? [exact] : [""];

  if (subPath.length > 0) {
    const dynamicCandidate = [...subPath.slice(0, -1), "[id]"].join("/");
    if (!candidates.includes(dynamicCandidate)) {
      candidates.push(dynamicCandidate);
    }
  }

  return candidates;
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

  const candidates = createRouteCandidates(subPath);
  const routeKey = resolveAdminModuleRouteKey(projectId, resolvedModule.moduleKey, candidates);
  if (!routeKey && routeKey !== "") notFound();

  return (
    <AdminModuleLazyRoute
      projectId={projectId}
      moduleKey={resolvedModule.moduleKey}
      routeKey={routeKey}
      useModuleLayout={hasAdminModuleLayout(projectId, resolvedModule.moduleKey)}
    />
  );
}
