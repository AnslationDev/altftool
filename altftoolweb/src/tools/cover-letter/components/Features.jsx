import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Cover Letter Creation",
      description:
        "Generate a professional cover letter in seconds tailored to your job role and experience.",
    },
    {
      title: "Job-Specific Customization",
      description:
        "Personalize your cover letter based on the position, company name, and key skills required.",
    },
    {
      title: "Professional & ATS-Friendly Format",
      description:
        "Create clean, structured cover letters optimized for Applicant Tracking Systems (ATS).",
    },
    {
      title: "Easy Editing & Copy Option",
      description:
        "Quickly edit, refine, and copy your cover letter to use in job applications or email submissions.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Enter your details effortlessly with a clean, guided form designed for smooth writing experience.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Create and access your cover letter seamlessly on desktop, tablet, or mobile devices.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Cover Letter Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create a professional cover letter for your next job interview in minutes
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
