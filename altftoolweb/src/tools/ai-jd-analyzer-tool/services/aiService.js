// AI Service - Hugging Face API integration through the server-only proxy.
const HF_PROXY_URL = '/api/tools/ai-jd-analyzer';

// Using different models for different tasks
const MODELS = {
    textGeneration: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    ner: 'dslim/bert-base-NER',
    zeroShot: 'facebook/bart-large-mnli'
};

// Helper function to query HuggingFace
const queryHuggingFace = async (model, payload) => {
    const response = await fetch(HF_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, payload })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.error || 'Hugging Face API error');
    }

    return result;
};

// Extract skills using NER model
const extractSkillsWithNER = async (text) => {
    try {
        const result = await queryHuggingFace(MODELS.ner, {
            inputs: text
        });

        // Extract unique entities
        const skills = new Set();
        result.forEach(entity => {
            if (entity.entity_group === 'MISC' || entity.entity_group === 'ORG') {
                skills.add(entity.word.replace('##', ''));
            }
        });

        return Array.from(skills).slice(0, 10);
    } catch (error) {
        console.warn('NER extraction failed, using fallback');
        return extractSkillsFallback(text);
    }
};

// Fallback skill extraction
const extractSkillsFallback = (text) => {
    const skillPatterns = [
        'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'TypeScript',
        'AWS', 'Docker', 'Kubernetes', 'Git', 'SQL', 'MongoDB',
        'REST API', 'GraphQL', 'Machine Learning', 'CI/CD', 'Agile',
        'HTML', 'CSS', 'Redux', 'Express', 'Spring Boot', 'Angular',
        'Vue', 'PostgreSQL', 'Redis', 'Jenkins', 'TensorFlow'
    ];

    return skillPatterns.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 8);
};

// Classify seniority using zero-shot classification
const classifySeniority = async (text) => {
    try {
        const result = await queryHuggingFace(MODELS.zeroShot, {
            inputs: text.substring(0, 512), // Limit text length
            parameters: {
                candidate_labels: ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal']
            }
        });

        return result.labels[0];
    } catch (error) {
        console.warn('Classification failed, using fallback');
        const lowerText = text.toLowerCase();
        if (lowerText.includes('senior') || lowerText.includes('lead')) return 'Senior';
        if (lowerText.includes('junior') || lowerText.includes('entry')) return 'Junior';
        return 'Mid-level';
    }
};

// Main analysis using text generation model
const analyzeWithLLM = async (jdText) => {
    const prompt = `<s>[INST] You are an expert HR analyst. Analyze this job description and provide a structured analysis.

Job Description:
${jdText}

Provide analysis in this JSON format:
{
  "roleTitle": "extracted job title",
  "employmentType": "Full-time/Part-time/Contract",
  "location": "location or Remote",
  "experienceYears": "X+ years",
  "responsibilities": ["resp1", "resp2", "resp3"],
  "qualifications": ["qual1", "qual2", "qual3"],
  "readabilityScore": 0-100,
  "inclusivityScore": 0-100,
  "clarityScore": 0-100,
  "marketFitScore": 0-100,
  "qualityIssues": [
    {"severity": "error/warning/info", "category": "category", "message": "message", "suggestion": "suggestion"}
  ],
  "alternativeTitles": ["title1", "title2"],
  "salaryBand": "estimated range",
  "improvementTips": ["tip1", "tip2", "tip3"],
  "rewrittenJD": "improved version"
}

Return only valid JSON, no extra text. [/INST]`;

    try {
        const result = await queryHuggingFace(MODELS.textGeneration, {
            inputs: prompt,
            parameters: {
                max_new_tokens: 2000,
                temperature: 0.7,
                return_full_text: false
            }
        });

        let responseText = result[0].generated_text;

        // Clean the response
        responseText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Find JSON in response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('No valid JSON in response');
    } catch (error) {
        console.warn('LLM analysis failed:', error);
        return null;
    }
};

