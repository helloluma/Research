/**
 * Research Queries Configuration
 * All search queries organized by project and job type
 * Easy to edit and maintain
 */

import { ResearchQuery, ProjectName } from '@/types';

// ============================================================
// MORNING DIGEST QUERIES
// Full research for the daily morning email
// ============================================================

// SPONSORBASE - Creator Sponsorship SaaS
const SPONSORBASE_MORNING_QUERIES: ResearchQuery[] = [
  // Competitor Intel
  {
    query: 'creator sponsorship management tools new features 2026',
    project: 'sponsorbase',
    category: 'competitor_intel',
  },
  {
    query: 'influencer CRM competitor updates AspireIQ Grin CreatorIQ',
    project: 'sponsorbase',
    category: 'competitor_intel',
  },

  // Reddit Pain Points
  {
    query: 'site:reddit.com r/NewTubers sponsorship tracking problems',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/influencermarketing managing brand deals',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/Instagram sponsorship payment issues',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/youtubegaming brand deals spreadsheet nightmare',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/Twitch managing sponsors contracts',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com micro influencer can\'t afford tools',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com creator CRM too expensive',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com tracking sponsorship deliverables',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
  },

  // General Pain Points
  {
    query: 'micro influencer pain points sponsorships reddit',
    project: 'sponsorbase',
    category: 'general_pain_points',
  },
  {
    query: 'creators struggling to track sponsorships 2026',
    project: 'sponsorbase',
    category: 'general_pain_points',
  },
  {
    query: 'influencer brand deal management complaints',
    project: 'sponsorbase',
    category: 'general_pain_points',
  },
];

// LUMA COMPLY - HIPAA-compliant Medical Documentation
const LUMA_MORNING_QUERIES: ResearchQuery[] = [
  // Regulatory Updates
  {
    query: 'CMS prior authorization rule changes 2026',
    project: 'luma',
    category: 'regulatory_updates',
  },
  {
    query: 'HIPAA compliance healthcare AI updates',
    project: 'luma',
    category: 'regulatory_updates',
  },
  {
    query: 'Medicare biologics documentation requirements',
    project: 'luma',
    category: 'regulatory_updates',
  },
  {
    query: 'medical necessity documentation audit requirements',
    project: 'luma',
    category: 'regulatory_updates',
  },

  // Reddit Pain Points
  {
    query: 'site:reddit.com r/medicine prior authorization nightmare',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/nursing documentation burden biologics',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/pharmacy prior auth denied',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/healthIT HIPAA compliant AI tools',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/physicians audit clawback documentation',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com r/medicalschool prior authorization hours',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com healthcare providers ChatGPT HIPAA risk',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com rheumatology biologics prior auth',
    project: 'luma',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com oncology documentation requirements',
    project: 'luma',
    category: 'reddit_pain_points',
  },

  // General Pain Points
  {
    query: 'physicians frustrated prior authorization 2026',
    project: 'luma',
    category: 'general_pain_points',
  },
  {
    query: 'healthcare AI HIPAA violations ChatGPT',
    project: 'luma',
    category: 'general_pain_points',
  },
  {
    query: 'biologics documentation audit failures',
    project: 'luma',
    category: 'general_pain_points',
  },
];

// MARINA REAL ESTATE - El Paso Content Marketing
const MARINA_MORNING_QUERIES: ResearchQuery[] = [
  // Market Intel
  {
    query: 'El Paso Texas real estate market update 2026',
    project: 'marina',
    category: 'market_intel',
  },
  {
    query: 'Fort Bliss BAH rates 2026',
    project: 'marina',
    category: 'market_intel',
  },
  {
    query: 'El Paso new construction homes Horizon City Eastlake',
    project: 'marina',
    category: 'market_intel',
  },
  {
    query: 'first time home buyer El Paso down payment assistance',
    project: 'marina',
    category: 'market_intel',
  },
  {
    query: 'First Time Home buyers incoming El Paso region 2026',
    project: 'marina',
    category: 'market_intel',
  },

  // Reddit Pain Points
  {
    query: 'site:reddit.com moving to El Paso',
    project: 'marina',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com Fort Bliss housing advice',
    project: 'marina',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com El Paso neighborhoods safe',
    project: 'marina',
    category: 'reddit_pain_points',
  },
  {
    query: 'site:reddit.com PCS Fort Bliss buy or rent',
    project: 'marina',
    category: 'reddit_pain_points',
  },
];

