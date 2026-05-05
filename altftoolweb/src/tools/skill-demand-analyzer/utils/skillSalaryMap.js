/**
 * Comprehensive skill-to-salary mapping
 * Based on industry standards, demand, and experience level
 */
export const SKILL_SALARY_MAP = {
  // Frontend Skills
  react: { min: 70000, max: 160000, avg: 115000 },
  'react.js': { min: 70000, max: 160000, avg: 115000 },
  vue: { min: 65000, max: 150000, avg: 107500 },
  'vue.js': { min: 65000, max: 150000, avg: 107500 },
  angular: { min: 72000, max: 165000, avg: 118500 },
  'html': { min: 55000, max: 120000, avg: 87500 },
  'css': { min: 55000, max: 120000, avg: 87500 },
  'javascript': { min: 65000, max: 150000, avg: 107500 },
  'typescript': { min: 70000, max: 155000, avg: 112500 },
  'webgl': { min: 85000, max: 170000, avg: 127500 },
  'canvas': { min: 65000, max: 140000, avg: 102500 },

  // Backend Skills
  python: { min: 80000, max: 180000, avg: 130000 },
  java: { min: 75000, max: 170000, avg: 122500 },
  'c++': { min: 80000, max: 175000, avg: 127500 },
  'cpp': { min: 80000, max: 175000, avg: 127500 },
  'c': { min: 75000, max: 165000, avg: 120000 },
  'c#': { min: 75000, max: 165000, avg: 120000 },
  'csharp': { min: 75000, max: 165000, avg: 120000 },
  'node.js': { min: 70000, max: 155000, avg: 112500 },
  nodejs: { min: 70000, max: 155000, avg: 112500 },
  'php': { min: 60000, max: 140000, avg: 100000 },
  'go': { min: 85000, max: 175000, avg: 130000 },
  golang: { min: 85000, max: 175000, avg: 130000 },
  rust: { min: 90000, max: 185000, avg: 137500 },
  'ruby': { min: 70000, max: 155000, avg: 112500 },
  'ruby on rails': { min: 72000, max: 160000, avg: 116000 },
  'kotlin': { min: 75000, max: 165000, avg: 120000 },
  'swift': { min: 80000, max: 170000, avg: 125000 },

  // Data & ML Skills
  'data science': { min: 90000, max: 200000, avg: 145000 },
  'machine learning': { min: 100000, max: 220000, avg: 160000 },
  'ml': { min: 100000, max: 220000, avg: 160000 },
  'artificial intelligence': { min: 105000, max: 230000, avg: 167500 },
  'ai': { min: 105000, max: 230000, avg: 167500 },
  'deep learning': { min: 105000, max: 225000, avg: 165000 },
  'nlp': { min: 100000, max: 220000, avg: 160000 },
  'computer vision': { min: 100000, max: 220000, avg: 160000 },
  'data analysis': { min: 75000, max: 170000, avg: 122500 },
  'analytics': { min: 70000, max: 160000, avg: 115000 },
  'sql': { min: 65000, max: 150000, avg: 107500 },
  'tableau': { min: 70000, max: 160000, avg: 115000 },
  'power bi': { min: 70000, max: 160000, avg: 115000 },

  // Database Skills
  'mongodb': { min: 75000, max: 165000, avg: 120000 },
  'mysql': { min: 65000, max: 150000, avg: 107500 },
  'postgresql': { min: 70000, max: 160000, avg: 115000 },
  'oracle': { min: 80000, max: 175000, avg: 127500 },
  'firebase': { min: 70000, max: 160000, avg: 115000 },
  'dynamodb': { min: 75000, max: 170000, avg: 122500 },
  'redis': { min: 75000, max: 165000, avg: 120000 },
  'elasticsearch': { min: 80000, max: 175000, avg: 127500 },

  // Cloud & DevOps
  'cloud': { min: 85000, max: 190000, avg: 137500 },
  'devops': { min: 90000, max: 200000, avg: 145000 },
  'aws': { min: 90000, max: 195000, avg: 142500 },
  'azure': { min: 90000, max: 195000, avg: 142500 },
  'gcp': { min: 90000, max: 195000, avg: 142500 },
  'docker': { min: 80000, max: 180000, avg: 130000 },
  'kubernetes': { min: 95000, max: 205000, avg: 150000 },
  'jenkins': { min: 80000, max: 175000, avg: 127500 },
  'terraform': { min: 85000, max: 190000, avg: 137500 },
  'cicd': { min: 85000, max: 190000, avg: 137500 },
  'ci/cd': { min: 85000, max: 190000, avg: 137500 },

  // Mobile Development
  'react native': { min: 75000, max: 165000, avg: 120000 },
  'flutter': { min: 75000, max: 165000, avg: 120000 },
  'android': { min: 75000, max: 170000, avg: 122500 },
  'ios': { min: 80000, max: 175000, avg: 127500 },
  'mobile development': { min: 75000, max: 170000, avg: 122500 },

  // Framework & Library Skills
  'express': { min: 68000, max: 155000, avg: 111500 },
  'fastapi': { min: 80000, max: 175000, avg: 127500 },
  'django': { min: 75000, max: 165000, avg: 120000 },
  'flask': { min: 70000, max: 160000, avg: 115000 },
  'spring': { min: 78000, max: 170000, avg: 124000 },
  'spring boot': { min: 80000, max: 175000, avg: 127500 },
  'nest.js': { min: 72000, max: 160000, avg: 116000 },
  'nestjs': { min: 72000, max: 160000, avg: 116000 },
  'graphql': { min: 75000, max: 170000, avg: 122500 },
  'rest api': { min: 70000, max: 160000, avg: 115000 },
  'next.js': { min: 75000, max: 165000, avg: 120000 },
  'nextjs': { min: 75000, max: 165000, avg: 120000 },

  // Testing & QA
  'testing': { min: 65000, max: 150000, avg: 107500 },
  'qa': { min: 60000, max: 140000, avg: 100000 },
  'selenium': { min: 68000, max: 155000, avg: 111500 },
  'jest': { min: 70000, max: 160000, avg: 115000 },
  'junit': { min: 68000, max: 155000, avg: 111500 },
  'automation testing': { min: 70000, max: 160000, avg: 115000 },

  // Security & Blockchain
  'cybersecurity': { min: 95000, max: 210000, avg: 152500 },
  'security': { min: 90000, max: 200000, avg: 145000 },
  'blockchain': { min: 100000, max: 220000, avg: 160000 },
  'web3': { min: 95000, max: 210000, avg: 152500 },
  'smart contracts': { min: 105000, max: 225000, avg: 165000 },
  'solidity': { min: 100000, max: 220000, avg: 160000 },

  // Other Tech Skills
  'git': { min: 65000, max: 150000, avg: 107500 },
  'linux': { min: 75000, max: 165000, avg: 120000 },
  'unix': { min: 75000, max: 165000, avg: 120000 },
  'shell scripting': { min: 70000, max: 160000, avg: 115000 },
  'bash': { min: 68000, max: 155000, avg: 111500 },
  'scripting': { min: 70000, max: 160000, avg: 115000 },
  'api development': { min: 75000, max: 170000, avg: 122500 },
  'microservices': { min: 85000, max: 190000, avg: 137500 },
  'architecture': { min: 100000, max: 220000, avg: 160000 },
  'software architect': { min: 105000, max: 230000, avg: 167500 },

  // Business & Soft Skills
  'project management': { min: 70000, max: 160000, avg: 115000 },
  'agile': { min: 72000, max: 165000, avg: 118500 },
  'scrum': { min: 70000, max: 160000, avg: 115000 },
  'communication': { min: 65000, max: 150000, avg: 107500 },
  'leadership': { min: 85000, max: 180000, avg: 132500 },
  'management': { min: 85000, max: 190000, avg: 137500 },

  // Non-Tech / General Business Skills
  'hr': { min: 45000, max: 120000, avg: 82500 },
  'human resources': { min: 45000, max: 120000, avg: 82500 },
  'recruitment': { min: 50000, max: 130000, avg: 90000 },
  'hr manager': { min: 65000, max: 150000, avg: 107500 },
  'hr executive': { min: 50000, max: 130000, avg: 90000 },
  'marketing': { min: 55000, max: 140000, avg: 97500 },
  'digital marketing': { min: 60000, max: 150000, avg: 105000 },
  'marketing manager': { min: 75000, max: 170000, avg: 122500 },
  'sales': { min: 50000, max: 135000, avg: 92500 },
  'sales executive': { min: 50000, max: 130000, avg: 90000 },
  'sales manager': { min: 70000, max: 160000, avg: 115000 },
  'business analyst': { min: 60000, max: 145000, avg: 102500 },
  'data analyst': { min: 65000, max: 155000, avg: 110000 },
  'systems analyst': { min: 70000, max: 160000, avg: 115000 },
  'analyst': { min: 60000, max: 145000, avg: 102500 },
  'finance': { min: 65000, max: 160000, avg: 112500 },
  'finance manager': { min: 80000, max: 190000, avg: 135000 },
  'accountant': { min: 45000, max: 120000, avg: 82500 },
  'accounts manager': { min: 65000, max: 155000, avg: 110000 },
  'accounting': { min: 45000, max: 120000, avg: 82500 },
  'clerk': { min: 30000, max: 80000, avg: 55000 },
  'office clerk': { min: 30000, max: 80000, avg: 55000 },
  'administrative': { min: 35000, max: 90000, avg: 62500 },
  'admin': { min: 35000, max: 90000, avg: 62500 },
  'executive assistant': { min: 45000, max: 120000, avg: 82500 },
  'customer service': { min: 35000, max: 90000, avg: 62500 },
  'customer support': { min: 35000, max: 90000, avg: 62500 },
  'customer care': { min: 35000, max: 90000, avg: 62500 },
  'bpo': { min: 30000, max: 85000, avg: 57500 },
  'call center': { min: 30000, max: 85000, avg: 57500 },
  'content writing': { min: 40000, max: 110000, avg: 75000 },
  'copywriting': { min: 45000, max: 120000, avg: 82500 },
  'seo': { min: 50000, max: 130000, avg: 90000 },
  'graphic design': { min: 50000, max: 130000, avg: 90000 },
  'designer': { min: 50000, max: 130000, avg: 90000 },
  'ui designer': { min: 55000, max: 140000, avg: 97500 },
  'ux designer': { min: 60000, max: 145000, avg: 102500 },
  'brand management': { min: 65000, max: 155000, avg: 110000 },
  'product manager': { min: 80000, max: 190000, avg: 135000 },
  'operations': { min: 60000, max: 145000, avg: 102500 },
  'supply chain': { min: 65000, max: 155000, avg: 110000 },
  'logistics': { min: 55000, max: 140000, avg: 97500 },
  'procurement': { min: 60000, max: 145000, avg: 102500 },
  'teaching': { min: 35000, max: 95000, avg: 65000 },
  'teacher': { min: 35000, max: 95000, avg: 65000 },
  'education': { min: 40000, max: 110000, avg: 75000 },
  'training': { min: 50000, max: 130000, avg: 90000 },
  'consulting': { min: 75000, max: 180000, avg: 127500 },
  'consultant': { min: 75000, max: 180000, avg: 127500 },
  'legal': { min: 70000, max: 200000, avg: 135000 },
  'compliance': { min: 65000, max: 155000, avg: 110000 },
  'audit': { min: 60000, max: 145000, avg: 102500 },
  'audit manager': { min: 75000, max: 175000, avg: 125000 },
};

