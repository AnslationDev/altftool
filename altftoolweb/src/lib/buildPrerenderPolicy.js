export function shouldDeferBulkPrerendering() {
  return process.env.ALTFT_DEFER_BULK_PRERENDER === "true";
}
