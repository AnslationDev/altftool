const seo = {
  title: "MongoDB Connection String Builder (URI Generator)",
  metaDescription:
    "Build a mongodb:// or mongodb+srv:// URI with replicaSet, authSource, readPreference, w, tls and maxPoolSize — passwords percent-encoded per the spec.",
  steps: [
    "Enter Hosts (comma separated host:port) or tick 'Use mongodb+srv://' for an Atlas-style DNS seed list — one host, no port — then add the optional User, Password and default auth database.",
    "Set replicaSet, authSource, Read preference, Write concern (w), TLS, maxPoolSize and appName; the URI rebuilds live with credentials percent-encoded per the connection string spec.",
    "Review the option-by-option list under the Connection URI panel and press Copy URI to copy the finished string — everything is generated locally in your browser.",
  ],
  intro:
    "This builder assembles a MongoDB connection URI in the official Connection String format — mongodb://user:password@host1:27017,host2:27017/db?options or the DNS seed list form mongodb+srv://cluster.example.mongodb.net/db — with credentials percent-encoded as the spec requires. It covers replicaSet, authSource, readPreference, write concern (w), tls, retryWrites, maxPoolSize and appName, and enforces the +srv rules: one host, no port. Everything is generated locally in the browser.",
  useCases: [
    "A developer connecting to a self-hosted three-member replica set who needs replicaSet, authSource=admin and readPreference in one correct URI",
    "An Atlas user whose password contains @ or / and keeps getting authentication failures from an unencoded connection string",
    "A platform engineer capping driver connections with maxPoolSize and tagging connections with appName for the server logs",
  ],
  benefits: [
    ["Spec-correct encoding", "User names and passwords are percent-encoded exactly as the MongoDB connection string spec requires."],
    ["SRV rules enforced", "mongodb+srv:// is validated to a single host with no port, matching how DNS seed lists actually work."],
    ["Replica-set aware", "Multiple host:port members, replicaSet, read preference and write concern handled in one form."],
  ],
  faqs: [
    [
      "What is the format of a MongoDB connection string?",
      "mongodb://user:password@host1:27017,host2:27017/defaultauthdb?replicaSet=rs0&authSource=admin — the default port is 27017, multiple replica-set members are comma-separated, and options follow as query parameters. The alternative mongodb+srv:// form names a single DNS host whose SRV records list the members.",
    ],
    [
      "What is the difference between mongodb:// and mongodb+srv://?",
      "mongodb:// lists every host explicitly, while mongodb+srv:// gives one DNS name and the driver discovers the members from SRV records — which is why +srv URIs must not include a port and take exactly one host. With +srv, TLS also defaults to enabled, which is the form MongoDB Atlas gives you.",
    ],
    [
      "How do I escape special characters in a MongoDB password?",
      "Percent-encode them: the spec requires ':', '/', '?', '#', '[', ']', '@' and '%' in the user name or password to be percent-encoded, so p@ss/1 becomes p%40ss%2F1. Unencoded characters make the driver misparse the URI, which typically surfaces as an authentication or host-resolution error.",
    ],
    [
      "What does authSource=admin mean in a MongoDB URI?",
      "It tells the driver which database holds the user's credentials, independent of the database named in the URI path. Users created in the admin database need authSource=admin; if the option is omitted, the driver authenticates against the database in the path, or admin when no path database is given.",
    ],
  ],
};

export default seo;
