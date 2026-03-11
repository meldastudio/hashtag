"use client";

import { useState } from 'react';
import { useScoringStore } from '@/lib/store';
import { PostsList } from '@/components/dashboard/posts-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

interface AccountData {
  id: string;
  username: string;
  platform: string;
  posts: any[];
}

export default function AccountClient({ account }: { account: AccountData }) {
  const { viewWeight, likeWeight, commentWeight, shareWeight, saveWeight } = useScoringStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'FACEBOOK' | 'TIKTOK'>('ALL');

  const filteredPosts = account.posts.filter((p) => activeTab === 'ALL' || p.platform === activeTab);

  // Calculate totals based on filtered posts
  const totals = filteredPosts.reduce((acc, p) => ({
    views: acc.views + p.views,
    likes: acc.likes + p.likes,
    comments: acc.comments + p.comments,
    shares: acc.shares + p.shares,
    saves: acc.saves + (p.saves || 0),
  }), { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 });

  const score = 
      (totals.views * viewWeight) +
      (totals.likes * likeWeight) +
      (totals.comments * commentWeight) +
      (totals.shares * shareWeight) +
      (totals.saves * saveWeight);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <Card className="border-none shadow-sm overflow-hidden border-t-4 border-indigo-500">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-4 rounded-full">
                <User className="h-8 w-8 text-slate-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">@{account.username}</h1>
                <Badge variant="outline" className={`mt-2 ${account.platform === 'FACEBOOK' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}`}>
                  {account.platform}
                </Badge>
              </div>
            </div>

            <div className="bg-indigo-50 px-6 py-4 rounded-xl text-center min-w-[200px] border border-indigo-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mb-1">Total Score</p>
              <p className="text-4xl font-black text-indigo-900">{score.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Account Media & Engagement</CardTitle>
            <p className="text-slate-500 text-sm mt-1">Showing {filteredPosts.length} tracked posts</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('ALL')}
            >
              All Platforms
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'FACEBOOK' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('FACEBOOK')}
            >
              Facebook
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'TIKTOK' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('TIKTOK')}
            >
              TikTok
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <PostsList posts={filteredPosts} />
        </CardContent>
      </Card>
    </div>
  );
}
