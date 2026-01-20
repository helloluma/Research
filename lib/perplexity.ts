/**
 * Perplexity API Wrapper
 * Handles all research queries using the sonar-pro model
 */

import {
  ResearchQuery,
  ResearchFinding,
  PriorityLevel,
  PainPoint,
  Source,
  PerplexityResponse,
} from '@/types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar-pro';

// Delay helper to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Standard research prompt for morning digest queries
 * Written in first person for Edward as a solo founder
 */
function buildMorningPrompt(query: string): string {
  return `Research and summarize: ${query}

Write your response in FIRST PERSON as if you're a research assistant briefing me directly.
Use "I found", "I noticed", "You should", "Here's what I discovered" etc.

Provide:
1. Key findings (bullet points, first person)
2. Most important insight (what I need to know right now)
3. SPECIFIC PAIN POINTS mentioned (exact quotes if possible)
4. What solution are people asking for?
5. Action items I should take as a founder building in this space
6. Priority level (low/medium/high/urgent)

For Reddit results specifically:
- Note the subreddit and upvotes if visible
- Capture emotional language (frustrated, nightmare, hate, wish)
- Identify recurring complaints vs one-off issues

Keep it concise, actionable, and written directly to me.`;
}

/**
 * Evening urgent-focused prompt
 * Written in first person
 */
function buildEveningPrompt(query: string): string {
  return `Research: ${query}

Is there any URGENT or BREAKING news from the last 12 hours?

Write in FIRST PERSON as if briefing me directly.

Respond with:
1. Priority: URGENT / HIGH / NONE
2. If URGENT/HIGH: One sentence summary of what I need to know
3. Source link

If nothing urgent, just say 'I found no urgent updates.'`;
}

/**
 * Blog trending topics prompt
 * Written in first person
 */
function buildBlogTopicsPrompt(project: string, description: string): string {
  return `I need blog topic ideas for ${description}. What topics are trending this week that I should write about?

Focus on topics with high search intent. Give me 5 specific blog post titles I should consider writing, with target keywords in this format:

1. "[Blog Title]" - Keywords: keyword1, keyword2, keyword3
2. "[Blog Title]" - Keywords: keyword1, keyword2, keyword3
...and so on

Write as if you're suggesting these directly to me.`;
}

/**
 * Make a single Perplexity API call
 */
async function callPerplexity(prompt: string): Promise<PerplexityResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
      return_citations: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Parse priority level from response text
 */
function parsePriority(text: string): PriorityLevel {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('urgent')) return 'urgent';
  if (lowerText.includes('high')) return 'high';
  if (lowerText.includes('medium')) return 'medium';
  return 'low';
}

/**
 * Extract pain points from response text
 */
function extractPainPoints(text: string): PainPoint[] {
  const painPoints: PainPoint[] = [];

  // Look for quoted text that represents pain points
  const quoteRegex = /"([^"]+)"|"([^"]+)"|'([^']+)'/g;
  let match: RegExpExecArray | null;

  while ((match = quoteRegex.exec(text)) !== null) {
    const quote = match[1] || match[2] || match[3];
    if (quote && quote.length > 10 && quote.length < 500) {
      // Check for emotional language
      const emotionalWords = ['frustrated', 'nightmare', 'hate', 'wish', 'impossible',
        'terrible', 'awful', 'annoying', 'pain', 'struggle', 'difficult'];
      const emotionalLanguage = emotionalWords.filter(word =>
        quote.toLowerCase().includes(word)
      );

      painPoints.push({
        quote,
        emotionalLanguage: emotionalLanguage.length > 0 ? emotionalLanguage : undefined,
      });
    }
  }

  // Also extract subreddit mentions
  const subredditRegex = /r\/(\w+)/g;
  let subredditMatch: RegExpExecArray | null;
  while ((subredditMatch = subredditRegex.exec(text)) !== null) {
    const existingPoint = painPoints.find(p =>
      text.indexOf(p.quote) > text.indexOf(subredditMatch![0]) - 200 &&
      text.indexOf(p.quote) < text.indexOf(subredditMatch![0]) + 200
    );
    if (existingPoint) {
      existingPoint.subreddit = subredditMatch[1];
    }
  }

  return painPoints;
}

