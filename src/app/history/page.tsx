'use client';

import { useState, useEffect } from 'react';
import { HistoryTable } from '@/components/history/history-table';
import { Clock, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-indigo-600" />
            Search History
          </h1>
          <p className="text-slate-500 mt-1">Review past tracking sessions and jump back into the data.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 text-slate-700 bg-white border-slate-200 hover:bg-slate-50">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-3 text-slate-500">
            <Clock className="h-5 w-5 animate-spin" />
            Loading history...
          </div>
        </div>
      ) : (
        <HistoryTable jobs={jobs} />
      )}
    </div>
  );
}
