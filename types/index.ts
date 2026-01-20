/**
 * TypeScript types for the Research Automation System
 */

// Priority levels for research findings
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

// Project identifiers
export type ProjectName = 'sponsorbase' | 'luma' | 'marina';

// Query categories
export type QueryCategory =
  | 'competitor_intel'
  | 'reddit_pain_points'
  | 'general_pain_points'
  | 'regulatory_updates'
  | 'market_intel'
  | 'trending_topics'
  | 'urgent_news';

// Individual research finding from Perplexity
export interface ResearchFinding {
  query: string;
  project: ProjectName;
  category: QueryCategory;
  keyFindings: string[];
  mostImportantInsight: string;
  painPoints: PainPoint[];
  solutionRequests: string[];
  actionItems: string[];
  priority: PriorityLevel;
  sources: Source[];
  rawResponse: string;
  timestamp: string;
}

// Pain point captured from research
export interface PainPoint {
  quote: string;
  source?: string;
  subreddit?: string;
  upvotes?: number;
  emotionalLanguage?: string[];
}

// Source citation
export interface Source {
  title: string;
  url: string;
}

// Blog topic recommendation
export interface BlogTopic {
  title: string;
  targetKeywords: string[];
  project: ProjectName;
  isDuplicate: boolean;
  existingPostTitle?: string;
  existingPostUrl?: string;
}

// Existing blog post for duplicate checking
export interface ExistingBlogPost {
  title: string;
  url?: string;
  project: ProjectName;
}

// Blog check result
export interface BlogCheckResult {
  project: ProjectName;
  blogUrl: string;
  existingPosts: ExistingBlogPost[];
  success: boolean;
  error?: string;
}

// Urgent item for tracking between morning/evening
export interface UrgentItem {
  project: ProjectName;
  summary: string;
  source: string;
  priority: PriorityLevel;
  category: QueryCategory;
  timestamp: string;
}

// Daily urgent items storage
export interface DailyUrgentItems {
  date: string;
  morningUrgentItems: UrgentItem[];
  eveningUrgentItems?: UrgentItem[];
  lastMorningRun?: string;
  lastEveningRun?: string;
}

// Research query definition
export interface ResearchQuery {
  query: string;
  project: ProjectName;
  category: QueryCategory;
  isEvening?: boolean;
}

// Perplexity API response
export interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  citations?: string[];
}

// OpenAI API response for email formatting
export interface FormattedEmailResponse {
  htmlBody: string;
  urgentItems: UrgentItem[];
  blogRecommendations: BlogTopic[];
}

// Email send result
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Cron job result
export interface CronJobResult {
  success: boolean;
  jobType: 'morning' | 'evening';
  timestamp: string;
  queriesProcessed: number;
  urgentItemsFound: number;
  emailSent: boolean;
  errors: string[];
}

// System status for landing page
export interface SystemStatus {
  lastMorningRun: string | null;
  lastEveningRun: string | null;
  lastMorningSuccess: boolean;
  lastEveningSuccess: boolean;
  totalQueriesLastRun: number;
  urgentItemsLastRun: number;
}
