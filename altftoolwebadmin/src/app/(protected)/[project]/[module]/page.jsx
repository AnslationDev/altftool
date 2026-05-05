import { getProject } from "@/projects";

export default async function ModulePage({ params }) {
  const { project: projectId, module: moduleKey } = await params;

  const project = getProject(projectId);
  if (!project) return <div>Invalid Project</div>;

  const moduleConfig = project.modules[moduleKey];
  if (!moduleConfig) return <div>Module not found</div>;

  let Page;
  let Layout;

  try {
    Page = (
      await import(`@/projects/${projectId}/modules/${moduleKey}/page.jsx`)
    ).default;
  } catch {
    return <div>Module not implemented</div>;
  }

  try {
    Layout = (
      await import(`@/projects/${projectId}/modules/${moduleKey}/layout.jsx`)
    ).default;
  } catch {}

  

  if (Layout) {
    return (
      <Layout>
        <Page />
      </Layout>
    );
  }

  return <Page />;
}