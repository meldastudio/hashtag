import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ExternalLink, ThumbsUp, Eye, MessageSquare, ChevronUp, ChevronDown, Share2, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useScoringStore } from '@/lib/store';

interface Post {
  id: string;
  postUrl: string;
  platform: string;
  postedAt: Date | string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  content?: string;
  account: {
    username: string;
  };
}

interface PostsListProps {
  posts: Post[];
}

type SortField = 'post' | 'account' | 'platform' | 'date' | 'metrics' | 'score';
type SortOrder = 'asc' | 'desc';

export function PostsList({ posts }: PostsListProps) {
  const { viewWeight, likeWeight, commentWeight, shareWeight, saveWeight } = useScoringStore();
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'FACEBOOK' | 'TIKTOK'>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  const processedPosts = posts
    .filter((p) => activeTab === 'ALL' || p.platform === activeTab)
    .map((p) => {
      const score = 
        (p.views * viewWeight) +
        (p.likes * likeWeight) +
        (p.comments * commentWeight) +
        ((p.shares || 0) * shareWeight) +
        ((p.saves || 0) * saveWeight);
      const metricsTotal = p.views + p.likes + p.comments + (p.shares || 0) + (p.saves || 0);
      return { ...p, score, metricsTotal };
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'post':
          comparison = (a.content || '').localeCompare(b.content || '');
          break;
        case 'account':
          comparison = a.account.username.localeCompare(b.account.username);
          break;
        case 'platform':
          comparison = a.platform.localeCompare(b.platform);
          break;
        case 'date':
          comparison = new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
          break;
        case 'metrics':
          comparison = a.metricsTotal - b.metricsTotal;
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-2">
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

      <div className="rounded-md border border-slate-100 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('post')}>
                Post Details {getSortIcon('post')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('account')}>
                Account {getSortIcon('account')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('platform')}>
                Platform {getSortIcon('platform')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('date')}>
                Date {getSortIcon('date')}
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('metrics')}>
                Metrics {getSortIcon('metrics')}
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-slate-100 transition-colors text-indigo-700 font-bold select-none" onClick={() => handleSort('score')}>
                Score {getSortIcon('score')}
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedPosts.length > 0 ? (
              processedPosts.map((post) => (
                <TableRow key={post.id} className="hover:bg-slate-50/50">
                  <TableCell className="max-w-[150px] truncate text-sm text-slate-600" title={post.content}>
                    {post.content || '...'}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                    @{post.account.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={post.platform === 'FACEBOOK' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}>
                      {post.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(post.postedAt), 'MMM d, yy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1" title="Views"><Eye className="h-3 w-3" /> {post.views > 1000 ? (post.views/1000).toFixed(1)+'k' : post.views}</span>
                      <span className="flex items-center gap-1" title="Likes"><ThumbsUp className="h-3 w-3" /> {post.likes > 1000 ? (post.likes/1000).toFixed(1)+'k' : post.likes}</span>
                      <span className="flex items-center gap-1" title="Comments"><MessageSquare className="h-3 w-3" /> {post.comments > 1000 ? (post.comments/1000).toFixed(1)+'k' : post.comments}</span>
                      <span className="flex items-center gap-1" title="Shares"><Share2 className="h-3 w-3" /> {post.shares > 1000 ? (post.shares/1000).toFixed(1)+'k' : (post.shares || 0)}</span>
                      <span className="flex items-center gap-1" title="Saves"><Bookmark className="h-3 w-3" /> {post.saves && post.saves > 1000 ? (post.saves/1000).toFixed(1)+'k' : (post.saves || 0)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-800">
                    {post.score.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </TableCell>
                  <TableCell>
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-400">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