/**
 * Extract sources from Perplexity citations
 */
function extractSources(response: PerplexityResponse): Source[] {
  const sources: Source[] = [];

  if (response.citations) {
    response.citations.forEach((url, index) => {
      sources.push({
        title: `Source ${index + 1}`,
        url,
      });
    });
  }

  // Also extract URLs from the response text
  const content = response.choices[0]?.message?.content || '';
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  let urlMatch: RegExpExecArray | null;

  while ((urlMatch = urlRegex.exec(content)) !== null) {
    const url = urlMatch[0].replace(/[.,;:]+$/, ''); // Remove trailing punctuation
    if (!sources.some(s => s.url === url)) {
      sources.push({
        title: 'Mentioned source',
        url,
      });
    }
  }

  return sources;
}

/**
 * Extract key findings as bullet points
 */
function extractKeyFindings(text: string): string[] {
  const findings: string[] = [];

  // Look for numbered or bulleted items
  const bulletRegex = /(?:^|\n)\s*(?:[-•*]|\d+[.)]\s*)(.*?)(?=\n|$)/g;
  let bulletMatch: RegExpExecArray | null;

  while ((bulletMatch = bulletRegex.exec(text)) !== null) {
    const finding = bulletMatch[1].trim();
    if (finding.length > 10 && finding.length < 300) {
      findings.push(finding);
    }
  }

  // If no bullets found, split by sentences in key findings section
  if (findings.length === 0) {
    const keyFindingsMatch = text.match(/key findings?:?\s*([\s\S]*?)(?=most important|pain point|solution|action|priority|$)/i);
    if (keyFindingsMatch) {
      const sentences = keyFindingsMatch[1].split(/[.!?]+/).filter(s => s.trim().length > 10);
      findings.push(...sentences.slice(0, 5).map(s => s.trim()));
    }
  }

  return findings.slice(0, 10); // Limit to 10 findings
}

/**
 * Extract action items from response
 */
function extractActionItems(text: string): string[] {
  const actions: string[] = [];

  // Look for action items section
  const actionMatch = text.match(/action items?:?\s*([\s\S]*?)(?=priority|$)/i);
  if (actionMatch) {
    const actionBulletRegex = /(?:^|\n)\s*(?:[-•*]|\d+[.)]\s*)(.*?)(?=\n|$)/g;
    let actionBulletMatch: RegExpExecArray | null;

    while ((actionBulletMatch = actionBulletRegex.exec(actionMatch[1])) !== null) {
      const action = actionBulletMatch[1].trim();
      if (action.length > 5 && action.length < 200) {
        actions.push(action);
      }
    }
  }

  return actions.slice(0, 5);
}

/**
 * Process a single research query
 */
