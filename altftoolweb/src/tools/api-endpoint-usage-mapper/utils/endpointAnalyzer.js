// Line-level request parser shared by the scan engine. Recognizes access-log
// lines, cURL commands, fetch/axios calls, and Express-style route definitions.

export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

function cleanUrl(value) {
  if (!value) return "";
  let url = value.trim().replace(/["'`),;]+$/g, "");
  try {
    if (/^https?:\/\//i.test(url)) url = new URL(url).pathname;
  } catch {
    return "";
  }
  const path = url.split(/[?#]/)[0] || "/";
  return path.replace(/\/{2,}/g, "/");
}

function normalizePath(path) {
  return cleanUrl(path)
    .split("/")
    .map((part) => {
      if (!part) return part;
      if (/^\d+$/.test(part)) return ":id";
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part)) return ":id";
      if (/^(?:[a-z]+_)?[0-9a-f]{12,}$/i.test(part) && /\d/.test(part)) return ":id";
      // Stripe-style prefixed identifiers: ord_91, cus_a8f2, tok_live_x9…
      if (/^[a-z]{2,8}_[a-z0-9_]{2,}$/i.test(part) && /\d/.test(part)) return ":id";
      return part;
    })
    .join("/");
}

export function parseLine(line) {
  let method = METHODS.find((item) => new RegExp(`\\b${item}\\b`).test(line.toUpperCase()));
  let url = "";
  const methodUrl = line.match(/\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(https?:\/\/[^\s"']+|\/[^\s"']+)/i);
  const requestCall = line.match(/\b(?:fetch|axios\.(?:get|post|put|patch|delete)|request)\s*\(\s*["'`](https?:\/\/[^"'`]+|\/[^"'`]+)["'`]/i);
  const routeCall = line.match(/\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`](\/[^"'`]+)["'`]/i);
  const urlFirst = line.match(/(https?:\/\/[^\s"'`]+|\/[A-Za-z0-9._~!$&'()*+,;=:@%\-/{\}]+(?:\?[^\s"'`]*)?)/);

  if (methodUrl) [method, url] = [methodUrl[1].toUpperCase(), methodUrl[2]];
  else if (routeCall) [method, url] = [routeCall[1].toUpperCase(), routeCall[2]];
  else if (requestCall) {
    url = requestCall[1];
    const axiosMethod = line.match(/axios\.(get|post|put|patch|delete)/i);
    if (axiosMethod) method = axiosMethod[1].toUpperCase();
  } else if (urlFirst) url = urlFirst[1];
  if (!url) return null;

  const optionMethod = line.match(/method\s*:\s*["'`](GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)["'`]/i);
  if (optionMethod) method = optionMethod[1].toUpperCase();
  const status = line.match(/(?:\s|status[=: ]+)([1-5]\d{2})(?=\s|$|[,;}])/i);
  const latency = line.match(/(\d+(?:\.\d+)?)\s*ms\b/i);
  return {
    method: method || "GET",
    path: cleanUrl(url),
    normalized: normalizePath(url),
    status: status ? Number(status[1]) : null,
    latency: latency ? Number(latency[1]) : null,
  };
}
