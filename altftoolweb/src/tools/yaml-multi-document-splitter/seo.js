const seo = {
  intro:
    "A YAML multi document splitter breaks a single YAML stream into its individual documents at the `---` markers defined by the YAML 1.2 specification, then validates and names each one. It is built for anyone holding a bundled Kubernetes manifest, a Docker Compose override set or a CI pipeline file that has grown into one long stream. Separators that appear inside a block scalar (`|` or `>`) are treated as literal text, so a document is never cut in the wrong place.",
  useCases: [
    "Break a single kubectl-applied manifest into one file per Service, Deployment and ConfigMap before committing them to a Git repository",
    "Find which document in a long CI or Ansible YAML stream has the syntax error, with the failing line reported per document",
    "Recombine reviewed, individually edited YAML files back into one stream for a single `kubectl apply -f -`",
  ],
  benefits: [
    ["Block-scalar safe", "A `---` inside a `|` or `>` literal block stays part of the text instead of splitting the file."],
    ["Per-document validation", "Each document is parsed on its own so one bad document does not hide the others."],
    ["Names from the manifest", "Kubernetes documents are named `<kind>-<metadata.name>`, so files land with meaningful names."],
  ],
  faqs: [
    [
      "How do you split a YAML file with multiple documents?",
      "Cut the file at every line that is exactly `---` at column 0, and close a document at any line that is exactly `...`. Those two markers are the document start and end indicators in the YAML 1.2 specification; every other `---` — including one inside a quoted string or a block scalar — is ordinary content.",
    ],
    [
      "What does `---` mean in a Kubernetes YAML file?",
      "It marks the start of a new document, letting one file hold several independent objects such as a Deployment, a Service and a ConfigMap. `kubectl apply -f file.yaml` reads the whole stream and creates each document as a separate resource.",
    ],
    [
      "Do YAML anchors work across documents?",
      "No. An anchor such as `&defaults` and its alias `*defaults` are only valid inside the document that defines them, so a stream that relies on an anchor from an earlier document will fail once the documents are split. Repeat the anchored block in each file, or keep those documents together.",
    ],
    [
      "What is the difference between `---` and `...` in YAML?",
      "`---` starts a document, while `...` ends the current document without starting another. `...` is optional and mainly useful in streams sent over a socket or appended to over time, where a reader needs to know the document is complete before more bytes arrive.",
    ],
  ],
};

export default seo;
