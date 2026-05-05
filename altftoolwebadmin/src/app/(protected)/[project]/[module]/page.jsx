import { renderAdminModuleRoute } from "@/lib/adminModuleRoute";

export default async function ModulePage({ params }) {
  const { project: projectId, module: moduleKey } = await params;

  return renderAdminModuleRoute({
    projectId,
    moduleSegment: moduleKey,
  });
}
