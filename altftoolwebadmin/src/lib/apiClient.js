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

export function getErrorMessage(error, fallbackMessage = "Something went wrong") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error?.message) return String(error.message);
  if (error?.code) return String(error.code);
  return fallbackMessage;
}
