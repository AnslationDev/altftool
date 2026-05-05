import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import LatencyEstimator from "./LatencyEstimator";
import HealthChecker from "./HealthChecker";
import ExampleResponseGenerator from "./ExampleResponseGenerator";

const METHOD_COLORS = {
  get: "bg-blue-600",
  post: "bg-green-600",
  put: "bg-yellow-600",
  patch: "bg-orange-500",
  delete: "bg-red-600",
};

function TryItOut({ path, method, operation, baseUrl }) {
  const [paramValues, setParamValues] = useState({});
  const [bodyValue, setBodyValue] = useState(
    operation.requestBody
      ? JSON.stringify(
          operation.requestBody?.content?.["application/json"]?.schema
            ?.properties
            ? Object.fromEntries(
                Object.entries(
                  operation.requestBody.content["application/json"].schema
                    .properties,
                ).map(([k, v]) => [k, v.type === "integer" ? 0 : ""]),
              )
            : {},
          null,
          2,
        )
      : "",
  );
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setResponse(null);
    try {
      // Build URL with path + query params
      let url = `${baseUrl}${path}`;
      const queryParams = (operation.parameters || [])
        .filter((p) => p.in === "query" && paramValues[p.name])
        .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
        .join("&");
      if (queryParams) url += `?${queryParams}`;

      // Replace path params like {id}
      (operation.parameters || [])
        .filter((p) => p.in === "path" && paramValues[p.name])
        .forEach((p) => {
          url = url.replace(
            `{${p.name}}`,
            encodeURIComponent(paramValues[p.name]),
          );
        });

      const options = {
        method: method.toUpperCase(),
        headers: { "Content-Type": "application/json" },
      };

      if (bodyValue && ["post", "put", "patch"].includes(method)) {
        options.body = bodyValue;
      }

      const res = await fetch(url, options);
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        ok: res.ok,
        data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      });
    } catch (err) {
      setResponse({ status: "Error", ok: false, data: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-4">
      {/* Parameters */}
      {operation.parameters?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
            Parameters
          </p>
          <div className="space-y-2">
            {operation.parameters.map((p, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
              >
                <label className="text-xs font-mono font-semibold text-[var(--foreground)] sm:w-32 shrink-0">
                  {p.name}
                  {p.required && <span className="text-red-500 ml-1">*</span>}
                  <span className="ml-1 text-[var(--muted-foreground)] font-normal">
                    ({p.in})
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={p.description || p.schema?.type || "string"}
                  value={paramValues[p.name] || ""}
                  onChange={(e) =>
                    setParamValues({ ...paramValues, [p.name]: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] 
                  bg-[var(--background)] text-[var(--foreground)] 
                  focus:outline-none focus:border-[var(--primary)] w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {operation.requestBody && (
        <div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
            Request Body
          </p>
          <textarea
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--border)] 
            bg-[var(--background)] text-[var(--foreground)] 
            focus:outline-none focus:border-[var(--primary)] resize-none"
          />
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={execute}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] 
        text-[var(--primary-foreground)] rounded-lg text-sm font-semibold 
        hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        <Play size={14} />
        {loading ? "Executing..." : "Execute"}
      </button>

      {/* Response */}
      {response && (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2
            ${
              response.ok
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            }`}
          >
            <span>Status: {response.status}</span>
          </div>
          <pre
            className="p-4 text-xs font-mono bg-[var(--muted)] text-[var(--foreground)] 
          overflow-x-auto whitespace-pre-wrap break-words max-w-full"
          >
            {response.data}
          </pre>
        </div>
      )}
    </div>
  );
}

function EndpointAccordion({ path, method, operation, baseUrl }) {
  const [open, setOpen] = useState(false);
  const [tryItOpen, setTryItOpen] = useState(false);
  const color = METHOD_COLORS[method] || "bg-gray-600";

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden mb-3 w-full">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 
        bg-[var(--muted)] hover:bg-[var(--card)] transition-colors text-left"
      >
        <span
          className={`${color} text-white text-xs font-bold px-2 py-1 rounded uppercase shrink-0`}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-[var(--foreground)] flex-1 truncate">
          {path}
        </span>
        <span className="text-xs text-[var(--muted-foreground)] truncate hidden sm:block flex-1">
          {operation.summary}
        </span>
        {open ? (
          <ChevronUp
            size={16}
            className="shrink-0 text-[var(--muted-foreground)]"
          />
        ) : (
          <ChevronDown
            size={16}
            className="shrink-0 text-[var(--muted-foreground)]"
          />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 py-4 bg-[var(--background)] space-y-4 w-full">
          {operation.summary && (
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {operation.summary}
            </p>
          )}
          {operation.description && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {operation.description}
            </p>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {operation["x-status"] && (
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 
              text-green-700 dark:text-green-300 font-medium"
              >
                {operation["x-status"]}
              </span>
            )}
            {operation["x-version"] && (
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 
              text-blue-700 dark:text-blue-300 font-medium"
              >
                {operation["x-version"]}
              </span>
            )}
            {operation["x-latency"] && (
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 
              text-purple-700 dark:text-purple-300 font-medium"
              >
                {operation["x-latency"]}
              </span>
            )}
          </div>

          {/* Parameters info */}
          {operation.parameters?.length > 0 && !tryItOpen && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
                Parameters
              </p>
              <div className="space-y-2">
                {operation.parameters.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap gap-2 items-center text-sm"
                  >
                    <span className="font-mono font-semibold text-[var(--foreground)]">
                      {p.name}
                    </span>
                    <span className="text-xs bg-[var(--muted)] px-2 py-0.5 rounded text-[var(--muted-foreground)]">
                      {p.in}
                    </span>
                    <span className="text-xs bg-[var(--muted)] px-2 py-0.5 rounded text-[var(--muted-foreground)]">
                      {p.schema?.type || p.type}
                    </span>
                    {p.required && (
                      <span className="text-xs text-red-500 font-medium">
                        required
                      </span>
                    )}
                    {p.description && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        — {p.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses info */}
          {operation.responses && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
                Responses
              </p>
              <div className="space-y-2">
                {Object.entries(operation.responses).map(([code, res]) => (
                  <div
                    key={code}
                    className="flex flex-wrap gap-2 items-start text-sm"
                  >
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded 
                      ${
                        code.startsWith("2")
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {code}
                    </span>
                    <span className="text-[var(--muted-foreground)] text-xs">
                      {res.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ExampleResponseGenerator operation={operation} />
          <LatencyEstimator method={method} />
          <HealthChecker baseUrl={baseUrl} />
          
          {/* Try it out toggle */}
          <button
            onClick={() => setTryItOpen(!tryItOpen)}
            className="px-4 py-1.5 text-sm border border-[var(--primary)] 
            text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] 
            hover:text-[var(--primary-foreground)] transition-colors font-medium cursor-pointer"
          >
            {tryItOpen ? "Close" : "Try it out"}
          </button>

          {/* Try it out panel */}
          {tryItOpen && (
            <TryItOut
              path={path}
              method={method}
              operation={operation}
              baseUrl={baseUrl}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function PreviewTab({
  swaggerSpec,
  copied,
  copiedYaml,
  downloadSwagger,
  copySwagger,
  downloadYAML,
  copyYAML,
  copiedShare,
  generateShareLink,
}) {
  const baseUrl = swaggerSpec?.servers?.[0]?.url || "";

  return (
    <div className="w-full">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={downloadSwagger}
          className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm cursor-pointer bg-green-800 
          hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 shadow-md"
        >
          <Download size={16} /> Download JSON
        </button>
        <button
          onClick={copySwagger}
          className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm cursor-pointer bg-purple-800
          hover:bg-purple-600 text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 shadow-md"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          onClick={downloadYAML}
          className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm cursor-pointer bg-yellow-800 
          hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 shadow-md"
        >
          <Download size={16} /> Download YAML
        </button>
        <button
          onClick={copyYAML}
          className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm cursor-pointer bg-teal-800
          hover:bg-teal-600 text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 shadow-md"
        >
          {copiedYaml ? <Check size={16} /> : <Copy size={16} />}
          {copiedYaml ? "Copied!" : "Copy YAML"}
        </button>
        <button
          onClick={generateShareLink}
          className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm cursor-pointer bg-blue-800
          hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 shadow-md"
        >
          {copiedShare ? <Check size={16} /> : <Share2 size={16} />}
          {copiedShare ? "Link Copied!" : "Share Link"}
        </button>
      </div>

      {/* API Info */}
      {swaggerSpec && (
        <div className="mb-6 p-4 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {swaggerSpec.info?.title}
          </h2>
          <div className="flex flex-wrap gap-2 mt-1 mb-2">
            <span
              className="text-xs bg-[var(--card)] border border-[var(--border)] 
            px-2 py-0.5 rounded text-[var(--muted-foreground)]"
            >
              v{swaggerSpec.info?.version}
            </span>
            <span
              className="text-xs bg-[var(--card)] border border-[var(--border)] 
            px-2 py-0.5 rounded text-[var(--muted-foreground)]"
            >
              OAS 3.0
            </span>
          </div>
          {swaggerSpec.info?.description && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {swaggerSpec.info.description}
            </p>
          )}
          {swaggerSpec.servers?.[0]?.url && (
            <p className="text-xs font-mono mt-2 text-[var(--primary)]">
              {swaggerSpec.servers[0].url}
            </p>
          )}
        </div>
      )}

      {/* Endpoints Accordion */}
      <div className="w-full">
        {swaggerSpec &&
          Object.entries(swaggerSpec.paths || {}).map(([path, methods]) =>
            Object.entries(methods).map(([method, operation]) => (
              <EndpointAccordion
                key={`${method}-${path}`}
                path={path}
                method={method}
                operation={operation}
                baseUrl={baseUrl}
              />
            )),
          )}
      </div>
    </div>
  );
}
