import { useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";

const DEFAULT_ERRORS = [
  { code: "400", name: "Bad Request", message: "The request was invalid or malformed." },
  { code: "401", name: "Unauthorized", message: "Invalid or missing authentication token." },
  { code: "404", name: "Not Found", message: "The requested resource was not found." },
  { code: "500", name: "Server Error", message: "An unexpected error occurred on the server." },
];

const CODE_COLORS = {
  "2": "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  "4": "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  "5": "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

function getCodeColor(code) {
  return CODE_COLORS[code?.[0]] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
}

export default function ErrorGeneratorTab() {
  const [errors, setErrors] = useState(DEFAULT_ERRORS);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [formError, setFormError] = useState("");

  const addError = () => {
    if (!newCode.trim() || !newName.trim() || !newMessage.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (!/^\d{3}$/.test(newCode.trim())) {
      setFormError("Status code must be a 3-digit number.");
      return;
    }
    setErrors([...errors, {
      code: newCode.trim(),
      name: newName.trim(),
      message: newMessage.trim(),
    }]);
    setNewCode("");
    setNewName("");
    setNewMessage("");
    setFormError("");
  };

  const removeError = (index) => {
    setErrors(errors.filter((_, i) => i !== index));
  };

  const copyError = async (index) => {
    const err = errors[index];
    const json = JSON.stringify({ error: err.name, message: err.message }, null, 2);
    await navigator.clipboard.writeText(json);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">API Error Generator</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Define your API errors and get ready-to-use JSON examples.
        </p>
      </div>

      {/* Add new error form */}
      <div className="bg-[var(--muted)] rounded-lg border border-[var(--border)] p-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Add New Error</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Code (e.g. 403)"
            value={newCode}
            maxLength={3}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-full sm:w-24 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
            bg-[var(--background)] text-[var(--foreground)]
            focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            placeholder="Name (e.g. Forbidden)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
            bg-[var(--background)] text-[var(--foreground)]
            focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <input
          type="text"
          placeholder="Message (e.g. You don't have permission to access this resource.)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)]
          bg-[var(--background)] text-[var(--foreground)]
          focus:outline-none focus:border-[var(--primary)]"
        />

        {formError && (
          <p className="text-xs text-red-500">{formError}</p>
        )}

        <button
          onClick={addError}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[var(--primary)]
          text-[var(--primary-foreground)] rounded-lg sm:text-sm text-xs font-semibold
          hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus size={16} /> Add Error
        </button>
      </div>

      {/* Error list */}
      <div className="space-y-3">
        {errors.map((err, index) => {
          const json = JSON.stringify({ error: err.name, message: err.message }, null, 2);
          return (
            <div key={index}
              className="border border-[var(--border)] rounded-lg overflow-hidden">

              {/* Error header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--muted)]">
                <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${getCodeColor(err.code)}`}>
                  {err.code}
                </span>
                <span className="font-semibold text-sm text-[var(--foreground)] flex-1">
                  {err.name}
                </span>
                {/* Copy button */}
                <button
                  onClick={() => copyError(index)}
                  className="p-1.5 rounded-lg hover:bg-[var(--card)] 
                  text-[var(--muted-foreground)] transition-colors cursor-pointer"
                  title="Copy JSON"
                >
                  {copiedIndex === index ? <Check size={15} /> : <Copy size={15} />}
                </button>
                {/* Delete button */}
                <button
                  onClick={() => removeError(index)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900
                  text-red-500 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* JSON example */}
              <div className="px-4 py-3 bg-[var(--background)]">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">{err.message}</p>
                <pre className="text-xs font-mono bg-[var(--muted)] p-3 rounded-lg
                text-[var(--foreground)] whitespace-pre-wrap break-words">
                  {json}
                </pre>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}