// Rule-based extraction functions
const extractBasicInfo = (text) => {
    const lines = text.split('\n').filter(line => line.trim());

    // Extract title (usually first line)
    const roleTitle = lines[0]?.trim() || 'Software Engineer';

    // Extract experience
    const expMatch = text.match(/(\d+)\+?\s*(year|yr|years)/i);
    const experienceYears = expMatch ? `${expMatch[1]}+ years` : '2-3 years';

    // Extract employment type
    const lowerText = text.toLowerCase();
    let employmentType = 'Full-time';
    if (lowerText.includes('part-time') || lowerText.includes('part time')) employmentType = 'Part-time';
    if (lowerText.includes('contract')) employmentType = 'Contract';
    if (lowerText.includes('intern')) employmentType = 'Internship';

    // Extract location
    const locationMatch = text.match(/(?:location|located|based):\s*([^\n]+)/i);
    let location = 'Not specified';
    if (locationMatch) location = locationMatch[1].trim();
    else if (lowerText.includes('remote')) location = 'Remote';
    else if (lowerText.includes('hybrid')) location = 'Hybrid';

    return { roleTitle, experienceYears, employmentType, location };
};

const extractResponsibilities = (text) => {
    const responsibilities = [];
    const lines = text.split('\n');
    let inSection = false;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().includes('responsibilit') || trimmed.toLowerCase().includes('duties')) {
            inSection = true;
            continue;
        }
        if (inSection && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./))) {
            responsibilities.push(trimmed.replace(/^[•\-\d.]+\s*/, ''));
        }
        if (inSection && (trimmed.toLowerCase().includes('qualification') || trimmed.toLowerCase().includes('requirement'))) {
            break;
        }
    }

    return responsibilities.length > 0 ? responsibilities : [
        'Design and develop software solutions',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews'
    ];
};

const extractQualifications = (text) => {
    const qualifications = [];
    const lines = text.split('\n');
    let inSection = false;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().includes('qualification') ||
            trimmed.toLowerCase().includes('requirement') ||
            trimmed.toLowerCase().includes('must have')) {
            inSection = true;
            continue;
        }
        if (inSection && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./))) {
            qualifications.push(trimmed.replace(/^[•\-\d.]+\s*/, ''));
        }
    }

    return qualifications.length > 0 ? qualifications : [
        'Bachelor\'s degree in Computer Science or related field',
        'Strong problem-solving skills',
        'Excellent communication skills',
        'Team player with attention to detail'
    ];
};

// Calculate scores
const calculateScores = (text, qualityIssues) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Readability (based on sentence length)
    let readability = 90;
    if (avgWordsPerSentence > 25) readability = 50;
    else if (avgWordsPerSentence > 20) readability = 70;

    // Inclusivity (check for biased language)
    const lowerText = text.toLowerCase();
    let inclusivity = 100;
    const genderedTerms = ['he ', 'she ', 'his ', 'her ', 'guys', 'ninja', 'rockstar'];
    genderedTerms.forEach(term => {
        if (lowerText.includes(term)) inclusivity -= 15;
    });

    // Clarity (check for vague terms)
    let clarity = 100;
    const vagueTerms = ['etc', 'various', 'multiple', 'good understanding', 'familiar with'];
    vagueTerms.forEach(term => {
        if (lowerText.includes(term)) clarity -= 10;
    });

    // Market fit (based on modern skills presence)
    let marketFit = 60;
    const modernTerms = ['remote', 'agile', 'ci/cd', 'cloud', 'api', 'modern', 'collaborative'];
    modernTerms.forEach(term => {
        if (lowerText.includes(term)) marketFit += 5;
    });
    marketFit = Math.min(marketFit, 95);

    return {
        readability: Math.max(readability, 30),
        inclusivity: Math.max(inclusivity, 0),
        clarity: Math.max(clarity, 30),
        marketFit
    };
};

// Detect quality issues
const detectQualityIssues = (text, extracted) => {
    const flags = [];
    const lowerText = text.toLowerCase();

    // Check for gendered language
    if (lowerText.match(/\b(he|she|his|her)\b/)) {
        flags.push({
            severity: 'error',
            category: 'Inclusivity',
            message: 'Gendered pronouns detected',
            suggestion: 'Use gender-neutral language like "they/their"'
        });
    }

    // Check for age bias
    if (lowerText.includes('young') || lowerText.includes('recent graduate')) {
        flags.push({
            severity: 'warning',
            category: 'Inclusivity',
            message: 'Potential age bias detected',
            suggestion: 'Remove age-related requirements unless legally required'
        });
    }

    // Check for vague terms
    if (lowerText.includes('etc') || lowerText.includes('various')) {
        flags.push({
            severity: 'warning',
            category: 'Clarity',
            message: 'Vague terms found (etc, various)',
            suggestion: 'Be specific about all requirements'
        });
    }

    // Check sentence length
    const sentences = text.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 30).length;
    if (longSentences > 2) {
        flags.push({
            severity: 'warning',
            category: 'Readability',
            message: `${longSentences} sentences are too long`,
            suggestion: 'Break long sentences into shorter ones'
        });
    }

    // Check for missing info
    if (extracted.location === 'Not specified') {
        flags.push({
            severity: 'info',
            category: 'Completeness',
            message: 'Location not specified',
            suggestion: 'Add location or remote/hybrid options'
        });
    }

    return flags;
};

