/**
 * Test Email Endpoint
 * Send a test email to verify configuration
 */

import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/resend';

export async function GET() {
  console.log('Sending test email...');

  const result = await sendTestEmail();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: result.error,
    },
    { status: 500 }
  );
}
