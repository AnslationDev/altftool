/** Let plain `node --test` load the JSON module that Next handles natively. */
export async function load(url, context, nextLoad) {
  if (url.endsWith("/blogs.json")) {
    return nextLoad(url, {
      ...context,
      importAttributes: { ...context.importAttributes, type: "json" },
    });
  }
  return nextLoad(url, context);
}
