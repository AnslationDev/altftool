const seo = {
  title: "Docker Network Modes: bridge, host, macvlan Compared",
  metaDescription:
    "Pick bridge, user-defined bridge, host, none, container:<name> or macvlan and see the exact address the host, LAN and other containers use for your app.",
  steps: [
    "Choose a Network mode — Default bridge, User-defined bridge, Host, None, container:<name> (shared namespace) or Macvlan.",
    "Enter the port the app listens on inside the container, then tick \"I pass a publish flag\" and set the published host port (the left side of -p).",
    "Read the From the Docker host, From the LAN, From another container, DNS by container name and \"-p publish flag effective\" rows, then press Copy result.",
  ],
  intro:
    "This tool explains what each Docker network mode — bridge, user-defined bridge, host, none, container:<name> and macvlan — actually does to a container's reachability, DNS and port publishing. Pick a mode and your app's port, and it shows exactly how the container is reached from the host, from the LAN and from other containers, following the semantics documented for the Docker Engine network drivers. It is built for developers debugging 'connection refused' between containers or wondering why -p seems to do nothing.",
  useCases: [
    "Debugging why one container cannot reach another by name — the default bridge has no automatic DNS, only user-defined networks do",
    "Deciding between --network host and a published port for a latency-sensitive service on a Linux server",
    "Checking whether a macvlan container will be reachable from the Docker host itself before building a home-lab setup around it",
  ],
  benefits: [
    ["Reachability, spelled out", "Shows the exact address (localhost:port, host-ip:port or container name) each party uses to reach your app."],
    ["Publish-flag truth", "Flags the modes where -p is ignored (host), rejected (container:) or simply unnecessary (macvlan)."],
    ["Side-by-side table", "All six modes compared on DNS, publishing and host isolation in one glance."],
  ],
  faqs: [
    [
      "What is the difference between the default bridge and a user-defined bridge in Docker?",
      "A user-defined bridge adds automatic DNS: containers on it resolve each other by container name or network alias, while on the default bridge they can only use IP addresses (the old --link flag is legacy). Both use NAT and need -p for outside access, which is why Docker's own docs recommend user-defined networks for anything multi-container.",
    ],
    [
      "Does -p work with --network host?",
      "No. In host networking the container shares the host's network namespace, so the app's listening port is already a host port; Docker prints a warning and ignores any -p flags. This also means only one process — container or host service — can own a given port.",
    ],
    [
      "Why can't my Docker host reach a macvlan container?",
      "By design: the macvlan driver blocks traffic between the host's parent interface and the containers attached to it. LAN devices can reach the container directly on its own IP and MAC, but from the host itself you need a workaround such as adding a macvlan sub-interface on the host and routing through it.",
    ],
    [
      "What does --network container:<name> do?",
      "It puts the new container into an existing container's network namespace, so both share one localhost and one set of interfaces — the same pattern Kubernetes uses for containers in a pod. Ports must be published on the container that owns the namespace; docker run rejects -p combined with --network container:<name>.",
    ],
  ],
};

export default seo;
