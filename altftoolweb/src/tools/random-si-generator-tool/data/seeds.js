"use client";

// Startup Idea Seeds Database
export const seeds = {
    categories: [
        'SaaS',
        'Marketplace',
        'AI/ML',
        'Fintech',
        'HealthTech',
        'EdTech',
        'Climate',
        'Creator Tools',
        'E-commerce',
        'B2B Tools',
        'Gaming',
        'Social'
    ],

    personas: [
        'independent developers',
        'small retailers',
        'HR managers',
        'college students',
        'remote workers',
        'content creators',
        'freelancers',
        'small business owners',
        'fitness enthusiasts',
        'parents',
        'teachers',
        'designers',
        'researchers',
        'event organizers',
        'real estate agents',
        'restaurant owners'
    ],

    painPoints: [
        'hard to discover niche suppliers',
        'manual invoicing and messy receivables',
        'low-quality hiring pipeline',
        'students struggle finding affordable mentors',
        'content creators can\'t repurpose content easily',
        'difficult to track project time accurately',
        'expensive tools for small teams',
        'no easy way to collect customer feedback',
        'hard to manage remote team collaboration',
        'struggle with inventory management',
        'can\'t automate repetitive tasks',
        'difficult to build online presence',
        'lack of affordable analytics tools',
        'hard to schedule meetings across timezones',
        'struggle with document version control',
        'difficult to find local services'
    ],

    solutions: [
        'AI-powered automation',
        'marketplace platform',
        'no-code workflow builder',
        'mobile-first PWA',
        'blockchain-based verification',
        'subscription management',
        'real-time collaboration tools',
        'smart recommendation engine',
        'automated reporting dashboard',
        'API-first integration platform',
        'white-label solution',
        'community-driven network',
        'gamified learning system',
        'peer-to-peer marketplace',
        'micro-SaaS platform'
    ],

    techStacks: [
        ['React', 'Node.js', 'PostgreSQL'],
        ['Next.js', 'Prisma', 'MongoDB'],
        ['Vue', 'Express', 'Redis'],
        ['React Native', 'Firebase', 'Stripe'],
        ['Python', 'FastAPI', 'SQLite'],
        ['Flutter', 'Supabase', 'AWS'],
        ['Svelte', 'Nest.js', 'MySQL'],
        ['PWA', 'IndexedDB', 'Service Worker'],
        ['React', 'GraphQL', 'PostgreSQL'],
        ['Angular', 'Spring Boot', 'MongoDB']
    ],

    revenueModels: [
        'Subscription (SaaS)',
        'Transaction fee',
        'Freemium + Pro features',
        'Marketplace commission',
        'Ads + Premium',
        'Pay-per-use',
        'White-label licensing',
        'One-time purchase',
        'Affiliate commissions',
        'Enterprise licenses'
    ],

    noveltyModifiers: [
        'with AI',
        'for emerging markets',
        'blockchain-powered',
        'for microbusinesses',
        'mobile-first',
        'voice-enabled',
        'AR/VR integrated',
        'community-driven',
        'gamified',
        'zero-code',
        'API-first',
        'privacy-focused'
    ],

    budgetRanges: [
        '₹1-3L ($1.2k-$3.6k)',
        '₹3-5L ($3.6k-$6k)',
        '₹5-10L ($6k-$12k)',
        '₹10-20L ($12k-$24k)',
        '$5k-$15k',
        '$15k-$50k'
    ],

    timeToMVP: [
        '4 weeks',
        '6-8 weeks',
        '8-12 weeks',
        '3 months',
        '4-6 months'
    ],

    geographies: [
        'India (Tier 2/3 cities)',
        'Southeast Asia',
        'US/Canada',
        'Europe',
        'Latin America',
        'Middle East',
        'Global/Remote-first'
    ],

    tags: [
        'micro-saas',
        'no-code',
        'ai-powered',
        'mobile-first',
        'b2b',
        'b2c',
        'marketplace',
        'automation',
        'analytics',
        'collaboration',
        'productivity',
        'education',
        'health',
        'finance',
        'sustainability',
        'social-impact'
    ]
};

// MVP Steps Templates
export const mvpTemplates = [
    [
        'Build core {feature} with {tech} and basic auth',
        'Launch landing page and onboard 5-10 pilot users',
        'Collect feedback and iterate on UX'
    ],
    [
        'Create MVP with {tech} focusing on {core_feature}',
        'Integrate {revenue} and test with beta users',
        'Measure key metrics and refine product-market fit'
    ],
    [
        'Develop {feature} prototype using {tech}',
        'Add {integration} and basic analytics',
        'Run 30-day pilot with target users'
    ],
    [
        'Build minimal viable {product} with {tech}',
        'Set up {revenue} infrastructure',
        'Launch to 20-50 early adopters and iterate'
    ]
];

// Title templates
export const titleTemplates = [
    '{category} for {persona}',
    '{modifier} {category} Platform',
    '{persona} {category} Solution',
    'Smart {category} for {persona}',
    '{category} Marketplace for {persona}'
];

// Tagline templates
export const taglineTemplates = [
    'Helps {persona} solve {pain} with {solution}',
    'The easiest way for {persona} to {benefit}',
    'Empowering {persona} with {solution}',
    '{solution} designed for {persona}',
    'Transform how {persona} {benefit}'
];