import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const hashtag = searchParams.get('hashtag');

  try {
    const where: any = {};
    if (platform && platform !== 'ALL') where.platform = platform;
    if (hashtag) where.searchJob = { hashtag: { contains: hashtag } };

    // 1. Total Summary
    const summary = await prisma.post.aggregate({
      where,
      _sum: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
      },
      _count: true,
    });

    // 2. Top Accounts
    const topAccounts = await prisma.account.findMany({
      include: {
        _count: {
          select: { posts: { where } }
        },
        posts: {
          where,
          select: {
            views: true,
            likes: true,
            comments: true,
            shares: true,
            saves: true,
          }
        }
      },
      take: 10,
    });

    const accountRankings = topAccounts.map(account => {
      const stats = account.posts.reduce((acc, post) => ({
        views: acc.views + post.views,
        likes: acc.likes + post.likes,
        comments: acc.comments + post.comments,
        shares: acc.shares + (post.shares || 0),
        saves: acc.saves + (post.saves || 0),
      }), { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 });

      return {
        id: account.id,
        username: account.username,
        platform: account.platform,
        postCount: account._count.posts,
        ...stats,
        totalEngagement: stats.likes + stats.comments + stats.shares + stats.saves,
      };
    }).sort((a, b) => b.totalEngagement - a.totalEngagement);

    // 3. Raw Posts
    const posts = await prisma.post.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      include: { account: true },
      take: 50,
    });

    return NextResponse.json({
      summary: {
        totalPosts: summary._count,
        views: summary._sum.views || 0,
        likes: summary._sum.likes || 0,
        comments: summary._sum.comments || 0,
        shares: summary._sum.shares || 0,
        saves: summary._sum.saves || 0,
      },
      topAccounts: accountRankings,
      posts,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
