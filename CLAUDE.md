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

# Trigger morning digest (warning: uses API credits)
curl http://localhost:3000/api/cron/morning-digest

# Trigger evening catch-up
curl http://localhost:3000/api/cron/evening-catchup
```

## Architecture

This is a Next.js 15 App Router application that runs automated research digests via Vercel Cron Jobs.

### Data Flow

1. **Cron triggers** → `app/api/cron/morning-digest/route.ts` or `evening-catchup/route.ts`
2. **Research queries** → `lib/perplexity.ts` calls Perplexity API (sonar-pro model) with rate limiting
3. **Blog duplicate check** → `lib/blogChecker.ts` fetches existing posts via Perplexity
4. **Email formatting** → `lib/openai.ts` uses GPT-4o to format HTML email
5. **Email delivery** → `lib/resend.ts` sends via Resend API
6. **State tracking** → `lib/urgentTracker.ts` saves urgent items to Vercel KV for morning/evening deduplication

### Key Files

- `lib/queries.ts` - All research queries organized by project (sponsorbase, luma, marina) and job type (morning/evening). Edit this to add/modify queries.
- `lib/resend.ts` - Email configuration including sender/recipient addresses in `EMAIL_CONFIG`.
- `types/index.ts` - All TypeScript interfaces (`ResearchFinding`, `UrgentItem`, `BlogTopic`, etc.)

### Cron Schedules (vercel.json)

Schedules are in UTC:
- Morning: `30 12 * * *` = 12:30pm UTC = 6:30am CT
- Evening: `0 2 * * *` = 2:00am UTC = 8:00pm CT

### Projects Tracked

Three projects with different query types:
- **sponsorbase**: Creator sponsorship SaaS - competitor intel, Reddit pain points
- **luma**: HIPAA medical documentation - regulatory updates, provider pain points
- **marina**: El Paso real estate - market intel, Fort Bliss housing

### Error Handling Strategy

- Individual query failures are logged but don't stop the job
- If OpenAI formatting fails, `generateFallbackEmail()` sends raw data
- If Resend fails, retries once before logging error
- If urgent tracker fails, emails still send but deduplication may not work

## Environment Variables

Required: `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`

Optional: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (for Vercel KV), `CRON_SECRET` (for endpoint security)
