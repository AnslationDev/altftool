const seo = {
  title: "RabbitMQ AMQP URI Builder: amqps & %2F Vhost",
  metaDescription:
    "Build amqp:// or amqps:// URIs with percent-encoded credentials and vhost (%2F), scheme-default ports 5672/5671, plus heartbeat and connection_timeout.",
  steps: [
    "Pick the Scheme — amqp, plain TCP on default port 5672, or amqps, TLS on 5671 — then enter host, username, password and the virtual host (the default \"/\" encodes as %2F).",
    "Add optional heartbeat (seconds), connection timeout (ms) and channel max query parameters, or tick 'Omit the port when it is the scheme default'.",
    "Read the assembled connection URI with its vhost segment and query string shown separately, then click Copy URI.",
  ],
  intro:
    "This tool assembles a RabbitMQ connection URI of the form amqp[s]://username:password@host:port/vhost?heartbeat=... following the official RabbitMQ URI specification, which profiles RFC 3986. It is for developers wiring services, workers or CI pipelines to a RabbitMQ broker who need credentials and the vhost percent-encoded correctly, with heartbeat, connection_timeout and channel_max query parameters attached.",
  useCases: [
    "Build a CLOUDAMQP_URL or RABBITMQ_URL environment variable for a worker service, with the vhost and a password containing special characters encoded correctly.",
    "Switch a connection string from amqp on port 5672 to amqps on port 5671 when enabling TLS on the broker.",
    "Add heartbeat=30 and connection_timeout=10000 to a URI to survive aggressive load balancer idle timeouts without editing client code.",
  ],
  benefits: [
    ["Spec-correct encoding", "Userinfo and vhost are percent-encoded per the RabbitMQ URI spec, so the default vhost \"/\" becomes %2F."],
    ["TLS-aware defaults", "Picks 5672 for amqp and 5671 for amqps automatically, matching the IANA-assigned AMQP ports."],
    ["Tuning parameters built in", "Adds heartbeat, connection_timeout and channel_max as query parameters recognised by the major client libraries."],
  ],
  faqs: [
    [
      "Why is the RabbitMQ vhost written as %2F in the URI?",
      "Because the default RabbitMQ virtual host is literally named \"/\", and a raw slash in a URI path would read as a segment separator. The RabbitMQ URI spec requires every character outside the RFC 3986 unreserved set to be percent-encoded in the vhost segment, so \"/\" becomes %2F, as in amqp://localhost:5672/%2F.",
    ],
    [
      "What is the default port for amqp and amqps?",
      "amqp uses port 5672 and amqps (AMQP over TLS) uses port 5671; both are IANA-assigned. If a URI omits the port, RabbitMQ client libraries fall back to the default for the scheme, not to a shared default.",
    ],
    [
      "What does the heartbeat query parameter do in an AMQP URI?",
      "It requests the heartbeat interval, in seconds, that client and broker negotiate to detect dead TCP connections. RabbitMQ's server default is 60 seconds; lower values such as heartbeat=30 detect failures faster, and heartbeat=0 disables heartbeats entirely, which is discouraged behind load balancers.",
    ],
    [
      "Is connection_timeout in seconds or milliseconds?",
      "Milliseconds. connection_timeout=10000 tells the client library to abandon the initial TCP connection attempt after 10 seconds. This is distinct from heartbeat, which is expressed in seconds and applies after the connection is established.",
    ],
  ],
};

export default seo;
