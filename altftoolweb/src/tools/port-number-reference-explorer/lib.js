/**
 * Port number reference data and search.
 *
 * Port assignments follow the IANA Service Name and Transport Protocol Port
 * Number Registry. Range boundaries come from RFC 6335 section 6:
 *   0-1023      system (well-known) ports
 *   1024-49151  user (registered) ports
 *   49152-65535 dynamic / private (ephemeral) ports
 *
 * Entries marked source: "iana" carry the IANA-assigned service name.
 * Entries marked source: "conventional" are de-facto defaults widely used by
 * a product but not (or differently) assigned in the registry.
 */

// RFC 6335 section 6 range boundaries.
export const WELL_KNOWN_MAX = 1023;
export const REGISTERED_MAX = 49151;
export const PORT_MAX = 65535;

export const PORTS = [
  { port: 7, protocol: "tcp/udp", service: "echo", description: "Echo protocol (RFC 862)", source: "iana" },
  { port: 20, protocol: "tcp", service: "ftp-data", description: "FTP data transfer channel", source: "iana" },
  { port: 21, protocol: "tcp", service: "ftp", description: "FTP control channel (RFC 959)", source: "iana" },
  { port: 22, protocol: "tcp", service: "ssh", description: "Secure Shell — remote login, SFTP, SCP (RFC 4253)", source: "iana" },
  { port: 23, protocol: "tcp", service: "telnet", description: "Telnet — unencrypted remote login (RFC 854)", source: "iana" },
  { port: 25, protocol: "tcp", service: "smtp", description: "SMTP — server-to-server mail relay (RFC 5321)", source: "iana" },
  { port: 53, protocol: "tcp/udp", service: "domain", description: "DNS queries and zone transfers (RFC 1035)", source: "iana" },
  { port: 67, protocol: "udp", service: "bootps", description: "DHCP / BOOTP server (RFC 2131)", source: "iana" },
  { port: 68, protocol: "udp", service: "bootpc", description: "DHCP / BOOTP client (RFC 2131)", source: "iana" },
  { port: 69, protocol: "udp", service: "tftp", description: "Trivial File Transfer Protocol (RFC 1350)", source: "iana" },
  { port: 80, protocol: "tcp", service: "http", description: "HTTP — unencrypted web traffic (RFC 9110)", source: "iana" },
  { port: 88, protocol: "tcp/udp", service: "kerberos", description: "Kerberos authentication (RFC 4120)", source: "iana" },
  { port: 110, protocol: "tcp", service: "pop3", description: "POP3 mail retrieval (RFC 1939)", source: "iana" },
  { port: 111, protocol: "tcp/udp", service: "sunrpc", description: "ONC RPC portmapper / rpcbind (NFS)", source: "iana" },
  { port: 119, protocol: "tcp", service: "nntp", description: "Network News Transfer Protocol (RFC 3977)", source: "iana" },
  { port: 123, protocol: "udp", service: "ntp", description: "Network Time Protocol (RFC 5905)", source: "iana" },
  { port: 135, protocol: "tcp/udp", service: "epmap", description: "Microsoft RPC endpoint mapper (DCE/RPC)", source: "iana" },
  { port: 137, protocol: "udp", service: "netbios-ns", description: "NetBIOS name service", source: "iana" },
  { port: 138, protocol: "udp", service: "netbios-dgm", description: "NetBIOS datagram service", source: "iana" },
  { port: 139, protocol: "tcp", service: "netbios-ssn", description: "NetBIOS session service (legacy SMB)", source: "iana" },
  { port: 143, protocol: "tcp", service: "imap", description: "IMAP4 mail access (RFC 3501)", source: "iana" },
  { port: 161, protocol: "udp", service: "snmp", description: "SNMP agent queries (RFC 3411)", source: "iana" },
  { port: 162, protocol: "udp", service: "snmptrap", description: "SNMP traps and notifications", source: "iana" },
  { port: 179, protocol: "tcp", service: "bgp", description: "Border Gateway Protocol (RFC 4271)", source: "iana" },
  { port: 194, protocol: "tcp", service: "irc", description: "Internet Relay Chat (RFC 1459)", source: "iana" },
  { port: 389, protocol: "tcp/udp", service: "ldap", description: "LDAP directory access (RFC 4511)", source: "iana" },
  { port: 443, protocol: "tcp/udp", service: "https", description: "HTTP over TLS; UDP carries HTTP/3 QUIC (RFC 9114)", source: "iana" },
  { port: 445, protocol: "tcp", service: "microsoft-ds", description: "SMB over TCP — Windows file sharing", source: "iana" },
  { port: 465, protocol: "tcp", service: "submissions", description: "Mail submission over implicit TLS (RFC 8314)", source: "iana" },
  { port: 500, protocol: "udp", service: "isakmp", description: "IKE key exchange for IPsec VPNs (RFC 7296)", source: "iana" },
  { port: 514, protocol: "udp", service: "syslog", description: "Syslog event messages (RFC 5424 transport)", source: "iana" },
  { port: 515, protocol: "tcp", service: "printer", description: "LPD / LPR line printer daemon", source: "iana" },
  { port: 520, protocol: "udp", service: "router", description: "RIP routing protocol (RFC 2453)", source: "iana" },
  { port: 546, protocol: "udp", service: "dhcpv6-client", description: "DHCPv6 client (RFC 8415)", source: "iana" },
  { port: 547, protocol: "udp", service: "dhcpv6-server", description: "DHCPv6 server (RFC 8415)", source: "iana" },
  { port: 587, protocol: "tcp", service: "submission", description: "Mail submission with STARTTLS (RFC 6409)", source: "iana" },
  { port: 631, protocol: "tcp/udp", service: "ipp", description: "Internet Printing Protocol / CUPS (RFC 8010)", source: "iana" },
  { port: 636, protocol: "tcp", service: "ldaps", description: "LDAP over TLS", source: "iana" },
  { port: 853, protocol: "tcp/udp", service: "domain-s", description: "DNS over TLS (RFC 7858) and DNS over QUIC (RFC 9250)", source: "iana" },
  { port: 873, protocol: "tcp", service: "rsync", description: "rsync file synchronisation daemon", source: "iana" },
  { port: 902, protocol: "tcp", service: "ideafarm-door", description: "VMware ESXi host management (conventional use)", source: "conventional" },
  { port: 989, protocol: "tcp", service: "ftps-data", description: "FTP over TLS — data channel (RFC 4217)", source: "iana" },
  { port: 990, protocol: "tcp", service: "ftps", description: "FTP over implicit TLS — control channel", source: "iana" },
  { port: 993, protocol: "tcp", service: "imaps", description: "IMAP over implicit TLS (RFC 8314)", source: "iana" },
  { port: 995, protocol: "tcp", service: "pop3s", description: "POP3 over implicit TLS (RFC 8314)", source: "iana" },
  { port: 1080, protocol: "tcp", service: "socks", description: "SOCKS proxy protocol (RFC 1928)", source: "iana" },
  { port: 1194, protocol: "tcp/udp", service: "openvpn", description: "OpenVPN tunnel", source: "iana" },
  { port: 1433, protocol: "tcp", service: "ms-sql-s", description: "Microsoft SQL Server", source: "iana" },
  { port: 1434, protocol: "udp", service: "ms-sql-m", description: "Microsoft SQL Server browser / monitor", source: "iana" },
  { port: 1521, protocol: "tcp", service: "ncube-lm", description: "Oracle Database listener (conventional use)", source: "conventional" },
  { port: 1723, protocol: "tcp", service: "pptp", description: "PPTP VPN (legacy, considered insecure)", source: "iana" },
  { port: 1812, protocol: "udp", service: "radius", description: "RADIUS authentication (RFC 2865)", source: "iana" },
  { port: 1813, protocol: "udp", service: "radius-acct", description: "RADIUS accounting (RFC 2866)", source: "iana" },
  { port: 1883, protocol: "tcp", service: "mqtt", description: "MQTT messaging for IoT (OASIS standard)", source: "iana" },
  { port: 2049, protocol: "tcp/udp", service: "nfs", description: "Network File System (RFC 7530)", source: "iana" },
  { port: 2181, protocol: "tcp", service: "zookeeper", description: "Apache ZooKeeper client port (conventional)", source: "conventional" },
  { port: 2375, protocol: "tcp", service: "docker", description: "Docker daemon API — unencrypted", source: "iana" },
  { port: 2376, protocol: "tcp", service: "docker-s", description: "Docker daemon API over TLS", source: "iana" },
  { port: 2379, protocol: "tcp", service: "etcd-client", description: "etcd client requests (Kubernetes datastore)", source: "conventional" },
  { port: 2380, protocol: "tcp", service: "etcd-peer", description: "etcd server-to-server peer traffic", source: "conventional" },
  { port: 3000, protocol: "tcp", service: "dev-server", description: "Common local dev server default (React, Rails, Grafana)", source: "conventional" },
  { port: 3128, protocol: "tcp", service: "squid-http", description: "Squid caching proxy default", source: "conventional" },
  { port: 3268, protocol: "tcp", service: "msft-gc", description: "Active Directory global catalog LDAP", source: "iana" },
  { port: 3306, protocol: "tcp", service: "mysql", description: "MySQL / MariaDB database", source: "iana" },
  { port: 3389, protocol: "tcp/udp", service: "ms-wbt-server", description: "Remote Desktop Protocol (RDP)", source: "iana" },
  { port: 4369, protocol: "tcp", service: "epmd", description: "Erlang port mapper daemon (RabbitMQ clustering)", source: "iana" },
  { port: 5060, protocol: "tcp/udp", service: "sip", description: "SIP call signalling (RFC 3261)", source: "iana" },
  { port: 5061, protocol: "tcp", service: "sips", description: "SIP over TLS", source: "iana" },
  { port: 5222, protocol: "tcp", service: "xmpp-client", description: "XMPP / Jabber client connections (RFC 6120)", source: "iana" },
  { port: 5432, protocol: "tcp", service: "postgresql", description: "PostgreSQL database", source: "iana" },
  { port: 5671, protocol: "tcp", service: "amqps", description: "AMQP 1.0 over TLS (RabbitMQ)", source: "iana" },
  { port: 5672, protocol: "tcp", service: "amqp", description: "AMQP message broker (RabbitMQ)", source: "iana" },
  { port: 5900, protocol: "tcp", service: "rfb", description: "VNC remote framebuffer (RFC 6143)", source: "iana" },
  { port: 5984, protocol: "tcp", service: "couchdb", description: "Apache CouchDB HTTP API (conventional)", source: "conventional" },
  { port: 6379, protocol: "tcp", service: "redis", description: "Redis in-memory data store", source: "iana" },
  { port: 6443, protocol: "tcp", service: "kube-apiserver", description: "Kubernetes API server default", source: "conventional" },
  { port: 6514, protocol: "tcp", service: "syslog-tls", description: "Syslog over TLS (RFC 5425)", source: "iana" },
  { port: 8080, protocol: "tcp", service: "http-alt", description: "Alternative HTTP — proxies, Tomcat, dev servers", source: "iana" },
  { port: 8443, protocol: "tcp", service: "pcsync-https", description: "Alternative HTTPS (conventional use)", source: "conventional" },
  { port: 8883, protocol: "tcp", service: "secure-mqtt", description: "MQTT over TLS", source: "iana" },
  { port: 9042, protocol: "tcp", service: "cassandra-cql", description: "Apache Cassandra CQL native transport (conventional)", source: "conventional" },
  { port: 9090, protocol: "tcp", service: "prometheus", description: "Prometheus server HTTP (conventional)", source: "conventional" },
  { port: 9092, protocol: "tcp", service: "kafka", description: "Apache Kafka broker (conventional)", source: "conventional" },
  { port: 9200, protocol: "tcp", service: "elasticsearch-http", description: "Elasticsearch / OpenSearch REST API (conventional)", source: "conventional" },
  { port: 9300, protocol: "tcp", service: "elasticsearch-node", description: "Elasticsearch inter-node transport (conventional)", source: "conventional" },
  { port: 11211, protocol: "tcp/udp", service: "memcache", description: "Memcached object cache", source: "iana" },
  { port: 27017, protocol: "tcp", service: "mongodb", description: "MongoDB database (conventional)", source: "conventional" },
  { port: 50051, protocol: "tcp", service: "grpc", description: "Common gRPC server default (conventional)", source: "conventional" },
];

