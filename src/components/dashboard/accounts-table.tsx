import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useScoringStore } from '@/lib/store';
import Link from 'next/link';

interface AccountRanking {
  id: string;
  username: string;
  platform: string;
  postCount: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  totalEngagement: number; // legacy fast calc
}

interface AccountsTableProps {
  accounts: AccountRanking[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const { viewWeight, likeWeight, commentWeight, shareWeight, saveWeight } = useScoringStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'FACEBOOK' | 'TIKTOK'>('ALL');

  const filteredAccounts = accounts
    .filter((a) => activeTab === 'ALL' || a.platform === activeTab)
    .map((account) => {
      const score = 
        (account.views * viewWeight) +
        (account.likes * likeWeight) +
        (account.comments * commentWeight) +
        (account.shares * shareWeight) +
        (account.saves * saveWeight);
      return { ...account, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Platforms
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'FACEBOOK' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('FACEBOOK')}
        >
          Facebook
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'TIKTOK' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('TIKTOK')}
        >
          TikTok
        </button>
      </div>

      <div className="rounded-md border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Posts</TableHead>
              <TableHead className="text-right text-indigo-700 font-bold">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-indigo-600 hover:underline">
                    <Link href={`/account/${account.id}`}>@{account.username}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={account.platform === 'FACEBOOK' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}>
                      {account.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{account.postCount}</TableCell>
                  <TableCell className="text-right font-bold text-slate-800">
                    {account.score.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
