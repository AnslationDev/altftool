import React from "react";

function Step({ icon, title, description, stepNumber }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-md bg-(--card) hover:shadow-lg transition-shadow duration-300">
      {/* Step Number */}
      <div className="mb-4 text-xl font-bold text-(--primary) bg-(--primary-light) rounded-full w-12 h-12 flex items-center justify-center border-2 border-(--primary-border)">
        {stepNumber}
      </div>

      {/* Icon */}
      <div className="w-14 h-14 mb-4 text-(--primary)">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-(--text) mb-2">{title}</h3>

      {/* Description */}
      <p className="text-(--muted-foreground)">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <h2 className="text-3xl font-extrabold text-(--foreground) text-center mb-10">
        How Our Image Reducer Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* STEP 1 */}
        <Step
          stepNumber={1}
          title="Upload Your Image"
          description="Drag and drop or select an image file (JPG, PNG, WebP, etc.) from your device."
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          }
        />

        {/* STEP 2 */}
        <Step
          stepNumber={2}
          title="Adjust Settings"
          description="Customize compression quality, max width, and height to meet your needs."
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />

        {/* STEP 3 */}
        <Step
          stepNumber={3}
          title="Download & Use"
          description="Click compress and download the optimized image with reduced file size."
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          }
        />
      </div>
    </section>
  );
}
