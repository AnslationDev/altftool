import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

const ModernTemplate = ({
  personalInfo,
  experiences,
  educations,
  skillsByCategory,
  projects,
   recruiterView,
}) => {
  return (
    <div className="bg-white text-black w-full min-h-[297mm]  p-10 break-words overflow-visible">

      <div data-resume-section="personal" className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase text-blue-700">
          {personalInfo.fullName}
        </h1>

        <p className="text-xl text-gray-600 mt-2">{personalInfo.jobTitle}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          {personalInfo.email && (
            <span className="flex items-center gap-2">
              <Mail size={16} />
              {personalInfo.email}
            </span>
          )}

          {personalInfo.phone && (
            <span className="flex items-center gap-2">
              <Phone size={16} />
              {personalInfo.phone}
            </span>
          )}

          {personalInfo.address && (
            <span className="flex items-center gap-2">
              <MapPin size={16} />
              {personalInfo.address}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-2">
              <Linkedin size={16} />
              <span className="break-all">{personalInfo.linkedin}</span>
            </span>
          )}

          {personalInfo.github && (
            <span className="flex items-center gap-2">
              <Github size={16} />
              <span className="break-all">{personalInfo.github}</span>
            </span>
          )}

          {personalInfo.website && (
            <span className="flex items-center gap-2">
              <Globe size={16} />
              <span className="break-all">{personalInfo.website}</span>
            </span>
          )}
        </div>
      </div>


      {personalInfo.summary && (
        <div data-resume-section="personal" className="mb-6">
          <h2 className="text-xl font-bold border-b border-blue-500 pb-2 mb-3">
            Summary
          </h2>

          <p
  className={`${
    recruiterView ? "opacity-70" : ""
  }`}
>
  {personalInfo.summary}
</p>
        </div>
      )}


      {experiences.length > 0 && (
        <div data-resume-section="experience" className="mb-6">
          <h2 className="text-xl font-bold border-b border-blue-500 pb-2 mb-3">
            Experience
          </h2>

          {experiences.map((exp) => (
            <div key={exp.id} className="mb-5">
              <h3 className="font-bold text-lg">{exp.jobTitle}</h3>

              <p
  className={`${
    recruiterView
      ? "text-blue-700 font-semibold"
      : "text-blue-600"
  }`}
>
  {exp.company}
</p>

              {exp.location && (
                <p className="text-sm text-gray-500">{exp.location}</p>
              )}

              <p className="text-sm text-gray-500">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </p>

              <p
  className={`mt-2 text-sm whitespace-pre-line ${
    recruiterView ? "opacity-70" : ""
  }`}
>
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      )}


      {educations.length > 0 && (
        <div data-resume-section="education" className="mb-6">
          <h2 className="text-xl font-bold border-b border-blue-500 pb-2 mb-3">
            Education
          </h2>

          {educations.map((edu) => (
            <div key={edu.id} className="mb-5">
              <h3 className="font-bold">
                {edu.degree}
              </h3>

              <p className="text-blue-600">
                {edu.school}
              </p>

              {edu.location && (
              <p className="text-sm text-gray-400">
                {edu.location}
              </p>
            )}

              <p className="text-sm text-gray-500">
                {edu.graduationDate}
              </p>

              {edu.description && (
                <p className="mt-2 text-sm whitespace-pre-line text-gray-700">
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}


      {Object.keys(skillsByCategory).length > 0 && (
        <div data-resume-section="skills" className="mb-6">
          <h2 className="text-xl font-bold border-b border-blue-500 pb-2 mb-3">
            Skills
          </h2>

          <div className="space-y-3">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <h3 className="font-semibold text-blue-700 mb-1">
                  {category}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`px-3 py-1 rounded-full text-sm ${
  recruiterView
    ? "bg-yellow-100 text-yellow-700"
    : "bg-blue-100 text-blue-700"
}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {projects.length > 0 && (
        <div data-resume-section="projects" className="mb-6">
          <h2 className="text-xl font-bold border-b border-blue-500 pb-2 mb-3">
            Projects
          </h2>

          {projects.map((project) => (
            <div key={project.id} className="mb-5">


              <h3 className="font-bold text-lg text-black">
                {project.name}
              </h3>


              {project.description && (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                  {project.description}
                </p>
              )}


              {project.technologies && (
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">
                    Technologies Used:
                  </span>{" "}
                  {project.technologies}
                </p>
              )}

              {/* PROJECT LINK */}
              {project.link && (
                <p className="mt-2 text-sm break-all text-blue-600">
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default ModernTemplate;
