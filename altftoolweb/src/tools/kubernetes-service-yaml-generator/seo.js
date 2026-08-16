const seo = {
  title: "Kubernetes Service YAML Generator with Validation",
  metaDescription:
    "Generate ClusterIP, NodePort or LoadBalancer manifests with RFC 1035 name checks, 30000-32767 nodePort limits and required multi-port names.",
  steps: [
    "Type the Service name and Namespace, pick ClusterIP, NodePort or LoadBalancer as the Service type, and list the Pod selector as key=value per line.",
    "Fill each port's Service port (1-65535), targetPort and protocol, adding rows with Add port — a second port makes Port name required — and keep any nodePort inside 30000-32767 or leave it blank for auto.",
    "Check the Generated manifest pane, fix any inline validation error, then click Copy YAML for the apply-ready Service manifest.",
  ],
  intro:
    "This generator produces a valid Kubernetes core/v1 Service manifest — ClusterIP, NodePort or LoadBalancer — with the same validation the API server applies: RFC 1035 names (lowercase, max 63 characters, starting with a letter), ports 1-65535, nodePorts inside the default 30000-32767 range, and mandatory port names on multi-port services. It is for developers and SREs who want copy-paste-ready YAML without a round-trip of kubectl apply errors.",
  useCases: [
    "Exposing a Deployment inside the cluster with a ClusterIP Service whose selector exactly matches the pod template labels",
    "Creating a NodePort Service for a bare-metal cluster and checking the chosen port is inside 30000-32767 before applying",
    "Generating a headless Service (clusterIP: None) for a StatefulSet so each replica gets its own DNS record",
  ],
  benefits: [
    ["API-server-grade validation", "Name, namespace, selector, port and nodePort rules are enforced exactly as k8s.io/apimachinery does."],
    ["Multi-port aware", "Requires a name on every port once you add a second one — the rule people most often hit at apply time."],
    ["Sensible YAML", "Omits targetPort when it equals port and quotes selector values, producing clean diff-friendly manifests."],
  ],
  faqs: [
    [
      "What is the difference between ClusterIP, NodePort and LoadBalancer services?",
      "ClusterIP (the default) gives the Service a virtual IP reachable only inside the cluster; NodePort additionally opens the same port — from the 30000-32767 range by default — on every node's IP; LoadBalancer builds on NodePort and asks the cloud provider to provision an external load balancer. Most external traffic in production actually enters through an Ingress or Gateway backed by one LoadBalancer Service.",
    ],
    [
      "What is the valid NodePort range in Kubernetes?",
      "30000-32767 by default, set by the kube-apiserver --service-node-port-range flag. If you leave nodePort empty the control plane auto-allocates a free port from that range; requesting one outside it is rejected at admission.",
    ],
    [
      "What is the difference between port and targetPort in a Service?",
      "port is what the Service itself listens on (clients connect to service-name:port), while targetPort is the container port the traffic is forwarded to; it defaults to the same value as port. targetPort can also be a named port from the pod spec — a string of up to 15 lowercase characters — which lets containers move ports without editing the Service.",
    ],
    [
      "Why is my Kubernetes Service not routing traffic to my pods?",
      "The most common cause is a selector mismatch: the Service spec.selector must be a subset of the pod labels, compared exactly, and a typo like app=web vs app=webapp silently selects nothing. Check kubectl get endpoints <service> — an empty ENDPOINTS column means no pod matched, and comparing kubectl get pods --show-labels against the selector usually reveals the difference.",
    ],
  ],
};

export default seo;
