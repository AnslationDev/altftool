const seo = {
  title: "Database Connection String Builder: URI & Default Ports",
  metaDescription:
    "Build scheme://user:password@host:port/database for Postgres, MySQL, MariaDB, MongoDB, Redis or SQL Server — leave the port blank for 5432, 3306 or 27017.",
  intro:
    "The Database Connection String Builder assembles a URI in the form scheme://user:password@host:port/database for PostgreSQL, MySQL, MariaDB, MongoDB, Redis and SQL Server, filling in the correct scheme and the engine's default port — 5432, 3306, 27017, 6379 and 1433 — whenever you leave the port blank. Developers wiring up a DATABASE_URL or a container environment file get the exact string plus a breakdown of the scheme, host, port and database name it used. Credentials are typed in plain text, so use throwaway values rather than production secrets.",
  useCases: [
    "You are filling in a DATABASE_URL for a new deploy and cannot remember whether MongoDB listens on 27017 or 27018.",
    "A docker-compose service needs a Redis URI and you want the scheme and default port right the first time instead of debugging a connection refused error.",
    "You are onboarding a teammate and want to hand them a correctly shaped local Postgres string they can drop straight into their .env file.",
  ],
  benefits: [
    [
      "Default ports built in per engine",
      "Leave the port blank and it inserts the documented default for that database rather than producing a portless string that silently falls back somewhere else.",
    ],
    [
      "Scheme mapping handled",
      "MariaDB emits the mysql:// scheme and SQL Server emits sqlserver://, which are the two cases people most often get wrong by typing the product name.",
    ],
    [
      "Optional parts stay optional",
      "Omitting the username drops the whole auth segment and omitting the database name drops the trailing path, so you get a valid URI instead of stray colons and slashes.",
    ],
  ],
  faqs: [
    [
      "what are the default ports for these databases",
      "PostgreSQL 5432, MySQL and MariaDB 3306, MongoDB 27017, Redis 6379, and SQL Server 1433. Those are the values inserted automatically when the port field is left empty.",
    ],
    [
      "what is the format of a database connection string",
      "scheme://username:password@host:port/database — for example postgresql://admin:secret@localhost:5432/app. The username and password segment and the trailing database path are both optional, and the scheme identifies the driver rather than the product name.",
    ],
    [
      "my password has special characters and the connection fails",
      "Percent-encode them yourself before pasting the password in. Characters such as @, :, /, ? and # are structural in a URI, so a password like p@ss must appear as p%40ss — this builder inserts the password as typed and does not encode it for you.",
    ],
    [
      "is it safe to type my production password here",
      "No. The password is displayed in plain text in the result and in your browser's form state, so use a placeholder and substitute the real secret in your own environment file or secret manager. Anything you have already pasted into any web tool should be treated as needing rotation.",
    ],
  ],
};

export default seo;
