export async function loadToolModule(slug) {
  return import(`@/tools/${slug}/entry`);
}
