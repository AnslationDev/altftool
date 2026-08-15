const seo = {
  title: "Port Number Lookup — TCP/UDP Services & IANA Ranges",
  metaDescription:
    "Search TCP and UDP ports by number or service name; every port is classed per RFC 6335 as well-known (0-1023), registered or dynamic.",
  steps: [
    "Type a port number or service name — e.g. 443, postgres, mail — in the 'Port number or service name' field and pick a 'Transport protocol' (Any, TCP or UDP).",
    "For a numeric query, read the RFC 6335 classification — well-known, registered or dynamic — shown above the matching entries.",
    "Scan the results table of port, protocol, service, description and 'IANA-assigned' vs 'Conventional' source, then click 'Copy list' to copy up to the first 25 matches.",
  ],
  intro:
    "This explorer looks up TCP and UDP port numbers by number, service name or keyword, and classifies any port into the IANA ranges defined by RFC 6335 — well-known (0-1023), registered (1024-49151) and dynamic (49152-65535). It is built for developers, sysadmins and network engineers who need to identify what runs on a port, pick a safe port for a new service, or write a firewall rule without guessing.",
  useCases: [
    "Identifying what service a firewall log entry on port 3389 or 5432 most likely belongs to",
    "Choosing a registered-range port for a new internal service that will not clash with common defaults like 8080 or 9090",
    "Writing security-group or iptables rules and confirming whether a service uses TCP, UDP or both",
  ],
  benefits: [
    ["Search both directions", "Type a number to get the service, or a service name to get its port."],
    ["RFC 6335 range classification", "Every numeric lookup states whether the port is well-known, registered or dynamic."],
    ["IANA vs conventional flagged", "Each entry says whether the assignment is official or a widely used product default."],
  ],
  faqs: [
    [
      "What are well-known, registered and dynamic ports?",
      "RFC 6335 splits the 0-65535 port space into three ranges: 0-1023 are system or well-known ports managed by IANA, 1024-49151 are user or registered ports that anyone can register, and 49152-65535 are dynamic or private ports that are never assigned and are used for ephemeral client connections.",
    ],
    [
      "Why do ports below 1024 need root or administrator privileges?",
      "On Unix-like systems, binding a listener to a port from 0 to 1023 traditionally requires root privileges (or the CAP_NET_BIND_SERVICE capability on Linux) because these well-known ports carry trusted services like SSH on 22 and HTTPS on 443, and the restriction stops unprivileged users from impersonating them.",
    ],
    [
      "What is the difference between port 80 and port 443?",
      "Port 80 carries plain unencrypted HTTP, while port 443 carries HTTP over TLS (HTTPS); on UDP, port 443 also carries HTTP/3 over QUIC. Modern browsers default to 443 and most sites redirect port-80 requests straight to it.",
    ],
    [
      "Can two applications use the same port number?",
      "Yes, as long as they differ in transport protocol or IP address — TCP 53 and UDP 53 are separate sockets, and two processes can each bind port 8080 on different interfaces. Two listeners cannot bind the same protocol, address and port at once, which is the familiar 'address already in use' error.",
    ],
  ],
};

export default seo;
