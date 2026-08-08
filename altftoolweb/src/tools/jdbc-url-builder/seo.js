const seo = {
  title: "JDBC URL Builder for PostgreSQL, MySQL, Oracle",
  metaDescription:
    "Build a JDBC URL with each driver’s own grammar — ?key=value, ;key=value or none for Oracle thin — plus driver class, Maven and Gradle lines.",
  steps: [
    "Choose the Database engine — PostgreSQL, MySQL, Oracle, SQL Server, H2 or SQLite — and fill Host, Port, Database and User; Oracle adds an Oracle naming style select, H2 an H2 mode, SQLite a SQLite storage select, and SQL Server takes a named instance such as SQLEXPRESS.",
    "Add one connection property in Extra property name and Extra property value (the placeholders read ApplicationName and billing-service) and tick “Require an encrypted connection” if the server needs TLS.",
    "The JDBC URL appears with Driver class, Port used and Parameter style (?key=value&key=value or ;key=value;key=value) plus a “Things to watch” list; Copy URL copies the string, and the Java (DriverManager), Maven and Gradle (Kotlin DSL) snippets each have their own Copy button.",
  ],
  intro:
    "The JDBC URL Builder assembles a valid JDBC connection string for PostgreSQL, MySQL, Oracle, SQL Server, H2 and SQLite, applying each driver's own grammar rather than one generic template. That matters because the grammars genuinely differ: PostgreSQL and MySQL take `?key=value&key=value`, SQL Server and H2 take `;key=value;`, and the Oracle thin driver takes no URL parameters at all. It returns the URL plus the driver class name, the Maven and Gradle coordinate and a DriverManager snippet, so Java and Kotlin developers can paste a working connection instead of debugging a malformed one.",
  useCases: [
    "Wiring a Spring Boot `spring.datasource.url` for PostgreSQL on a non-default port with sslmode=require",
    "Converting an Oracle SID connection to the service-name form after a pluggable-database migration",
    "Connecting to a SQL Server named instance such as host\\SQLEXPRESS, where the port is resolved by the Browser service instead of written in the URL",
  ],
  benefits: [
    [
      "Right separator every time",
      "Query style for PostgreSQL, MySQL and SQLite; semicolons for SQL Server and H2; none for the Oracle thin driver.",
    ],
    [
      "Driver class and coordinate included",
      "Each URL comes with its class name — com.mysql.cj.jdbc.Driver, not the deprecated com.mysql.jdbc.Driver — and the matching Maven and Gradle dependency.",
    ],
    [
      "Flags the traps",
      "Warns about relative SQLite and H2 file paths, in-memory H2 vanishing without DB_CLOSE_DELAY=-1, and passwords leaking into logs via the URL.",
    ],
  ],
  faqs: [
    [
      "What is the JDBC URL format for PostgreSQL?",
      "`jdbc:postgresql://host:port/database`, with the default port 5432 and parameters appended as `?sslmode=require&ApplicationName=billing`. The driver class is org.postgresql.Driver and the dependency is org.postgresql:postgresql. The port can be omitted entirely (`jdbc:postgresql://host/database`) and the driver falls back to 5432.",
    ],
    [
      "What is the difference between the Oracle SID and service name in a JDBC URL?",
      "The service form is `jdbc:oracle:thin:@//host:1521/service_name` and the legacy SID form is `jdbc:oracle:thin:@host:1521:SID` — note the double slash and forward slash in one, colons in the other. Use the service name: from Oracle 12c onward a pluggable database is reached by service, and a SID can stop resolving after a consolidation or move. Neither form accepts query parameters; set connection properties on a java.util.Properties object instead.",
    ],
    [
      "Why does my SQL Server JDBC connection fail with an SSL or certificate error?",
      "Because the Microsoft driver changed its default: since mssql-jdbc 10.2, `encrypt` defaults to true, so a server without a trusted certificate now fails where older driver versions connected happily. The fix is either a properly trusted certificate, or `;encrypt=true;trustServerCertificate=true` for a development server — and remember the whole SQL Server URL is semicolon-separated, including `databaseName=`.",
    ],
    [
      "How do I write a JDBC URL for an in-memory database?",
      "For H2 use `jdbc:h2:mem:testdb`, adding `;DB_CLOSE_DELAY=-1` if the data must survive between connections — otherwise H2 drops the database when the last connection closes. For SQLite use `jdbc:sqlite::memory:` with the org.xerial:sqlite-jdbc driver. Neither takes a host, port or password, since both run inside the JVM process rather than over a socket.",
    ],
  ],
};

export default seo;
