import { notFound, redirect } from "next/navigation";
import { getProject } from "@/projects";
import { getProjectModuleRoute } from "@/config/adminRoutes";

function EmptyProjectState({ project }) {
  return (
    <main className="min-h-[60vh] bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-sm font-bold text-[var(--foreground)]">{project.name}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This project is registered in the admin panel. Modules can be added when the project backend is ready.
        </p>
      </section>
    </main>
  );
}

export default async function ProjectIndexPage({ params }) {
  const { project: projectId } = await params;
  const project = getProject(projectId);

  if (!project) {
    notFound();
  }

  const firstModuleKey = Object.keys(project.modules || {})[0];

  if (!firstModuleKey) {
    return <EmptyProjectState project={project} />;
  }

  redirect(getProjectModuleRoute(projectId, firstModuleKey));
}
