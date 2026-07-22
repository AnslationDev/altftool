import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import ModernTemplate from "../templates/ModernTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import TechTemplate from "../templates/TechTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import DownloadUnlockModal from "../modal/DownloadUnlockModal";

const ResumePreview = ({
  personalInfo,
  experiences,
  educations,
  skillsByCategory,
  projects,
  resumeRef,
  downloadPDF,
  isDownloading,
  activeSection,
  selectedTemplate,
  setShowPortfolio

}) => {
  const [recruiterView, setRecruiterView] = useState(false);
  const [pageBreaks, setPageBreaks] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    const el = resumeRef?.current?.querySelector(
      `[data-resume-section="${activeSection}"]`,
    );

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeSection]);


  const getHighlightClass = (section) =>

    activeSection === section
      ? ` bg-blue-500/5
      shadow-[0_0_25px_rgba(59,130,246,0.12)]
      rounded-lg
      transition-all
      duration-500 `
      : " transition-all duration-500 ";



 useEffect(() => {
  const calculateBreaks = async () => {
    if (!resumeRef?.current) return;

    const html2canvas = (await import("html2canvas")).default;

    const clone = resumeRef.current.cloneNode(true);


const all = clone.querySelectorAll("*");

all.forEach((el) => {
  el.style.color = "#000000";
  el.style.backgroundColor = "#ffffff";
  el.style.borderColor = "#000000";
  el.style.boxShadow = "none";
});

clone.style.position = "fixed";
clone.style.top = "-9999px";
clone.style.left = "0";

document.body.appendChild(clone);

const canvas = await html2canvas(clone, {
  scale: 2,
  useCORS: true,
});

document.body.removeChild(clone);

    const totalHeight = canvas.height;

    const pageHeight = 1122 * 2;

    const breaks = [];
    let current = pageHeight;

    while (current < totalHeight) {
      breaks.push(current);
      current += pageHeight;
    }


   if (!resumeRef.current) return;

const scaleRatio = totalHeight / resumeRef.current.scrollHeight;

   const adjustedBreaks = breaks.map(
      (b) => b / scaleRatio
    );

    setPageBreaks(adjustedBreaks);
  };

  calculateBreaks();
}, [personalInfo, experiences, educations, skillsByCategory, projects]);

  return (
    <div className="mt-8">
      <div className=" flex justify-center mb-5">
        <h2 className=" text-2xl sm:text-3xl font-bold text-gray-500 text-center ">
          Resume Preview
        </h2>
        </div>


      <div className="flex  flex-wrap justify-center items-center gap-3 mb-6">
        <button
          onClick={() => setShowDownloadModal(true)}
          disabled={isDownloading}
          className={` h-10 px-4 sm:px-5 rounded-lg text-sm font-medium text-white transition-all shadow-sm
  ${isDownloading ? " bg-green-400  opacity-50 cursor-not-allowed"
    :  "bg-green-600 hover:bg-green-700"}`}
        >
          {isDownloading ? "Generating PDF..." : "Download Resume as PDF"}
        </button>


        <button
          onClick={() => setRecruiterView(!recruiterView)}
          className={`h-10 px-4 sm:px-5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${
              recruiterView
                ? "bg-blue-100 text-blue-600"
                : "bg-(--card) text-(--muted-foreground) border border-(--border) hover:bg-(--border)"
            }`}
        >
          {recruiterView ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {recruiterView ? "Recruiter View ON" : "Recruiter View"}
        </button>


      <button
  onClick={() => setShowPortfolio(true)}
  className= "h-10 px-4 sm:px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all shadow-sm"
>
  📱 Generate Portfolio
</button>

</div>


      <div className="
relative
flex
justify-start sm:justify-center
overflow-x-auto
overflow-y-hidden

w-full

px-0 sm:px-4

mt-2
    sm:mt-4
    lg:mt-6

    [-ms-overflow-style:none]
    [scrollbar-width:none]">


        {pageBreaks.map((top, index) => (
          <div
            key={index}
            className="absolute border-t border-dashed border-gray-400 opacity-60 pointer-events-none"
            style={{
              top: `${top > 50 ? top + 10 : top}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: "210mm",
              zIndex: 10,
            }}
          />
        ))}

       <div
  ref={resumeRef}
  className={`origin-top scale-100 max-lg:-mb-[120px] max-lg:scale-[0.78] max-sm:-mb-[320px] max-sm:scale-[0.60] max-[480px]:-mb-[520px] max-[480px]:-ml-[180px] max-[480px]:scale-[0.48] max-[320px]:-mb-[700px] max-[320px]:scale-[0.36]

    ${
      !selectedTemplate
        ? `
          bg-(--card)
          text-(--foreground)
          border border-(--border)

          shadow-2xl
          rounded-xl

          transition-all
          duration-500
        `
        : ""
    }
  `}
 style={{
  width: "210mm",

  minHeight: "297mm",

  padding: selectedTemplate ? "0" : "20mm",

  overflow: "visible",

}}
>

{ !selectedTemplate && (
  <>

          {personalInfo.fullName && (
            <div data-resume-section="personal" className={`text-center mb-6 pb-4 border-b  transition-all duration-500 ${getHighlightClass(
              "personal"
            )}`}>
              <h1
                className={`text-3xl font-bold text-(--foreground) uppercase transition-all
                ${recruiterView ? "shadow-[0_0_10px_rgba(59,130,246,0.18)] scale-[1.02]" : ""}`}
              >
                {personalInfo.fullName}
              </h1>

              <p
                className={`text-lg font-medium mt-1 transition-all
  ${recruiterView ? "text-blue-500 font-semibold" : "text-blue-600"}`}
              >
                {personalInfo.jobTitle}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-(--muted-foreground)">
                {personalInfo.email && (
                  <span>
                    <Mail className="inline w-4 h-4" /> {personalInfo.email}
                  </span>
                )}
                {personalInfo.phone && (
                  <span>
                    <Phone className="inline w-4 h-4" /> {personalInfo.phone}
                  </span>
                )}
                {personalInfo.address && (
                  <span>
                    <MapPin className="inline w-4 h-4" /> {personalInfo.address}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                {personalInfo.linkedin && (
                  <span>
                    <Linkedin className="inline w-4 h-4" />{" "}
                    {personalInfo.linkedin}
                  </span>
                )}
                {personalInfo.github && (
                  <span>
                    <Github className="inline w-4 h-4" /> {personalInfo.github}
                  </span>
                )}
                {personalInfo.website && (
                  <span>
                    <Globe className="inline w-4 h-4" /> {personalInfo.website}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ================= SUMMARY ================= */}
          {personalInfo.summary && (
            <section data-resume-section="personal" className={`mb-5 transition-all duration-500 ${getHighlightClass(
"personal"
            )}`}>
              <h2 className={`
  text-lg
  font-bold
  border-b
  pb-1
  mb-3

  transition-all
  duration-500
`}>
                Professional Summary
              </h2>
              <p
                className={`text-sm transition-all
                ${recruiterView ? "opacity-60" : ""}`}
              >
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* ================= EXPERIENCE ================= */}
          {experiences.length > 0 && (
            <section data-resume-section="experience" className={`mb-5 transition-all duration-500 ${getHighlightClass(
"experience"
            )}`}>
              <h2 className="text-lg font-bold border-b pb-1 mb-3">
                Work Experience
              </h2>

              {experiences.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{exp.jobTitle}</h3>
                      <p
                        className={`transition-all
  ${recruiterView ? "text-blue-500 font-semibold" : "text-blue-600"}`}
                      >
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="text-sm">{exp.location}</p>
                      )}
                    </div>

                    <span className="text-sm">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {exp.description && (
                    <p
                      className={`text-sm mt-2 whitespace-pre-line transition-all
                      ${recruiterView ? "opacity-60" : ""}`}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ================= EDUCATION ================= */}
          {educations.length > 0 && (
            <section data-resume-section="education" className={`mb-5 transition-all duration-500 ${getHighlightClass(
              "education"
            )}`}>
              <h2 className="text-lg font-bold border-b pb-1 mb-3">
                Education
              </h2>

              {educations.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{edu.degree}</h3>
                      <p className="text-blue-600">{edu.school}</p>
                      {edu.location && (
                        <p className="text-sm">{edu.location}</p>
                      )}
                    </div>

                    {edu.graduationDate && (
                      <span className="text-sm">{edu.graduationDate}</span>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-sm mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ================= SKILLS ================= */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section data-resume-section="skills" className={`mb-5 transition-all duration-500 ${getHighlightClass(
              "skills"
            )}`}>
              <h2 className="text-lg font-bold border-b pb-1 mb-3">Skills</h2>

              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div
                  key={category}
                  className={`mb-2 transition-all pl-2
    ${recruiterView ? "border-l-4 border-yellow-400" : ""}`}
                >
                  <strong className={recruiterView ? "text-yellow-600" : ""}>
                    {category}:{" "}
                  </strong>
                  {skills.map((s) => s.name).join(", ")}
                </div>
              ))}
            </section>
          )}

          {/* ================= PROJECTS ================= */}
          {projects.length > 0 && (
            <section data-resume-section="projects" className={`mb-5 transition-all duration-500 ${getHighlightClass(
            "projects"
            )}`}>
              <h2 className="text-lg font-bold border-b pb-1 mb-3">Projects</h2>

              {projects.map((proj) => (
                <div key={proj.id} className="mb-4">
                  <div className="flex justify-between">
                    <h3
                      className={`font-bold transition-all
  ${recruiterView ? "text-blue-500" : ""}`}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <span className="text-blue-600">{proj.link}</span>
                    )}
                  </div>

                  {proj.description && (
                    <p
                      className={`text-sm mt-1 transition-all
                      ${recruiterView ? "opacity-60" : ""}`}
                    >
                      {proj.description}
                    </p>
                  )}

                  {proj.technologies && (
                    <p className="text-sm mt-1">
                      <strong>Technologies:</strong> {proj.technologies}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
          </>
          )}


  {selectedTemplate === "modern" && (
    <ModernTemplate
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skillsByCategory={skillsByCategory}
      projects={projects}
      recruiterView={recruiterView}
    />
  )}

  {selectedTemplate === "minimal" && (
    <MinimalTemplate
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skillsByCategory={skillsByCategory}
      projects={projects}
      recruiterView={recruiterView}
    />
  )}

  {selectedTemplate === "tech" && (
    <TechTemplate
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skillsByCategory={skillsByCategory}
      projects={projects}
      recruiterView={recruiterView}
    />
  )}

  {selectedTemplate === "creative" && (
    <CreativeTemplate
      personalInfo={personalInfo}
      experiences={experiences}
      educations={educations}
      skillsByCategory={skillsByCategory}
      projects={projects}
      recruiterView={recruiterView}
    />
  )}



{showDownloadModal && (

  <DownloadUnlockModal

    onClose={() => setShowDownloadModal(false)}

    onContinue={() => {
      setShowDownloadModal(false);
      downloadPDF();
    }}

  />

)}
</div>
</div>
</div>

  );
};

export default ResumePreview;
