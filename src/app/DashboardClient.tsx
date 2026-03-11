'use client';

import { useState, useEffect, Suspense } from 'react';
import { SearchPanel, SearchParams } from '@/components/dashboard/search-panel';
import { AccountsTable } from '@/components/dashboard/accounts-table';
import { PostsList } from '@/components/dashboard/posts-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ThumbsUp, MessageSquare, BarChart3, Clock, FileDown, History, Home, Info } from 'lucide-react';
import { downloadCSV } from '@/lib/utils/export';
import ScoringSettings from '@/components/ScoringSettings';
import { useScoringStore } from '@/lib/store';
import Link from 'next/link';

function SummaryCard({ title, value, icon, bgColor }: { title: string, value: string, icon: React.ReactNode, bgColor: string }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [activeHashtag, setActiveHashtag] = useState<string>('');
  const [activePlatform, setActivePlatform] = useState<string>('ALL');
  const { viewWeight, likeWeight, commentWeight, shareWeight, saveWeight } = useScoringStore();

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setJobStatus('Initiating job...');
    setActiveHashtag(params.hashtag);
    setActivePlatform(params.platform);
    
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const jobId = data.jobId;

      if (jobId) {
        pollJobStatus(jobId, params.hashtag, params.platform);
      } else {
        console.error('No jobId returned from API');
        setIsLoading(false);
        setJobStatus('Error: No Job ID');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setIsLoading(false);
      setJobStatus('Failed to start job');
    }
  };

  const pollJobStatus = (jobId: string, searchHashtag: string, searchPlatform: string) => {
    setJobStatus('Scraping in progress...');
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const { status, postCount } = await res.json();
        
        if (status === 'COMPLETED' || status === 'FAILED') {
          clearInterval(interval);
          setIsLoading(false);
          setJobStatus(status);
          
          fetchReports(searchHashtag, searchPlatform); 
        } else {
          setJobStatus(`Scraping... (${postCount ?? 0} posts found)`);
        }
      } catch (error) {
        console.error('Polling failed:', error);
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 3000);
  };

  const fetchReports = async (hashtag?: string, platform?: string) => {
    try {
      let url = '/api/reports';
      const params = new URLSearchParams();
      if (hashtag) params.append('hashtag', hashtag);
      if (platform) params.append('platform', platform);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  useEffect(() => {
    // Rely on SearchPanel's initialization to call fetchReports 
    // rather than doing an empty global fetch on mount that breaks query persistence
  }, []);

  const handleExportCSV = () => {
    if (!results?.posts) return;
    const exportData = results.posts.map((p: any) => {
      const score = 
        (p.views * viewWeight) +
        (p.likes * likeWeight) +
        (p.comments * commentWeight) +
        ((p.shares || 0) * shareWeight) +
        ((p.saves || 0) * saveWeight);
        
      return {
        Platform: p.platform,
        Author: p.account.username,
        URL: p.postUrl,
        Content: p.content,
        PostedAt: p.postedAt,
        Views: p.views,
        Likes: p.likes,
        Comments: p.comments,
        Shares: p.shares || 0,
        Saves: p.saves || 0,
        Score: Number(score.toFixed(1)),
      };
    });
    downloadCSV(exportData, `engagement_report_${new Date().toISOString().split('T')[0]}`);
  };

  const summary = results?.summary || {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    totalPosts: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Engagement Insights</h1>
          <p className="text-slate-500 mt-1">Scrape and analyze social media performance via hashtags.</p>
        </div>
        <div className="flex items-center gap-4">
          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 animate-pulse">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{jobStatus}</span>
            </div>
          )}
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link 
            href="/history"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            <History className="h-4 w-4" />
            Search History
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="h-16 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse text-slate-400">Loading search options...</div>}>
        <SearchPanel 
          onSearch={handleSearch} 
          onLoad={(params) => {
            setActiveHashtag(params.hashtag);
            setActivePlatform(params.platform);
            fetchReports(params.hashtag, params.platform);
          }}
          isLoading={isLoading} 
        />
      </Suspense>
      <ScoringSettings />

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800 shadow-sm">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-900">หมายเหตุ: ข้อจำกัดการดึงข้อมูลจากแพลตฟอร์ม (API Limitations)</p>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li><strong>TikTok:</strong> สามารถดึงข้อมูลยอด Views, Likes, Comments, Shares, และ Saves ได้อย่างครบถ้วน</li>
            <li><strong>Facebook:</strong> สามารถดึงยอด Likes, Comments, และ Shares ได้ <u>แต่ไม่สามารถดึงยอด Saves ได้</u> (แสดงเป็น 0) เนื่องจากข้อจำกัดด้าน Privacy ของแพลตฟอร์ม และยอด Views จะสามารถดึงได้เฉพาะบางโพสต์ที่แสดงเป็นวิดีโอสาธารณะเท่านั้น</li>
          </ul>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Views" 
          value={summary.views.toLocaleString()} 
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <SummaryCard 
          title="Total Likes" 
          value={summary.likes.toLocaleString()} 
          icon={<ThumbsUp className="h-5 w-5 text-pink-600" />}
          bgColor="bg-pink-50"
        />
        <SummaryCard 
          title="Total Comments" 
          value={summary.comments.toLocaleString()} 
          icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <SummaryCard 
          title="Tracked Posts" 
          value={summary.totalPosts.toLocaleString()} 
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountsTable accounts={results?.topAccounts || []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">All Content</CardTitle>
            <div className="flex gap-2">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-sm"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </CardHeader>
          <CardContent>
             <PostsList posts={results?.posts || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
