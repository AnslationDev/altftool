export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
  actions,
}) {
  const options = [
    { projectId: "all", projectName: "All Projects" },
    ...projects.map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
    })),
  ];

  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Project Scope
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Switch between a single project view and the combined global summary.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {actions ? <div className="flex justify-start lg:justify-end">{actions}</div> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedProjectId}
            onChange={(event) => onSelect(event.target.value)}
            className="border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] outline-none transition focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {options.map((option) => (
              <option key={option.projectId} value={option.projectId}>
                {option.projectName}
              </option>
            ))}
          </select>

          <div className="hidden flex-wrap gap-2 xl:flex">
            {options.map((option) => {
              const active = option.projectId === selectedProjectId;
              return (
                <button
                  key={option.projectId}
                  type="button"
                  onClick={() => onSelect(option.projectId)}
                  className={`px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)]"
                      : "bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--primary-soft)]"
                  }`}
                >
                  {option.projectName}
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
