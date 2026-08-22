const seo = {
  title: "MySQL Connection String Builder",
  metaDescription:
    "Enter host, port, charset, TLS mode and timeout once — get a mysql:// URI, a go-sql-driver DSN and a Connector/J JDBC URL with correct parameter names.",
  steps: [
    "Fill in Host, Port (blank = default 3306), Database (schema) name, and the optional User and Password fields.",
    "Set Character set, an IANA Time zone, the TLS / SSL mode, Connect timeout in seconds and the parseTime=true Go DSN checkbox.",
    "Copy whichever output your driver expects — URI (Node mysql2 / SQLAlchemy style), Go DSN (go-sql-driver/mysql) or JDBC URL (Connector/J).",
  ],
  intro:
    "This builder turns one set of MySQL connection details into three correctly formatted strings: a mysql:// URI (Node mysql2 / SQLAlchemy style), a Go DSN in go-sql-driver/mysql's user:pass@tcp(host:port)/db grammar, and a JDBC URL for Connector/J. Charset, IANA time zone, TLS mode, connect timeout and pool limit are mapped to each driver's own parameter names — including the ssl-mode → tls translation the Go driver needs. Everything is generated locally in the browser.",
  useCases: [
    "A Node developer building a mysql2 pool URL with utf8mb4, a 10-second connect timeout and connectionLimit=15",
    "A Go engineer who needs parseTime=true, loc=Asia%2FKolkata and the right tls value without re-reading the go-sql-driver README",
    "A Java team converting the same database credentials into a Connector/J JDBC URL with sslMode and connectionTimeZone set",
  ],
  benefits: [
    ["Three drivers, one form", "URI, Go DSN and JDBC output simultaneously from the same inputs."],
    ["TLS mode translated", "MySQL's DISABLED-to-VERIFY_IDENTITY modes are mapped to the Go driver's tls=false/preferred/skip-verify/true values."],
    ["Unit-safe timeouts", "Enter seconds once — emitted as milliseconds for mysql2 and Connector/J and as 10s duration syntax for Go."],
  ],
  faqs: [
    [
      "What is the format of a MySQL connection string?",
      "The URI form is mysql://user:password@host:3306/database?charset=utf8mb4; the default port is 3306. Go's driver uses its own DSN grammar — user:password@tcp(host:3306)/database?parseTime=true — and Java uses jdbc:mysql://host:3306/database. All three carry options as query parameters, but the parameter names differ per driver.",
    ],
    [
      "What does parseTime=true do in a Go MySQL DSN?",
      "It makes go-sql-driver/mysql scan DATE and DATETIME columns into Go time.Time values instead of []byte. Without it, reading a timestamp column into a time.Time fails, which is one of the most common first-run errors with the Go driver; loc= then controls which time zone those values are interpreted in.",
    ],
    [
      "Which MySQL SSL mode should I use?",
      "For production over a network you do not fully trust, VERIFY_CA or VERIFY_IDENTITY — REQUIRED encrypts the connection but performs no certificate verification, so it does not stop man-in-the-middle attacks. The client default is PREFERRED, which falls back to plaintext if the server has no TLS configured.",
    ],
    [
      "Should I use utf8 or utf8mb4 in MySQL?",
      "Use utf8mb4. MySQL's legacy utf8 (utf8mb3) stores at most 3 bytes per character and cannot hold emoji or many CJK extension characters; utf8mb4 is full UTF-8 and has been the server default character set since MySQL 8.0.",
    ],
  ],
};

export default seo;
