# Research Automation System

Automated daily research digests for SponsorBase, Luma Comply, and Marina Real Estate projects.

## Features

- **Morning Full Digest (6:30am CT)**: Complete research including competitor intel, Reddit pain points, trending blog topics with duplicate checking, and urgent items highlighted
- **Evening Catch-Up (8pm CT)**: Quick scan for NEW urgent items since morning - only sends email if new items found
- **Blog Duplicate Detection**: Automatically checks existing blog posts before recommending new topics
- **Urgent Item Tracking**: Tracks urgent items between morning and evening runs to avoid duplicates

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Vercel Cron Jobs
- Perplexity API (sonar-pro model)
- OpenAI API (gpt-4o)
- Resend API
- Vercel KV (optional, for urgent item tracking)

## Setup

### 1. Clone and Install

```bash
cd research-automation
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `PERPLEXITY_API_KEY` | Perplexity API key for research queries | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |
| `OPENAI_API_KEY` | OpenAI API key for email formatting | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `RESEND_API_KEY` | Resend API key for sending emails | [resend.com/api-keys](https://resend.com/api-keys) |

Optional environment variables:

| Variable | Description |
|----------|-------------|
| `KV_REST_API_URL` | Vercel KV URL (auto-set when adding KV) |
| `KV_REST_API_TOKEN` | Vercel KV token (auto-set when adding KV) |
| `CRON_SECRET` | Secret for securing cron endpoints |

### 3. Configure Resend Domain

1. Go to [resend.com](https://resend.com) and add your domain
2. Add the required DNS records for `edwardguillen.com`
3. Verify the domain in Resend dashboard

### 4. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 5. Add Environment Variables to Vercel

In the Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables

### 6. (Optional) Add Vercel KV

For persistent urgent item tracking between runs:

1. In Vercel dashboard, go to Storage
2. Create a new KV Database
3. Connect it to your project
4. Environment variables will be auto-configured

### 7. Configure Cron Jobs

Cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/morning-digest",
      "schedule": "30 12 * * *"
    },
    {
      "path": "/api/cron/evening-catchup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Note: Cron schedules are in UTC:
- `30 12 * * *` = 12:30pm UTC = 6:30am CT
- `0 2 * * *` = 2:00am UTC = 8:00pm CT (previous day)

## Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the status page.

### Testing Endpoints

- **Status**: `GET /api/status`
- **Test Email**: `GET /api/test-email`
- **Morning Digest**: `GET /api/cron/morning-digest`
- **Evening Catch-Up**: `GET /api/cron/evening-catchup`

## Project Structure

```
/app
  /api
    /cron
      /morning-digest    # Full morning research digest
        route.ts
      /evening-catchup   # Evening urgent-only catch-up
        route.ts
    /status              # System status endpoint
      route.ts
    /test-email          # Test email endpoint
      route.ts
  page.tsx               # Landing page with status
  layout.tsx
/lib
  perplexity.ts          # Perplexity API wrapper
  openai.ts              # OpenAI API wrapper
  resend.ts              # Resend email wrapper
  queries.ts             # All search queries by project
  blogChecker.ts         # Blog duplicate checking
  urgentTracker.ts       # Urgent item tracking
/types
  index.ts               # TypeScript types
vercel.json              # Cron configuration
```

## Customizing Queries

Edit `/lib/queries.ts` to add, remove, or modify research queries.

Queries are organized by:
- **Project**: sponsorbase, luma, marina
- **Category**: competitor_intel, reddit_pain_points, regulatory_updates, market_intel
- **Job type**: morning (full) vs evening (urgent-only)

## Email Recipients

Edit `/lib/resend.ts` to change email recipients:

```typescript
const EMAIL_CONFIG = {
  from: 'Research Digest <noreply@edwardguillen.com>',
  morningTo: 'hello@edwardguillen.com',
  eveningTo: 'hello@edwardguillen.com',
};
```

## Cost Estimates

Approximate costs per run:
- **Morning digest** (~30 Perplexity queries + 1 OpenAI call): ~$0.50-1.00
- **Evening catch-up** (~7 Perplexity queries): ~$0.10-0.20
- **Monthly total**: ~$20-40

## Troubleshooting

### Cron jobs not running
- Ensure you're on Vercel Pro plan (cron jobs require Pro)
- Check Vercel Functions logs for errors
- Verify environment variables are set correctly

### Emails not sending
- Verify Resend domain is configured and verified
- Check that sender email matches your domain
- Look for errors in Vercel Functions logs

### Blog duplicate checking failing
- Some blogs may block scraping - check error messages
- Fallback: topics will still be recommended with a note about failed checking

## License

Private project - not for redistribution.
