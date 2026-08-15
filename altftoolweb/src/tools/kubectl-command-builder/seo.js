const seo = {
  title: "kubectl Command Builder with Flag Conflict",
  metaDescription:
    "Build get, logs, exec, delete and scale commands with -n, -l, -o and --dry-run in the right places — invalid pairs like -A with -n are rejected.",
  steps: [
    "Pick a Verb — get, describe, delete, logs, exec, apply, scale, port-forward or rollout restart — and a Resource type such as pods or deployments where it applies.",
    "Fill the verb-aware fields: Resource name (blank = all), Namespace (-n), Label selector (-l), Output format (-o), --dry-run, or the logs toggles Follow log stream (-f) and Previous container instance (--previous).",
    "Read the Assembled command, shell-quoted with conflicting flags rejected and the reason shown, then press Copy command.",
  ],
  intro:
    "This builder assembles syntactically correct kubectl commands — get, describe, delete, logs, exec, apply, scale, port-forward and rollout restart — with the namespace, label selector, output format and dry-run flags in the right places, shell-quoted where needed. It enforces the same flag rules kubectl does, rejecting -A combined with -n, a resource name combined with -l, and the removed boolean --dry-run form. Handy for engineers who touch clusters occasionally and forget flag order and compatibility.",
  useCases: [
    "Building a safe delete: kubectl delete pods -l app=web --dry-run=client to preview exactly what would be removed",
    "Getting the logs incantation right for a crash-looping pod, combining -c container, -f and --previous",
    "Teaching juniors why kubectl get pods my-pod -A fails — a named resource cannot be fetched across all namespaces",
  ],
  benefits: [
    ["kubectl-grade validation", "Conflicting flags (-A with -n, name with -l, nodes with a namespace) are rejected with the reason, not silently emitted."],
    ["Verb-aware fields", "Only the flags that apply to the chosen verb appear, so you cannot attach -o yaml to exec or a selector to port-forward."],
    ["Shell-safe output", "Arguments with spaces or parentheses, like set-based selectors, are single-quoted automatically."],
  ],
  faqs: [
    [
      "What is the difference between kubectl --dry-run=client and --dry-run=server?",
      "client validates and prints the object locally without contacting the cluster, while server sends the request through the full API path — authentication, admission webhooks, validation — but persists nothing. Server dry-run catches problems client mode cannot, such as admission policy rejections; the bare boolean --dry-run flag was removed in kubectl 1.18.",
    ],
    [
      "Why can't I use -A and -n together in kubectl?",
      "Because they contradict each other: -n scopes the request to one namespace while -A (--all-namespaces) asks for every namespace. kubectl also refuses to fetch a resource by name across all namespaces, since names are only unique within a namespace.",
    ],
    [
      "How do I see logs from a crashed container?",
      "Use kubectl logs <pod> --previous, which reads the log of the last terminated container instance instead of the current one. For pods with multiple containers add -c <container-name>, and -f to stream; without --previous a freshly restarted container shows only the new (usually empty) log.",
    ],
    [
      "How do I get output as YAML or JSON from kubectl?",
      "Add -o yaml or -o json to read verbs like get. -o wide adds extra table columns (node, IP), -o name prints just resource/name for scripting, and -o jsonpath='{...}' extracts specific fields — for example -o jsonpath='{.items[*].metadata.name}' lists only names.",
    ],
  ],
};

export default seo;
