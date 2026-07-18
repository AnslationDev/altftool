/**
 * ChatBot Knowledge Configuration
 * 
 * This file is the single source of truth for the ChatBot.
 * It is now fully dynamic and fetches data from Firebase (Admin Portal).
 */

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";

// Helper for fetching collections
const fetchCollection = async (path) => {
    try {
        return await getCachedFirebaseRead(`chatbot:collection:${path}`, async () => {
            const colRef = collection(db, ...path.split('/'));
            const snap = await getDocs(colRef);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }, 120000);
    } catch (e) {
        console.error(`AltFBot: Error fetching collection ${path}:`, e);
        return [];
    }
};

// Helper for fetching documents with arrays
const fetchDocument = async (path, field) => {
    try {
        return await getCachedFirebaseRead(`chatbot:doc:${path}:${field}`, async () => {
            const docRef = doc(db, ...path.split('/'));
            const snap = await getDoc(docRef);
            if (!snap.exists()) {
                console.warn(`[AltFBot] Document ${path} does not exist.`);
                return [];
            }
            const data = snap.data()[field];
            if (!Array.isArray(data)) {
                console.warn(`[AltFBot] Field '${field}' in ${path} is not an array or is missing. Value:`, data);
                return [];
            }
            return data;
        }, 120000);
    } catch (e) {
        console.error(`AltFBot: Error fetching document ${path}:`, e);
        return [];
    }
};

// 1. Static Routes (Pages directly accessible)
export const staticRoutes = [
    { id: 'academy', name: 'Academy', description: 'Educational resources, tutorials, and courses.', path: '/academy', type: 'page', keywords: ['learn', 'course', 'education', 'academy'] },
    { id: 'blogs', name: 'Blogs & Articles', description: 'Guides, tips, and news articles about tech and tools.', path: '/blogs', type: 'page', keywords: ['read', 'blog', 'article', 'news'] },
    { id: 'buysmart', name: 'BuySmart', description: 'Your ultimate shopping assistant and curated deals finder.', path: '/buysmart', type: 'page', keywords: ['shopping', 'deals', 'buy', 'smart', 'products'] },
    { id: 'search', name: 'Search Hub', description: 'Search across the entire platform for tools, extensions, and content.', path: '/search', type: 'page', keywords: ['search', 'find', 'hub', 'locate'] },
    { id: 'desktop', name: 'Desktop Softwares', description: 'Downloadable tools and software for Windows/Mac.', path: '/desktop', type: 'page', keywords: ['download', 'software', 'desktop', 'mac', 'windows'] },
    { id: 'exclusivedeals', name: 'Exclusive Deals', description: 'Special offers, coupons, and software discounts.', path: '/exclusivedeals', type: 'page', keywords: ['discount', 'offer', 'deal', 'cheap', 'coupon', 'exclusive'] },
    { id: 'news', name: 'Latest News', description: 'Platform updates and global tech news.', path: '/news', type: 'page', keywords: ['latest', 'update', 'tech news'] },
    { id: 'sale', name: 'Sale Locator', description: 'Find ongoing sales, Black Friday deals, and seasonal offers.', path: '/sale', type: 'page', keywords: ['sale', 'locator', 'find', 'black friday'] },
    { id: 'trendingvids', name: 'Trending Videos', description: 'Popular, viral, and trending video content.', path: '/trendingvids', type: 'page', keywords: ['video', 'watch', 'trending', 'viral'] },
    { id: 'supportsetting', name: 'Setting Support', description: 'Get help, support, and documentation for platform settings.', path: '/supportsetting', type: 'page', keywords: ['support', 'help', 'settings', 'assistance'] },
    { id: 'brandrating', name: 'Brand Ratings & Reviews', description: 'Compare products, read reviews, and find the best brands before you buy.', path: '/brandrating', type: 'page', keywords: ['brand', 'rating', 'review', 'compare', 'product', 'best'] },
    { id: 'about', name: 'About Us', description: 'Learn more about AltFTool and our mission.', path: '/policypages/about', type: 'page', keywords: ['about', 'mission', 'team', 'who we are'] },
    { id: 'contact', name: 'Contact Us', description: 'Get in touch for business or support inquiries.', path: '/policypages/contact', type: 'page', keywords: ['contact', 'email', 'reach out', 'support'] },
    { id: 'disclaimer', name: 'Disclaimer', description: 'Read our platform disclaimer and liability information.', path: '/policypages/disclaimer', type: 'page', keywords: ['disclaimer', 'legal', 'liability'] },
    { id: 'privacy', name: 'Privacy Policy', description: 'Learn how we collect, use, and protect your personal data.', path: '/policypages/privacy', type: 'page', keywords: ['privacy', 'data', 'policy', 'protection'] },
    { id: 'affiliate', name: 'Affiliate Policy', description: 'Read our policies regarding affiliate links and partnerships.', path: '/policypages/affiliate', type: 'page', keywords: ['affiliate', 'partnerships', 'policy', 'links'] },
    { id: 'cookie', name: 'Cookie Policy', description: 'Information on how we use cookies to improve your experience.', path: '/policypages/cookie', type: 'page', keywords: ['cookie', 'tracking', 'policy', 'data'] },
    { id: 'termsandconditions', name: 'Terms & Conditions', description: 'The rules, terms, and conditions for using AltFTool.', path: '/policypages/termsandconditions', type: 'page', keywords: ['terms', 'conditions', 'rules', 'legal', 'tos'] }
];

/// 2. Dynamic Sources (Extensible Databases)
// Format dictates an async loader that returns an array of structured objects.
export const dynamicSources = [
    // --- JS Registries ---
    {
        name: 'Tools Registry',
        load: async () => {
            const { toolMetaMap } = await import('@/platform/registry/toolMetaMap');
            return Object.entries(toolMetaMap).map(([slug, data]) => ({
                id: slug,
                type: 'tool',
                name: data.name,
                description: data.description,
                path: `/tools/all/${slug}`,
                keywords: [...(Array.isArray(data.category) ? data.category : [data.category]).map(c => c?.toLowerCase()), 'tool', slug]
            }));
        }
    },
    {
        name: 'Extensions Registry',
        load: async () => {
            const extensions = await fetchCollection('projects/altftool/extensions');
            return extensions.map(data => ({
                id: data.id,
                type: 'extension',
                name: data.name,
                description: data.description,
                path: `/extensions/${data.id}`,
                keywords: [data.category?.toLowerCase(), 'extension', 'chrome', data.id]
            }));
        }
    }
];
