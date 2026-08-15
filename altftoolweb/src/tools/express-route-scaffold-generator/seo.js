const seo = {
  title: "Express Router Generator: CRUD, Zod, Error Handler",
  metaDescription:
    "Generates list, read, create, update and delete routes for Express 4 or 5, with Zod or express-validator, asyncHandler and RFC 9110 status codes.",
  steps: [
    "Type a singular Resource name and a Base path such as /api/v1, then set Express version, Module system and Validation layer.",
    "Under \"Routes to generate\" tick List (GET collection), Create (POST) or Delete (DELETE /:id), and optionally \"Paginate the list route (limit / offset)\".",
    "Check the Mounted at path and the Method / Path / Success status table, then press Copy all files for the routes/, middleware/error-handler and validators/ output.",
  ],
  intro:
    "This generator produces a ready-to-paste Express router — list, read, create, update and delete routes with validation, an async error wrapper and four-argument error middleware — from nothing but a resource name. It targets Express 4 or Express 5 in ES modules or CommonJS, emits Zod or express-validator schemas, and applies the status codes RFC 9110 prescribes: 201 with a Location header on create and 204 with no body on delete. It is built for Node.js developers who want a correct CRUD skeleton instead of retyping the same boilerplate for every resource.",
  useCases: [
    "Scaffolding a paginated /api/v1/invoices router with Zod validation for a new Express 5 service",
    "Migrating an Express 4 API and needing the asyncHandler wrapper that stops rejected async handlers from hanging requests",
    "Teaching REST conventions — the generated comments explain why POST returns 201 with Location and DELETE returns 204",
  ],
  benefits: [
    ["Version-aware output", "Emits the asyncHandler wrapper only on Express 4; Express 5 forwards rejected promises to next() by itself."],
    ["Error middleware done right", "The error handler keeps its four-argument signature, because Express detects error middleware by arity alone."],
    ["Correct HTTP semantics", "201 plus Location on create, 204 on delete, 404, 409 and 422 mapped per RFC 9110."],
  ],
  faqs: [
    [
      "Why does my Express error middleware never run?",
      "Almost always because it does not declare exactly four parameters. Express decides a function is an error handler by counting its declared arguments, so (err, req, res, next) is required — drop next and it silently becomes ordinary middleware. It must also be registered after every route.",
    ],
    [
      "Do I still need an asyncHandler wrapper in Express 5?",
      "No. Express 5 automatically passes a rejected promise from an async handler to next(), which routes it to your error middleware. Express 4 ignores the returned promise entirely, so without a wrapper a thrown error in an async handler leaves the request hanging until it times out.",
    ],
    [
      "What status code should a POST route return when it creates a resource?",
      "201 Created, with a Location header pointing at the new resource — that is what RFC 9110 section 15.3.2 specifies. The generated create route does both; a plain 200 is reserved for requests that do not create anything.",
    ],
    [
      "Why must /search be registered before /:id in an Express router?",
      "Because Express matches routes in registration order, and /:id matches any single path segment — including the literal word search. Register literal segments first or the parameterised route swallows them and your handler receives 'search' as an id.",
    ],
  ],
};

export default seo;
