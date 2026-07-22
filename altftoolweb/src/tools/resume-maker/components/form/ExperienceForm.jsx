import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import { Plus, Trash2 } from "lucide-react";
import React, {useState} from "react";


const ExperienceForm = ({
  experiences,
  addExperience,
  removeExperience,
  updateExperience
}) => {

const [added, setAdded] = useState(false);


  return (
    <div className="space-y-4">

      <button
       onClick={() => {

  addExperience();

  setAdded(true);

  setTimeout(() => {
    setAdded(false);
  }, 1500);

}}
        className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary) transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <>
  {added ? (
    <>
      ✅ Experience Added
    </>
  ) : (
    <>
      <Plus className="w-5 h-5" />
      Add Experience
    </>
  )}
</>
      </button>

      {experiences.map((exp, index) => (
        <div key={exp.id} className="border rounded-lg p-4 space-y-4 relative">

          <button
            onClick={() => removeExperience(exp.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <h4 className="font-medium text-(--muted-foreground)">
            Experience {index + 1}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Job Title"
              value={exp.jobTitle}
              onChange={(v) => updateExperience(exp.id, "jobTitle", v)}
              placeholder="Software Engineer"
            />

            <InputField
              label="Company"
              value={exp.company}
              onChange={(v) => updateExperience(exp.id, "company", v)}
              placeholder="Google Inc"
            />
          </div>

          <InputField
            label="Location"
            value={exp.location}
            onChange={(v) => updateExperience(exp.id, "location", v)}
            placeholder="New York, USA"
          />

          <div className="grid grid-cols-2 gap-4">

            <InputField
              label="Start Date"
              value={exp.startDate}
              onChange={(v) => updateExperience(exp.id, "startDate", v)}
              placeholder="Jan 2022"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-(--muted-foreground)">
                End Date
              </label>

              {exp.current ? (
                <input
                  type="text"
                  value="Present"
                  disabled
                  className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--card)"
                />
              ) : (
                <InputField
                  label=""
                  value={exp.endDate}
                  onChange={(v) => updateExperience(exp.id, "endDate", v)}
                  placeholder="Dec 2023"
                />
              )}

              <label className="flex items-center gap-2 text-xs sm:text-sm text-(--muted-foreground) leading-5">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    updateExperience(exp.id, "current", e.target.checked)
                  }
                />
                I currently works here
              </label>
            </div>
          </div>

          <TextAreaField
            label="Description (Use action verbs like 'achieved', 'increased', 'improved')"
            value={exp.description}
            onChange={(v) => updateExperience(exp.id, "description", v)}
            placeholder="Lead a team of developers and improved system performance by 30%..."
            rows={4}
          />



        </div>
      ))}

    </div>
  );
};

export default ExperienceForm;
