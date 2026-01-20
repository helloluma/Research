/**
 * Custom Email Template Generator
 * Replaces ChatGPT for email formatting - saves ~$0.50 per digest
 *
 * Design: Dark editorial aesthetic inspired by Bloomberg Terminal
 * All styles are inline for email client compatibility
 */

import {
  ResearchFinding,
  BlogTopic,
  BlogCheckResult,
  UrgentItem,
  ProjectName,
} from '@/types';

// Color palette - sophisticated dark theme
const colors = {
  bg: '#0a0a0a',
  bgCard: '#141414',
  bgSubtle: '#1a1a1a',
  border: '#262626',
  borderAccent: '#333333',
  text: '#e5e5e5',
  textMuted: '#a3a3a3',
  textSubtle: '#737373',
  accent: '#22d3ee', // cyan
  urgent: '#ef4444', // red
  urgentBg: '#1c1917',
  urgentBorder: '#7f1d1d',
  high: '#f59e0b', // amber
  highBg: '#1c1917',
  success: '#22c55e',
  sponsorbase: '#8b5cf6', // purple
  luma: '#06b6d4', // cyan
};

// Font stacks that work in email clients
const fonts = {
  display: "'Georgia', 'Times New Roman', serif",
  body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
};

/**
 * Format date for email header
 */
function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Denver',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for footer
 */
function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Denver',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' MST';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate the urgent items banner
 */