// ============================================================
// EVENING CATCH-UP QUERIES
// Quick urgent-focused scan for breaking news
// ============================================================

const SPONSORBASE_EVENING_QUERIES: ResearchQuery[] = [
  {
    query: 'influencer CRM competitor launch announcement today',
    project: 'sponsorbase',
    category: 'urgent_news',
    isEvening: true,
  },
  {
    query: 'creator economy breaking news today',
    project: 'sponsorbase',
    category: 'urgent_news',
    isEvening: true,
  },
];

const LUMA_EVENING_QUERIES: ResearchQuery[] = [
  {
    query: 'CMS Medicare announcement today',
    project: 'luma',
    category: 'urgent_news',
    isEvening: true,
  },
  {
    query: 'HIPAA enforcement action healthcare AI today',
    project: 'luma',
    category: 'urgent_news',
    isEvening: true,
  },
  {
    query: 'prior authorization rule change breaking news',
    project: 'luma',
    category: 'urgent_news',
    isEvening: true,
  },
];

const MARINA_EVENING_QUERIES: ResearchQuery[] = [
  {
    query: 'El Paso real estate market breaking news today',
    project: 'marina',
    category: 'urgent_news',
    isEvening: true,
  },
  {
    query: 'Fort Bliss announcement housing today',
    project: 'marina',
    category: 'urgent_news',
    isEvening: true,
  },
];

// ============================================================
// BLOG URLS FOR DUPLICATE CHECKING
// ============================================================

export const BLOG_URLS: Record<ProjectName, string> = {
  sponsorbase: 'https://blog.sponsorbase.io',
  luma: 'https://www.useluma.io/blog',
  marina: 'https://www.marina-ramirez.com/en/blog',
};

// ============================================================
// BLOG TOPIC DESCRIPTIONS
// Used for generating trending topic recommendations
// ============================================================

export const BLOG_TOPIC_DESCRIPTIONS: Record<ProjectName, string> = {
  sponsorbase:
    'creator economy, influencer marketing, and brand sponsorships that a SaaS blog should write about. Focus on topics with high search intent that micro-influencers (10K-150K followers) would search for',
  luma:
    'healthcare documentation, prior authorization, HIPAA compliance, and medical billing that a B2B healthcare SaaS blog should write about. Focus on topics providers and healthcare admins are searching for',
  marina:
    'El Paso Texas, Fort Bliss military housing, and first-time home buyers that a real estate blog should write about. Focus on local SEO opportunities',
};

// ============================================================
// EXPORTED QUERY COLLECTIONS
// ============================================================

/**
 * Get all morning queries for the full digest
 */
export function getMorningQueries(): ResearchQuery[] {
  return [
    ...SPONSORBASE_MORNING_QUERIES,
    ...LUMA_MORNING_QUERIES,
    ...MARINA_MORNING_QUERIES,
  ];
}

/**
 * Get all evening queries for urgent catch-up
 */
export function getEveningQueries(): ResearchQuery[] {
  return [
    ...SPONSORBASE_EVENING_QUERIES,
    ...LUMA_EVENING_QUERIES,
    ...MARINA_EVENING_QUERIES,
  ];
}

/**
 * Get queries by project
 */
export function getQueriesByProject(
  project: ProjectName,
  isEvening: boolean = false
): ResearchQuery[] {
  const morningQueries: Record<ProjectName, ResearchQuery[]> = {
    sponsorbase: SPONSORBASE_MORNING_QUERIES,
    luma: LUMA_MORNING_QUERIES,
    marina: MARINA_MORNING_QUERIES,
  };

  const eveningQueries: Record<ProjectName, ResearchQuery[]> = {
    sponsorbase: SPONSORBASE_EVENING_QUERIES,
    luma: LUMA_EVENING_QUERIES,
    marina: MARINA_EVENING_QUERIES,
  };

  return isEvening ? eveningQueries[project] : morningQueries[project];
}

/**
 * Count total queries
 */
export function getQueryCounts(): {
  morning: number;
  evening: number;
  total: number;
} {
  const morning = getMorningQueries().length;
  const evening = getEveningQueries().length;
  return {
    morning,
    evening,
    total: morning + evening,
  };
}
