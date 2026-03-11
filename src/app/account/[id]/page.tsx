import prisma from '@/lib/db/prisma';
import AccountClient from './AccountClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountPageData id={id} />;
}

async function AccountPageData({ id }: { id: string }) {
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { postedAt: 'desc' }
      }
    }
  });

  if (!account) {
    return notFound();
  }

  // Format data for the client component
  const accountData = {
    id: account.id,
    username: account.username,
    platform: account.platform,
    posts: account.posts.map(p => ({
      id: p.id,
      postUrl: p.postUrl,
      platform: p.platform,
      postedAt: p.postedAt,
      views: p.views,
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      saves: p.saves,
      account: { username: account.username }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <AccountClient account={accountData} />
    </div>
  );
}
