// ============================================================================
// FILE: app/api/cron/process-queue/route.ts
// PURPOSE: Vercel Cron job that runs every minute to process scheduled posts
// ============================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// NOTE: Queue processing is now handled by the external worker service (git-x-flow-worker)
// This cron endpoint is deprecated but kept for health check compatibility

export async function GET(request: Request) {
  // TODO: Verify cron secret to prevent unauthorized access
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // TODO: Fetch all pending jobs where scheduledFor <= now
    // const pendingJobs = await db.scheduledPost.findMany({
    //   where: {
    //     status: 'pending',
    //     scheduledFor: { lte: new Date() }
    //   },
    //   include: {
    //     content: true,
    //     user: { include: { accounts: true } }
    //   }
    // });

    // TODO: Process each job
    // const results = await Promise.allSettled(
    //   pendingJobs.map(job => processJob(job))
    // );

    // TODO: Return summary of processed jobs
    return NextResponse.json({
      success: true,
      // processed: results.filter(r => r.status === 'fulfilled').length,
      // failed: results.filter(r => r.status === 'rejected').length
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    );
  }
}