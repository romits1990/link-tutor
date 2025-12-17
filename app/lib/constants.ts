export const KNOWLEDGE_DEPTHS = ['basic', 'advanced', 'expert'] as const;

export const KNOWLEDGE_DEPTH_CRAWL_CONFIG: Record<typeof KNOWLEDGE_DEPTHS[number], { MAX_DEPTH: number; MAX_PAGES: number; ROBOTS_CACHE_TTL_MS?: number }> = {
    basic: { MAX_DEPTH: 1, MAX_PAGES: 1, ROBOTS_CACHE_TTL_MS: 1 * 60 * 60 * 1000 },
    advanced: { MAX_DEPTH: 5, MAX_PAGES: 5, ROBOTS_CACHE_TTL_MS: 5 * 60 * 60 * 1000 },
    expert: { MAX_DEPTH: 10, MAX_PAGES: 10, ROBOTS_CACHE_TTL_MS: 24 * 60 * 60 * 1000 },
};