// Generate suggestions
const generateSuggestions = (extracted) => {
    const title = extracted.roleTitle;

    return {
        alternativeTitles: [
            title,
            title.replace('Engineer', 'Developer'),
            title.replace('Developer', 'Engineer'),
            `${extracted.seniority} ${title}`,
            title.split(' ')[0] + ' Specialist'
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),

        salaryBand: extracted.seniority === 'Senior'
            ? '$120,000 - $180,000'
            : extracted.seniority === 'Junior'
                ? '$60,000 - $90,000'
                : '$90,000 - $130,000',

        jobBoardTags: [
            ...extracted.skills.slice(0, 5),
            extracted.seniority,
            extracted.employmentType,
            'Tech',
            'Software'
        ],

        improvementTips: [
            'Add specific metrics or KPIs for success',
            'Include information about team size and structure',
            'Mention growth opportunities and learning budget',
            'Add details about company culture and benefits',
            'Consider adding salary range for transparency',
            'Use bullet points for better readability'
        ]
    };
};

// Generate rewritten JD
const generateRewrittenJD = (extracted) => {
    return `${extracted.roleTitle}

${extracted.seniority} Level | ${extracted.employmentType} | ${extracted.location}

About the Role
We're seeking a talented ${extracted.roleTitle} to join our team. This position requires ${extracted.experienceYears} of experience and offers an opportunity to work with modern technologies in a collaborative environment.

Key Responsibilities
${extracted.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Required Qualifications
${extracted.qualifications.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Technical Skills
${extracted.skills.join(' • ')}

What We Offer
• Competitive salary and benefits
• Professional development opportunities
• Flexible work arrangements
• Collaborative team environment

We are an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.`;
};

// Main analysis function
export const analyzeJobDescription = async (jdText) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('Starting HuggingFace analysis...');
        }

        // Extract basic information
        const basicInfo = extractBasicInfo(jdText);

        // Extract skills (try HF NER, fallback to regex)
        const skills = await extractSkillsWithNER(jdText);

        // Classify seniority (try HF zero-shot, fallback to regex)
        const seniority = await classifySeniority(jdText);

        // Extract responsibilities and qualifications
        const responsibilities = extractResponsibilities(jdText);
        const qualifications = extractQualifications(jdText);

        // Combine extracted data
        const extracted = {
            ...basicInfo,
            seniority,
            skills,
            responsibilities,
            qualifications
        };

        // Try LLM analysis for enhanced results
        const llmAnalysis = await analyzeWithLLM(jdText);

        // If LLM succeeded, merge results
        if (llmAnalysis) {
            extracted.roleTitle = llmAnalysis.roleTitle || extracted.roleTitle;
            extracted.responsibilities = llmAnalysis.responsibilities || extracted.responsibilities;
            extracted.qualifications = llmAnalysis.qualifications || extracted.qualifications;
        }

        // Detect quality issues
        const qualityFlags = detectQualityIssues(jdText, extracted);

        // Calculate scores
        const scores = calculateScores(jdText, qualityFlags);

        // Generate suggestions
        const suggestions = generateSuggestions(extracted);

        // Generate rewritten JD
        const rewrittenJD = generateRewrittenJD(extracted);

        if (process.env.NODE_ENV === 'development') {
            console.log('Analysis completed successfully!');
        }

        return {
            extracted,
            scores,
            qualityFlags,
            suggestions,
            rewrittenJD
        };

    } catch (error) {
        console.error('HuggingFace analysis error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
    }
};

export default {
    analyzeJobDescription
};
