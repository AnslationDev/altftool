const seo = {
  title: "MySQL ER Diagram Builder & SQL Query Runner",
  metaDescription:
    "Paste CREATE TABLE statements to draw a draggable ER diagram, export PNG or JSON, and run SELECT with JOIN and aggregates. No database connection.",
  steps: [
    "Paste your MySQL CREATE TABLE statements into SQL Schema Input, or drop CSV, SQL or JSON files onto the dataset uploader.",
    "Drag the tables around the Live ER Diagram, and type a SELECT with WHERE, JOIN ... ON, GROUP BY or LIMIT into Query Visualization to highlight the schema pieces it touches.",
    "Open the Export Panel for Copy schema, Download JSON as mysql-visualization-workspace.json, or Export PNG as mysql-er-diagram.png.",
  ],
  intro:
    "This MySQL visualization workspace parses your CREATE TABLE statements into tables, columns, primary keys, unique constraints and foreign keys, then draws them as a draggable ER diagram you can export as PNG or JSON. It also runs a browser-side SELECT engine over CSV or JSON data you upload, supporting WHERE, JOIN … ON, GROUP BY, ORDER BY, LIMIT and the COUNT, SUM, AVG, MIN and MAX aggregates. It is built for developers, analysts and students who want to see a schema and test queries against it without installing a MySQL server or handing a schema dump to a hosted service.",
  useCases: [
    "You inherited a legacy MySQL dump and need an ER diagram for the handover doc before you can explain which tables the orders table actually points at.",
    "You are teaching JOINs and want students to upload a CSV, watch it become a real table, and see the join result change as they edit the ON clause.",
    "You are reviewing a schema in a pull request and want to confirm every foreign key resolves to a table that exists rather than a renamed or dropped one.",
  ],
  benefits: [
    [
      "Reads the DDL you already have",
      "Handles inline REFERENCES, table-level FOREIGN KEY and CONSTRAINT clauses, comments and backtick-quoted identifiers straight from a dump.",
    ],
    [
      "Diagram and query engine share one schema",
      "Running a SELECT highlights the tables and columns that query touches, so the diagram doubles as a query explainer.",
    ],
    [
      "Warns about relationships that point nowhere",
      "Foreign keys referencing a table not present in the pasted SQL are surfaced instead of silently drawn as a dangling edge.",
    ],
  ],
  faqs: [
    [
      "Does this connect to my MySQL database?",
      "No — there is no database connection at any point. You paste CREATE TABLE statements or upload CSV/JSON files, and both the parser and the query engine run entirely in your browser tab, with your work saved to localStorage rather than a server.",
    ],
    [
      "Which SQL statements can I actually run here?",
      "SELECT queries only; anything else returns an error saying the browser engine supports SELECT. Within SELECT it handles column lists and *, WHERE with =, !=, <>, >, <, >=, <= and LIKE, JOIN … ON, GROUP BY, ORDER BY, LIMIT, and the COUNT, SUM, AVG, MIN and MAX aggregates.",
    ],
    [
      "How do I get the ER diagram out for documentation?",
      "Export it as a PNG image of the rendered diagram, or download the parsed schema and datasets as JSON. The PNG suits a README or a design doc; the JSON is the better choice if you want to feed the parsed table and relationship list into another tool.",
    ],
    [
      "What file formats can I upload as data?",
      "CSV and JSON. Each file becomes a live in-browser table named after the file, and the equivalent CREATE TABLE statement is generated and added to your schema, so uploaded data shows up in the diagram and is queryable immediately. Built-in sample datasets are available if you have nothing to hand.",
    ],
  ],
};

export default seo;
