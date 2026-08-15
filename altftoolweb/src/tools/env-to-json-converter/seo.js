const seo = {
  title: ".env to JSON Converter with Nesting and Type Coercion",
  steps: [
    "Pick '.env → JSON' or 'JSON → .env' in the Direction select, then paste your file into the '.env contents' (or 'JSON object') box — a sample with DB__HOST, PORT and a quoted \"1.10\" loads by default.",
    "Tick 'Coerce types (true/false, numbers, null)' and 'Nest keys on the delimiter (DB__HOST → DB.HOST)', or change the 'Nesting delimiter' from the default __.",
    "Read the converted output with its 'Entries converted' count, then click 'Copy result' to put the JSON or .env text on the clipboard.",
  ],
  intro:
    "This tool converts a dotenv (.env) file into JSON and converts JSON back into .env lines, with two optional transforms: type coercion (unquoted true, false, null and numeric strings become real JSON types) and nesting on a delimiter (DB__HOST becomes db.host, the double-underscore convention used by ASP.NET Core configuration and nconf). Values that were quoted in the .env are always preserved as strings.",
  useCases: [
    "Turn a service's .env into the JSON config block an app-hosting dashboard, AWS ECS task definition or serverless.yml expects.",
    "Flatten a nested JSON config file into UPPER_SNAKE_CASE environment variables for a twelve-factor deployment.",
    "Generate typed JSON fixtures from an .env so tests read the same configuration values the runtime sees.",
  ],
  benefits: [
    ["Both directions", "One tool converts .env → JSON and JSON → .env, sharing the same delimiter convention so output round-trips."],
    ["Quote-aware coercion", "PORT=3000 becomes the number 3000, but VERSION=\"1.10\" stays the string \"1.10\" because it was quoted."],
    ["Real nesting rules", "Double-underscore splitting with explicit conflict errors when A=1 and A__B=2 both exist, instead of silent data loss."],
  ],
  faqs: [
    [
      "How do I convert a .env file to JSON?",
      "Paste the .env and copy the JSON: each KEY=VALUE line becomes a JSON property, comments are dropped, and with coercion enabled unquoted true/false, null and numbers become native JSON types. Enable nesting to fold DB__HOST and DB__PORT into a {\"DB\": {\"HOST\": ..., \"PORT\": ...}} object.",
    ],
    [
      "Why does the double underscore (__) mean nesting in environment variables?",
      "Because environment variable names cannot portably contain dots or colons, ASP.NET Core adopted __ as the hierarchy separator (ConnectionStrings__Default maps to ConnectionStrings:Default), and Node loaders like nconf support the same separator. This tool uses __ by default and lets you change the delimiter.",
    ],
    [
      "Are environment variable values really numbers or booleans?",
      "No — at runtime every environment variable is a string; process.env.PORT is \"3000\", not 3000. Coercion here only shapes the JSON representation. To keep a numeric-looking value as a string through conversion, quote it in the .env (VERSION=\"1.10\").",
    ],
    [
      "Can I convert JSON back to a .env file?",
      "Yes — switch the direction to JSON → .env. Nested objects flatten with the delimiter, arrays flatten by index (ARR__0, ARR__1), keys are upper-cased with invalid characters replaced by underscores, and values that would be misread unquoted — like \"42\" or text containing # — are double-quoted.",
    ],
  ],
};

export default seo;
