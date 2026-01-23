# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build with TypeScript checking
npm run lint     # Run ESLint
```

### Testing Endpoints Locally

```bash
# Test status page
curl http://localhost:3000/api/status

# Test email configuration
curl http://localhost:3000/api/test-email

# Trigger weekly digest (warning: uses API credits)
curl http://localhost:3000/api/cron/morning-digest
```

## Architecture

This is a Next.js 15 App Router application that runs automated research digests via Vercel Cron Jobs.

### Data Flow

1. **Cron triggers** → `app/api/cron/morning-digest/route.ts` (runs weekly on Mondays)
2. **Research queries** → `lib/perplexity.ts` calls Perplexity API (sonar-pro model) with rate limiting
3. **Duplicate filtering** → `lib/historyTracker.ts` checks against last 3 weeks of findings stored in `data/history.md`
4. **Blog duplicate check** → `lib/blogChecker.ts` fetches existing posts via Perplexity
5. **Email formatting** → Custom template in `lib/emailTemplate.ts` (no GPT-4o needed)
6. **Email delivery** → `lib/resend.ts` sends via Resend API
7. **History update** → New findings saved to `data/history.md` (and Vercel KV in production)

### Key Files

- `lib/queries.ts` - All research queries organized by project (sponsorbase, luma). Edit this to add/modify queries.
- `lib/historyTracker.ts` - Manages 3-week history in markdown file to prevent duplicate findings.
- `lib/resend.ts` - Email configuration including sender/recipient addresses in `EMAIL_CONFIG`.
- `data/history.md` - Stores last 3 weeks of research findings for duplicate detection.
- `types/index.ts` - All TypeScript interfaces (`ResearchFinding`, `UrgentItem`, `BlogTopic`, etc.)

### Cron Schedule (vercel.json)

Schedule is in UTC:
- Weekly Monday: `30 13 * * 1` = 1:30pm UTC = 6:30am MST

### Projects Tracked

Two projects with different query types:
- **sponsorbase**: Creator sponsorship SaaS - competitor intel, Reddit pain points
- **luma**: HIPAA medical documentation - regulatory updates, provider pain points

### Error Handling Strategy

- Individual query failures are logged but don't stop the job
- If OpenAI formatting fails, `generateFallbackEmail()` sends raw data
- If Resend fails, retries once before logging error
- If urgent tracker fails, emails still send but deduplication may not work

## Environment Variables

Required: `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`

Optional: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (for Vercel KV), `CRON_SECRET` (for endpoint security)
