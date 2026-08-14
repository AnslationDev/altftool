"use client";

import { escapeHtml } from "../utils/escapeHtml";

export const generateHTML = (formTitle, formDescription, formFields = [],theme) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(formTitle) || "Custom Form"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class=" min-h-screen flex items-center justify-center p-6"
style="
    background-color: #f3f4f6;
    font-family: ${escapeHtml(theme?.fontFamily) || "sans-serif"};
  "
>

  <div class="w-full max-w-2xl">

    <form id="customForm" class="bg-white rounded-xl shadow-md p-8 space-y-6">

      ${
        formTitle
          ? `<h1 class="text-3xl font-bold text-gray-900">${escapeHtml(formTitle)}</h1>`
          : ""
      }

      ${
        formDescription
          ? `<p class="text-gray-600">${escapeHtml(formDescription)}</p>`
          : ""
      }

      ${
        (formFields || [])
          .map((field) => {
            // All field text below can come from a decoded share link
            // (see utils/shareForm.js's decodeForm), so it is untrusted
            // and must be HTML-escaped before landing in this template.
            const safeId = escapeHtml(field.id);
            const safeLabel = escapeHtml(field.label);
            const safePlaceholder = escapeHtml(field.placeholder);
            const safePattern = escapeHtml(field.pattern);
            const safeType = escapeHtml(field.type);

            let fieldHTML = `
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-800">
                ${safeLabel}
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
                    name="field_${safeId}"
                    placeholder="${safePlaceholder}"
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
                    name="field_${safeId}"
                    ${field.required ? "required" : ""}
                    class="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an option</option>
                    ${(field.options || [])
                      .map((opt) => {
                        const safeOpt = escapeHtml(opt);
                        return `<option value="${safeOpt}">${safeOpt}</option>`;
                      })
                      .join("")}
                  </select>
                `;
                break;

              case "radio":
                fieldHTML += `
                  <div class="space-y-2">
                    ${(field.options || [])
                      .map((opt) => {
                        const safeOpt = escapeHtml(opt);
                        return `
                        <label class="flex items-center gap-2">
                          <input type="radio" name="field_${safeId}" value="${safeOpt}" ${
                          field.required ? "required" : ""
                        }>
                          <span>${safeOpt}</span>
                        </label>
                      `;
                      })
                      .join("")}
                  </div>
                `;
                break;

              case "checkbox":
                fieldHTML += `
                  <div class="space-y-2">
                    ${(field.options || [])
                      .map((opt, idx) => {
                        const safeOpt = escapeHtml(opt);
                        return `
                        <label class="flex items-center gap-2">
                          <input type="checkbox" name="field_${safeId}_${idx}" value="${safeOpt}">
                          <span>${safeOpt}</span>
                        </label>
                      `;
                      })
                      .join("")}
                  </div>
                `;
                break;

              case "range":
                fieldHTML += `
                  <input type="range"
                    name="field_${safeId}"
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
                    type="${safeType}"
                    name="field_${safeId}"
                    placeholder="${safePlaceholder}"
                    ${field.required ? "required" : ""}
                    ${field.minLength ? `minlength="${field.minLength}"` : ""}
                    ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                    ${field.pattern ? `pattern="${safePattern}"` : ""}
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


export const downloadForm = (formTitle, formDescription, formFields = [], theme) => {
  const html = generateHTML(formTitle, formDescription, formFields, theme);

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