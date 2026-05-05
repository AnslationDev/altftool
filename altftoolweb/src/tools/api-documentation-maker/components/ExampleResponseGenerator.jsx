import { useState } from "react";
import { Copy, Check, Wand2 } from "lucide-react";

function generateValue(key, type) {
  const k = key.toLowerCase();

  // Key-based smart values
  if (k.includes("id"))          return 1;
  if (k.includes("name"))        return "John Doe";
  if (k.includes("email"))       return "john.doe@example.com";
  if (k.includes("phone"))       return "+1-555-000-1234";
  if (k.includes("age"))         return 28;
  if (k.includes("price") || k.includes("amount")) return 99.99;
  if (k.includes("url") || k.includes("link"))     return "https://example.com";
  if (k.includes("image") || k.includes("avatar")) return "https://example.com/image.png";
  if (k.includes("date") || k.includes("at"))      return "2024-01-15T10:30:00Z";
  if (k.includes("token"))       return "eyJhbGciOiJIUzI1NiJ9.example";
  if (k.includes("status"))      return "active";
  if (k.includes("description")) return "This is a sample description.";
  if (k.includes("count") || k.includes("total")) return 42;
  if (k.includes("active") || k.includes("enabled") || k.includes("is")) return true;
  if (k.includes("tags"))        return ["tag1", "tag2"];
  if (k.includes("address"))     return "123 Main St, New York, NY";
  if (k.includes("city"))        return "New York";
  if (k.includes("country"))     return "United States";
  if (k.includes("zip") || k.includes("postal")) return "10001";

  // Type-based fallback
  switch (type) {
    case "integer":
    case "number":  return 1;
    case "boolean": return true;
    case "array":   return [];
    case "object":  return {};
    default:        return "string";
  }
}

function generateFromSchema(schema) {
  if (!schema) return {};

  if (schema.type === "array" && schema.items) {
    return [generateFromSchema(schema.items)];
  }

  if (schema.type === "object" && schema.properties) {
    const result = {};
    Object.entries(schema.properties).forEach(([key, value]) => {
      if (value.type === "object" && value.properties) {
        result[key] = generateFromSchema(value);
      } else if (value.type === "array" && value.items) {
        result[key] = [generateFromSchema(value.items)];
      } else {
        result[key] = generateValue(key, value.type);
      }
    });
    return result;
  }

  return {};
}

export default function ExampleResponseGenerator({ operation }) {
  const [copied, setCopied] = useState(false);

  // Extract schema from responses
  const getSchema = () => {
    const responses = operation?.responses || {};
    const successCode = Object.keys(responses).find((c) => c.startsWith("2"));
    if (!successCode) return null;
    return responses[successCode]?.content?.["application/json"]?.schema || null;
  };

  const schema = getSchema();
  if (!schema) return null;

  const example = generateFromSchema(schema);
  const exampleJson = JSON.stringify(example, null, 2);

  const copy = async () => {
    await navigator.clipboard.writeText(exampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--muted)] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-[var(--primary)]" />
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
            Example Response
          </p>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs
          text-[var(--primary)] hover:opacity-80 cursor-pointer"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs font-mono bg-[var(--background)] p-3 rounded-lg
      border border-[var(--border)] text-[var(--foreground)]
      overflow-x-auto whitespace-pre-wrap break-words">
        {exampleJson}
      </pre>
    </div>
  );
}