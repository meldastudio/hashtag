'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface SearchParams {
  hashtag: string;
  platform: 'FACEBOOK' | 'TIKTOK' | 'ALL';
  startDate: Date;
  endDate: Date;
}

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  onLoad?: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchPanel({ onSearch, onLoad, isLoading }: SearchPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hashtag, setHashtag] = useState(searchParams.get('hashtag') || '');
  const [platform, setPlatform] = useState<'FACEBOOK' | 'TIKTOK' | 'ALL'>((searchParams.get('platform') as any) || 'ALL');
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // If URL params exist on mount, trigger the load automatically to render historical data
    const urlHashtag = searchParams.get('hashtag');
    if (urlHashtag && onLoad) {
      onLoad({
        hashtag: urlHashtag,
        platform: (searchParams.get('platform') as any) || 'ALL',
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }
  }, []);

  const handleSearch = () => {
    if (!hashtag) return;

    // Update URL to persist state across refreshes
    const params = new URLSearchParams(searchParams);
    params.set('hashtag', hashtag);
    params.set('platform', platform);
    router.push(`/?${params.toString()}`);

    onSearch({ 
      hashtag, 
      platform, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate) 
    });
  };

  return (
    <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100 items-end">
      <div className="space-y-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-slate-700">Hashtag</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="e.g. fashion" 
            className="pl-9"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 min-w-[150px]">
        <label className="text-sm font-medium text-slate-700">Platform</label>
        <select 
          value={platform} 
          onChange={(e) => setPlatform(e.target.value as any)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All Platforms</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="TIKTOK">TikTok</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Start Date</label>
        <input 
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">End Date</label>
        <input 
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Button 
        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]" 
        onClick={handleSearch}
        disabled={isLoading || !hashtag}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
}

