import { getProject } from "@/projects";
import { notFound } from "next/navigation";

export default async function ProjectLayout({ children, params }) {
  const { project: projectId } = await params;

  const project = getProject(projectId);

  if (!project) {
    notFound();
  }

  return children;
}
