const seo = {
  title: "Kubernetes Label Selector Tester - Clause Verdicts",
  metaDescription:
    "Test matchLabels and matchExpressions (In, NotIn, Exists, DoesNotExist) against pod labels with per-clause PASS/FAIL and API-exact semantics.",
  steps: [
    "Paste the pod's labels into \"Pod labels (key=value per line)\" and the selector's \"matchLabels (key=value per line)\".",
    "Click \"Add expression\" for each matchExpressions clause, setting its Key, Operator (In, NotIn, Exists, DoesNotExist) and comma-separated Values.",
    "Read the MATCHES / NO MATCH verdict with a PASS or FAIL reason on every clause, then click \"Copy result\".",
  ],
  intro:
    "This tester evaluates a Kubernetes label selector — matchLabels plus matchExpressions with In, NotIn, Exists and DoesNotExist — against a sample set of pod labels, clause by clause, using the same semantics as k8s.io/apimachinery. It shows exactly which clause fails and why, including the frequently missed rule that NotIn also matches objects that lack the key entirely. Useful for anyone debugging Deployments, Services, NetworkPolicies or affinity rules that silently select nothing.",
  useCases: [
    "Finding out why kubectl get endpoints shows an empty list — testing the Service selector against the pod template labels",
    "Verifying a NetworkPolicy podSelector with NotIn before applying it, since NotIn unexpectedly matches pods missing the label",
    "Checking a nodeAffinity-style matchExpressions block with multiple ANDed clauses against a node's label set",
  ],
  benefits: [
    ["Exact API semantics", "In, NotIn, Exists and DoesNotExist behave precisely as apimachinery evaluates them, including absent-key handling."],
    ["Clause-level verdicts", "Every matchLabels pair and expression gets its own PASS/FAIL with a plain-language reason."],
    ["Validation built in", "Rejects what the API rejects: In/NotIn without values, Exists with values, and malformed label keys over 63 characters."],
  ],
  faqs: [
    [
      "Does NotIn match a pod that doesn't have the label at all?",
      "Yes. The Kubernetes documentation states the NotIn operator also selects resources that do not have the label key, so a pod with no 'env' label matches env NotIn (prod). To require the key while excluding a value, combine NotIn with an Exists expression on the same key.",
    ],
    [
      "What is the difference between matchLabels and matchExpressions?",
      "matchLabels is shorthand for exact key=value equality; matchExpressions adds the operators In, NotIn, Exists and DoesNotExist with a values list. They are not alternatives — the API ANDs every entry from both sections together, and a single matchLabels pair is equivalent to an In expression with one value.",
    ],
    [
      "Why does my Service have no endpoints even though pods are running?",
      "Almost always a selector mismatch: the Service spec.selector must equal a subset of each pod's labels exactly, and it compares against pod labels, not Deployment labels. Test your selector against the pod template's labels (kubectl get pods --show-labels) — a one-character difference selects nothing without any error message.",
    ],
    [
      "What are the rules for valid label keys and values in Kubernetes?",
      "The name segment of a key and any value are limited to 63 characters, must start and end alphanumeric, and may contain '-', '_' and '.' in between; keys can carry an optional DNS-subdomain prefix (like app.kubernetes.io/) of up to 253 characters ending in '/'. Values may also be empty, and In/NotIn expressions must list at least one value while Exists/DoesNotExist must list none.",
    ],
  ],
};

export default seo;
