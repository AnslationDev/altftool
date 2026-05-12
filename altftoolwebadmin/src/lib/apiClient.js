export async function readApiJson(response, fallbackMessage = "Request failed") {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || fallbackMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
