import { useRef, useState } from "react";
import { toPng } from "html-to-image";

const PortfolioPreview = ({
  personalInfo,
  projects,
  skills,
  onClose,
}) => {

  const portfolioRef = useRef(null);

 const downloadPortfolio = async () => {

  if (!portfolioRef.current) return;

  try {

    const buttons = document.getElementById("portfolio-actions");


    if (buttons) {
      buttons.style.display = "none";
    }

    const dataUrl = await toPng(portfolioRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const link = document.createElement("a");

    link.download = `${
      personalInfo?.fullName || "portfolio"
    }.png`;

    link.href = dataUrl;

    link.click();


    if (buttons) {
      buttons.style.display = "flex";
    }

  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto p-4">

      git
      <div
        ref={portfolioRef}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
      >


        <div
  className="text-white p-8 md:p-12 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(90deg, #0f172a 0%, #312e81 50%, #1e293b 100%)",
  }}
>

          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_40%)]" />


          <div
  id="portfolio-actions"
  className="
    relative
    sm:absolute

    top-0
    sm:top-4

    right-0
    sm:right-4

    z-20

    flex
    flex-row

    justify-end

    gap-2

    w-full
    sm:w-auto

    mb-6
    sm:mb-0
  "
>

            <button
              onClick={downloadPortfolio}
              className="w-[110px]
  sm:w-auto
  bg-white
  text-slate-800
  hover:bg-gray-100
  px-4
  py-2
  rounded-xl
  text-sm
  font-medium
  transition-all
  shadow-sm"
            >
              ⬇ Download
            </button>



            <button
              onClick={onClose}
              className="w-[110px]
  sm:w-auto
  bg-white/20
  hover:bg-white/30
  px-4
  py-2
  rounded-xl
  text-sm
  transition-all"
            >
              ✕ Close
            </button>
          </div>

        <div className="max-w-3xl relative z-10">

            <p className="uppercase tracking-[0.3em] text-indigo-300 text-xs font-semibold mb-4">
              Portfolio
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {personalInfo?.fullName || "Your Name"}
            </h1>

            <p className="mt-4 text-xl md:text-2xl text-indigo-200 font-medium">
              {personalInfo?.jobTitle || "Professional Title"}
            </p>

            {personalInfo?.summary && (
              <p className="mt-8 text-slate-200 leading-8 text-base md:text-lg max-w-2xl">
                {personalInfo.summary}
              </p>
            )}



            <div className="mt-8 flex flex-wrap gap-3">

              {personalInfo?.email && (
                <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm">
                  {personalInfo.email}
                </span>
              )}

              {personalInfo?.github && (
                <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm">
                  GitHub
                </span>
              )}

              {personalInfo?.linkedin && (
                <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm">
                  LinkedIn
                </span>
              )}

            </div>
          </div>
        </div>
<div className="p-8 md:p-10 border-b border-gray-100 bg-gray-50">

          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Skills
          </h2>

          {skills?.length > 0 ? (

            <div className="flex flex-wrap gap-3">

              {skills.map((skill, index) => (
                <span
                  key={skill.id || index}
                  className="bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                >
                  {skill.name}
                </span>
              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No skills added yet.
            </p>

          )}
        </div>




        <div className="p-8 md:p-10 bg-white">

          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">

            <h2 className="text-3xl font-bold text-slate-800">
              Featured Projects
            </h2>

            <div className="h-1 w-24 bg-indigo-600 rounded-full" />

          </div>

          {projects?.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {projects.map((project, index) => (

                <div
                  key={project.id || index}
                  className="group border border-gray-200 rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white"
                >

                  <div className="flex items-start justify-between gap-4">

                    <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                      {project.name || "Untitled Project"}
                    </h3>

                    <div className="w-3 h-3 rounded-full bg-indigo-600 mt-3 shrink-0" />

                  </div>

                  {project.description && (
                    <p className="text-gray-600 leading-7 mb-6">
                      {project.description}
                    </p>
                  )}

                  {project.technologies && (
                    <div className="mb-5 flex flex-wrap gap-2">

                      {project.technologies
                        .split(",")
                        .map((tech, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {tech.trim()}
                          </span>
                        ))}

                    </div>
                  )}

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline break-all"
                    >
                      🔗 View Project
                    </a>
                  )}

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No projects added yet.
            </p>

          )}
        </div>

      </div>
    </div>
  );
};

export default PortfolioPreview;
