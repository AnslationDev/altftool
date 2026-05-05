import { getProject } from "@/projects";
import { ProjectProvider } from "@/context/ProjectContext";

export default async function ProjectLayout({ children, params }) {
  const { project: projectId } = await params;

  const project = getProject(projectId);

  if (!project) {
    console.error("Project not found:", projectId);
    return <div>Project not found: {projectId}</div>;
  }

  return children;
}

