const seo = {
  title: "SQL Naming Conventions: Tables, Keys, Indexes, Limits",
  metaDescription:
    "Generate table, column, PK, FK, index and check naming rules with worked examples, checked against PostgreSQL's 63 bytes, MySQL's 64 and Oracle's 30.",
  steps: [
    "Choose a Case style, a Database system, and whether Table names are Plural (customers) or Singular (customer).",
    "Set Surrogate key column to Bare id or Entity-prefixed (customer_id), pick Constraint and index naming, then type a Sample entity and Sample column.",
    "Read the worked example for each object type — names past the identifier limit are flagged with their character count — then press Copy rules.",
  ],
  intro:
    "This generator produces a complete database naming convention — tables, columns, primary and foreign keys, unique constraints, indexes and check constraints — with a worked example for every rule. Choose snake_case, camelCase or PascalCase, plural or singular tables, and prefixed (pk_, fk_, ix_) or PostgreSQL-suffix (_pkey, _fkey, _idx) constraint names, and every example is checked against your DBMS identifier limit: 63 bytes in PostgreSQL, 64 characters in MySQL 8, 128 in SQL Server and Oracle 12.2+, and 30 in older Oracle. It is built for teams writing a schema style guide before the first migration.",
  useCases: [
    "Writing the naming section of a new project's database style guide with concrete examples the whole team can copy",
    "Checking whether long constraint names like fk_international_shipments_reconciliation_records fit Oracle's 30-byte legacy limit before a migration fails",
    "Settling the plural-vs-singular and id-vs-customer_id debate with a consistent rule sheet instead of ad-hoc choices per table",
  ],
  benefits: [
    ["Every object covered", "One consistent rule each for tables, columns, PK, FK, unique, index and check constraint names."],
    ["Length limits enforced", "Examples that exceed your DBMS identifier limit are flagged in red with the exact character count."],
    ["Case-folding warnings", "Choosing camelCase on PostgreSQL or Oracle triggers a warning that unquoted identifiers are case-folded."],
  ],
  faqs: [
    [
      "Should database table names be singular or plural?",
      "Both are defensible; consistency matters more than the choice. Plural (customers) reads naturally in SELECT * FROM customers, while singular (customer) maps cleanly to ORM entity classes and avoids irregular plural bugs. Pick one, document it, and apply it to every table — this generator renders the full rule sheet for either choice.",
    ],
    [
      "What is the maximum identifier length in PostgreSQL, MySQL and SQL Server?",
      "PostgreSQL truncates identifiers to 63 bytes (NAMEDATALEN minus one), MySQL 8 allows 64 characters, SQL Server allows 128 characters (sysname), and Oracle allows 128 bytes from version 12.2 but only 30 before that. PostgreSQL truncates silently rather than erroring, which is why long auto-generated constraint names can quietly collide.",
    ],
    [
      "Why is snake_case recommended for SQL identifiers?",
      "Because PostgreSQL folds unquoted identifiers to lower case and Oracle folds them to upper case, a camelCase name like orderTotal must be double-quoted in every query forever or it silently becomes ordertotal. snake_case survives case folding unchanged on every major DBMS, so it needs no quoting.",
    ],
    [
      "How should foreign key constraints be named?",
      "A common convention is fk_<child_table>_<parent_table>, for example fk_customer_orders_customers, so the constraint name states the relationship it enforces. PostgreSQL's own auto-generated style is <table>_<column>_fkey. Explicit names matter because they appear in error messages and are needed to DROP or ALTER the constraint later.",
    ],
  ],
};

export default seo;
