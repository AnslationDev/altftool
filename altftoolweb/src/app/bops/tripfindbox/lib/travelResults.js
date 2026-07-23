function toApiDate(date) {
  return date.toISOString().slice(0, 10);
}

export async function searchTravelResults(criteria) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch("/bops/tripfindbox/api/travel/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        tripType: criteria.tripType,
        from: criteria.from,
        to: criteria.to,
        departureDate: toApiDate(criteria.departureDate),
        returnDate: criteria.returnDate ? toApiDate(criteria.returnDate) : null,
        travelers: criteria.travelers,
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      return payload.results ?? [];
    }
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeout);
  }

  return [];
}
