import { Plus, Trash2 } from "lucide-react";

const SkillsForm = ({
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  skillsByCategory
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={newSkill.name}
          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
          placeholder="Add skill (e.g., JavaScript)"
          className="flex-1 px-4 py-2 border border-(--border) rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
        />

        <select
          value={newSkill.category}
          onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
          className="px-4 py-2 border border-(--border) rounded-lg"
        >
          <option className="bg-(--card) text-(--foreground)" >Technical</option>
          <option className="bg-(--card) text-(--foreground)" >Soft Skills</option>
          <option className="bg-(--card) text-(--foreground)" >Tools</option>
          <option className="bg-(--card) text-(--foreground)" >Languages</option>
          <option className="bg-(--card) text-(--foreground)" >Frameworks</option>
        </select>

        <button onClick={addSkill} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h5 className="font-medium text-(--foreground) mb-2">{category}</h5>

            <div className="flex flex-wrap gap-2">
              {categorySkills.map(skill => (
                <span key={skill.id} className="inline-flex items-center gap-2 px-3 py-1 bg-(--card) text-(--foreground) rounded-full text-sm">
                  {skill.name}
                  <button onClick={() => removeSkill(skill.id)} className="hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;