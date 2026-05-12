import { notFound, redirect } from "next/navigation";
import { getProject } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";

export default async function ProjectIndexPage({ params }) {
  const { project: projectId } = await params;
  const project = getProject(projectId);

  if (!project) {
    notFound();
  }

  const firstModuleKey = Object.keys(project.modules || {})[0];

  if (!firstModuleKey) {
    notFound();
  }

  redirect(getProjectModuleRoute(projectId, firstModuleKey));
}
