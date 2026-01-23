/**
 * Custom Email Template Generator
 * Clean, readable light theme design
 */

import {
  ResearchFinding,
  BlogTopic,
  BlogCheckResult,
  UrgentItem,
  ProjectName,
} from '@/types';

// Clean light color palette
const colors = {
  bg: '#ffffff',
  bgCard: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  accent: '#2563eb', // blue
  urgent: '#dc2626', // red
  high: '#d97706', // amber
  success: '#059669', // green
};

// Simple font stack
const fonts = {
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Denver',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Denver',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' MST';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateUrgentSection(urgentItems: ResearchFinding[]): string {
  if (urgentItems.length === 0) return '';

  const items = urgentItems.map(item => {
    const priorityColor = item.priority === 'urgent' ? colors.urgent : colors.high;

    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid ${colors.border};">
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; padding: 4px 8px; background: ${priorityColor}15; color: ${priorityColor}; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-right: 8px;">
              ${escapeHtml(item.priority)}
            </span>
            <span style="font-size: 12px; color: ${colors.textMuted};">
              ${escapeHtml(item.project)}
            </span>
          </div>
          <div style="font-size: 15px; color: ${colors.text}; line-height: 1.5;">
            ${escapeHtml(item.mostImportantInsight || item.keyFindings[0] || 'No details available')}
          </div>
          ${item.sources.length > 0 ? `
          <div style="margin-top: 10px;">
            <a href="${escapeHtml(item.sources[0].url)}" style="font-size: 13px; color: ${colors.accent}; text-decoration: none;">
              View source
            </a>
          </div>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px; border: 1px solid ${colors.urgent}30; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 16px; background: ${colors.urgent}08; border-bottom: 1px solid ${colors.urgent}20;">
          <span style="font-size: 16px; font-weight: 600; color: ${colors.urgent};">
            Needs Attention (${urgentItems.length})
          </span>
        </td>
      </tr>
      ${items}
    </table>
  `;
}

function generateProjectSection(
  project: ProjectName,
  findings: ResearchFinding[],
  blogTopics: BlogTopic[]
): string {
  if (findings.length === 0 && blogTopics.length === 0) return '';

  const projectNames: Record<ProjectName, string> = {
    sponsorbase: 'SponsorBase',
    luma: 'Luma Comply',
    marina: 'Marina Real Estate',
  };

  const competitorFindings = findings.filter(f =>
    f.category === 'competitor_intel' || f.category === 'regulatory_updates'
  );
  const redditFindings = findings.filter(f => f.category === 'reddit_pain_points');

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="padding-bottom: 16px; border-bottom: 2px solid ${colors.text};">
          <span style="font-size: 20px; font-weight: 600; color: ${colors.text};">
            ${projectNames[project]}
          </span>
        </td>
      </tr>

      ${competitorFindings.length > 0 ? `
      <tr>
        <td style="padding: 20px 0;">
          <div style="font-size: 13px; font-weight: 600; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            ${project === 'luma' ? 'Regulatory Updates' : 'Competitor Intel'}
          </div>
          ${competitorFindings.map(f => `
            <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
              <div style="font-size: 15px; color: ${colors.text}; line-height: 1.6; margin-bottom: 12px;">
                ${escapeHtml(f.mostImportantInsight)}
              </div>
              ${f.keyFindings.slice(0, 3).map(finding => `
                <div style="font-size: 14px; color: ${colors.textMuted}; padding-left: 12px; border-left: 2px solid ${colors.border}; margin-bottom: 8px; line-height: 1.5;">
                  ${escapeHtml(finding)}
                </div>
              `).join('')}
              ${f.sources.length > 0 ? `
                <div style="margin-top: 12px;">
                  <a href="${escapeHtml(f.sources[0].url)}" style="font-size: 13px; color: ${colors.accent}; text-decoration: none;">
                    Source
                  </a>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </td>
      </tr>
      ` : ''}

      ${redditFindings.length > 0 ? `
      <tr>
        <td style="padding: 20px 0;">
          <div style="font-size: 13px; font-weight: 600; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            Reddit Pain Points
          </div>
          ${redditFindings.slice(0, 4).map(f => `
            <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
              ${f.painPoints.slice(0, 2).map(pp => `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 14px; font-style: italic; color: ${colors.text}; line-height: 1.6; padding: 12px; background: white; border-left: 3px solid ${colors.border}; border-radius: 0 4px 4px 0;">
                    "${escapeHtml(pp.quote)}"
                  </div>
                  ${pp.subreddit ? `
                    <div style="font-size: 12px; color: ${colors.textSubtle}; margin-top: 6px;">
                      r/${escapeHtml(pp.subreddit)}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
              ${f.solutionRequests.length > 0 ? `
                <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid ${colors.border};">
                  <div style="font-size: 12px; color: ${colors.textSubtle}; text-transform: uppercase; margin-bottom: 6px;">
                    Solution Requested
                  </div>
                  <div style="font-size: 14px; color: ${colors.textMuted}; line-height: 1.5;">
                    ${escapeHtml(f.solutionRequests[0])}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </td>
      </tr>
      ` : ''}

      ${blogTopics.length > 0 ? `
      <tr>
        <td style="padding: 20px 0;">
          <div style="font-size: 13px; font-weight: 600; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            Blog Topics
          </div>
          ${blogTopics.map(topic => `
            <div style="padding: 12px 16px; background: ${topic.isDuplicate ? colors.bgCard : 'white'}; border: 1px solid ${colors.border}; border-radius: 6px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: ${topic.isDuplicate ? colors.textSubtle : colors.text}; ${topic.isDuplicate ? 'text-decoration: line-through;' : ''}">
                  ${escapeHtml(topic.title)}
                </span>
                <span style="font-size: 11px; padding: 3px 8px; background: ${topic.isDuplicate ? colors.textSubtle + '20' : colors.success + '15'}; color: ${topic.isDuplicate ? colors.textSubtle : colors.success}; border-radius: 4px; font-weight: 600; text-transform: uppercase; margin-left: 12px;">
                  ${topic.isDuplicate ? 'Skip' : 'Write'}
                </span>
              </div>
              ${topic.isDuplicate && topic.existingPostTitle ? `
                <div style="font-size: 12px; color: ${colors.textSubtle}; margin-top: 6px;">
                  Similar to: ${escapeHtml(topic.existingPostTitle)}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </td>
      </tr>
      ` : ''}
    </table>
  `;
}

function generateBlogCalendar(blogTopics: Record<ProjectName, BlogTopic[]>): string {
  const allTopics = Object.entries(blogTopics)
    .flatMap(([project, topics]) =>
      topics.filter(t => !t.isDuplicate).map(t => ({ ...t, project: project as ProjectName }))
    )
    .slice(0, 7);

  if (allTopics.length === 0) return '';

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 20px; background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 8px;">
          <div style="font-size: 16px; font-weight: 600; color: ${colors.text}; margin-bottom: 16px;">
            Weekly Blog Calendar
          </div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${allTopics.map((topic, i) => `
              <tr>
                <td style="width: 50px; padding: 10px 0; border-bottom: 1px solid ${colors.border};">
                  <span style="font-size: 12px; color: ${colors.textSubtle}; font-weight: 600;">
                    ${days[i % 7]}
                  </span>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid ${colors.border};">
                  <span style="font-size: 12px; color: ${colors.textMuted}; margin-right: 8px;">
                    ${topic.project === 'sponsorbase' ? 'SB' : topic.project === 'luma' ? 'LC' : 'MR'}
                  </span>
                  <span style="font-size: 14px; color: ${colors.text};">
                    ${escapeHtml(topic.title)}
                  </span>
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function generatePriorities(findings: ResearchFinding[]): string {
  const allActions = findings
    .flatMap(f => f.actionItems.map(a => ({ action: a, project: f.project, priority: f.priority })))
    .filter(a => a.action.length > 10)
    .slice(0, 3);

  if (allActions.length === 0) {
    const topInsights = findings
      .filter(f => f.priority === 'urgent' || f.priority === 'high')
      .slice(0, 3)
      .map(f => ({ action: f.mostImportantInsight, project: f.project, priority: f.priority }));

    if (topInsights.length === 0) return '';
    allActions.push(...topInsights);
  }

  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px; border-top: 2px solid ${colors.border}; padding-top: 24px;">
      <tr>
        <td>
          <div style="font-size: 16px; font-weight: 600; color: ${colors.text}; margin-bottom: 16px;">
            Today's Priorities
          </div>
          ${allActions.map((item, i) => `
            <div style="padding: 14px 16px; background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 6px; margin-bottom: 10px;">
              <div style="display: flex; align-items: flex-start;">
                <span style="display: inline-block; width: 24px; height: 24px; background: ${colors.accent}15; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; color: ${colors.accent}; margin-right: 12px; flex-shrink: 0;">
                  ${i + 1}
                </span>
                <div>
                  <div style="font-size: 14px; color: ${colors.text}; line-height: 1.5;">
                    ${escapeHtml(item.action)}
                  </div>
                  <div style="font-size: 12px; color: ${colors.textSubtle}; margin-top: 4px;">
                    ${escapeHtml(item.project)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </td>
      </tr>
    </table>
  `;
}

export function generateMorningDigestEmail(
  findings: ResearchFinding[],
  blogTopics: Partial<Record<ProjectName, BlogTopic[]>>,
  blogCheckResults: BlogCheckResult[]
): string {
  const urgentFindings = findings.filter(f => f.priority === 'urgent' || f.priority === 'high');
  const sponsorbaseFindings = findings.filter(f => f.project === 'sponsorbase');
  const lumaFindings = findings.filter(f => f.project === 'luma');

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
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: ${fonts.body};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px; background: ${colors.bg}; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 32px;">

              <!-- Header -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; color: ${colors.textSubtle}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      Daily Research Digest
                    </div>
                    <div style="font-size: 24px; font-weight: 600; color: ${colors.text};">
                      ${formatDate()}
                    </div>
                    <div style="font-size: 13px; color: ${colors.textMuted}; margin-top: 8px;">
                      ${formatTime()} &middot; ${findings.length} queries
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Urgent Section -->
              ${generateUrgentSection(urgentFindings)}

              <!-- SponsorBase -->
              ${generateProjectSection('sponsorbase', sponsorbaseFindings, safeBlogTopics.sponsorbase)}

              <!-- Luma Comply -->
              ${generateProjectSection('luma', lumaFindings, safeBlogTopics.luma)}

              <!-- Blog Calendar -->
              ${generateBlogCalendar(safeBlogTopics)}

              <!-- Priorities -->
              ${generatePriorities(findings)}

              <!-- Footer -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px; padding-top: 20px; border-top: 1px solid ${colors.border};">
                <tr>
                  <td style="font-size: 12px; color: ${colors.textSubtle};">
                    Research Automation
                  </td>
                  <td style="text-align: right; font-size: 12px; color: ${colors.textSubtle};">
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

export function generateEveningCatchupEmail(urgentItems: UrgentItem[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evening Update - ${formatDate()}</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: ${fonts.body};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px; background: ${colors.bg}; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 32px;">

              <!-- Header -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; color: ${colors.high}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      Evening Catch-Up
                    </div>
                    <div style="font-size: 22px; font-weight: 600; color: ${colors.text};">
                      ${urgentItems.length} New Item${urgentItems.length !== 1 ? 's' : ''} Since Morning
                    </div>
                    <div style="font-size: 13px; color: ${colors.textMuted}; margin-top: 8px;">
                      ${formatTime()} &middot; ${formatDate()}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              ${urgentItems.map(item => {
                const priorityColor = item.priority === 'urgent' ? colors.urgent : colors.high;

                return `
                  <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-left: 3px solid ${priorityColor}; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                    <div style="margin-bottom: 8px;">
                      <span style="display: inline-block; padding: 3px 8px; background: ${priorityColor}15; color: ${priorityColor}; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-right: 8px;">
                        ${escapeHtml(item.priority)}
                      </span>
                      <span style="font-size: 12px; color: ${colors.textMuted};">
                        ${escapeHtml(item.project)}
                      </span>
                    </div>
                    <div style="font-size: 15px; color: ${colors.text}; line-height: 1.6;">
                      ${escapeHtml(item.summary)}
                    </div>
                    ${item.source ? `
                      <div style="margin-top: 12px;">
                        <a href="${escapeHtml(item.source)}" style="font-size: 13px; color: ${colors.accent}; text-decoration: none;">
                          View source
                        </a>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}

              <!-- Footer -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid ${colors.border};">
                <tr>
                  <td style="font-size: 12px; color: ${colors.textSubtle};">
                    Research Automation
                  </td>
                  <td style="text-align: right; font-size: 12px; color: ${colors.textSubtle};">
                    Next digest at 6:30 AM MST
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
