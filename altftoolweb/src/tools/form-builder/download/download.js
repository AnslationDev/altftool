export const generateHTML = (formTitle, formDescription, formFields = [],theme) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${formTitle || "Custom Form"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class=" min-h-screen flex items-center justify-center p-6"
style="
    background-color: #f3f4f6;
    font-family: ${theme?.fontFamily || "sans-serif"};
  "
>

  <div class="w-full max-w-2xl">
    
    <form id="customForm" class="bg-white rounded-xl shadow-md p-8 space-y-6">

      ${
        formTitle
          ? `<h1 class="text-3xl font-bold text-gray-900">${formTitle}</h1>`
          : ""
      }

      ${
        formDescription
          ? `<p class="text-gray-600">${formDescription}</p>`
          : ""
      }

      ${
        (formFields || [])
          .map((field) => {
            let fieldHTML = `
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-800">
                ${field.label}
                ${
                  field.required
                    ? `<span class="text-red-500 ml-1">*</span>`
                    : ""
                }
              </label>
            `;

            switch (field.type) {
              case "textarea":
                fieldHTML += `
                  <textarea
                    name="field_${field.id}"
                    placeholder="${field.placeholder || ""}"
                    ${field.required ? "required" : ""}
                    ${field.minLength ? `minlength="${field.minLength}"` : ""}
                    ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                `;
                break;

              case "select":
                fieldHTML += `
                  <select
                    name="field_${field.id}"
                    ${field.required ? "required" : ""}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an option</option>
                    ${(field.options || [])
                      .map((opt) => `<option value="${opt}">${opt}</option>`)
                      .join("")}
                  </select>
                `;
                break;

              case "radio":
                fieldHTML += `
                  <div class="space-y-2">
                    ${(field.options || [])
                      .map(
                        (opt) => `
                        <label class="flex items-center gap-2">
                          <input type="radio" name="field_${field.id}" value="${opt}" ${
                          field.required ? "required" : ""
                        }>
                          <span>${opt}</span>
                        </label>
                      `
                      )
                      .join("")}
                  </div>
                `;
                break;

              case "checkbox":
                fieldHTML += `
                  <div class="space-y-2">
                    ${(field.options || [])
                      .map(
                        (opt, idx) => `
                        <label class="flex items-center gap-2">
                          <input type="checkbox" name="field_${field.id}_${idx}" value="${opt}">
                          <span>${opt}</span>
                        </label>
                      `
                      )
                      .join("")}
                  </div>
                `;
                break;

              case "range":
                fieldHTML += `
                  <input type="range"
                    name="field_${field.id}"
                    min="${field.min || 0}"
                    max="${field.max || 100}"
                    step="${field.step || 1}"
                    class="w-full"
                    oninput="this.nextElementSibling.textContent = this.value">
                  <div class="text-center text-sm font-medium text-gray-700">50</div>
                `;
                break;

              default:
                fieldHTML += `
                  <input
                    type="${field.type}"
                    name="field_${field.id}"
                    placeholder="${field.placeholder || ""}"
                    ${field.required ? "required" : ""}
                    ${field.minLength ? `minlength="${field.minLength}"` : ""}
                    ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                    ${field.pattern ? `pattern="${field.pattern}"` : ""}
                    ${field.min ? `min="${field.min}"` : ""}
                    ${field.max ? `max="${field.max}"` : ""}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                `;
            }

            fieldHTML += `</div>`;
            return fieldHTML;
          })
          .join("")
      }

      <button 
        type="submit"
        class="w-full bg-blue-600 text-white py-3 rounded-md font-semibold"
      >
        Submit Form
      </button>

    </form>
  </div>

  <script>
    document.getElementById('customForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      alert('Form Submitted Successfully!\\n\\n' + JSON.stringify(data, null, 2));
    });
  </script>

</body>
</html>`;
};


export const downloadForm = (formTitle, formDescription, formFields = []) => {
  const html = generateHTML(formTitle, formDescription, formFields);

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${(formTitle || "form").replace(/\s+/g, "_")}.html`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};