const seo = {
  intro:
    "This builder assembles a PostgreSQL connection string in both libpq formats — the URI form postgresql://user:password@host:port/dbname?params and the keyword/value DSN form host=... dbname=... — with special characters percent-encoded automatically. It covers sslmode, connect_timeout, application_name, a schema via search_path and the pgxpool pool_max_conns setting. Everything is generated locally in the browser; nothing you type is transmitted.",
  useCases: [
    "A developer whose password contains @ or : characters and keeps breaking the URI — the builder percent-encodes userinfo correctly",
    "A platform engineer producing a verify-full SSL connection string for a managed Postgres instance before putting it in a secrets manager",
    "A multi-tenant app team setting search_path per tenant through the options parameter without hand-crafting -csearch_path syntax",
  ],
  benefits: [
    ["Both libpq forms", "Generates the postgresql:// URI and the equivalent host=... keyword/value DSN side by side."],
    ["Correct encoding", "Percent-encodes user, password and database name in the URI and quote-escapes the DSN per libpq rules."],
    ["Full sslmode reference", "All six libpq sslmode values from disable to verify-full, with what each actually verifies."],
  ],
  faqs: [
    [
      "What is the format of a PostgreSQL connection string?",
      "PostgreSQL accepts two formats: a URI — postgresql://user:password@host:5432/dbname?sslmode=require — and a keyword/value string — host=localhost port=5432 dbname=mydb user=me. Both are parsed by libpq and by most drivers built on it; the default port is 5432 and both postgresql:// and postgres:// scheme spellings are valid.",
    ],
    [
      "How do I put special characters in a PostgreSQL password in the URI?",
      "Percent-encode them: @ becomes %40, : becomes %3A, / becomes %2F and a space becomes %20. In the keyword/value form no percent-encoding is used; instead values with spaces or quotes are wrapped in single quotes with backslash escapes. This tool applies the right rule to each format automatically.",
    ],
    [
      "What is the difference between sslmode require and verify-full?",
      "require encrypts the connection but does not verify the server's certificate, so it does not protect against man-in-the-middle attacks; verify-full checks the certificate against a trusted CA and confirms the host name matches. For production over untrusted networks, verify-full is the safe choice; libpq's default is prefer.",
    ],
    [
      "How do I set a schema in a PostgreSQL connection string?",
      "There is no dedicated schema parameter — you set search_path through the options parameter: options=-csearch_path%3Dmyschema in a URI. This tool builds that syntax for you when you fill in the schema field. Alternatively, set the schema per role with ALTER ROLE ... SET search_path.",
    ],
  ],
};

export default seo;
