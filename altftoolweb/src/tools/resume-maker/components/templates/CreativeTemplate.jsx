import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

const CreativeTemplate = ({
  personalInfo,
  experiences,
  educations,
  skillsByCategory,
  projects,
   recruiterView,

}) => {
  return (
    <div className="grid grid-cols-[38%_62%] w-full min-h-[297mm] overflow-visible bg-white">

      <div
  data-resume-section="personal"
  className="text-white p-7 flex flex-col min-w-0"
  style={{
    background: "linear-gradient(to bottom, #7e22ce, #ec4899)",
  }}
>
        <h1 className="text-2xl font-bold leading-tight text-center">
          {personalInfo.fullName}
        </h1>

        <p className="text-center text-pink-100 mt-1 text-sm">
          {personalInfo.jobTitle}
        </p>


        <div className="mt-7 space-y-3 text-sm break-words">
          {personalInfo.email && (
            <div className="flex items-start gap-3 min-w-0">
              <Mail size={16} />
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}

          {personalInfo.phone && (
            <div className="flex items-start gap-3 min-w-0">
              <Phone size={16} />
              <span className="break-all">{personalInfo.phone}</span>
            </div>
          )}

          {personalInfo.address && (
            <div className="flex items-start gap-3 min-w-0">
              <MapPin size={16} />
              <span className="break-all">{personalInfo.address}</span>
            </div>
          )}

          {personalInfo.linkedin && (
            <div className="flex items-start gap-3 min-w-0">
              <Linkedin size={16} />
              <span className="break-all">{personalInfo.linkedin}</span>
            </div>
          )}

          {personalInfo.github && (
            <div className="flex items-start gap-3 min-w-0">
              <Github size={16} />
              <span className="break-all">{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-start gap-3 min-w-0">
              <Globe size={16} />

              <span className="break-all">{personalInfo.website}</span>
            </div>
          )}
        </div>


        {Object.keys(skillsByCategory).length > 0 && (
          <div data-resume-section="skills" className="mt-10">
            <h2 className="font-bold text-xl mb-5">Skills</h2>

            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="font-semibold text-pink-100 mb-2">
                    {category}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.name}
                        className={`px-3 py-1 rounded-full text-xs ${
  recruiterView
    ? "bg-yellow-200 text-yellow-900"
    : "bg-white/20"
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
      </div>


      <div className="bg-white p-10 min-w-0">

        {personalInfo.summary && (
          <section data-resume-section="personal" className="mb-10">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">
              About Me
            </h2>

            <p
  className={`leading-8 ${
    recruiterView
      ? "opacity-70 text-gray-600"
      : "text-gray-700"
  }`}
>{personalInfo.summary}</p>
          </section>
        )}


        {experiences.length > 0 && (
          <section data-resume-section="experience" className="mb-10">
            <h2 className="text-3xl font-bold text-purple-600 mb-5">
              Experience
            </h2>

            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="mb-6 border-l-4 border-pink-500 pl-5"
              >
                <h3 className="font-bold text-lg  text-black">
                  {exp.jobTitle}
                </h3>

               <p
  className={`font-medium ${
    recruiterView
      ? "text-yellow-200"
      : "text-pink-500"
  }`}
>
  {exp.company}
</p>
                {exp.location && (
                  <p className="text-sm text-gray-500">{exp.location}</p>
                )}

                <p className="text-sm text-gray-600 mt-1">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </p>

                <p className="mt-3 text-gray-700 leading-7">
                  {exp.description}
                </p>
              </div>
            ))}
          </section>
        )}


        {educations.length > 0 && (
          <section data-resume-section="education" className="mb-10">
            <h2 className="text-3xl font-bold text-purple-600 mb-5">
              Education
            </h2>

            {educations.map((edu) => (
              <div
                key={edu.id}
                className="mb-6 border-l-4 border-purple-400 pl-5"
              >
                <div className="flex justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-bold text-black text-lg">
                      {edu.degree}
                    </h3>

                    <p className="text-pink-500 font-medium">{edu.school}</p>

                    {edu.location && (
                      <p className="text-sm text-gray-500">{edu.location}</p>
                    )}
                  </div>

                  {edu.graduationDate && (
                    <span className="text-sm text-gray-500">
                      {edu.graduationDate}
                    </span>
                  )}
                </div>

                {edu.description && (
                  <p className="mt-3 text-gray-700 leading-7 whitespace-pre-line">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}


  {projects?.length > 0 && (
  <section data-resume-section="projects" className="mb-10">
    <h2 className="text-3xl font-bold text-purple-600 mb-5">
      Projects
    </h2>

    {projects.map((project) => (
      <div
        key={project.id}
        className="mb-6 border-l-4 border-pink-500 pl-5"
      >

        <h3 className="font-bold text-lg text-black">
          {project.name}
        </h3>


        {project.description && (
          <p className="mt-3 text-gray-700 leading-7 whitespace-pre-line">
            {project.description}
          </p>
        )}


        {project.technologies && (
          <p className="text-sm text-purple-600 mt-3">
            <strong>Technologies Used:</strong>{" "}
            {project.technologies}
          </p>
        )}


        {project.link && (
          <p className="text-sm text-blue-600 break-all mt-3">
            <strong>Project Link:</strong>{" "}
            {project.link}
          </p>
        )}
      </div>
    ))}
  </section>
)}
      </div>
    </div>
  );
};

export default CreativeTemplate;
