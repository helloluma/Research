/**
 * Evening Catch-Up Cron Job
 * Runs at 8:00pm MST (3:00am UTC next day)
 *
 * Quick scan for NEW urgent items since morning.
 * Only sends email if new urgent items are found.
 *
 * Uses custom email template (no ChatGPT - saves ~$0.10/run)
 */

import { NextResponse } from 'next/server';
import { processQueries, isUrgentResult } from '@/lib/perplexity';
import { generateEveningCatchupEmail } from '@/lib/emailTemplate';
import { sendEveningCatchup } from '@/lib/resend';
import {
  loadMorningUrgentItems,
  saveEveningUrgentItems,
  filterNewUrgentItems,
  extractUrgentItems,
} from '@/lib/urgentTracker';
import { getEveningQueries } from '@/lib/queries';
import { CronJobResult } from '@/types';

// Vercel cron security
const CRON_SECRET = process.env.CRON_SECRET;

export const maxDuration = 60; // 1 minute timeout should be enough
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  const errors: string[] = [];
  let emailSent = false;

  console.log('=== Starting Evening Catch-Up Cron Job ===');
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
    // STEP 1: Load morning urgent items for comparison
    console.log('\n--- Step 1: Loading Morning Urgent Items ---');
    const morningItems = await loadMorningUrgentItems();
    console.log(`Loaded ${morningItems.length} morning urgent items`);

    // STEP 2: Run evening urgent-focused queries
    console.log('\n--- Step 2: Processing Evening Queries ---');
    const queries = getEveningQueries();
    console.log(`Processing ${queries.length} evening queries...`);

    const { findings, errors: queryErrors } = await processQueries(queries, true);
    errors.push(...queryErrors);

    console.log(`Completed ${findings.length}/${queries.length} queries`);

    // STEP 3: Filter for urgent results only
    console.log('\n--- Step 3: Filtering Urgent Results ---');
    const urgentFindings = findings.filter(isUrgentResult);
    console.log(`Found ${urgentFindings.length} urgent results from queries`);

    if (urgentFindings.length === 0) {
      console.log('No urgent items found in evening scan');
      console.log('=== Evening Catch-Up Complete (No email needed) ===');

      const result: CronJobResult = {
        success: true,
        jobType: 'evening',
        timestamp: new Date().toISOString(),
        queriesProcessed: findings.length,
        urgentItemsFound: 0,
        emailSent: false,
        errors,
      };

      return NextResponse.json(result);
    }

    // STEP 4: Convert to urgent items and filter out morning duplicates
    console.log('\n--- Step 4: Filtering Duplicates from Morning ---');
    const eveningUrgentItems = extractUrgentItems(urgentFindings);
    const newUrgentItems = filterNewUrgentItems(eveningUrgentItems, morningItems);

    console.log(`Evening urgent items: ${eveningUrgentItems.length}`);
    console.log(`After removing morning duplicates: ${newUrgentItems.length}`);

    // Save evening items for tracking
    try {
      await saveEveningUrgentItems(newUrgentItems);
    } catch (error) {
      console.warn('Failed to save evening items:', error);
    }

    // If no NEW urgent items, don't send email
    if (newUrgentItems.length === 0) {
      console.log('No NEW urgent items (all were reported this morning)');
      console.log('=== Evening Catch-Up Complete (No email needed) ===');

      const result: CronJobResult = {
        success: true,
        jobType: 'evening',
        timestamp: new Date().toISOString(),
        queriesProcessed: findings.length,
        urgentItemsFound: 0,
        emailSent: false,
        errors,
      };

      return NextResponse.json(result);
    }

    // STEP 5: Generate evening email with custom template (no ChatGPT!)
    console.log('\n--- Step 5: Generating Evening Email (Custom Template) ---');
    const htmlBody = generateEveningCatchupEmail(newUrgentItems);
    console.log('Email generated successfully using custom template');

    // STEP 6: Send email
    console.log('\n--- Step 6: Sending Evening Email ---');
    const sendResult = await sendEveningCatchup(htmlBody, newUrgentItems.length);

    if (sendResult.success) {
      emailSent = true;
      console.log(`Evening email sent. ID: ${sendResult.messageId}`);
    } else {
      errors.push(`Failed to send email: ${sendResult.error}`);
      console.error(sendResult.error);
    }

    // Calculate duration
    const duration = Date.now() - startTime;
    console.log(`\n=== Evening Catch-Up Complete ===`);
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`New urgent items: ${newUrgentItems.length}`);
    console.log(`Email sent: ${emailSent}`);

    const result: CronJobResult = {
      success: true,
      jobType: 'evening',
      timestamp: new Date().toISOString(),
      queriesProcessed: findings.length,
      urgentItemsFound: newUrgentItems.length,
      emailSent,
      errors,
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    errors.push(errorMsg);

    const result: CronJobResult = {
      success: false,
      jobType: 'evening',
      timestamp: new Date().toISOString(),
      queriesProcessed: 0,
      urgentItemsFound: 0,
      emailSent: false,
      errors,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
