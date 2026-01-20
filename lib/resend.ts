/**
 * Resend Email Wrapper
 * Handles email delivery for research digests
 */

import { Resend } from 'resend';
import { EmailSendResult } from '@/types';

// Initialize Resend client
function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  return new Resend(apiKey);
}

// Email configuration
const EMAIL_CONFIG = {
  from: 'Research Digest <noreply@edwardguillen.com>',
  morningTo: 'hello@edwardguillen.com',
  eveningTo: 'hello@edwardguillen.com',
};

/**
 * Format today's date for email subject
 */
function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Send the morning digest email
 */
export async function sendMorningDigest(htmlBody: string): Promise<EmailSendResult> {
  try {
    const client = getClient();
    const date = formatDate();

    const { data, error } = await client.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.morningTo,
      subject: `Daily Research Digest - ${date}`,
      html: htmlBody,
    });

    if (error) {
      // Retry once on failure
      console.log('First send attempt failed, retrying...');
      const retryResult = await client.emails.send({
        from: EMAIL_CONFIG.from,
        to: EMAIL_CONFIG.morningTo,
        subject: `Daily Research Digest - ${date}`,
        html: htmlBody,
      });

      if (retryResult.error) {
        return {
          success: false,
          error: `Failed after retry: ${retryResult.error.message}`,
        };
      }

      return {
        success: true,
        messageId: retryResult.data?.id,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Send error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Send the evening catch-up email
 */
export async function sendEveningCatchup(
  htmlBody: string,
  urgentCount: number
): Promise<EmailSendResult> {
  try {
    const client = getClient();
    const date = formatDate();

    const { data, error } = await client.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.eveningTo,
      subject: `Evening Update: ${urgentCount} new item${urgentCount !== 1 ? 's' : ''} - ${date}`,
      html: htmlBody,
    });

    if (error) {
      // Retry once on failure
      console.log('First send attempt failed, retrying...');
      const retryResult = await client.emails.send({
        from: EMAIL_CONFIG.from,
        to: EMAIL_CONFIG.eveningTo,
        subject: `Evening Update: ${urgentCount} new item${urgentCount !== 1 ? 's' : ''} - ${date}`,
        html: htmlBody,
      });

      if (retryResult.error) {
        return {
          success: false,
          error: `Failed after retry: ${retryResult.error.message}`,
        };
      }

      return {
        success: true,
        messageId: retryResult.data?.id,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Send error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(): Promise<EmailSendResult> {
  try {
    const client = getClient();

    const { data, error } = await client.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.morningTo,
      subject: 'Research Automation System - Test Email',
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h1>Test Email</h1>
  <p>If you're receiving this email, your Research Automation System is configured correctly.</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <hr>
  <p style="color: #666; font-size: 14px;">
    Morning digest runs at 6:30am CT<br>
    Evening catch-up runs at 8:00pm CT
  </p>
</div>
      `.trim(),
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Test email error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Send an error notification email
 */
export async function sendErrorNotification(
  jobType: 'morning' | 'evening',
  errors: string[]
): Promise<EmailSendResult> {
  try {
    const client = getClient();
    const date = formatDate();

    const { data, error } = await client.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.morningTo,
      subject: `Research System Error - ${jobType} job - ${date}`,
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h1 style="color: #dc3545;">Research System Error</h1>
  <p>The ${jobType} research job encountered errors:</p>
  <ul style="background: #f8f9fa; padding: 20px 40px; border-radius: 5px;">
    ${errors.map(e => `<li style="color: #dc3545;">${e}</li>`).join('')}
  </ul>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <p>Check Vercel logs for more details.</p>
</div>
      `.trim(),
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
