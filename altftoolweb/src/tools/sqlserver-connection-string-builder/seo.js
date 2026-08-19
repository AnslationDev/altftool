const seo = {
  title: "SQL Server Connection String Builder",
  metaDescription:
    "Generate matching SqlClient and JDBC strings with named instances, port 1433, Encrypt, TrustServerCertificate and passwords escaped for each format.",
  steps: [
    "Enter Host, \"Instance name (optional, e.g. SQLEXPRESS)\", \"Port (blank = default 1433 / SQL Browser)\" and Database name.",
    "Choose Authentication, add \"User (login)\" and \"Password (escaped for you)\" for SQL auth, then tick \"Encrypt=True\" or \"TrustServerCertificate=True (skips certificate validation — dev/test only)\".",
    "Both formats appear together — \"ADO.NET (SqlClient)\" and \"JDBC (Microsoft JDBC Driver)\" — each in its own code box with a Copy button.",
  ],
  intro:
    "This builder produces matched SQL Server connection strings in the two dominant formats: ADO.NET SqlClient (Server=host\\INSTANCE,1433;Database=...;Encrypt=True;...) and the Microsoft JDBC driver URL (jdbc:sqlserver://host:1433;databaseName=...;encrypt=true;...). It handles named instances, SQL versus Windows/Integrated authentication, encryption and TrustServerCertificate flags, timeouts and application names — and applies each format's escaping rules, double-quoting ADO.NET values containing semicolons and brace-escaping JDBC values.",
  useCases: [
    "A .NET developer connecting to HOST\\SQLEXPRESS who needs the backslash, comma-port and Encrypt settings in the right places",
    "A team porting a service from C# to Java that wants the exact JDBC equivalent of an existing SqlClient connection string",
    "A DBA issuing a temporary string with TrustServerCertificate=True for a dev box while keeping the production form strict",
  ],
  benefits: [
    ["Both ecosystems", "ADO.NET and JDBC output side by side from one set of inputs, with per-format property names."],
    ["Correct escaping", "Semicolons and quotes in passwords are double-quoted for ADO.NET and brace-escaped for JDBC automatically."],
    ["Instance-aware", "Named instances, explicit ports or SQL Browser resolution — the Server value is assembled correctly."],
  ],
  faqs: [
    [
      "What is the format of a SQL Server connection string?",
      "For .NET: Server=myhost\\MYINSTANCE,1433;Database=mydb;User Id=me;Password=secret;Encrypt=True; — key=value pairs separated by semicolons. For Java: jdbc:sqlserver://myhost:1433;databaseName=mydb;user=me;password=secret;encrypt=true;. The default TCP port for a default instance is 1433.",
    ],
    [
      "How do I connect to a named SQL Server instance?",
      "Put the instance after a backslash: Server=myhost\\SQLEXPRESS in ADO.NET, or instanceName=SQLEXPRESS in JDBC. Without an explicit port, the client asks the SQL Server Browser service (UDP 1434) which port the instance is listening on; specifying host\\INSTANCE,port skips that lookup and works when UDP 1434 is blocked.",
    ],
    [
      "What does TrustServerCertificate=True do?",
      "It makes the client accept the server's TLS certificate without validating it, so the connection is encrypted but not protected against man-in-the-middle attacks. It exists for dev machines and self-signed certificates; in production, install a certificate the client trusts and keep the flag False. Since Microsoft.Data.SqlClient 4.0, Encrypt defaults to True, which is why untrusted-certificate errors became common after upgrading.",
    ],
    [
      "What is the difference between Integrated Security and SQL authentication?",
      "Integrated Security=SSPI (JDBC: integratedSecurity=true) authenticates with the Windows or domain identity of the running process, so no password appears in the string; SQL authentication sends an explicit User Id and Password stored on the server. Integrated auth is generally preferred on Windows domains because credentials never live in configuration files.",
    ],
  ],
};

export default seo;
