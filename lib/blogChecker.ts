/**
 * Blog Checker Utility
 * Fetches existing blog posts and checks for duplicates
 */

import {
  BlogTopic,
  BlogCheckResult,
  ExistingBlogPost,
  ProjectName,
} from '@/types';
import { BLOG_URLS } from './queries';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Fetch existing blog posts from a blog URL using Perplexity
 */
async function fetchBlogPosts(
  project: ProjectName,
  blogUrl: string
): Promise<BlogCheckResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return {
      project,
      blogUrl,
      existingPosts: [],
      success: false,
      error: 'PERPLEXITY_API_KEY not configured',
    };
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: `List all blog post titles from ${blogUrl}.

Return the results in this exact format, one per line:
- Title: [exact blog post title]

Only list actual blog posts you can find. If you cannot access the blog or find any posts, say "No posts found" or "Cannot access".`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        project,
        blogUrl,
        existingPosts: [],
        success: false,
        error: `API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse blog titles from response
    const existingPosts: ExistingBlogPost[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Look for "Title: " pattern
      const titleMatch = line.match(/(?:Title:|^-\s*)(.*?)$/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        if (title.length > 5 && !title.toLowerCase().includes('no posts found')) {
          existingPosts.push({
            title,
            project,
          });
        }
      }
    }

    // Check for "cannot access" or similar errors
    if (content.toLowerCase().includes('cannot access') ||
        content.toLowerCase().includes('no posts found') ||
        content.toLowerCase().includes('unable to')) {
      return {
        project,
        blogUrl,
        existingPosts: [],
        success: true, // We successfully checked, just found nothing
        error: 'Blog may be empty or inaccessible',
      };
    }

    return {
      project,
      blogUrl,
      existingPosts,
      success: true,
    };
  } catch (error) {
    return {
      project,
      blogUrl,
      existingPosts: [],
      success: false,
      error: `Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if a topic is similar to an existing post
 * Uses simple keyword matching
 */
function isSimilarTopic(
  newTopic: string,
  existingPosts: ExistingBlogPost[]
): { isDuplicate: boolean; matchedPost?: string } {
  const newTopicLower = newTopic.toLowerCase();

  // Extract key words from new topic (remove common words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'your', 'you', 'how', 'what', 'why', 'when', 'where', 'which', 'who',
  ]);

  const newKeywords = newTopicLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  for (const post of existingPosts) {
    const existingLower = post.title.toLowerCase();
    const existingKeywords = existingLower
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Count matching keywords
    const matchCount = newKeywords.filter(keyword =>
      existingKeywords.some(existing =>
        existing.includes(keyword) || keyword.includes(existing)
      )
    ).length;

    // If more than 50% of keywords match, consider it a duplicate
    const matchRatio = matchCount / Math.max(newKeywords.length, 1);
    if (matchRatio > 0.5) {
      return {
        isDuplicate: true,
        matchedPost: post.title,
      };
    }

    // Also check for very similar titles (Levenshtein-like)
    if (existingLower.includes(newTopicLower.slice(0, 30)) ||
        newTopicLower.includes(existingLower.slice(0, 30))) {
      return {
        isDuplicate: true,
        matchedPost: post.title,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Check all blogs and get existing posts
 */
export async function checkAllBlogs(): Promise<BlogCheckResult[]> {
  const projects: ProjectName[] = ['sponsorbase', 'luma', 'marina'];
  const results: BlogCheckResult[] = [];

  for (const project of projects) {
    console.log(`Checking blog for ${project}: ${BLOG_URLS[project]}`);
    const result = await fetchBlogPosts(project, BLOG_URLS[project]);
    results.push(result);

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Check trending topics against existing posts for duplicates
 */
export function checkTopicsForDuplicates(
  topics: string[],
  project: ProjectName,
  blogCheckResults: BlogCheckResult[]
): BlogTopic[] {
  const blogResult = blogCheckResults.find(r => r.project === project);
  const existingPosts = blogResult?.existingPosts || [];

  return topics.map(topic => {
    const { isDuplicate, matchedPost } = isSimilarTopic(topic, existingPosts);

    return {
      title: topic,
      targetKeywords: extractKeywords(topic),
      project,
      isDuplicate,
      existingPostTitle: matchedPost,
    };
  });
}

/**
 * Extract target keywords from a blog title
 */
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'how',
    'what', 'why', 'when', 'where', 'which', 'who', 'your', 'you', 'guide',
    'complete', 'ultimate', 'best', 'top',
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 5);
}

/**
 * Get a summary of blog check results for logging
 */
export function getBlogCheckSummary(results: BlogCheckResult[]): string {
  return results.map(r => {
    if (!r.success) {
      return `${r.project}: Failed - ${r.error}`;
    }
    return `${r.project}: Found ${r.existingPosts.length} existing posts`;
  }).join('\n');
}
