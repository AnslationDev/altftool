// Shared tone assignments so the same entity (HTTP method) always wears the
// same color everywhere in the tool — pills, meters, donut segments.

export const METHOD_PILL = {
  GET: "bg-info-soft text-info",
  POST: "bg-success-soft text-success",
  PUT: "bg-warning-soft text-warning",
  PATCH: "bg-warning-soft text-warning",
  DELETE: "bg-danger-soft text-danger",
  OPTIONS: "bg-muted text-muted-foreground",
  HEAD: "bg-muted text-muted-foreground",
};

export const METHOD_BAR = {
  GET: "bg-info",
  POST: "bg-success",
  PUT: "bg-warning",
  PATCH: "bg-warning",
  DELETE: "bg-danger",
  OPTIONS: "bg-muted-foreground",
  HEAD: "bg-muted-foreground",
};
