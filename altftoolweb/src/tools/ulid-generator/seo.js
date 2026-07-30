const seo = {
  intro:
    "This ULID generator produces batches of five 26-character ULIDs: a 10-character timestamp encoded from the current millisecond followed by 16 characters of randomness, all in Crockford base32. Because the timestamp comes first and base32 sorts the same way lexicographically as it does numerically, ULIDs generated later always sort after earlier ones — the property that makes them a drop-in alternative to random UUIDs for database keys. Copy the whole batch in one click and paste it straight into a seed file, a test fixture or a schema example.",
  useCases: [
    "You are seeding a database table and want primary keys that arrive in insert order, so range scans and B-tree inserts stay tidy instead of scattering like UUIDv4.",
    "You need a handful of realistic-looking identifiers for API documentation or a Postman collection and do not want to hand-type 26 characters each time.",
    "You are writing tests for a system that sorts records by ID and need several IDs whose relative order you can predict from when you generated them.",
  ],
  benefits: [
    [
      "Sortable by construction",
      "The leading 10 characters encode the millisecond timestamp, so plain string sorting puts identifiers in creation order.",
    ],
    [
      "Ambiguity-free alphabet",
      "Crockford base32 omits I, L, O and U, so an ID read aloud or copied off a screen cannot be mistyped as a look-alike character.",
    ],
    [
      "Five at a time",
      "Each press yields a full batch you can copy as newline-separated lines, rather than one value you have to click repeatedly for.",
    ],
  ],
  faqs: [
    [
      "What is a ULID and how is it different from a UUID?",
      "A ULID is a 26-character identifier made of a 48-bit millisecond timestamp plus random bits, encoded in base32, whereas a UUIDv4 is 36 characters of hex and dashes with no ordering. ULIDs sort chronologically as plain strings and are shorter and URL-safe, which is why they are often chosen for database keys and public-facing IDs.",
    ],
    [
      "Why is a ULID exactly 26 characters?",
      "Ten base32 characters carry the timestamp and 16 carry the randomness, which is 26 total. That layout is the ULID specification's, and the 10-character timestamp field has room well beyond the year 10000, so it will not overflow in practice.",
    ],
    [
      "Do two ULIDs generated in the same millisecond collide?",
      "Almost certainly not — the 16 random base32 characters give an enormous space of possible values for any single millisecond, so a collision within one millisecond is vanishingly unlikely. Identifiers created in different milliseconds differ in the timestamp prefix regardless.",
    ],
    [
      "Can I use these as security tokens or session IDs?",
      "No. The random portion here is drawn from the browser's ordinary pseudorandom generator, not a cryptographic one, and the timestamp prefix is readable by anyone who sees the ID. Use a cryptographically secure random source for anything that must be unguessable.",
    ],
  ],
};

export default seo;
