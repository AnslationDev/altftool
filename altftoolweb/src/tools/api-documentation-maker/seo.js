const seo = {
  title: "API Docs Generator — Free OpenAPI & Postman",
  h1: "API Documentation Generator",
  metaDescription:
    "Turn endpoint JSON, an OpenAPI/Swagger file, or a Postman collection into interactive API docs — export JSON, YAML, Markdown, HTML or PDF. Free.",
  intro:
    "The API Documentation Maker converts a plain JSON description of your endpoints into a valid OpenAPI 3.0.0 specification in the browser, then renders it as an interactive endpoint explorer with parameters, responses, and generated example payloads. You can also drop in an existing OpenAPI or Swagger file — JSON or YAML, parsed with js-yaml — or a Postman Collection v2 export, which is flattened into the same endpoint schema before conversion. Every export is built locally too: swagger.json and swagger.yaml, a Markdown reference with parameter tables, a self-contained styled HTML page, and an A4 PDF rendered with jsPDF.",
  useCases: [
    "Turning a Postman collection that is the only record of an internal REST API into a shareable, readable reference",
    "Producing a swagger.json or swagger.yaml file from a hand-written endpoint list, for import into other API tooling",
    "Handing a client or teammate a Markdown, HTML, or PDF API reference — or a diffed changelog between two versions",
  ],
  benefits: [
    [
      "Three ways in, one spec out",
      "Type endpoint JSON, drop an OpenAPI/Swagger file in JSON or YAML, or import a Postman Collection v2 export — all three normalise to the same OpenAPI 3.0.0 specification.",
    ],
    [
      "Client code for every endpoint",
      "Each endpoint gets a ready-to-run snippet in JavaScript (fetch), Python (requests), PHP (cURL), Go (net/http) and cURL, with any custom headers you add folded into all five.",
    ],
    [
      "Five export formats",
      "Download swagger.json, swagger.yaml, Markdown with a parameter table per endpoint, a standalone HTML page, or an A4 PDF — all generated client-side as direct downloads.",
    ],
    [
      "Runs in your browser, no signup",
      "Parsing, OpenAPI conversion and exports all happen on your device. Your spec is never uploaded to AltFTool, and recent projects stay in your own browser storage.",
    ],
  ],
  faqs: [
    [
      "How do I generate API documentation from JSON?",
      "Paste a JSON object with title, version, description, baseUrl and an endpoints array, then click Generate Swagger Docs. Each endpoint needs a path and method; summary, description, parameters and responses are optional. The tool assembles a valid OpenAPI 3.0.0 spec and opens the interactive preview. Click Load Example first to see the exact shape using a sample Pet Store API.",
    ],
    [
      "How do I convert a Postman collection to OpenAPI?",
      "Use Import from Postman with a Collection v2 or v2.1 export. Nested folders are flattened into a single endpoint list, the host and path are pulled from each request URL, query parameters become OpenAPI query params, and a raw JSON request body is inferred into an object schema (numeric fields typed as integer, everything else as string). The result is an OpenAPI 3.0.0 spec you can download as JSON or YAML.",
    ],
    [
      "What formats can I export API documentation to?",
      "Five: swagger.json, swagger.yaml (converted with js-yaml), Markdown with a parameter table per endpoint, a standalone HTML page that carries its own CSS, and an A4 PDF built with jsPDF. All five are generated in the browser and download straight to your device.",
    ],
    [
      "Can I get code samples for each endpoint?",
      "Yes — the Code Snippets tab produces a request example per endpoint in JavaScript (fetch), Python (requests), PHP (cURL), Go (net/http) and cURL. Each snippet includes Content-Type: application/json and an Authorization: Bearer YOUR_TOKEN placeholder, plus any custom headers you add, and POST, PUT and PATCH snippets include a JSON body stub.",
    ],
    [
      "Does the Try it out button send a real request to my API?",
      "Yes. It fires a real fetch from your browser to the base URL in your spec, substituting the query and path parameters and JSON body you fill in, then shows the status code and response. Because it is a browser request, your API must allow CORS from this origin, and only Content-Type: application/json is sent — auth headers are not, so protected endpoints will return 401.",
    ],
    [
      "How do I compare two API versions and generate a changelog?",
      "Open the Version Compare tab and paste two specs — either OpenAPI documents with a paths object or the tool's own endpoints array. It performs a set difference on the METHOD /path pairs and lists added, removed and unchanged endpoints. From there the changelog generator builds a dated Markdown file, with an optional Improved section you write yourself, that you can copy or download as .md.",
    ],
    [
      "How do I share the API docs I generated?",
      "Click Share Link. The whole spec is base64-encoded into a ?spec= query parameter on the page URL and copied to your clipboard, and anyone opening that link lands directly on the Preview tab with the same documentation. Because the entire spec travels in the URL, large APIs produce very long links — for those, the HTML or PDF export is more practical.",
    ],
    [
      "Is the API Documentation Maker free, and is my spec uploaded anywhere?",
      "It is free with no signup, and your spec is never sent to AltFTool. Files you import are read locally, conversion and exports run in your browser, your recent projects (up to 8) are kept in your browser's localStorage, and the input box is held in sessionStorage. The only network requests are ones you trigger yourself — Try it out and the endpoint health check — and those go directly from your browser to your own API.",
    ],
  ],
  steps: [
    "For a manual spec, click New Documentation, paste endpoint JSON in the Input JSON tab, then click Generate Swagger Docs to build the OpenAPI 3.0 spec and open Preview Docs.",
    "For an existing spec, drop an OpenAPI/Swagger JSON or YAML file on the import panel, or use Import from Postman for a collection export. Imports are converted immediately and open Preview Docs automatically — there is no second Generate click.",
    "Download JSON, YAML, Markdown, HTML or PDF — or copy a share link to the rendered docs.",
  ],
};

export default seo;
