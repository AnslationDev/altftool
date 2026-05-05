import React from "react";

const Description = () => {
  const steps = [
    {
      title: "Enter Your Basic Details",
      description:
        "Start by filling in your personal information including name, contact details, job title, and professional summary.",
    },
    {
      title: "Add Education & Experience",
      description:
        "Include your academic background, work experience, internships, and key achievements to showcase your qualifications.",
    },
    {
      title: "Highlight Skills",
      description:
        "Add technical skills, soft skills, certifications, and tools you are proficient in to strengthen your resume.",
    },
    {
      title: "Choose a Resume Template",
      description:
        "Select from professionally designed resume templates that match your industry and career goals.",
    },
    {
      title: "Preview in Real-Time",
      description:
        "See live updates as you edit your information and make instant changes before finalizing your resume.",
    },
    {
      title: "Download & Apply",
      description:
        "Download your resume in PDF format and start applying to jobs confidently with a professional layout.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-40]">
            How It Works ?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create a professional resume in just a few simple steps
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 transition-all hover:text-blue-600">
                {step.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;