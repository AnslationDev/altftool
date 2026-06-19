const criteriaKey = "tripnest.search.criteria";
const resultsKey = "tripnest.search.results";
const selectedKey = "tripnest.search.selected";

function isBrowser() {
  return typeof window !== "undefined";
}

function serializeCriteria(criteria) {
  return {
    ...criteria,
    departureDate: criteria.departureDate.toISOString(),
    returnDate: criteria.returnDate ? criteria.returnDate.toISOString() : null,
  };
}

function parseCriteria(criteria) {
  return {
    ...criteria,
    departureDate: new Date(criteria.departureDate),
    returnDate: criteria.returnDate ? new Date(criteria.returnDate) : null,
  };
}

export function saveSearchCriteria(criteria) {
  if (!isBrowser()) return;
  sessionStorage.setItem(criteriaKey, JSON.stringify(serializeCriteria(criteria)));
  sessionStorage.removeItem(resultsKey);
  sessionStorage.removeItem(selectedKey);
}

export function loadSearchCriteria() {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(criteriaKey);
  if (!raw) return null;
  try {
    return parseCriteria(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSearchResults(results) {
  if (!isBrowser()) return;
  sessionStorage.setItem(resultsKey, JSON.stringify(results));
}

export function loadSearchResults() {
  if (!isBrowser()) return [];
  const raw = sessionStorage.getItem(resultsKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSelectedTravel(result) {
  if (!isBrowser()) return;
  sessionStorage.setItem(selectedKey, JSON.stringify(result));
}

export function loadSelectedTravel() {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(selectedKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
