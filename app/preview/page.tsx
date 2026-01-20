'use client';

import { useState } from 'react';

// Mock data for preview
const mockFindings = [
  {
    query: 'creator sponsorship management tools new features 2026',
    project: 'sponsorbase' as const,
    category: 'competitor_intel' as const,
    keyFindings: [
      'Grin launched AI-powered campaign recommendations feature',
      'AspireIQ now offers automated payment splitting for multi-creator deals',
      'CreatorIQ pricing increased 15% for enterprise tier',
    ],
    mostImportantInsight: 'Grin launched AI-powered campaign recommendations, positioning as direct competitor to SponsorBase\'s planned features',
    painPoints: [],
    solutionRequests: ['Need affordable alternative to enterprise tools'],
    actionItems: ['Analyze Grin\'s new AI feature set', 'Consider accelerating AI roadmap'],
    priority: 'high' as const,
    sources: [{ title: 'Source', url: 'https://example.com/grin-update' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/NewTubers sponsorship tracking problems',
    project: 'sponsorbase' as const,
    category: 'reddit_pain_points' as const,
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
    priority: 'medium' as const,
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/NewTubers' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'CMS prior authorization rule changes 2026',
    project: 'luma' as const,
    category: 'regulatory_updates' as const,
    keyFindings: [
      'CMS finalizing new prior auth transparency requirements',
      'Electronic prior auth mandate taking effect Q2 2026',
      'New documentation standards for biologics approvals',
    ],
    mostImportantInsight: 'CMS electronic prior authorization mandate goes into effect Q2 2026 - major compliance deadline approaching',
    painPoints: [],
    solutionRequests: ['Need compliant documentation tools'],
    actionItems: ['Review CMS requirements', 'Update compliance documentation', 'Prepare customer communications'],
    priority: 'urgent' as const,
    sources: [{ title: 'CMS.gov', url: 'https://cms.gov/prior-auth-2026' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
  {
    query: 'site:reddit.com r/medicine prior authorization nightmare',
    project: 'luma' as const,
    category: 'reddit_pain_points' as const,
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
    priority: 'high' as const,
    sources: [{ title: 'Reddit', url: 'https://reddit.com/r/medicine' }],
    rawResponse: '',
    timestamp: new Date().toISOString(),
  },
];

const mockBlogTopics = {
  sponsorbase: [
    { title: 'How to Negotiate Your First Brand Deal: A Complete Guide for Micro-Influencers', targetKeywords: ['brand deal', 'negotiate', 'micro-influencer'], project: 'sponsorbase' as const, isDuplicate: false },
    { title: '5 Red Flags in Sponsorship Contracts Every Creator Should Know', targetKeywords: ['sponsorship', 'contract', 'creator'], project: 'sponsorbase' as const, isDuplicate: false },
    { title: 'Building Your Media Kit: What Brands Actually Want to See', targetKeywords: ['media kit', 'brand', 'influencer'], project: 'sponsorbase' as const, isDuplicate: true, existingPostTitle: 'Creating the Perfect Media Kit' },
  ],
  luma: [
    { title: 'Prior Authorization in 2026: What Healthcare Providers Need to Know', targetKeywords: ['prior authorization', 'healthcare', '2026'], project: 'luma' as const, isDuplicate: false },
    { title: 'HIPAA-Compliant AI: Navigating Documentation Tools Safely', targetKeywords: ['HIPAA', 'AI', 'documentation'], project: 'luma' as const, isDuplicate: false },
    { title: 'Reducing Prior Auth Denials: Documentation Best Practices', targetKeywords: ['prior auth', 'denials', 'documentation'], project: 'luma' as const, isDuplicate: true, existingPostTitle: 'Prior Authorization Documentation Guide' },
  ],
  marina: [],
};

const mockUrgentItems = [
  {
    project: 'luma' as const,
    summary: 'CMS announces accelerated timeline for electronic prior authorization mandate - now effective March 2026 instead of Q2',
    source: 'https://cms.gov/prior-auth-update',
    priority: 'urgent' as const,
    category: 'regulatory_updates' as const,
    timestamp: new Date().toISOString(),
  },
  {
    project: 'sponsorbase' as const,
    summary: 'Major competitor Grin raises $50M Series C, plans aggressive expansion into micro-influencer market',
    source: 'https://techcrunch.com/grin-series-c',
    priority: 'high' as const,
    category: 'competitor_intel' as const,
    timestamp: new Date().toISOString(),
  },
];

export default function PreviewPage() {
  const [emailType, setEmailType] = useState<'morning' | 'evening'>('morning');
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/preview-email?type=${emailType}`);
      const data = await response.json();
      setEmailHtml(data.html);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Controls */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <h1 className="text-xl font-semibold text-zinc-100">Email Template Preview</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setEmailType('morning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                emailType === 'morning'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Morning Digest
            </button>
            <button
              onClick={() => setEmailType('evening')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                emailType === 'evening'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Evening Catch-Up
            </button>
          </div>

          <button
            onClick={generatePreview}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Preview'}
          </button>

          <a
            href="/"
            className="ml-auto text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {emailHtml ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm text-zinc-400">
                  {emailType === 'morning' ? 'Daily Research Digest' : 'Evening Update'} - Preview
                </span>
              </div>
              <iframe
                srcDoc={emailHtml}
                className="w-full h-[800px] border-0"
                title="Email Preview"
              />
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <div className="text-zinc-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-zinc-300 mb-2">Email Template Preview</h2>
              <p className="text-zinc-500 mb-6">
                Select an email type and click &quot;Generate Preview&quot; to see the template with mock data.
              </p>
              <p className="text-sm text-zinc-600">
                This preview uses sample data to demonstrate how the email will look.
                <br />
                No ChatGPT API calls are made - templates are generated locally.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-6 pb-6">
        <div className="max-w-4xl mx-auto bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
          <div className="flex items-start gap-4">
            <div className="text-cyan-500 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-1">Cost Savings</h3>
              <p className="text-sm text-zinc-500">
                This custom template replaces the ChatGPT formatting step, saving approximately $0.50 per digest
                (roughly $15-20/month). The template uses inline CSS for maximum email client compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
