const PROXY = "https://proxy.cors.sh/";
const KEY = "temp_30ab0b2006237d8f81f9982b7db77f63";

export const proxyFetch = async (url) => {
  const response = await fetch(PROXY + url, {
    headers: { "x-cors-api-key": KEY },
  });

  if (!response.ok) throw new Error("Failed to fetch");

  return response.json();
};
