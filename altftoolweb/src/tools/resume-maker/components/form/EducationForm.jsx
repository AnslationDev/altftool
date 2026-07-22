import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const EducationForm = ({
  educations,
  addEducation,
  removeEducation,
  updateEducation
}) => {
  const [added, setAdded] = useState(false);
  return (
    <div className="space-y-4">
      <button
  onClick={() => {

    addEducation();

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);

  }}
      className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary) transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <>
  {added ? (
    <>
      ✅ Education Added
    </>
  ) : (
    <>
      <Plus className="w-5 h-5" />
      Add Education
    </>
  )}
</>
      </button>

      {educations.map((edu, index) => (
        <div key={edu.id} className="border rounded-lg p-4 space-y-4 relative">
          <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <Trash2 className="w-5 h-5" />
          </button>

          <h4 className="font-medium text-(--muted-foreground)">
            Education {index + 1}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Degree"
              value={edu.degree}
              onChange={(v) => updateEducation(edu.id, 'degree', v)}
              placeholder="B.Tech in Computer Science"
            />

            <InputField
              label="Institute"
              value={edu.school}
              onChange={(v) => updateEducation(edu.id, 'school', v)}
              placeholder="Delhi University"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Location"
              value={edu.location}
              onChange={(v) => updateEducation(edu.id, 'location', v)}
              placeholder="Delhi, India"
            />

            <InputField
              label="Graduation End Date"
              value={edu.graduationDate}
              onChange={(v) => updateEducation(edu.id, 'graduationDate', v)}
              placeholder="2024"
            />
          </div>

          <TextAreaField
            label="Description"
            value={edu.description}
            onChange={(v) => updateEducation(edu.id, 'description', v)}
            placeholder="Relevant coursework, achievements, GPA, etc."
            rows={3}
          />
        </div>
      ))}
    </div>
  );
};

export default EducationForm;