/**
 * OpenAI API Wrapper
 * Handles email formatting using GPT-4o
 */

import OpenAI from 'openai';
import {
  ResearchFinding,
  BlogTopic,
  BlogCheckResult,
  UrgentItem,
  ProjectName,
} from '@/types';

// Initialize OpenAI client
function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey });
}

/**
 * Build the email formatting prompt for the morning digest
 */
function buildMorningEmailPrompt(
  findings: ResearchFinding[],
  blogTopics: Partial<Record<ProjectName, BlogTopic[]>>,
  blogCheckResults: BlogCheckResult[]
): string {
  // Organize findings by project
  const sponsorbaseFindings = findings.filter(f => f.project === 'sponsorbase');
  const lumaFindings = findings.filter(f => f.project === 'luma');

  // Get urgent items
  const urgentFindings = findings.filter(f => f.priority === 'urgent' || f.priority === 'high');

  // Format blog check results
  const blogCheckInfo = blogCheckResults.map(r => {
    if (!r.success) {
      return `${r.project.toUpperCase()} Blog (${r.blogUrl}): Could not check - ${r.error}`;
    }
    return `${r.project.toUpperCase()} Blog (${r.blogUrl}): Found ${r.existingPosts.length} existing posts`;
  }).join('\n');

  return `Format this research into a professional but conversational email digest for Edward, a solo founder running two projects.

RESEARCH DATA:

=== URGENT/HIGH PRIORITY ITEMS ===
${urgentFindings.length > 0 ? urgentFindings.map(f => `
- [${f.project.toUpperCase()}] ${f.query}
  Priority: ${f.priority.toUpperCase()}
  Insight: ${f.mostImportantInsight}
  Sources: ${f.sources.map(s => s.url).join(', ')}
`).join('\n') : 'No urgent items today.'}

=== SPONSORBASE RESEARCH ===
${sponsorbaseFindings.map(f => `
Query: ${f.query}
Priority: ${f.priority}
Key Findings: ${f.keyFindings.join('; ')}
Most Important: ${f.mostImportantInsight}
Pain Points: ${f.painPoints.map(p => `"${p.quote}"${p.subreddit ? ` (r/${p.subreddit})` : ''}`).join('; ')}
Solutions Requested: ${f.solutionRequests.join('; ')}
Action Items: ${f.actionItems.join('; ')}
Sources: ${f.sources.map(s => s.url).slice(0, 3).join(', ')}
`).join('\n---\n')}

=== LUMA COMPLY RESEARCH ===
${lumaFindings.map(f => `
Query: ${f.query}
Priority: ${f.priority}
Key Findings: ${f.keyFindings.join('; ')}
Most Important: ${f.mostImportantInsight}
Pain Points: ${f.painPoints.map(p => `"${p.quote}"${p.subreddit ? ` (r/${p.subreddit})` : ''}`).join('; ')}
Solutions Requested: ${f.solutionRequests.join('; ')}
Action Items: ${f.actionItems.join('; ')}
Sources: ${f.sources.map(s => s.url).slice(0, 3).join(', ')}
`).join('\n---\n')}

=== EXISTING BLOG POSTS (for duplicate checking) ===
${blogCheckInfo}

=== TRENDING BLOG TOPICS ===
SPONSORBASE: ${(blogTopics.sponsorbase || []).map(t => `"${t.title}" ${t.isDuplicate ? `[SKIP - similar to: ${t.existingPostTitle}]` : '[RECOMMENDED]'}`).join(', ')}
LUMA COMPLY: ${(blogTopics.luma || []).map(t => `"${t.title}" ${t.isDuplicate ? `[SKIP - similar to: ${t.existingPostTitle}]` : '[RECOMMENDED]'}`).join(', ')}

---

STRUCTURE:
1. URGENT ITEMS (if any) - at the very top, highlighted prominently
2. SPONSORBASE section
   - Competitor intel
   - Reddit pain points (with quotes)
   - Blog posts to write this week (with duplicate check results)
3. LUMA COMPLY section
   - Regulatory updates
   - Reddit pain points (with quotes)
   - Blog posts to write this week (with duplicate check results)
4. WEEKLY BLOG CALENDAR - consolidated list of recommended posts across both blogs

FORMATTING:
- NO emojis - use proper H1 H2 H3 H4 H5 H6 and text
- Bold key insights using <strong> tags
- Include source links from Perplexity citations as clickable <a> tags
- For Reddit pain points, include actual quotes in italics using <em> tags
- Keep it actionable and skimmable
- End with a simple priority list: 'Top 3 things to do today'

Return only the HTML email body, starting with the content (no <html>, <head>, or <body> tags - just the inner content). Use inline CSS for styling.`;
}

/**
 * Build the evening email prompt for urgent catch-up
 */
