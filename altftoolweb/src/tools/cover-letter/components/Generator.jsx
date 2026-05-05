



"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const jsPDF = dynamic(() => import("jspdf"), { ssr: false });

export default function Generator() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    portfolio: "",
    date: "",
    hiringManager: "Hiring Manager",
    company: "",
    jobTitle: "",
    experience: "",
    previousWork: "",
    skills: "",
    companyReason: "",
  });


  const requiredFields = [
    "name",
    "phone",
    "email",
    "date",
    "company",
    "jobTitle",
    "experience",
    "skills",
  ];

  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    const emptyFields = requiredFields.filter(field => !formData[field].trim());

    if (emptyFields.length > 0) {
      setErrorMessage("Please fill all required details before generating the cover letter.");
      setGenerated(false);
      return;
    }

    setErrorMessage(""); // Clear error if all fields are filled
    setGenerated(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(coverLetter, 10, 10);
    doc.save("CoverLetter.pdf");
  };

  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "CoverLetter.txt";
    document.body.appendChild(element);
    element.click();
  };

  const copyText = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };


  const handleReset = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      portfolio: "",
      date: "",
      hiringManager: "Hiring Manager",
      company: "",
      jobTitle: "",
      experience: "",
      previousWork: "",
      skills: "",
      companyReason: "",
    });
    setGenerated(false);
    setErrorMessage("");

    // Redirect to landing page
    window.location.href = "/"; // yaha landing page ka URL daal do
  };





  const coverLetter = `
${formData.name}
${formData.phone}
${formData.email}
${formData.portfolio && formData.portfolio}

${formData.date}

${formData.hiringManager}
${formData.company}

Subject: Application for ${formData.jobTitle} Position

Dear ${formData.hiringManager},

I am writing to express my interest in the ${formData.jobTitle} position at ${formData.company}. With ${formData.experience} of experience in my field, I am confident in my ability to contribute effectively to your team.

In my previous role, I worked on ${formData.previousWork}. I have hands-on experience with ${formData.skills}, and I enjoy building solutions that are both efficient and user-friendly.

What excites me about ${formData.company} is ${formData.companyReason}. I believe my skills and passion align well with your company’s goals, and I would welcome the opportunity to contribute and grow with your team.

I have attached my resume for your review. I would be grateful for the opportunity to discuss how my experience and skills can benefit ${formData.company}.

Thank you for your time and consideration. I look forward to hearing from you.

Sincerely,
${formData.name}
`;

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 sm:p-6 md:p-8 ">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
        Cover Letter Generator
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side Form */}
        <div className="bg-(--background) text-(--foreground)  p-4 sm:p-6 md:p-8 rounded-lg shadow w-full border border-(--border)">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
            Fill Your Details
          </h2>
          <div className="flex flex-col gap-3 bg-(--background)">
            {[
              ["name", "Your Name"],
              ["phone", "Phone Number"],
              ["email", "Email Address"],
              ["portfolio", "LinkedIn / Portfolio"],
              ["date", "Date"],
              ["hiringManager", "Hiring Manager"],
              ["company", "Company Name"],
              ["jobTitle", "Job Title"],
              ["experience", "Experience (e.g. 1 year / Fresher)"],
              ["previousWork", "Previous Work / Internship"],
              ["skills", "Skills"],
              ["companyReason", "Why this company"],
            ].map(([key, label]) => (
              <input
                key={key}
                name={key}
                placeholder={label}
                value={formData[key]}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 border border-gray-300 bg-(--card) rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-(--foreground) placeholder-gray-400"
              />
            ))}
          </div>
          <button
            onClick={handleGenerate}
            className="mt-4 w-full px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-200"
          >
            Generate Cover Letter
          </button>
          {/* <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow w-full mb-4"> */}
          {errorMessage && (
            <p className="text-red-600 font-medium mb-3">{errorMessage}</p>
          )}

          {/* Form fields go here */}
        </div>
        {/* </div> */}

        {/* Right Side Preview */}
        <div className="bg-(--background) text-(--foreground) p-4 sm:p-6 md:p-8 rounded-lg shadow w-full flex flex-col border border-(--border)">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
            Generated Cover Letter
          </h2>
          {generated ? (
            <>
              <pre className="whitespace-pre-wrap text-sm sm:text-base md:text-base text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-700 p-4 rounded flex-1 overflow-auto max-h-[70vh]">
                {coverLetter}
              </pre>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">

                <button
                  onClick={handleDownloadPDF}
                  className="w-full px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                >
                  Download as PDF
                </button>

                <button
                  onClick={handleDownloadText}
                  className="w-full px-4 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors duration-200"
                >
                  Download as Text
                </button>

                <button
                  onClick={copyText}
                  className={`w-full px-4 py-2 sm:py-3 rounded text-white transition-all duration-200 ${copied ? "bg-green-600" : "bg-indigo-600"
                    }`}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>

                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                >
                  Reset & Go to Landing Page
                </button>

              </div>

            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Your cover letter will appear here after clicking Generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
