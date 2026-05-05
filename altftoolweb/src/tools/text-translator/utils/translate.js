export async function translateText(text, sourceLang, targetLang) {
  const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const res = await fetch(apiUrl);
  const data = await res.json();

  return data?.[0]?.map((s) => s[0]).join("") || "";
}
