import React from 'react'
import styles from './page.module.css'

const CATEGORIES = [
  'All Categories',
  'Image Generators',
  'Video Editing',
  'AI Chat & Assistant',
  'Code Assistant',
  'Writing & SEO',
  'Audio Editing',
  'Business Tools',
  'Design Tools',
  'Education',
  'Marketing',
  'Productivity'
]

const PRICING_FILTERS = ['Verified', 'Free', 'Freemium', 'Paid', 'Free Trial']

const MOCK_TOOLS = [
  {
    id: 1,
    name: 'ChatGPT',
    icon: '🤖',
    description: 'Advanced AI assistant powered by GPT-4 for conversations, writing, and problem-solving.',
    votes: 5420,
    featured: true,
    category: 'AI Chat & Assistant',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 2,
    name: 'Midjourney',
    icon: '🎨',
    description: 'Create stunning AI-generated images from text descriptions. Professional quality artwork.',
    votes: 4850,
    featured: true,
    category: 'Image Generators',
    pricing: 'Paid',
    verified: true
  },
  {
    id: 3,
    name: 'Claude Code',
    icon: '💻',
    description: 'AI-powered code assistant that helps with debugging, writing, and understanding code.',
    votes: 3920,
    featured: true,
    category: 'Code Assistant',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 4,
    name: 'Runway ML',
    icon: '🎬',
    description: 'Professional video editing and AI-powered effects for content creators.',
    votes: 3540,
    featured: false,
    category: 'Video Editing',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 5,
    name: 'ElevenLabs',
    icon: '🎙️',
    description: 'Natural-sounding AI voice generation for any use case. 100+ languages supported.',
    votes: 3210,
    featured: false,
    category: 'Audio Editing',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 6,
    name: 'Canva AI',
    icon: '🖼️',
    description: 'Design anything you can imagine with AI-powered design tools and templates.',
    votes: 4100,
    featured: true,
    category: 'Design Tools',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 7,
    name: 'Grammarly',
    icon: '✍️',
    description: 'AI writing assistant that improves clarity, tone, and grammar in real-time.',
    votes: 3850,
    featured: false,
    category: 'Writing & SEO',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 8,
    name: 'Perplexity AI',
    icon: '🔍',
    description: 'AI search engine with real-time information and detailed answers to your questions.',
    votes: 3670,
    featured: false,
    category: 'AI Chat & Assistant',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 9,
    name: 'Copy.ai',
    icon: '📝',
    description: 'Generate marketing copy, social media content, and product descriptions instantly.',
    votes: 2980,
    featured: false,
    category: 'Writing & SEO',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 10,
    name: 'Notion AI',
    icon: '📊',
    description: 'Smart assistant that helps organize, write, and manage your knowledge base.',
    votes: 3450,
    featured: true,
    category: 'Productivity',
    pricing: 'Paid',
    verified: true
  },
  {
    id: 11,
    name: 'HeyGen',
    icon: '👤',
    description: 'Create professional AI avatars and videos without cameras or studios.',
    votes: 2890,
    featured: false,
    category: 'Video Editing',
    pricing: 'Freemium',
    verified: true
  },
  {
    id: 12,
    name: 'Deepl',
    icon: '🌐',
    description: 'Neural machine translation for accurate and nuanced text translation.',
    votes: 2650,
    featured: false,
    category: 'Business Tools',
    pricing: 'Freemium',
    verified: true
  }
]

import { createPageMetadata } from "@/platform/seo/generateMetadata";

// The route shipped with no metadata, so it inherited the root layout's title
// and served "AltFTool – Your Daily Digital Toolkit" with no description.
export const metadata = createPageMetadata({
  title: "AI Tools Directory: Chat, Image & Code",
  description:
    "Browse a hand-picked directory of AI tools for chat, image generation, code, video and writing, each with what it does and who it suits. Free to browse.",
  path: "/ai-explore",
  keywords: ["ai tools directory", "best ai tools", "ai chat tools", "ai image generators"],
});

export default function AIExplorePage() {
  return (
    <div className={`ai-explore-scope ${styles.container}`}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>AI Tools Directory</h1>
          <p className={styles.heroSubtitle}>Access the largest list of top-quality AI tools available</p>
          {/* The badge claimed "500+ AI tools analyzed", "Updated daily" and
              "100% manually verified". This page is a hardcoded array of 12
              tools with no fetch and nothing that updates or verifies them, so
              all three were assertions about work that does not happen. */}
          <div className={styles.statsBadge}>
            <span className={styles.statItem}>
              <strong>12</strong> hand-picked AI tools
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              across <strong>9</strong> categories
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className={styles.searchFilterSection}>
        <div className={styles.searchContainer}>
          <input
            type="search"
            placeholder="Search 12 AI tools..."
            className={styles.searchInput}
          />
          <button className={styles.searchBtn} type="submit">
            <span className={styles.searchIcon}>🔍</span>
          </button>
        </div>

        <div className={styles.filterGroup}>
          <select className={styles.categorySelect}>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className={styles.pricingFilters}>
            {PRICING_FILTERS.map(filter => (
              <button
                key={filter}
                className={styles.filterBtn}
              >
                {filter === 'Verified' && '✓'} {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className={styles.toolsGrid}>
        {MOCK_TOOLS.map((tool) => (
          <div key={tool.id} className={styles.toolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.toolIcon}>{tool.icon}</div>
              <div className={styles.cardBadges}>
                {tool.featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                {tool.verified && <span className={styles.verifiedBadge}>✓ Verified</span>}
              </div>
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.toolName}>{tool.name}</h3>
              <p className={styles.toolDescription}>{tool.description}</p>
              <div className={styles.toolMeta}>
                <span className={styles.pricingTag}>{tool.pricing}</span>
                <span className={styles.categoryTag}>{tool.category}</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.votes}>
                👍 <span>{tool.votes.toLocaleString()}</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.favoriteBtn} title="Add to favorites">
                  ❤️
                </button>
                <button className={styles.visitBtn}>Visit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}