const toolConfig = {
  slug: "sql-join-fanout-debugger",
  name: "SQL JOIN Fan-Out Debugger",
  category: ["Developer"],
  description:
    "Find out why your SUM is too high after a join: describe each table's grain and key cardinality to get the row-multiplication factor, which aggregates are inflated, and the corrected SQL.",
  icon: "git-merge",
  iconColor: "text-(--primary)",
};

export default toolConfig;
