import { SKILL_SALARY_MAP } from './skillSalaryMap.js';

/**
 * Validate if a given skill is a valid/recognized skill
 * @param {string} skill - The skill to validate
 * @returns {object} - { isValid: boolean, closestMatch?: string, suggestedSkills?: [] }
 */
export function validateSkill(skill) {
  const skillLower = skill.toLowerCase().trim();

  if (!skillLower) {
    return {
      isValid: false,
      message: "Please enter a skill to analyze.",
    };
  }

  // Exact match
  if (SKILL_SALARY_MAP[skillLower]) {
    return {
      isValid: true,
      skill: skillLower,
    };
  }

  // Case-insensitive exact match
  const exactMatch = Object.keys(SKILL_SALARY_MAP).find(
    (key) => key.toLowerCase() === skillLower
  );
  if (exactMatch) {
    return {
      isValid: true,
      skill: exactMatch,
    };
  }

  // Partial match - find skills that contain or are contained in the input
  const partialMatches = Object.keys(SKILL_SALARY_MAP).filter(
    (mappedSkill) =>
      skillLower.includes(mappedSkill) || mappedSkill.includes(skillLower)
  );

  if (partialMatches.length > 0) {
    return {
      isValid: true,
      skill: partialMatches[0], // Return the first match
      matchType: 'partial',
      suggestedSkills: partialMatches.slice(0, 5),
    };
  }

  // Find similar skills (for suggestions)
  const suggestions = findSimilarSkills(skillLower, 3);

  // Permissive Match: If not in our map but looks like a valid search term, allow it
  // This ensures the tool works for new or unmapped skills using real-time API data
  const isJustSpecialChars = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(skillLower);

  if (skillLower.length > 0 && !isJustSpecialChars) {
    return {
      isValid: true,
      skill: skillLower,
      matchType: 'permissive'
    };
  }

  return {
    isValid: false,
    skill: skillLower,
    message: `"${skill}" is not recognized as a valid skill.`,
    suggestedSkills: suggestions,
  };
}

/**
 * Find similar skills based on edit distance (Levenshtein)
 * @param {string} input - The input skill
 * @param {number} limit - Number of suggestions to return
 * @returns {array} - Array of similar skills
 */
function findSimilarSkills(input, limit = 3) {
  const allSkills = Object.keys(SKILL_SALARY_MAP);
  const distances = allSkills
    .map((skill) => ({
      skill,
      distance: levenshteinDistance(input, skill),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return distances.map((item) => item.skill);
}

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = more similar
 */
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Get all valid skills
 */
export function getAllValidSkills() {
  return Object.keys(SKILL_SALARY_MAP);
}

// Simple hardcoded categories for related skills
const SKILL_CLUSTERS = [
  ['react', 'vue', 'angular', 'javascript', 'typescript', 'next.js', 'html', 'css'],
  ['python', 'data science', 'machine learning', 'ai', 'sql', 'pandas', 'tensorflow'],
  ['java', 'spring', 'spring boot', 'kotlin', 'android', 'hibernate'],
  ['node.js', 'express', 'nestjs', 'javascript', 'typescript', 'mongodb'],
  ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'cloud', 'devops'],
  ['c#', '.net', 'unity', 'azure', 'sql server'],
  ['php', 'laravel', 'wordpress', 'mysql', 'javascript'],
  ['ruby', 'ruby on rails', 'postgresql', 'redis'],
  ['go', 'kubernetes', 'docker', 'grpc', 'microservices'],
  ['swift', 'ios', 'objective-c', 'mobile development'],
  ['flutter', 'dart', 'react native', 'mobile development'],
  ['c', 'c++', 'cpp', 'embedded', 'systems programming', 'low-level']
];

/**
 * Get related skills for a given skill
 */
export function getRelatedSkills(skill, limit = 4) {
  const skillLower = skill.toLowerCase();

  // Find which clusters this skill belongs to
  const matchingClusters = SKILL_CLUSTERS.filter(cluster =>
    cluster.some(s => s === skillLower || s.includes(skillLower) || skillLower.includes(s))
  );

  let related = new Set();

  if (matchingClusters.length > 0) {
    // Add skills from matching clusters
    matchingClusters.forEach(cluster => {
      cluster.forEach(s => {
        if (s !== skillLower && !skillLower.includes(s) && !s.includes(skillLower)) {
          related.add(s);
        }
      });
    });
  } else {
    // Fallback: just return random skills or similar spelled ones
    findSimilarSkills(skillLower, 10).forEach(s => related.add(s));
  }

  return Array.from(related).slice(0, limit);
}
