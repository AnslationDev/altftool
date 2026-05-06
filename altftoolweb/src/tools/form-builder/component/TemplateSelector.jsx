import React from "react";

const templates = {
  contact: [
    { id: "contact-name", type: "text", label: "Name", placeholder: "Enter your name" },
    { id: "contact-email", type: "email", label: "Email", placeholder: "Enter your email" },
    { id: "contact-message", type: "textarea", label: "Message", placeholder: "Enter your message" },
  ],
  login: [
    { id: "login-email", type: "email", label: "Email", placeholder: "Enter your email" },
    { id: "login-password", type: "password", label: "Password", placeholder: "Enter password" },
  ],
  feedback: [
    { id: "feedback-name", type: "text", label: "Name", placeholder: "Enter your name" },
    { id: "feedback-rating", type: "range", label: "Rating", min: "1", max: "5" },
    { id: "feedback-comments", type: "textarea", label: "Comments", placeholder: "Your feedback" },
  ],
  survey: [
    { id: "survey-name", type: "text", label: "Full Name", placeholder: "Enter name" },
    { id: "survey-age", type: "number", label: "Age", placeholder: "Enter age" },
    { id: "survey-feedback", type: "textarea", label: "Feedback", placeholder: "Your thoughts" },
  ],
  job: [
    { id: "job-name", type: "text", label: "Full Name", placeholder: "Enter name" },
    { id: "job-email", type: "email", label: "Email", placeholder: "Enter email" },
    { id: "job-resume", type: "file", label: "Resume" },
    { id: "job-experience", type: "textarea", label: "Experience", placeholder: "Describe experience" },
  ],
};

const TemplateSelector = ({ setFormFields, setFields }) => {

  const handleSelect = (templateKey) => {
    const selectedTemplate = templates[templateKey].map((field) => ({ ...field }));

    setFormFields(selectedTemplate);

    // also reset live field values
    setFields(
      selectedTemplate.map((f) => ({
        id: f.id,
        value: "",
      }))
    );
  };

  return (
    <div className="bg-(--card) border border-(--border) rounded-md p-3 mt-2">
      <p className="mb-2 font-semibold text-(--foreground)">Templates</p>

      <div className="flex flex-col gap-2">
        <button onClick={() => handleSelect("contact")} className="text-left px-3 py-2 rounded-md hover:bg-(--muted)">
          Contact Form
        </button>

        <button onClick={() => handleSelect("login")} className="text-left px-3 py-2 rounded-md hover:bg-(--muted)">
          Login Form
        </button>

        <button onClick={() => handleSelect("feedback")} className="text-left px-3 py-2 rounded-md hover:bg-(--muted)">
          Feedback Form
        </button>

        <button onClick={() => handleSelect("survey")} className="text-left px-3 py-2 rounded-md hover:bg-(--muted)">
          Survey Form
        </button>

        <button onClick={() => handleSelect("job")} className="text-left px-3 py-2 rounded-md hover:bg-(--muted)">
          Job Application
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;
