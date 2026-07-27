const seo = {
  intro:
    "This tool ranks the four major service meshes — Istio, Linkerd, Consul Connect and Cilium Service Mesh — with a transparent weighted-sum model over four criteria: feature breadth, operational simplicity, data-plane resource efficiency, and VM/multi-cluster support. Each mesh carries documented facts (Envoy sidecars vs Rust micro-proxy vs eBPF, mTLS approach, governance) and 1-5 ratings derived from the projects' own documentation, so platform teams can see exactly why one mesh outscores another for their priorities.",
  useCases: [
    "A platform team shortlisting a mesh for mTLS and golden metrics, weighing Linkerd's simplicity against Istio's feature depth",
    "An organisation with services on both VMs and Kubernetes checking why Consul scores highest on heterogeneous support",
    "A cluster already running Cilium as CNI evaluating whether sidecar-less eBPF mesh features make a second mesh unnecessary",
  ],
  benefits: [
    ["Transparent scoring", "A weighted sum over four named criteria, normalised to 100 — every contribution is visible, nothing is a black box."],
    ["Documented facts", "Data-plane architecture, mTLS model and governance for each mesh come from the projects' own documentation."],
    ["Priority sliders", "Move a weight from 0 to 5 and watch the ranking reorder — useful for showing stakeholders the trade-off, not just the verdict."],
  ],
  faqs: [
    [
      "Which service mesh is easiest to operate?",
      "Linkerd is widely regarded as the simplest: one-command install, a purpose-built Rust micro-proxy instead of Envoy, mTLS on by default and a deliberately small feature set. Istio is the most capable but historically the heaviest to operate — its sidecar-less ambient mode exists precisely to reduce that burden.",
    ],
    [
      "What is the difference between a sidecar mesh and Cilium's eBPF approach?",
      "Sidecar meshes (Istio, Linkerd, Consul) inject a proxy container into every pod, so each connection traverses two extra proxies; Cilium moves L3/L4 handling into eBPF programs in the kernel and uses a per-node Envoy only for L7 rules. That removes per-pod proxy memory and injection entirely, at the cost of requiring Cilium as your CNI and a reasonably modern kernel.",
    ],
    [
      "Do I need a service mesh at all?",
      "Not necessarily — a mesh pays off when you need mTLS between many services, uniform retries/timeouts, traffic shifting and per-service golden metrics without changing application code. If you have a handful of services, NetworkPolicies, an ingress controller and library-level TLS may cover you with far less operational cost.",
    ],
    [
      "Which service mesh works best with virtual machines?",
      "Consul is the strongest fit: it began as a VM-first service discovery tool, treats VMs and bare metal as first-class citizens and federates across datacentres. Istio also documents VM integration into the mesh, while Linkerd and Cilium Service Mesh are Kubernetes-centric.",
    ],
  ],
};

export default seo;