/**
 * Classify a port number into its RFC 6335 range.
 * Returns { error } for non-integer or out-of-range input.
 */
export function classifyPort(port) {
  const n = Number(port);
  if (!Number.isInteger(n)) return { error: "Enter a whole port number between 0 and 65535." };
  if (n < 0 || n > PORT_MAX) return { error: "Port numbers run from 0 to 65535 only." };
  if (n <= WELL_KNOWN_MAX) {
    return {
      port: n,
      range: "well-known",
      label: "System (well-known) port 0-1023",
      note: "Binding usually needs root/administrator privileges; assignments are IANA-managed.",
    };
  }
  if (n <= REGISTERED_MAX) {
    return {
      port: n,
      range: "registered",
      label: "User (registered) port 1024-49151",
      note: "Registrable with IANA; usable by ordinary processes.",
    };
  }
  return {
    port: n,
    range: "dynamic",
    label: "Dynamic / private port 49152-65535",
    note: "Never assigned by IANA; used for ephemeral client-side connections.",
  };
}

/**
 * Search the port table by number, service name or description text,
 * optionally filtered by transport protocol.
 *
 * @param {object} input
 * @param {string} input.query     Number or free text; empty returns everything.
 * @param {string} [input.protocol] "any" | "tcp" | "udp"
 * @returns {{ matches: Array, total: number, classification: object|null }}
 */
export function searchPorts({ query = "", protocol = "any" } = {}) {
  const q = String(query).trim().toLowerCase();
  const proto = protocol === "tcp" || protocol === "udp" ? protocol : "any";

  const protocolMatches = (entry) =>
    proto === "any" || entry.protocol === proto || entry.protocol === "tcp/udp";

  let matches;
  let classification = null;

  if (q === "") {
    matches = PORTS.filter(protocolMatches);
  } else if (/^\d+$/.test(q)) {
    const n = Number(q);
    classification = classifyPort(n);
    matches = PORTS.filter((entry) => entry.port === n && protocolMatches(entry));
  } else {
    matches = PORTS.filter(
      (entry) =>
        protocolMatches(entry) &&
        (entry.service.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q)),
    );
  }

  return { matches, total: matches.length, classification };
}
