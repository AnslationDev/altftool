export const generateAIForm = (aiprompt, theme) => {
  const text = (aiprompt || "").toLowerCase().trim();

  let fields = [];

  if (
    text.includes("job") ||
    text.includes("application") ||
    text.includes("career")
  ) {
    fields = [
      { type: "text", label: "Full Name" },
      { type: "email", label: "Email" },
      { type: "file", label: "Resume Upload" },
      { type: "textarea", label: "Experience" },
    ];
  } else if (text.includes("contact")) {
    fields = [
      { type: "text", label: "Name" },
      { type: "email", label: "Email" },
      { type: "tel", label: "Phone Number" },
      { type: "textarea", label: "Message" },
    ];
  } else if (
    text.includes("registration") ||
    text.includes("signup") ||
    text.includes("sign up")
  ) {
    fields = [
      { type: "text", label: "Full Name" },
      { type: "email", label: "Email" },
      { type: "password", label: "Password" },
      { type: "password", label: "Confirm Password" },
    ];
  } else if (
    text.includes("login") ||
    text.includes("sign in")
  ) {
    fields = [
      { type: "email", label: "Email" },
      { type: "password", label: "Password" },
    ];
  } else if (text.includes("feedback")) {
    fields = [
      { type: "text", label: "Name" },
      { type: "email", label: "Email" },
      { type: "textarea", label: "Feedback" },
    ];
  } else if (text.includes("survey")) {
    fields = [
      { type: "text", label: "Full Name" },
      { type: "email", label: "Email" },
      {
        type: "radio",
        label: "How satisfied are you?",
        options: [
          "Very Satisfied",
          "Satisfied",
          "Neutral",
          "Unsatisfied",
        ],
      },
      { type: "textarea", label: "Additional Comments" },
    ];
  } else {
    // fallback so feature never breaks
    fields = [
      { type: "text", label: "Name" },
      { type: "email", label: "Email" },
      { type: "textarea", label: "Message" },
    ];
  }

  const mapped = fields.map((f) => ({
    id: Date.now() + Math.random(),
    type: f.type,
    label: f.label,
    placeholder:
      f.type === "textarea"
        ? `Enter ${f.label}`
        : `Enter ${f.label}`,
    required: false,
    options:
      f.options ||
      (f.type === "radio"
        ? ["Option 1", "Option 2", "Option 3"]
        : f.type === "select" || f.type === "checkbox"
        ? ["Option 1", "Option 2", "Option 3"]
        : []),
    minLength: "",
    maxLength: "",
    pattern: "",
    min: "",
    max: "",
    step: "",
    theme,
  }));

  // Registration/signup forms include both a Password and a Confirm
  // Password field — link them the same way "Add Confirm Email" links an
  // email pair (see SmartSuggestions.jsx / main.jsx's isConfirmEmail
  // check), so the two passwords are actually validated to match.
  const passwordField = mapped.find(
    (f) => f.type === "password" && f.label === "Password",
  );
  const confirmPasswordField = mapped.find(
    (f) => f.type === "password" && f.label === "Confirm Password",
  );
  if (passwordField && confirmPasswordField) {
    confirmPasswordField.isConfirmPassword = true;
    confirmPasswordField.linkedFieldId = passwordField.id;
  }

  return mapped;
};