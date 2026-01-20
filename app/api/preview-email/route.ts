/**
 * Preview Email API Endpoint
 * Generates email previews with mock data for testing templates
 */

import { NextResponse } from 'next/server';
import { generateMorningDigestEmail, generateEveningCatchupEmail } from '@/lib/emailTemplate';
import { ResearchFinding, BlogTopic, UrgentItem, ProjectName } from '@/types';

// Mock data for preview
const mockFindings: ResearchFinding[] = [
  {
    query: 'creator sponsorship management tools new features 2026',
    project: 'sponsorbase',
    category: 'competitor_intel',
    keyFindings: [
      'Grin launched AI-powered campaign recommendations feature',
      'AspireIQ now offers automated payment splitting for multi-creator deals',
      'CreatorIQ pricing increased 15% for enterprise tier',
    ],
    mostImportantInsight: 'Grin launched AI-powered campaign recommendations, positioning as direct competitor to SponsorBase\'s planned features',
    painPoints: [],
    solutionRequests: ['Need affordable alternative to enterprise tools'],
    actionItems: ['Analyze Grin\'s new AI feature set', 'Consider accelerating AI roadmap'],
    priority: 'high',
    sources: [{ title: 'TechCrunch', url: 'https://techcrunch.com/grin-update' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/NewTubers sponsorship tracking problems',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
    keyFindings: [
      'Creators frustrated with spreadsheet-based tracking',
      'Payment delays causing cash flow issues',
    ],
    mostImportantInsight: 'Multiple creators expressing frustration with manual tracking methods',
    painPoints: [
      {
        quote: 'I spent 3 hours last week just updating my sponsorship spreadsheet. There has to be a better way to track all these deliverables and deadlines.',
        subreddit: 'NewTubers',
        emotionalLanguage: ['frustrated'],
      },
      {
        quote: 'Another brand ghosted me after I delivered the content. Wish I had some way to track payment status automatically.',
        subreddit: 'NewTubers',
        emotionalLanguage: ['wish'],
      },
    ],
    solutionRequests: ['Automated deliverable tracking', 'Payment status notifications'],
    actionItems: ['Add deliverable reminder feature', 'Build payment tracking integration'],
    priority: 'medium',
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/NewTubers' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/influencermarketing managing brand deals',
    project: 'sponsorbase',
    category: 'reddit_pain_points',
    keyFindings: [
      'Mid-tier influencers struggling with contract management',
      'Lack of standardized rate cards causing pricing confusion',
    ],
    mostImportantInsight: 'Creators need better tools for managing multiple simultaneous brand relationships',
    painPoints: [
      {
        quote: 'Managing 5 different brand deals at once is a nightmare. Each has different deliverable requirements, deadlines, and payment terms. I need a central dashboard.',
        subreddit: 'influencermarketing',
        emotionalLanguage: ['nightmare'],
      },
    ],
    solutionRequests: ['Central dashboard for all deals', 'Standardized contract templates'],
    actionItems: ['Improve multi-deal dashboard view', 'Add contract template library'],
    priority: 'medium',
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/influencermarketing' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'CMS prior authorization rule changes 2026',
    project: 'luma',
    category: 'regulatory_updates',
    keyFindings: [
      'CMS finalizing new prior auth transparency requirements',
      'Electronic prior auth mandate taking effect Q2 2026',
      'New documentation standards for biologics approvals',
    ],
    mostImportantInsight: 'CMS electronic prior authorization mandate goes into effect Q2 2026 - major compliance deadline approaching',
    painPoints: [],
    solutionRequests: ['Need compliant documentation tools'],
    actionItems: ['Review CMS requirements', 'Update compliance documentation', 'Prepare customer communications'],
    priority: 'urgent',
    sources: [{ title: 'CMS.gov', url: 'https://cms.gov/prior-auth-2026' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'HIPAA compliance healthcare AI updates',
    project: 'luma',
    category: 'regulatory_updates',
    keyFindings: [
      'HHS issues new guidance on AI in healthcare documentation',
      'BAA requirements clarified for AI tool providers',
      'Audit focus shifting to AI-generated documentation accuracy',
    ],
    mostImportantInsight: 'HHS clarifies that AI-generated medical documentation requires same HIPAA protections as human-created records',
    painPoints: [],
    solutionRequests: ['Clear HIPAA compliance documentation for AI tools'],
    actionItems: ['Update BAA templates', 'Review AI documentation audit trails'],
    priority: 'high',
    sources: [{ title: 'HHS.gov', url: 'https://hhs.gov/hipaa-ai-guidance' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/medicine prior authorization nightmare',
    project: 'luma',
    category: 'reddit_pain_points',
    keyFindings: [
      'Physicians spending 2+ hours daily on prior auth',
      'Denial rates increasing for biologics',
    ],
    mostImportantInsight: 'Healthcare providers reporting significant increase in prior auth denials',
    painPoints: [
      {
        quote: 'I spent my entire lunch break on hold with insurance trying to get a prior auth approved for a patient who clearly needs this medication. The system is broken.',
        subreddit: 'medicine',
        emotionalLanguage: ['nightmare', 'frustrated'],
      },
      {
        quote: 'Just had another biologic denied despite 6 pages of documentation. The appeals process is a nightmare and my patients suffer.',
        subreddit: 'medicine',
        emotionalLanguage: ['nightmare'],
      },
    ],
    solutionRequests: ['Automated documentation generation', 'Appeal letter templates'],
    actionItems: ['Improve biologic documentation templates', 'Add appeal workflow feature'],
    priority: 'high',
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/medicine' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/healthIT HIPAA compliant AI tools',
    project: 'luma',
    category: 'reddit_pain_points',
    keyFindings: [
      'IT admins concerned about shadow AI usage',
      'Need for vetted, compliant AI documentation tools',
    ],
    mostImportantInsight: 'Healthcare IT departments actively seeking HIPAA-compliant alternatives to consumer AI tools',
    painPoints: [
      {
        quote: 'Caught three physicians using ChatGPT for clinical documentation this month. We need to give them a compliant alternative before we have a breach.',
        subreddit: 'healthIT',
        emotionalLanguage: ['hate', 'frustrated'],
      },
    ],
    solutionRequests: ['Enterprise HIPAA-compliant AI platform', 'Clear audit logging'],
    actionItems: ['Highlight HIPAA compliance in marketing', 'Add enterprise audit dashboard'],
    priority: 'medium',
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/healthIT' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
];

const mockBlogTopics: Partial<Record<ProjectName, BlogTopic[]>> = {
  sponsorbase: [
    { title: 'How to Negotiate Your First Brand Deal: A Complete Guide for Micro-Influencers', targetKeywords: ['brand deal', 'negotiate', 'micro-influencer'], project: 'sponsorbase', isDuplicate: false },
    { title: '5 Red Flags in Sponsorship Contracts Every Creator Should Know', targetKeywords: ['sponsorship', 'contract', 'creator'], project: 'sponsorbase', isDuplicate: false },
    { title: 'Building Your Media Kit: What Brands Actually Want to See', targetKeywords: ['media kit', 'brand', 'influencer'], project: 'sponsorbase', isDuplicate: true, existingPostTitle: 'Creating the Perfect Media Kit' },
    { title: 'The Ultimate Guide to Sponsorship Pricing for Small Creators', targetKeywords: ['sponsorship', 'pricing', 'creator'], project: 'sponsorbase', isDuplicate: false },
  ],
  luma: [
    { title: 'Prior Authorization in 2026: What Healthcare Providers Need to Know', targetKeywords: ['prior authorization', 'healthcare', '2026'], project: 'luma', isDuplicate: false },
    { title: 'HIPAA-Compliant AI: Navigating Documentation Tools Safely', targetKeywords: ['HIPAA', 'AI', 'documentation'], project: 'luma', isDuplicate: false },
    { title: 'Reducing Prior Auth Denials: Documentation Best Practices', targetKeywords: ['prior auth', 'denials', 'documentation'], project: 'luma', isDuplicate: true, existingPostTitle: 'Prior Authorization Documentation Guide' },
    { title: 'The True Cost of Prior Authorization: A 2026 Analysis', targetKeywords: ['prior auth', 'cost', 'healthcare'], project: 'luma', isDuplicate: false },
  ],
  marina: [],
};

const mockUrgentItems: UrgentItem[] = [
  {
    project: 'luma',
    summary: 'CMS announces accelerated timeline for electronic prior authorization mandate - now effective March 2026 instead of Q2',
    source: 'https://cms.gov/prior-auth-update',
    priority: 'urgent',
    category: 'regulatory_updates',
    timestamp: new Date().toISOString(),
  },
  {
    project: 'sponsorbase',
    summary: 'Major competitor Grin raises $50M Series C, plans aggressive expansion into micro-influencer market segment',
    source: 'https://techcrunch.com/grin-series-c',
    priority: 'high',
    category: 'competitor_intel',
    timestamp: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'morning';

  try {
    let html: string;

    if (type === 'evening') {
      html = generateEveningCatchupEmail(mockUrgentItems);
    } else {
      html = generateMorningDigestEmail(
        mockFindings,
        mockBlogTopics,
        [] // Empty blog check results for preview
      );
    }

    return NextResponse.json({ html, type });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
