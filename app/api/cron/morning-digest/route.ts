/**
 * Morning Digest Cron Job
 * Runs at 6:30am CT (12:30pm UTC)
 *
 * Full research digest including:
 * - All project queries
 * - Reddit pain points with quotes
 * - Trending blog topics with duplicate checking
 * - Urgent items highlighted at top
 */

import { NextResponse } from 'next/server';
import { processQueries, getTrendingBlogTopics } from '@/lib/perplexity';
import { formatMorningEmail, generateFallbackEmail } from '@/lib/openai';
import { sendMorningDigest, sendErrorNotification } from '@/lib/resend';
import { checkAllBlogs, checkTopicsForDuplicates } from '@/lib/blogChecker';
import {
  saveMorningUrgentItems,
  extractUrgentItems,
} from '@/lib/urgentTracker';
import { getMorningQueries } from '@/lib/queries';
import { BlogTopic, ProjectName, CronJobResult } from '@/types';

// Vercel cron security - verify the request is from Vercel
const CRON_SECRET = process.env.CRON_SECRET;

export const maxDuration = 300; // 5 minute timeout for Vercel Pro
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  const errors: string[] = [];
  let emailSent = false;

  console.log('=== Starting Morning Digest Cron Job ===');
  console.log(`Time: ${new Date().toISOString()}`);

  // Verify cron secret if configured
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // STEP 1: Run all morning research queries
    console.log('\n--- Step 1: Processing Research Queries ---');
    const queries = getMorningQueries();
    console.log(`Processing ${queries.length} queries...`);

    const { findings, errors: queryErrors } = await processQueries(queries, false);
    errors.push(...queryErrors);

    console.log(`Completed ${findings.length}/${queries.length} queries`);
    if (queryErrors.length > 0) {
      console.warn(`Query errors: ${queryErrors.length}`);
    }

    // STEP 2: Get trending blog topics
    console.log('\n--- Step 2: Getting Trending Blog Topics ---');
    const projects: ProjectName[] = ['sponsorbase', 'luma', 'marina'];
    const trendingTopics: Record<ProjectName, string[]> = {
      sponsorbase: [],
      luma: [],
      marina: [],
    };

    for (const project of projects) {
      console.log(`Getting trending topics for ${project}...`);
      const { topics, error } = await getTrendingBlogTopics(project);
      if (error) {
        errors.push(`Blog topics error (${project}): ${error}`);
        console.warn(error);
      } else {
        trendingTopics[project] = topics;
        console.log(`Found ${topics.length} trending topics for ${project}`);
      }
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // STEP 3: Check existing blogs for duplicates
    console.log('\n--- Step 3: Checking Existing Blogs ---');
    const blogCheckResults = await checkAllBlogs();

    for (const result of blogCheckResults) {
      if (!result.success) {
        const errorMsg = `Could not check ${result.project} blog: ${result.error}`;
        errors.push(errorMsg);
        console.warn(errorMsg);
      } else {
        console.log(`${result.project}: Found ${result.existingPosts.length} existing posts`);
      }
    }

    // STEP 4: Check topics for duplicates
    console.log('\n--- Step 4: Checking for Duplicate Topics ---');
    const blogTopics: Record<ProjectName, BlogTopic[]> = {
      sponsorbase: checkTopicsForDuplicates(
        trendingTopics.sponsorbase,
        'sponsorbase',
        blogCheckResults
      ),
      luma: checkTopicsForDuplicates(
        trendingTopics.luma,
        'luma',
        blogCheckResults
      ),
      marina: checkTopicsForDuplicates(
        trendingTopics.marina,
        'marina',
        blogCheckResults
      ),
    };

    const duplicateCount = Object.values(blogTopics)
      .flat()
      .filter(t => t.isDuplicate).length;
    console.log(`Found ${duplicateCount} potential duplicate topics`);

    // STEP 5: Extract and save urgent items
    console.log('\n--- Step 5: Extracting Urgent Items ---');
    const urgentItems = extractUrgentItems(findings);
    console.log(`Found ${urgentItems.length} urgent/high priority items`);

    try {
      await saveMorningUrgentItems(urgentItems);
      console.log('Saved urgent items for evening comparison');
    } catch (error) {
      const errorMsg = `Failed to save urgent items: ${error instanceof Error ? error.message : 'Unknown'}`;
      errors.push(errorMsg);
      console.warn(errorMsg);
    }

    // STEP 6: Format email with ChatGPT
    console.log('\n--- Step 6: Formatting Email ---');
    let htmlBody: string;

    const { htmlBody: formattedHtml, error: formatError } = await formatMorningEmail(
      findings,
      blogTopics,
      blogCheckResults
    );

    if (formatError || !formattedHtml) {
      console.warn(`Email formatting failed: ${formatError}`);
      errors.push(`Email format error: ${formatError}`);
      // Use fallback formatting
      htmlBody = generateFallbackEmail(findings, 'morning');
      console.log('Using fallback email format');
    } else {
      htmlBody = formattedHtml;
      console.log('Email formatted successfully');
    }

    // STEP 7: Send email via Resend
    console.log('\n--- Step 7: Sending Email ---');
    const sendResult = await sendMorningDigest(htmlBody);

    if (sendResult.success) {
      emailSent = true;
      console.log(`Email sent successfully. ID: ${sendResult.messageId}`);
    } else {
      const errorMsg = `Failed to send email: ${sendResult.error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Calculate duration
    const duration = Date.now() - startTime;
    console.log(`\n=== Morning Digest Complete ===`);
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Queries processed: ${findings.length}`);
    console.log(`Urgent items: ${urgentItems.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Email sent: ${emailSent}`);

    // Send error notification if there were significant errors
    if (errors.length > 5 && emailSent) {
      await sendErrorNotification('morning', errors.slice(0, 10));
    }

    const result: CronJobResult = {
      success: emailSent && errors.length < findings.length / 2,
      jobType: 'morning',
      timestamp: new Date().toISOString(),
      queriesProcessed: findings.length,
      urgentItemsFound: urgentItems.length,
      emailSent,
      errors,
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    errors.push(errorMsg);

    // Try to send error notification
    try {
      await sendErrorNotification('morning', errors);
    } catch {
      console.error('Could not send error notification');
    }

    const result: CronJobResult = {
      success: false,
      jobType: 'morning',
      timestamp: new Date().toISOString(),
      queriesProcessed: 0,
      urgentItemsFound: 0,
      emailSent: false,
      errors,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
