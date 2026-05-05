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
    <section className="border border-gray-200 bg-white p-4 shadow-sm rounded-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Project Scope
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Switch between a single project view and the combined global summary.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {actions ? <div className="flex justify-start lg:justify-end">{actions}</div> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedProjectId}
            onChange={(event) => onSelect(event.target.value)}
            className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-300"
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
                  onClick={() => onSelect(option.projectId)}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
