import React, { useState } from "react";
import yaml from "js-yaml";
import TabBar from "./TabBar";
import InputTab from "./InputTab";
import PreviewTab from "./PreviewTab";
import CodeSnippetTab from "./CodeSnippetTab";
import ErrorGeneratorTab from "./ErrorGeneratorTab";
import VersionComparisonTab from "./VersionComparisonTab";
import VisualFlowTab from "./VisualFlowTab";

export default function SwaggerDocGenerator() {
// ✅ Fix — sessionStorage
const [jsonInput, setJsonInput] = useState(() => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("api-json-input") || "";
  }
  return "";
});

  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [activeTab, setActiveTab] = useState("input");

  // On page load — check if URL has shared swagger spec and auto load it
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get("spec");
      if (shared) {
        // Decode base64 URL param back to JSON string
        const decoded = JSON.parse(atob(decodeURIComponent(shared)));
        setSwaggerSpec(decoded);
        setActiveTab("preview");
      }
    } catch (err) {
      console.error("Failed to load shared spec from URL:", err);
    }
  }, []);

  // Example JSON — Pet Store API used as demo input
  const exampleJSON = {
    title: "Pet Store API",
    version: "1.0.0",
    description: "A sample Pet Store API",
    baseUrl: "https://api.petstore.com/v1",
    endpoints: [
      {
        path: "/pets",
        method: "GET",
        summary: "List all pets",
        description: "Returns a list of all pets in the store",
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of items to return",
            required: false,
            type: "integer",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  tag: { type: "string" },
                },
              },
            },
          },
        },
      },
      {
        path: "/pets",
        method: "POST",
        summary: "Create a pet",
        description: "Creates a new pet in the store",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  tag: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Pet created successfully",
          },
        },
      },
    ],
  };

const handleJsonInput = (value) => {
  setJsonInput(value);
  if (typeof window !== "undefined") {
    sessionStorage.setItem("api-json-input", value);
  }
};

  // Load example JSON into textarea and clear any existing errors
  const loadExample = () => {
    handleJsonInput(JSON.stringify(exampleJSON, null, 2));
    setError("");
  };

  // Parse JSON input and convert it to OpenAPI 3.0 spec format
  const generateSwagger = () => {
    try {
      setError("");
      const input = JSON.parse(jsonInput);

      // Build base OpenAPI 3.0 structure from user input
      const swagger = {
        openapi: "3.0.0",
        info: {
          title: input.title || "API Documentation",
          version: input.version || "1.0.0",
          description: input.description || "",
        },
        servers: [
          {
            url: input.baseUrl || "https://api.example.com",
          },
        ],
        paths: {},
      };

      // Loop through each endpoint and build the paths object
      if (input.endpoints && Array.isArray(input.endpoints)) {
        input.endpoints.forEach((endpoint) => {
          const path = endpoint.path;
          const method = endpoint.method.toLowerCase();

          // Initialize path object if it doesn't exist yet
          if (!swagger.paths[path]) {
            swagger.paths[path] = {};
          }

          const operation = {
            summary: endpoint.summary || "",
            description: endpoint.description || "",
            responses: {},
            "x-status": endpoint.status || "stable",
            "x-version": endpoint.version || "v1",
            "x-latency": endpoint.latency || "fast",
          };

          // Map query/path parameters if provided
          if (endpoint.parameters) {
            operation.parameters = endpoint.parameters.map((param) => ({
              name: param.name,
              in: param.in || "query",
              description: param.description || "",
              required: param.required || false,
              schema: {
                type: param.type || "string",
              },
            }));
          }

          // Attach request body for POST/PUT/PATCH if provided
          if (endpoint.requestBody) {
            operation.requestBody = endpoint.requestBody;
          }

          // Map responses — only add content block when schema exists
          if (endpoint.responses) {
            Object.keys(endpoint.responses).forEach((code) => {
              const res = endpoint.responses[code];
              operation.responses[code] = {
                description: res.description || "Response",
                // Only add content when schema exists
                ...(res.schema && {
                  content: {
                    "application/json": {
                      schema: res.schema,
                    },
                  },
                }),
              };
            });
          }

          swagger.paths[path][method] = operation;
        });
      }

      // Save generated spec and switch to preview tab
      setSwaggerSpec(swagger);
      setActiveTab("preview");
    } catch (err) {
      // Show error message if JSON is invalid
      setError(err.message);
    }
  };

  // Download swagger spec as swagger.json file
  const downloadSwagger = () => {
    if (!swaggerSpec) return;
    const blob = new Blob([JSON.stringify(swaggerSpec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swagger.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert spec to YAML and download as swagger.yaml file
  const downloadYAML = () => {
    if (!swaggerSpec) return;
    const yamlText = yaml.dump(swaggerSpec);
    const blob = new Blob([yamlText], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swagger.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy JSON spec to clipboard — show "Copied!" for 2 seconds
  const copySwagger = async () => {
    if (!swaggerSpec) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(swaggerSpec, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Convert to YAML and copy to clipboard — show "Copied!" for 2 seconds
  const copyYAML = async () => {
    if (!swaggerSpec) return;
    try {
      const yamlText = yaml.dump(swaggerSpec);
      await navigator.clipboard.writeText(yamlText);
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2000);
    } catch (err) {
      console.error("Failed to copy YAML:", err);
    }
  };

  // Generate a shareable URL by encoding swagger spec as base64 in query param
  const [copiedShare, setCopiedShare] = useState(false);

  const generateShareLink = async () => {
    if (!swaggerSpec) return;
    try {
      // Encode swagger spec to base64 and append to current URL
      const encoded = encodeURIComponent(btoa(JSON.stringify(swaggerSpec)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?spec=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error("Failed to generate share link:", err);
    }
  };

  return (
    // Main card — uses CSS variable for background to support dark mode
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 overflow-x-hidden max-w-[100vw]">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl overflow-x-hidden w-full max-w-full">
        {/* Tab navigation — Input / Preview / Code Snippets */}
        <TabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          swaggerSpec={swaggerSpec}
        />

        {/* Tab content area */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Input tab — JSON textarea and generate button */}
          {activeTab === "input" && (
            <InputTab
              jsonInput={jsonInput}
              setJsonInput={handleJsonInput}
              error={error}
              loadExample={loadExample}
              generateSwagger={generateSwagger}
            />
          )}

          {/* Preview tab — Swagger UI render + download/copy buttons */}
          {activeTab === "preview" && swaggerSpec && (
            <PreviewTab
              swaggerSpec={swaggerSpec}
              copied={copied}
              copiedYaml={copiedYaml}
              downloadSwagger={downloadSwagger}
              copySwagger={copySwagger}
              downloadYAML={downloadYAML}
              copyYAML={copyYAML}
              copiedShare={copiedShare}
              generateShareLink={generateShareLink}
            />
          )}
          {/* Code Snippets tab — per-endpoint code in multiple languages */}
          {activeTab === "snippets" && swaggerSpec && (
            <CodeSnippetTab swaggerSpec={swaggerSpec} />
          )}

          {activeTab === "flow" && swaggerSpec && (
            <VisualFlowTab swaggerSpec={swaggerSpec} />
          )}

          {activeTab === "errors" && <ErrorGeneratorTab />}

          {activeTab === "compare" && <VersionComparisonTab />}
        </div>
      </div>

      {/* Footer text — uses muted foreground color for dark mode support */}
      <div className="mt-6 sm:mt-8 text-center text-[var(--muted-foreground)] text-xs sm:text-sm">
        <p>
          Powered by Swagger UI • Paste your API JSON and generate professional
          documentation instantly
        </p>
      </div>
    </div>
  );
}
