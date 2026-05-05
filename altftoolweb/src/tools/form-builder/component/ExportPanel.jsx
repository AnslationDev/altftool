import React from "react";


const ExportPanel = ({ formFields, exportType, setExportType }) => {
    const [copied, setCopied] = React.useState(false);
    
  const generateCode = () => {
    //  Empty state fix
    if (!formFields || formFields.length === 0) {
      return "// Add fields to generate code ";
    }

    if (exportType === "html") {
      return `<form>
${formFields
  .map((f) => {
    if (f.type === "textarea") {
      return `<textarea placeholder="${f.placeholder || ""}"></textarea>`;
    }
    return `<input type="${f.type}" placeholder="${f.placeholder || ""}" />`;
  })
  .join("\n")}
</form>`;
    }

    if (exportType === "jsx") {
      return `export default function MyForm() {
  return (
    <form>
${formFields
  .map((f) => {
    if (f.type === "textarea") {
      return `      <textarea placeholder="${f.placeholder || ""}" />`;
    }
    return `      <input type="${f.type}" placeholder="${f.placeholder || ""}" />`;
  })
  .join("\n")}
      <button type="submit">Submit</button>
    </form>
  );
}`;
    }

    if (exportType === "json") {
      return JSON.stringify(formFields, null, 2);
    }

    return "// Select export type";
  };
const handleCopy = () => {
  const code = generateCode();

  try {
    navigator.clipboard.writeText(code);
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  // 👇 NEW LOGIC
  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000); // 2 sec baad wapas normal
};
 
  return (
    <div className="bg-(--card) border border-(--border) p-4 rounded-md mt-4">
      <div className="flex gap-2 mb-3">
        {/* ✅ FIX: OPTIONS ADD KIYE */}
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
          className="px-3 py-2 border border-(--border) rounded-md bg-(--card) text-(--foreground) appearance-none"
        >
          <option value="html">HTML</option>
          <option value="jsx">React JSX</option>
          <option value="json">JSON Schema</option>
        </select>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-(--primary) text-white rounded-md"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* ✅ FIX: visible + height */}
      <pre className="bg-(--muted) text-(--foreground) p-3 rounded-md text-sm overflow-auto min-h-[120px]">
        {generateCode()}
      </pre>
    </div>
  );
};

export default ExportPanel;
