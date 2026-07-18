import { staticRoutes, dynamicSources } from './knowledgeConfig';

class ChatbotSearchEngine {
    // Hoist stop words as a class-level constant to avoid re-creation on every search
    static STOP_WORDS = new Set(['a', 'an', 'the', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'with', 'what', 'how', 'why', 'where', 'when', 'who', 'i', 'need', 'want', 'show', 'me', 'some', 'any', 'can', 'you']);

    constructor() {
        this.knowledgeBase = [];
        this.isHydrated = false;
        
        // Push initial static routes instantly
        this.knowledgeBase.push(...staticRoutes);
    }

    async hydrate() {
        if (this.isHydrated) return; // Only hydrate once per session

        try {
            // Process all dynamic sources defined in knowledgeConfig
            const loaders = dynamicSources.map(source => 
                source.load()
                    .then(items => {
                        if (items && Array.isArray(items)) {
                            this.knowledgeBase.push(...items);
                        }
                    })
                    .catch(err => console.warn(`Failed to load source: ${source.name}`, err))
            );

            await Promise.allSettled(loaders);

            this.isHydrated = true;
        } catch (error) {
            console.error("AltFBot SearchEngine Hydration Failed:", error);
            this.isHydrated = true; // Mark as hydrated to prevent infinite retries
        }
    }

    search(query) {
        if (!query) return [];
        const normalizedQuery = query.toLowerCase().trim();

        const words = normalizedQuery.split(/\s+/).filter(w => w.length > 1 && !ChatbotSearchEngine.STOP_WORDS.has(w));

        return this.knowledgeBase
            .map(item => {
                let score = 0;
                const name = (item.name || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();

                // 1. Exact Name Match
                if (name === normalizedQuery) score += 100;

                // 2. Contains normalized query
                if (name.includes(normalizedQuery)) score += 50;

                // 3. Individual crucial word matches
                words.forEach(word => {
                    if (name.includes(word)) score += 20;
                    if (desc.includes(word)) score += 5;
                    if (item.keywords && item.keywords.some(kw => kw && (kw.toLowerCase().includes(word) || word.includes(kw.toLowerCase())))) score += 10;
                });

                // 4. Exact Type matching enhancements
                if (normalizedQuery.includes("extension") && item.type === "extension") score += 50;
                if (normalizedQuery.includes("deal") && item.type === "deal") score += 50;
                if ((normalizedQuery.includes("shop") || normalizedQuery.includes("store") || normalizedQuery.includes("buy")) && (item.type === "store" || item.type === "category" || item.id === "buysmart")) score += 30;
                if ((normalizedQuery.includes("rating") || normalizedQuery.includes("review") || normalizedQuery.includes("brand")) && (item.type === "rating" || item.id === "brandrating")) score += 50;
                if ((normalizedQuery.includes("course") || normalizedQuery.includes("learn") || normalizedQuery.includes("academy")) && (item.type === "course" || item.id === "academy")) score += 40;
                
                if (item.type && item.type === normalizedQuery.replace(/s$/, '')) score += 30;

                return { ...item, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Return top 5 matches
    }

    // Static Template Responses based on matches
    async getResponse(query) {
        // Ensure hydration is complete first
        if (!this.isHydrated) {
             await this.hydrate();
        }

        const matches = this.search(query);

        if (matches.length === 0) {
            return {
                text: "I searched everything on AltFTool but couldn't find exactly what you're looking for! You can try exploring our **Tools**, checking out the newest **Exclusive Deals**, or reading our **Blogs**.",
                suggestions: ['Find a tool', 'Exclusive Deals', 'Read Blogs'],
                links: []
            };
        }

        const top = matches[0];
        
        // Conversational templates
        const templates = [
            `I found what you need! Check out **${top.name}**. It's a ${top.type} that ${top.description.toLowerCase()}`,
            `Here is the best match for your search: **${top.name}**.`,
            `Looking for ${top.type}s? **${top.name}** is exactly what you want! ${top.description}`,
            `I ran a search across our platform and **${top.name}** looks like the perfect fit!`
        ];

        // Randomly select a template to make it feel natural
        let responseText = templates[Math.floor(Math.random() * templates.length)];

        // If there are multiple matches, acknowledge them
        if (matches.length > 1) {
            responseText += `\n\nI also found a few other relevant items you might like below!`;
        }

        return {
            text: responseText,
            links: matches.map(m => ({ name: m.name, path: m.path, type: m.type })),
            // Propose the next 3 items as suggestions to keep the conversation going
            suggestions: matches.slice(1, 4).map(m => m.name).concat(['Search again'])
        };
    }
}

export const agent = new ChatbotSearchEngine();
