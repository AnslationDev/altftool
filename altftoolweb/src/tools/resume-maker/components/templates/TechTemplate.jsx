import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

const TechTemplate = ({
  personalInfo,
  experiences,
  educations,
  skillsByCategory,
  projects,
   recruiterView,
}) => {
  return (
    <div className="bg-white text-black p-10 sm:p-14 shadow-2xl">

      <div data-resume-section="personal" className="mb-10 text-center border-b border-gray-300 pb-6">
        <h1 className="text-4xl font-light tracking-[8px] uppercase">
          {personalInfo.fullName}
        </h1>
        <p className="mt-3 text-gray-500 text-lg">{personalInfo.jobTitle}</p>

        <div className="flex flex-wrap justify-center gap-4 mt-5 text-sm text-gray-600">
          {personalInfo.email && (
            <span className="flex items-center gap-2">
              <Mail size={14} />
              {personalInfo.email}
            </span>
          )}

          {personalInfo.phone && (
            <span className="flex items-center gap-2">
              <Phone size={14} />
              {personalInfo.phone}
            </span>
          )}

          {personalInfo.address && (
            <span className="flex items-center gap-2">
              <MapPin size={14} />
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
        <section data-resume-section="personal" className="mb-8">
          <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
            Professional Summary
          </h2>

          <p
  className={`leading-7 ${
    recruiterView
      ? "opacity-70"
      : "text-gray-700"
  }`}
>{personalInfo.summary}</p>
        </section>
      )}


      {experiences.length > 0 && (
        <section data-resume-section="experience" className="mb-8">
          <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
            Experience
          </h2>

          {experiences.map((exp) => (
            <div key={exp.id} className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <div>
                  <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>

                 <p
  className={`${
    recruiterView
      ? "text-blue-700 font-semibold"
      : "text-gray-500"
  }`}
>
  {exp.company}
</p>
                  {exp.location && (
                    <p className="text-sm text-gray-400">{exp.location}</p>
                  )}
                </div>

                <span className="text-sm text-gray-400">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 whitespace-pre-line text-gray-700">
                {exp.description}
              </p>
            </div>
          ))}
        </section>
      )}


      {educations.length > 0 && (
        <section data-resume-section="education" className="mb-8">
          <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
            Education
          </h2>

          {educations.map((edu) => (
            <div key={edu.id} className="mb-5">
              <h3 className="font-semibold">{edu.degree}</h3>

              <p className="text-gray-500">{edu.school}</p>
              {edu.location && (
                <p className="text-sm text-gray-500">{edu.location}</p>
              )}

              <span className="text-sm text-gray-400">
                {edu.graduationDate}
              </span>

              {edu.description && (
                <p className="mt-3 text-sm leading-6 whitespace-pre-line text-gray-700">
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}


      {Object.keys(skillsByCategory).length > 0 && (
        <section data-resume-section="skills" className="mb-8">
          <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
            Skills
          </h2>

          <div className="space-y-4">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                     className={`px-3 py-1 rounded-md text-sm ${
  recruiterView
    ? "bg-yellow-100 text-yellow-700"
    : "bg-gray-200 text-gray-800"
}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {projects.length > 0 && (
        <section data-resume-section="projects" className="mb-8">
          <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
            Projects
          </h2>

          {projects.map((project) => (
            <div key={project.id} className="mb-6">

              <h3 className="font-semibold text-lg text-black">
                {project.name}
              </h3>


              {project.description && (
                <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line">
                  {project.description}
                </p>
              )}


              {project.technologies && (
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Technologies Used:</span>{" "}
                  {project.technologies}
                </p>
              )}


              {project.link && (
                <p className="mt-2 text-sm break-all text-blue-600">
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default TechTemplate;