function buildEveningEmailPrompt(urgentItems: UrgentItem[]): string {
  return `Format these urgent updates into a short, actionable evening email for Edward.

URGENT ITEMS:
${urgentItems.map(item => `
- [${item.project.toUpperCase()}] ${item.summary}
  Priority: ${item.priority.toUpperCase()}
  Source: ${item.source}
`).join('\n')}

FORMATTING:
- Keep it very brief - this is a quick evening catch-up
- NO emojis - use proper headers and text
- Bold key insights using <strong> tags
- Include source links as clickable <a> tags
- End with "Action needed: Yes/No" for each item

Return only the HTML email body content (no <html>, <head>, or <body> tags). Use inline CSS for styling.`;
}

/**
 * Format the morning digest email using GPT-4o
 */
export async function formatMorningEmail(
  findings: ResearchFinding[],
  blogTopics: Partial<Record<ProjectName, BlogTopic[]>>,
  blogCheckResults: BlogCheckResult[]
): Promise<{ htmlBody: string; error?: string }> {
  try {
    const client = getClient();
    const prompt = buildMorningEmailPrompt(findings, blogTopics, blogCheckResults);

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at formatting research data into professional, actionable email digests. You write in a conversational but efficient style. You never use emojis. You use proper HTML formatting with headers, bold text, and links.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.3,
    });

    const htmlBody = response.choices[0]?.message?.content || '';

    // Wrap in basic email styling
    const styledHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
  ${htmlBody}
</div>
    `.trim();

    return { htmlBody: styledHtml };
  } catch (error) {
    return {
      htmlBody: '',
      error: `Failed to format email: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Format the evening catch-up email using GPT-4o
 */
export async function formatEveningEmail(
  urgentItems: UrgentItem[]
): Promise<{ htmlBody: string; error?: string }> {
  try {
    const client = getClient();
    const prompt = buildEveningEmailPrompt(urgentItems);

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at formatting urgent updates into brief, actionable email alerts. You write concisely and never use emojis. You use proper HTML formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const htmlBody = response.choices[0]?.message?.content || '';

    // Wrap in basic email styling
    const styledHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
  <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <strong>Evening Catch-Up Alert</strong> - ${urgentItems.length} new urgent item${urgentItems.length !== 1 ? 's' : ''} since this morning
  </div>
  ${htmlBody}
</div>
    `.trim();

    return { htmlBody: styledHtml };
  } catch (error) {
    return {
      htmlBody: '',
      error: `Failed to format evening email: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate a fallback email when OpenAI fails
 * Uses raw Perplexity data formatted simply
 */
export function generateFallbackEmail(
  findings: ResearchFinding[],
  jobType: 'morning' | 'evening'
): string {
  const urgentFindings = findings.filter(f => f.priority === 'urgent' || f.priority === 'high');

  if (jobType === 'evening') {
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
  <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <strong>Note:</strong> Email formatting failed. Showing raw data.
  </div>
  <h1>Evening Urgent Items</h1>
  ${urgentFindings.map(f => `
    <div style="border-left: 3px solid #dc3545; padding-left: 15px; margin-bottom: 20px;">
      <h3>[${f.project.toUpperCase()}] ${f.query}</h3>
      <p><strong>Priority:</strong> ${f.priority.toUpperCase()}</p>
      <p>${f.mostImportantInsight}</p>
      ${f.sources.length > 0 ? `<p><a href="${f.sources[0].url}">Source</a></p>` : ''}
    </div>
  `).join('')}
</div>
    `.trim();
  }

  // Morning fallback
  const byProject = {
    sponsorbase: findings.filter(f => f.project === 'sponsorbase'),
    luma: findings.filter(f => f.project === 'luma'),
    marina: findings.filter(f => f.project === 'marina'),
  };

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
  <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <strong>Note:</strong> Email formatting failed. Showing raw data.
  </div>

  ${urgentFindings.length > 0 ? `
    <h1 style="color: #dc3545;">URGENT ITEMS</h1>
    ${urgentFindings.map(f => `
      <div style="border-left: 3px solid #dc3545; padding-left: 15px; margin-bottom: 15px;">
        <strong>[${f.project.toUpperCase()}]</strong> ${f.mostImportantInsight}
      </div>
    `).join('')}
  ` : ''}

  <h1>SponsorBase</h1>
  ${byProject.sponsorbase.map(f => `
    <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <h4>${f.query}</h4>
      <p><strong>Insight:</strong> ${f.mostImportantInsight}</p>
      ${f.painPoints.length > 0 ? `<p><em>"${f.painPoints[0].quote}"</em></p>` : ''}
    </div>
  `).join('')}

  <h1>Luma Comply</h1>
  ${byProject.luma.map(f => `
    <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <h4>${f.query}</h4>
      <p><strong>Insight:</strong> ${f.mostImportantInsight}</p>
      ${f.painPoints.length > 0 ? `<p><em>"${f.painPoints[0].quote}"</em></p>` : ''}
    </div>
  `).join('')}

  <h1>Marina Real Estate</h1>
  ${byProject.marina.map(f => `
    <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <h4>${f.query}</h4>
      <p><strong>Insight:</strong> ${f.mostImportantInsight}</p>
      ${f.painPoints.length > 0 ? `<p><em>"${f.painPoints[0].quote}"</em></p>` : ''}
    </div>
  `).join('')}
</div>
  `.trim();
}