export async function processQuery(query: ResearchQuery, isEvening: boolean = false): Promise<ResearchFinding> {
  const prompt = isEvening
    ? buildEveningPrompt(query.query)
    : buildMorningPrompt(query.query);

  const response = await callPerplexity(prompt);
  const content = response.choices[0]?.message?.content || '';

  return {
    query: query.query,
    project: query.project,
    category: query.category,
    keyFindings: extractKeyFindings(content),
    mostImportantInsight: extractMostImportantInsight(content),
    painPoints: extractPainPoints(content),
    solutionRequests: extractSolutionRequests(content),
    actionItems: extractActionItems(content),
    priority: parsePriority(content),
    sources: extractSources(response),
    rawResponse: content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract the most important insight
 */
function extractMostImportantInsight(text: string): string {
  const insightMatch = text.match(/most important insight:?\s*(.*?)(?=\n\n|pain point|solution|action|$)/i);
  if (insightMatch) {
    return insightMatch[1].trim().replace(/^[-•*]\s*/, '');
  }

  // Fallback: return first key finding
  const findings = extractKeyFindings(text);
  return findings[0] || 'No specific insight extracted';
}

/**
 * Extract what solutions people are asking for
 */
function extractSolutionRequests(text: string): string[] {
  const solutions: string[] = [];

  const solutionMatch = text.match(/(?:solution|what .* asking for):?\s*([\s\S]*?)(?=action|priority|$)/i);
  if (solutionMatch) {
    const solutionBulletRegex = /(?:^|\n)\s*(?:[-•*]|\d+[.)]\s*)(.*?)(?=\n|$)/g;
    let solutionBulletMatch: RegExpExecArray | null;

    while ((solutionBulletMatch = solutionBulletRegex.exec(solutionMatch[1])) !== null) {
      const solution = solutionBulletMatch[1].trim();
      if (solution.length > 5 && solution.length < 200) {
        solutions.push(solution);
      }
    }
  }

  return solutions.slice(0, 5);
}

/**
 * Process multiple queries with rate limiting
 * Runs in parallel batches of 5 for speed
 */
export async function processQueries(
  queries: ResearchQuery[],
  isEvening: boolean = false
): Promise<{ findings: ResearchFinding[]; errors: string[] }> {
  const findings: ResearchFinding[] = [];
  const errors: string[] = [];
  const BATCH_SIZE = 5;

  // Process queries in parallel batches
  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    const batch = queries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(queries.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatches} (queries ${i + 1}-${Math.min(i + BATCH_SIZE, queries.length)}/${queries.length})`);

    const batchPromises = batch.map(async (query, idx) => {
      try {
        const finding = await processQuery(query, isEvening);
        return { success: true, finding, query };
      } catch (error) {
        const errorMessage = `Failed: "${query.query.substring(0, 40)}...": ${error instanceof Error ? error.message : 'Unknown'}`;
        return { success: false, error: errorMessage, query };
      }
    });

    const results = await Promise.all(batchPromises);

    for (const result of results) {
      if (result.success && result.finding) {
        findings.push(result.finding);
      } else if (result.error) {
        console.error(result.error);
        errors.push(result.error);
      }
    }

    // Add delay between batches to avoid rate limiting (except for last batch)
    if (i + BATCH_SIZE < queries.length) {
      await delay(2000);
    }
  }

  return { findings, errors };
}

/**
 * Get trending blog topics for a project
 */
export async function getTrendingBlogTopics(
  project: 'sponsorbase' | 'luma' | 'marina'
): Promise<{ topics: string[]; error?: string }> {
  const descriptions: Record<string, string> = {
    sponsorbase: 'creator economy, influencer marketing, and brand sponsorships that a SaaS blog should write about. Focus on topics with high search intent that micro-influencers (10K-150K followers) would search for',
    luma: 'healthcare documentation, prior authorization, HIPAA compliance, and medical billing that a B2B healthcare SaaS blog should write about. Focus on topics providers and healthcare admins are searching for',
    marina: 'El Paso Texas, Fort Bliss military housing, and first-time home buyers that a real estate blog should write about. Focus on local SEO opportunities',
  };

  try {
    const prompt = buildBlogTopicsPrompt(project, descriptions[project]);
    const response = await callPerplexity(prompt);
    const content = response.choices[0]?.message?.content || '';

    // Extract blog titles
    const titleRegex = /\d+\.\s*"([^"]+)"|"([^"]+)"/g;
    const topics: string[] = [];
    let titleMatch: RegExpExecArray | null;

    while ((titleMatch = titleRegex.exec(content)) !== null) {
      const title = titleMatch[1] || titleMatch[2];
      if (title) {
        topics.push(title);
      }
    }

    // Fallback: look for lines that look like titles
    if (topics.length === 0) {
      const lines = content.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 &&
               trimmed.length < 100 &&
               (trimmed.match(/^\d+\./) || trimmed.startsWith('-'));
      });
      topics.push(...lines.slice(0, 5).map(l => l.replace(/^\d+\.\s*|-\s*/, '').trim()));
    }

    return { topics: topics.slice(0, 5) };
  } catch (error) {
    return {
      topics: [],
      error: `Failed to get trending topics: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if evening query result indicates urgent news
 */
export function isUrgentResult(finding: ResearchFinding): boolean {
  const lowerContent = finding.rawResponse.toLowerCase();

  // Check for explicit "no urgent updates" or similar
  if (lowerContent.includes('no urgent updates') ||
      lowerContent.includes('no breaking news') ||
      lowerContent.includes('nothing urgent') ||
      lowerContent.includes('priority: none')) {
    return false;
  }

  // Check for urgent indicators
  return finding.priority === 'urgent' || finding.priority === 'high';
}
