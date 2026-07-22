import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import { useState } from "react";

const ProjectsForm = React.memo(
  ({ projects, addProject, removeProject, updateProject }) => {

const [added, setAdded] = useState(false);


    return (
      <div className="space-y-4">
        <button
  onClick={() => {

    addProject();

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);

  }}
          className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary) transition-colors flex items-center justify-center gap-2"
        >
          <>
  {added ? (
    <>
      ✅ Project Added
    </>
  ) : (
    <>
      <Plus className="w-5 h-5" />
      Add Project
    </>
  )}
</>
        </button>

        {projects.map((proj, index) => (
          <div
            key={proj.id}
            className="border rounded-lg p-4 space-y-4 relative"
          >
            <button
              onClick={() => removeProject(proj.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <h4 className="font-medium text-(--foreground)">
              Project {index + 1}
            </h4>

            <InputField
              label="Project Name"
              value={proj.name}
              onChange={(v) => updateProject(proj.id, "name", v)}
              placeholder="E-commerce Website /shopping App"
            />

            <TextAreaField
              label="Description"
              value={proj.description}
              onChange={(v) => updateProject(proj.id, "description", v)}
              placeholder="Describe what the project does, your role, and key achievements..."
              rows={3}
            />

            <InputField
              label="Technologies Used"
              value={proj.technologies}
              onChange={(v) => updateProject(proj.id, "technologies", v)}
              placeholder="React, Node.js, MongoDB"
            />

            <InputField
              label="Project Link"
              value={proj.link}
              onChange={(v) => updateProject(proj.id, "link", v)}
              placeholder="https://yourprojectlink.com"
            />
          </div>
        ))}
      </div>
    );
  },
);

ProjectsForm.displayName = "ProjectsForm";

export default ProjectsForm;
