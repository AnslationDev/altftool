import React from "react";

const TemplateSelector = ({ setFormFields, setFields }) => {

  const templates = {
    contact: [
      { id: Date.now() + 1, type: "text", label: "Name", placeholder: "Enter your name" },
      { id: Date.now() + 2, type: "email", label: "Email", placeholder: "Enter your email" },
      { id: Date.now() + 3, type: "textarea", label: "Message", placeholder: "Enter your message" },
    ],

    login: [
      { id: Date.now() + 4, type: "email", label: "Email", placeholder: "Enter your email" },
      { id: Date.now() + 5, type: "password", label: "Password", placeholder: "Enter password" },
    ],

    feedback: [
      { id: Date.now() + 6, type: "text", label: "Name", placeholder: "Enter your name" },
      { id: Date.now() + 7, type: "range", label: "Rating", min: "1", max: "5" },
      { id: Date.now() + 8, type: "textarea", label: "Comments", placeholder: "Your feedback" },
    ],

    survey: [
      { id: Date.now() + 9, type: "text", label: "Full Name", placeholder: "Enter name" },
      { id: Date.now() + 10, type: "number", label: "Age", placeholder: "Enter age" },
      { id: Date.now() + 11, type: "textarea", label: "Feedback", placeholder: "Your thoughts" },
    ],

    job: [
      { id: Date.now() + 12, type: "text", label: "Full Name", placeholder: "Enter name" },
      { id: Date.now() + 13, type: "email", label: "Email", placeholder: "Enter email" },
      { id: Date.now() + 14, type: "file", label: "Resume" },
      { id: Date.now() + 15, type: "textarea", label: "Experience", placeholder: "Describe experience" },
    ],
  };

  const handleSelect = (templateKey) => {
    const selectedTemplate = templates[templateKey];

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