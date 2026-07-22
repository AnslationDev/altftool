import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

const MinimalTemplate = ({
  personalInfo,
  experiences,
  educations,
  skillsByCategory,
  projects,
   recruiterView,
}) => {
  return (
    <div className="bg-white text-black  w-full min-h-[297mm] p-10 sm:p-14  break-words overflow-visible">

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
            <span className="flex items-center gap-2 break-all">
              <Linkedin size={14} />
              {personalInfo.linkedin}
            </span>
          )}

          {personalInfo.github && (
            <span className="flex items-center gap-2 break-all">
              <Github size={14} />
              {personalInfo.github}
            </span>
          )}

          {personalInfo.website && (
            <span className="flex items-center gap-2 break-all">
              <Globe size={14} />
              {personalInfo.website}
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
      ? "text-gray-500"
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
      ? "text-black font-semibold"
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
      <div key={edu.id} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <div>
            <h3 className="font-semibold text-lg">
              {edu.degree}
            </h3>

            <p className="text-gray-500">
              {edu.school}
            </p>

            {edu.location && (
              <p className="text-sm text-gray-400">
                {edu.location}
              </p>
            )}
          </div>

          {edu.graduationDate && (
            <span className="text-sm text-gray-400">
              {edu.graduationDate}
            </span>
          )}
        </div>

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
          <h3 className="font-semibold text-gray-800 mb-2">
            {category}
          </h3>

          <div className={`text-sm leading-6 ${
  recruiterView
    ? "text-yellow-700 font-medium"
    : "text-gray-700"
}`}>
  {skills.map((skill, index) => (
    <span key={skill.name}>
      {skill.name}
      {index !== skills.length - 1 && ", "}
    </span>
  ))}
</div>
        </div>
      ))}
    </div>
  </section>
)}

{projects?.length > 0 && (
  <section data-resume-section="projects" className="mb-8">
    <h2 className="uppercase text-sm tracking-[4px] font-semibold mb-4 text-gray-700">
      Projects
    </h2>

    {projects.map((project) => (
      <div key={project.id} className="mb-6">


        <h3 className="font-semibold text-lg">
          {project.name}
        </h3>


        {project.description && (
          <p className="mt-3 text-sm leading-6 whitespace-pre-line text-gray-700">
            {project.description}
          </p>
        )}


        {project.technologies && (
          <p className="mt-3 text-sm text-gray-700">
            <strong>Technologies Used:</strong>{" "}
            {project.technologies}
          </p>
        )}


        {project.link && (
          <p className="mt-3 text-sm text-blue-600 break-all">
            <strong>Project Link:</strong>{" "}
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

export default MinimalTemplate;