function generateUrgentBanner(urgentItems: ResearchFinding[]): string {
  if (urgentItems.length === 0) return '';

  const items = urgentItems.map(item => {
    const priorityColor = item.priority === 'urgent' ? colors.urgent : colors.high;
    const projectColor = item.project === 'sponsorbase' ? colors.sponsorbase : colors.luma;

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${colors.urgentBorder};">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom: 6px;">
                <span style="display: inline-block; padding: 2px 8px; background: ${projectColor}20; color: ${projectColor}; font-family: ${fonts.mono}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 3px; margin-right: 8px;">
                  ${escapeHtml(item.project)}
                </span>
                <span style="display: inline-block; padding: 2px 8px; background: ${priorityColor}20; color: ${priorityColor}; font-family: ${fonts.mono}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 3px;">
                  ${escapeHtml(item.priority)}
                </span>
              </td>
            </tr>
            <tr>
              <td style="font-family: ${fonts.body}; font-size: 14px; color: ${colors.text}; line-height: 1.5;">
                ${escapeHtml(item.mostImportantInsight || item.keyFindings[0] || 'No details available')}
              </td>
            </tr>
            ${item.sources.length > 0 ? `
            <tr>
              <td style="padding-top: 8px;">
                <a href="${escapeHtml(item.sources[0].url)}" style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.accent}; text-decoration: none;">
                  View Source →
                </a>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="background: linear-gradient(135deg, ${colors.urgentBg} 0%, #1a0a0a 100%); border: 1px solid ${colors.urgentBorder}; border-radius: 8px; overflow: hidden;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: 16px 20px; background: ${colors.urgent}15; border-bottom: 1px solid ${colors.urgentBorder};">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width: 8px; height: 8px; background: ${colors.urgent}; border-radius: 50%; margin-right: 12px;"></td>
                    <td style="padding-left: 12px; font-family: ${fonts.display}; font-size: 18px; font-weight: 600; color: ${colors.urgent}; letter-spacing: -0.3px;">
                      ${urgentItems.length} Urgent Item${urgentItems.length !== 1 ? 's' : ''} Requiring Attention
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${items}
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a project section
 */
function generateProjectSection(
  project: ProjectName,
  findings: ResearchFinding[],
  blogTopics: BlogTopic[]
): string {
  const projectConfig = {
    sponsorbase: {
      name: 'SponsorBase',
      color: colors.sponsorbase,
      subtitle: 'Creator Sponsorship Intelligence',
    },
    luma: {
      name: 'Luma Comply',
      color: colors.luma,
      subtitle: 'Healthcare Documentation & Compliance',
    },
    marina: {
      name: 'Marina Real Estate',
      color: colors.accent,
      subtitle: 'El Paso Market Intelligence',
    },
  };

  const config = projectConfig[project];

  // Group findings by category
  const competitorFindings = findings.filter(f => f.category === 'competitor_intel' || f.category === 'regulatory_updates');
  const redditFindings = findings.filter(f => f.category === 'reddit_pain_points');
  const generalFindings = findings.filter(f => f.category === 'general_pain_points' || f.category === 'market_intel');

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
      <!-- Project Header -->
      <tr>
        <td style="padding-bottom: 24px; border-bottom: 2px solid ${config.color}40;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 4px; background: ${config.color}; border-radius: 2px;"></td>
              <td style="padding-left: 16px;">
                <div style="font-family: ${fonts.display}; font-size: 24px; font-weight: 600; color: ${colors.text}; letter-spacing: -0.5px; margin-bottom: 4px;">
                  ${config.name}
                </div>
                <div style="font-family: ${fonts.body}; font-size: 13px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 1px;">
                  ${config.subtitle}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Competitor / Regulatory Intel -->
      ${competitorFindings.length > 0 ? `
      <tr>
        <td style="padding: 24px 0;">
          <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${config.color}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">
            ${project === 'luma' ? '◆ Regulatory Updates' : '◆ Competitor Intelligence'}
          </div>
          ${competitorFindings.map(f => `
            <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
              <div style="font-family: ${fonts.body}; font-size: 14px; color: ${colors.text}; line-height: 1.6; margin-bottom: 12px;">
                ${escapeHtml(f.mostImportantInsight)}
              </div>
              ${f.keyFindings.slice(0, 3).map(finding => `
                <div style="font-family: ${fonts.body}; font-size: 13px; color: ${colors.textMuted}; padding-left: 12px; border-left: 2px solid ${colors.border}; margin-bottom: 8px; line-height: 1.5;">
                  ${escapeHtml(finding)}
                </div>
              `).join('')}
              ${f.sources.length > 0 ? `
                <div style="margin-top: 12px;">
                  <a href="${escapeHtml(f.sources[0].url)}" style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.accent}; text-decoration: none;">
                    Source →
                  </a>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </td>
      </tr>
      ` : ''}

      <!-- Reddit Pain Points -->
      ${redditFindings.length > 0 ? `
      <tr>
        <td style="padding: 24px 0;">
          <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${config.color}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">
            ◆ Reddit Pain Points
          </div>
          ${redditFindings.slice(0, 4).map(f => `
            <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
              ${f.painPoints.slice(0, 2).map(pp => `
                <div style="margin-bottom: 12px;">
                  <div style="font-family: ${fonts.display}; font-size: 14px; font-style: italic; color: ${colors.text}; line-height: 1.6; padding: 12px 16px; background: ${colors.bgSubtle}; border-left: 3px solid ${colors.textSubtle}; border-radius: 0 4px 4px 0;">
                    "${escapeHtml(pp.quote)}"
                  </div>
                  ${pp.subreddit ? `
                    <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle}; margin-top: 8px;">
                      r/${escapeHtml(pp.subreddit)}
                      ${pp.emotionalLanguage?.length ? ` · ${pp.emotionalLanguage.join(', ')}` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
              ${f.solutionRequests.length > 0 ? `
                <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid ${colors.border};">
                  <div style="font-family: ${fonts.mono}; font-size: 10px; color: ${colors.textSubtle}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                    Solution Requested
                  </div>
                  <div style="font-family: ${fonts.body}; font-size: 13px; color: ${colors.textMuted}; line-height: 1.5;">
                    ${escapeHtml(f.solutionRequests[0])}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </td>
      </tr>
      ` : ''}

      <!-- Blog Recommendations -->
      ${blogTopics.length > 0 ? `
      <tr>
        <td style="padding: 24px 0;">
          <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${config.color}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">
            ◆ Blog Topics This Week
          </div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${blogTopics.map(topic => `
              <tr>
                <td style="padding: 12px 16px; background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; margin-bottom: 8px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td>
                        <span style="display: inline-block; width: 8px; height: 8px; background: ${topic.isDuplicate ? colors.textSubtle : colors.success}; border-radius: 50%; margin-right: 12px;"></span>
                        <span style="font-family: ${fonts.body}; font-size: 14px; color: ${topic.isDuplicate ? colors.textSubtle : colors.text}; ${topic.isDuplicate ? 'text-decoration: line-through;' : ''}">
                          ${escapeHtml(topic.title)}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <span style="font-family: ${fonts.mono}; font-size: 10px; padding: 3px 8px; background: ${topic.isDuplicate ? colors.textSubtle + '20' : colors.success + '20'}; color: ${topic.isDuplicate ? colors.textSubtle : colors.success}; border-radius: 3px; text-transform: uppercase;">
                          ${topic.isDuplicate ? 'Skip' : 'Write'}
                        </span>
                      </td>
                    </tr>
                    ${topic.isDuplicate && topic.existingPostTitle ? `
                    <tr>
                      <td colspan="2" style="padding-top: 8px;">
                        <span style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                          Similar to: ${escapeHtml(topic.existingPostTitle)}
                        </span>
                      </td>
                    </tr>
                    ` : ''}
                    ${topic.targetKeywords.length > 0 ? `
                    <tr>
                      <td colspan="2" style="padding-top: 8px;">
                        ${topic.targetKeywords.map(kw => `
                          <span style="display: inline-block; font-family: ${fonts.mono}; font-size: 10px; color: ${colors.textMuted}; background: ${colors.bgSubtle}; padding: 2px 6px; border-radius: 3px; margin-right: 4px; margin-bottom: 4px;">
                            ${escapeHtml(kw)}
                          </span>
                        `).join('')}
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>
              <tr><td style="height: 8px;"></td></tr>
            `).join('')}
          </table>
        </td>
      </tr>
      ` : ''}
    </table>
  `;
}

/**
 * Generate the weekly blog calendar
 */
function generateBlogCalendar(blogTopics: Record<ProjectName, BlogTopic[]>): string {
  const allTopics = Object.entries(blogTopics)
    .flatMap(([project, topics]) =>
      topics.filter(t => !t.isDuplicate).map(t => ({ ...t, project: project as ProjectName }))
    )
    .slice(0, 7);

  if (allTopics.length === 0) return '';

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
      <tr>
        <td style="padding: 24px; background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 8px;">
          <div style="font-family: ${fonts.display}; font-size: 18px; font-weight: 600; color: ${colors.text}; margin-bottom: 20px; letter-spacing: -0.3px;">
            Weekly Blog Calendar
          </div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${allTopics.map((topic, i) => {
              const projectColor = topic.project === 'sponsorbase' ? colors.sponsorbase : colors.luma;
              return `
                <tr>
                  <td style="width: 50px; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                    <span style="font-family: ${fonts.mono}; font-size: 12px; color: ${colors.textSubtle}; text-transform: uppercase;">
                      ${days[i % 7]}
                    </span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid ${colors.border};">
                    <span style="display: inline-block; padding: 2px 6px; background: ${projectColor}20; color: ${projectColor}; font-family: ${fonts.mono}; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 3px; margin-right: 10px;">
                      ${topic.project === 'sponsorbase' ? 'SB' : 'LC'}
                    </span>
                    <span style="font-family: ${fonts.body}; font-size: 13px; color: ${colors.text};">
                      ${escapeHtml(topic.title)}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate the priorities footer
 */
function generatePrioritiesFooter(findings: ResearchFinding[]): string {
  // Extract top action items from all findings
  const allActions = findings
    .flatMap(f => f.actionItems.map(a => ({ action: a, project: f.project, priority: f.priority })))
    .filter(a => a.action.length > 10)
    .slice(0, 3);

  if (allActions.length === 0) {
    // Fallback to key insights
    const topInsights = findings
      .filter(f => f.priority === 'urgent' || f.priority === 'high')
      .slice(0, 3)
      .map(f => ({ action: f.mostImportantInsight, project: f.project, priority: f.priority }));

    if (topInsights.length === 0) return '';
    allActions.push(...topInsights);
  }

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 40px; border-top: 2px solid ${colors.border}; padding-top: 32px;">
      <tr>
        <td>
          <div style="font-family: ${fonts.display}; font-size: 18px; font-weight: 600; color: ${colors.text}; margin-bottom: 20px; letter-spacing: -0.3px;">
            Top ${allActions.length} Priorities Today
          </div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${allActions.map((item, i) => {
              const projectColor = item.project === 'sponsorbase' ? colors.sponsorbase : colors.luma;
              return `
                <tr>
                  <td style="padding: 16px; background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; margin-bottom: 12px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background: ${projectColor}20; border-radius: 50%; text-align: center; line-height: 28px; font-family: ${fonts.mono}; font-size: 12px; font-weight: 600; color: ${projectColor};">
                            ${i + 1}
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <div style="font-family: ${fonts.body}; font-size: 14px; color: ${colors.text}; line-height: 1.5;">
                            ${escapeHtml(item.action)}
                          </div>
                          <div style="margin-top: 8px;">
                            <span style="font-family: ${fonts.mono}; font-size: 10px; color: ${projectColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${item.project}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
              `;
            }).join('')}
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate the complete morning digest email
 */
export function generateMorningDigestEmail(
  findings: ResearchFinding[],
  blogTopics: Partial<Record<ProjectName, BlogTopic[]>>,
  blogCheckResults: BlogCheckResult[]
): string {
  const urgentFindings = findings.filter(f => f.priority === 'urgent' || f.priority === 'high');
  const sponsorbaseFindings = findings.filter(f => f.project === 'sponsorbase');
  const lumaFindings = findings.filter(f => f.project === 'luma');

  // Ensure blogTopics has default empty arrays
  const safeBlogTopics: Record<ProjectName, BlogTopic[]> = {
    sponsorbase: blogTopics.sponsorbase || [],
    luma: blogTopics.luma || [],
    marina: blogTopics.marina || [],
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Research Digest - ${formatDate()}</title>
</head>
<body style="margin: 0; padding: 0; background: ${colors.bg}; font-family: ${fonts.body};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${colors.bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 40px; border-bottom: 1px solid ${colors.border};">
              <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                Daily Research Digest
              </div>
              <div style="font-family: ${fonts.display}; font-size: 32px; font-weight: 600; color: ${colors.text}; letter-spacing: -1px; line-height: 1.2;">
                ${formatDate()}
              </div>
              <div style="font-family: ${fonts.mono}; font-size: 12px; color: ${colors.textMuted}; margin-top: 12px;">
                Generated at ${formatTime()} · ${findings.length} queries processed
              </div>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 40px;"></td></tr>

          <!-- Urgent Banner -->
          <tr>
            <td>
              ${generateUrgentBanner(urgentFindings)}
            </td>
          </tr>

          <!-- SponsorBase Section -->
          <tr>
            <td>
              ${generateProjectSection('sponsorbase', sponsorbaseFindings, safeBlogTopics.sponsorbase)}
            </td>
          </tr>

          <!-- Luma Comply Section -->
          <tr>
            <td>
              ${generateProjectSection('luma', lumaFindings, safeBlogTopics.luma)}
            </td>
          </tr>

          <!-- Weekly Blog Calendar -->
          <tr>
            <td>
              ${generateBlogCalendar(safeBlogTopics)}
            </td>
          </tr>

          <!-- Priorities Footer -->
          <tr>
            <td>
              ${generatePrioritiesFooter(findings)}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 48px; border-top: 1px solid ${colors.border}; margin-top: 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                    Research Automation System · research.edwardguillen.com
                  </td>
                  <td style="text-align: right; font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                    ${formatDate()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate the evening catch-up email
 */
export function generateEveningCatchupEmail(urgentItems: UrgentItem[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evening Update - ${formatDate()}</title>
</head>
<body style="margin: 0; padding: 0; background: ${colors.bg}; font-family: ${fonts.body};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${colors.bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; border-bottom: 1px solid ${colors.border};">
              <div style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.high}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                Evening Catch-Up
              </div>
              <div style="font-family: ${fonts.display}; font-size: 28px; font-weight: 600; color: ${colors.text}; letter-spacing: -0.5px; line-height: 1.2;">
                ${urgentItems.length} New Item${urgentItems.length !== 1 ? 's' : ''} Since Morning
              </div>
              <div style="font-family: ${fonts.mono}; font-size: 12px; color: ${colors.textMuted}; margin-top: 12px;">
                ${formatTime()} · ${formatDate()}
              </div>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 32px;"></td></tr>

          <!-- Urgent Items -->
          <tr>
            <td>
              ${urgentItems.map(item => {
                const priorityColor = item.priority === 'urgent' ? colors.urgent : colors.high;
                const projectColor = item.project === 'sponsorbase' ? colors.sponsorbase : colors.luma;

                return `
                  <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-left: 3px solid ${priorityColor}; border-radius: 6px; padding: 20px; margin-bottom: 16px;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; padding: 2px 8px; background: ${projectColor}20; color: ${projectColor}; font-family: ${fonts.mono}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 3px; margin-right: 8px;">
                        ${escapeHtml(item.project)}
                      </span>
                      <span style="display: inline-block; padding: 2px 8px; background: ${priorityColor}20; color: ${priorityColor}; font-family: ${fonts.mono}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 3px;">
                        ${escapeHtml(item.priority)}
                      </span>
                    </div>
                    <div style="font-family: ${fonts.body}; font-size: 15px; color: ${colors.text}; line-height: 1.6;">
                      ${escapeHtml(item.summary)}
                    </div>
                    ${item.source ? `
                      <div style="margin-top: 12px;">
                        <a href="${escapeHtml(item.source)}" style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.accent}; text-decoration: none;">
                          View Source →
                        </a>
                      </div>
                    ` : ''}
                    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid ${colors.border};">
                      <span style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                        Action needed: <span style="color: ${priorityColor}; font-weight: 600;">Yes</span>
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid ${colors.border}; margin-top: 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                    Research Automation System
                  </td>
                  <td style="text-align: right; font-family: ${fonts.mono}; font-size: 11px; color: ${colors.textSubtle};">
                    Next morning digest at 6:30 AM MST
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
