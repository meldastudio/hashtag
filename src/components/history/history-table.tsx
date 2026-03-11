'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

interface HistoryJob {
  id: string;
  hashtag: string;
  platform: string;
  status: string;
  createdAt: string;
  _count: {
    posts: number;
  };
}

interface HistoryTableProps {
  jobs: HistoryJob[];
}

export function HistoryTable({ jobs }: HistoryTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Hashtag</TableHead>
              <TableHead className="font-semibold text-slate-700">Platform</TableHead>
              <TableHead className="font-semibold text-slate-700">Date Searched</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Items Found</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">
                    <span className="flex items-center gap-2">
                       <Search className="h-4 w-4 text-slate-400" />
                       {job.hashtag}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={job.platform === 'FACEBOOK' ? 'bg-blue-50 text-blue-700 border-blue-200' : job.platform === 'TIKTOK' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                      {job.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-700">
                    {job._count.posts}
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge variant="outline" className={job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : job.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/?hashtag=${encodeURIComponent(job.hashtag)}&platform=${job.platform}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      View Results
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  No search history found. Try searching for a hashtag first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
