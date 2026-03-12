import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      has_database_url: !!process.env.DATABASE_URL,
      has_direct_url: !!process.env.DIRECT_URL,
      has_rapidapi_key: !!process.env.RAPIDAPI_KEY,
      node_env: process.env.NODE_ENV,
      is_vercel: !!process.env.VERCEL,
    }
  };

  try {
    // Check DB Connection
    const jobCount = await prisma.searchJob.count();
    diagnostics.db_connection = 'OK';
    diagnostics.jobs_count = jobCount;

    const postCount = await prisma.post.count();
    diagnostics.posts_count = postCount;

    const accountCount = await prisma.account.count();
    diagnostics.accounts_count = accountCount;

    // Latest jobs
    const latestJobs = await prisma.searchJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    diagnostics.latest_jobs = latestJobs;

  } catch (err: any) {
    diagnostics.db_connection = 'FAILED';
    diagnostics.error = err.message || err;
  }

  return NextResponse.json(diagnostics);
}
