import DESTINATIONS from "./destinations";

function scoreDestination(dest, preferences) {
  let score = 0;
  let maxScore = 0;

  if (preferences.budget) {
    maxScore += 3;
    if (dest.budget.includes(preferences.budget)) {
      score += 3;
    } else if (
      preferences.budget === "budget" &&
      dest.budget.includes("moderate")
    ) {
      score += 1.5;
    } else if (
      preferences.budget === "luxury" &&
      dest.budget.includes("moderate")
    ) {
      score += 1.5;
    }
  }

  if (preferences.climate) {
    maxScore += 3;
    if (dest.climate.includes(preferences.climate)) {
      score += 3;
    } else if (dest.climate.length > 0) {
      score += 1;
    }
  }

  if (preferences.activity) {
    maxScore += 3;
    if (dest.activity.includes(preferences.activity)) {
      score += 3;
    } else {
      const partial = dest.activity.filter(
        (a) =>
          a === preferences.activity ||
          (preferences.activity === "beach" && a === "nature") ||
          (preferences.activity === "nature" && a === "adventure") ||
          (preferences.activity === "culture" && a === "food") ||
          (preferences.activity === "food" && a === "culture") ||
          (preferences.activity === "urban" && a === "culture")
      );
      if (partial.length > 0) score += 1.5;
    }
  }

  if (preferences.travelStyle) {
    maxScore += 2;
    if (dest.travelStyle.includes(preferences.travelStyle)) {
      score += 2;
    } else if (preferences.travelStyle === "family") {
      if (dest.travelStyle.includes("group")) score += 1;
    } else if (preferences.travelStyle === "group") {
      if (dest.travelStyle.includes("family")) score += 1;
    }
  }

  if (preferences.season) {
    maxScore += 2;
    if (dest.season.includes(preferences.season)) {
      score += 2;
    }
  }

  if (preferences.duration) {
    maxScore += 2;
    if (dest.duration.includes(preferences.duration)) {
      score += 2;
    } else if (dest.duration.length > 0) {
      const durOrder = ["weekend", "week", "twoWeeks", "month"];
      const prefIdx = durOrder.indexOf(preferences.duration);
      const fits = dest.duration.some((d) => {
        const dIdx = durOrder.indexOf(d);
        if (prefIdx <= 1 && dIdx <= 2) return true;
        if (prefIdx >= 2 && dIdx >= 1) return true;
        return false;
      });
      if (fits) score += 1;
    }
  }

  if (preferences.continent && preferences.continent !== "any") {
    maxScore += 3;
    if (dest.continent === preferences.continent) {
      score += 3;
    }
  } else {
    maxScore += 0;
  }

  if (maxScore === 0) return { ...dest, score: 0 };

  return { ...dest, score: score / maxScore };
}

export function findDestinations(preferences) {
  const scored = DESTINATIONS.map((d) => scoreDestination(d, preferences));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function getRandomDestination(usedIds = []) {
  const available = DESTINATIONS.filter((d) => !usedIds.includes(d.name));
  if (available.length === 0) return DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function getDestinationByName(name) {
  return DESTINATIONS.find((d) => d.name === name) || null;
}

export function getDestinationsByContinent(continent) {
  return DESTINATIONS.filter((d) => d.continent === continent);
}

export function getDestinationsByActivity(activity) {
  return DESTINATIONS.filter((d) => d.activity.includes(activity));
}

export function getAllDestinations() {
  return DESTINATIONS;
}
