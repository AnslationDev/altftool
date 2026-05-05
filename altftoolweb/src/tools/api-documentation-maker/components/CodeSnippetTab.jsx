import { useState } from "react";
import { Copy, Check, Search, X, Plus, Trash2 } from "lucide-react";

const LANGUAGES = ["JavaScript", "Python", "PHP", "Go", "cURL"];

function generateSnippet(lang, method, url, hasBody, customHeaders = {}) {
  const allHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN",
    ...customHeaders,
  };

  const jsHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `    "${k}": "${v}"`)
    .join(",\n");
  const curlHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(" \\\n");
  const pyHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `    "${k}": "${v}"`)
    .join(",\n");
  const phpHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `    "${k}: ${v}"`)
    .join(",\n");
  const goHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `    req.Header.Set("${k}", "${v}")`)
    .join("\n");

  switch (lang) {
    case "JavaScript":
      return `fetch("${url}", {
  method: "${method}",
  headers: {
${jsHeaders}
  }${
    hasBody
      ? `,
  body: JSON.stringify({
    "key": "value"
  })`
      : ""
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;

    case "Python":
      return `import requests

url = "${url}"
headers = {
${pyHeaders}
}
${
  hasBody
    ? `payload = {
    "key": "value"
}
response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)`
    : `response = requests.${method.toLowerCase()}(url, headers=headers)`
}
print(response.json())`;

    case "PHP":
      return `<?php
$url = "${url}";
$headers = [
${phpHeaders}
];
${
  hasBody
    ? `$data = json_encode(["key" => "value"]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);`
    : `$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");`
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;

    case "Go":
      return `package main

import (
    "fmt"
    "net/http"
    "io/ioutil"${
      hasBody
        ? `
    "bytes"
    "encoding/json"`
        : ""
    }
)

func main() {
    url := "${url}"
    ${
      hasBody
        ? `payload, _ := json.Marshal(map[string]string{"key": "value"})
    req, _ := http.NewRequest("${method}", url, bytes.NewBuffer(payload))`
        : `req, _ := http.NewRequest("${method}", url, nil)`
    }
${goHeaders}

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;

    case "cURL":
      return `curl -X ${method} "${url}" \\
${curlHeaders}${
        hasBody
          ? ` \\
  -d '{"key": "value"}'`
          : ""
      }`;

    default:
      return "";
  }
}

function EndpointSnippet({ path, method, summary, baseUrl, status, version, latency }) {
  const [activeLang, setActiveLang] = useState("JavaScript");
  const [copied, setCopied] = useState(false);
  const [customHeaders, setCustomHeaders] = useState({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showHeaders, setShowHeaders] = useState(false);

  const url = `${baseUrl}${path}`;
  const hasBody = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());
  const snippet = generateSnippet(activeLang, method.toUpperCase(), url, hasBody, customHeaders);

  const addHeader = () => {
    if (!newKey.trim()) return;
    setCustomHeaders({ ...customHeaders, [newKey.trim()]: newValue.trim() });
    setNewKey("");
    setNewValue("");
  };

  const removeHeader = (key) => {
    const updated = { ...customHeaders };
    delete updated[key];
    setCustomHeaders(updated);
  };

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methodColors = {
    GET:    "bg-green-100 text-green-700",
    POST:   "bg-blue-100 text-blue-700",
    PUT:    "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH:  "bg-purple-100 text-purple-700",
  };

  const statusConfig = {
    stable:     { label: "Stable",     dot: "🟢", className: "bg-green-100 text-green-700 border border-green-200" },
    beta:       { label: "Beta",       dot: "🟡", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    deprecated: { label: "Deprecated", dot: "🔴", className: "bg-red-100 text-red-700 border border-red-200" },
  };

  const latencyConfig = {
    fast:   { label: "Fast",   icon: "⚡", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    medium: { label: "Medium", icon: "🕐", className: "bg-orange-100 text-orange-700 border border-orange-200" },
    slow:   { label: "Slow",   icon: "🐢", className: "bg-red-100 text-red-700 border border-red-200" },
  };

  return (
    <div className="border border-gray-200 rounded-xl mb-6 overflow-hidden shadow-sm">

      {/* Endpoint header */}
      <div className="bg-[var(--muted)] px-4 py-3 flex items-center gap-3 border-b border-[var(--border)] flex-wrap">
        <span className={`text-xs font-bold px-2 py-1 rounded ${methodColors[method.toUpperCase()] || "bg-gray-100 text-gray-700"}`}>
          {method.toUpperCase()}
        </span>
        <span className="font-mono text-[var(--foreground)] font-semibold">{path}</span>
        {summary && (
          <span className="text-[var(--muted-foreground)] text-sm">— {summary}</span>
        )}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {(() => {
            const s = statusConfig[status] || statusConfig["stable"];
            return (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.className}`}>
                {s.dot} {s.label}
              </span>
            );
          })()}
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            📌 {version || "v1"}
          </span>
          {(() => {
            const l = latencyConfig[latency] || latencyConfig["fast"];
            return (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${l.className}`}>
                {l.icon} {l.label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Language selector tabs */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeLang === lang
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Custom Headers section */}
      <div className="border-b border-[var(--border)] bg-[var(--muted)] px-4 py-2">
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="text-xs font-semibold text-[var(--primary)] hover:opacity-80 cursor-pointer"
        >
          {showHeaders ? "▼" : "▶"} Custom Headers
          {Object.keys(customHeaders).length > 0 && (
            <span className="ml-1 bg-[var(--primary)] text-[var(--primary-foreground)] 
            px-1.5 py-0.5 rounded-full text-xs">
              {Object.keys(customHeaders).length}
            </span>
          )}
        </button>

        {showHeaders && (
          <div className="mt-2 space-y-2">

            {/* Existing custom headers */}
            {Object.entries(customHeaders).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[var(--foreground)] w-32 shrink-0 truncate">{k}</span>
                <span className="text-[var(--muted-foreground)] flex-1 truncate">{v}</span>
                <button
                  onClick={() => removeHeader(k)}
                  className="text-red-500 hover:text-red-600 cursor-pointer shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* Add new header */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                type="text"
                placeholder="Key (e.g. X-Api-Key)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border)]
                bg-[var(--background)] text-[var(--foreground)] 
                focus:outline-none focus:border-[var(--primary)]"
              />
              <input
                type="text"
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border)]
                bg-[var(--background)] text-[var(--foreground)] 
                focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={addHeader}
                className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)]
                rounded text-xs font-medium hover:opacity-90 cursor-pointer shrink-0 mx-auto"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code block */}
      <div className="relative bg-gray-900">
        <button
          onClick={copySnippet}
          className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 
          text-white rounded-lg transition-colors cursor-pointer"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <pre className="p-4 text-green-300 text-sm overflow-x-auto whitespace-pre-wrap break-words pr-12">
          {snippet}
        </pre>
      </div>

    </div>
  );
}

export default function CodeSnippetTab({ swaggerSpec }) {
  const baseUrl = swaggerSpec?.servers?.[0]?.url || "https://api.example.com";
  const [searchQuery, setSearchQuery] = useState("");

  const allEndpoints = [];
  if (swaggerSpec?.paths) {
    Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        allEndpoints.push({
          path,
          method,
          summary:  operation.summary || "",
          status:   operation["x-status"]  || "stable",
          version:  operation["x-version"] || "v1",
          latency:  operation["x-latency"] || "fast",
        });
      });
    });
  }

  const filteredEndpoints = allEndpoints.filter((ep) => {
    const q = searchQuery.toLowerCase();
    return (
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q) ||
      ep.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Code Snippets</h2>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Ready-to-use code for every endpoint — JavaScript, Python, PHP, Go, cURL
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search endpoints... (e.g. /users, GET, login)"
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 
          text-[var(--muted-foreground)] rounded-xl text-sm 
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
          outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        {filteredEndpoints.length} of {allEndpoints.length} endpoints
        {searchQuery && ` for "${searchQuery}"`}
      </p>

      {/* Empty state */}
      {filteredEndpoints.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No endpoints found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        filteredEndpoints.map((ep, i) => (
          <EndpointSnippet
            key={i}
            path={ep.path}
            method={ep.method}
            summary={ep.summary}
            baseUrl={baseUrl}
            status={ep.status}
            version={ep.version}
            latency={ep.latency}
          />
        ))
      )}
    </div>
  );
}