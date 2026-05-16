export function getAdminRouteId(params = {}, pathname = "") {
  const directId = params.id;
  if (Array.isArray(directId)) return directId[directId.length - 1] || "";
  if (directId) return String(directId);

  const subpath = params.subpath;
  if (Array.isArray(subpath)) return subpath[subpath.length - 1] || "";
  if (subpath) return String(subpath);

  const pathParts = String(pathname || "").split("?")[0].split("/").filter(Boolean);
  if (pathParts.length) return pathParts[pathParts.length - 1] || "";

  return "";
}