/**
 * Get salary data for a skill with advanced matching
 * Handles exact matches, partial matches, and category-based estimates
 */
export function getSkillSalary(skill) {
  const skillLower = skill.toLowerCase().trim();

  // Exact match
  if (SKILL_SALARY_MAP[skillLower]) {
    return SKILL_SALARY_MAP[skillLower];
  }

  // Partial match - check if any mapped skill is contained in or contains the input
  for (const [mappedSkill, salary] of Object.entries(SKILL_SALARY_MAP)) {
    if (skillLower.includes(mappedSkill) || mappedSkill.includes(skillLower)) {
      return salary;
    }
  }

  // Category-based estimation
  const categories = {
    'frontend': { min: 65000, max: 155000, avg: 110000 },
    'backend': { min: 75000, max: 170000, avg: 122500 },
    'fullstack': { min: 80000, max: 175000, avg: 127500 },
    'full stack': { min: 80000, max: 175000, avg: 127500 },
    'data': { min: 85000, max: 190000, avg: 137500 },
    'ml': { min: 100000, max: 220000, avg: 160000 },
    'ai': { min: 100000, max: 220000, avg: 160000 },
    'cloud': { min: 85000, max: 190000, avg: 137500 },
    'devops': { min: 90000, max: 200000, avg: 145000 },
    'database': { min: 75000, max: 165000, avg: 120000 },
    'security': { min: 90000, max: 200000, avg: 145000 },
    'mobile': { min: 75000, max: 165000, avg: 120000 },
  };

  for (const [category, salary] of Object.entries(categories)) {
    if (skillLower.includes(category)) {
      return salary;
    }
  }

  // Tech-related default
  if (skillLower.match(/tech|developer|developer|engineer|programmer|programming|coding|code/i)) {
    return { min: 70000, max: 165000, avg: 117500 };
  }

  // Fallback default
  return { min: 60000, max: 140000, avg: 100000 };
}