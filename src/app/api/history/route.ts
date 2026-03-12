export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const jobs = await prisma.searchJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch history', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
