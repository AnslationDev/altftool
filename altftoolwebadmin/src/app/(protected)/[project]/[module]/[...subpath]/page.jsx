import { renderAdminModuleRoute } from "@/lib/adminModuleRoute";

export default async function ModuleSubPage({ params }) {
  const {
    project: projectId,
    module: moduleKey,
    subpath = [],
  } = await params;

  return renderAdminModuleRoute({
    projectId,
    moduleSegment: moduleKey,
    subPath: subpath,
  });
}
