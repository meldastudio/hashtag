"use client";

import { useScoringStore } from '@/lib/store';

export default function ScoringSettings() {
  const { viewWeight, likeWeight, commentWeight, shareWeight, saveWeight, setWeights } = useScoringStore();

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 p-6 w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Engagement Scoring Weights</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">View Score</label>
          <input 
            type="number" 
            min="0"
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            value={viewWeight}
            onChange={(e) => setWeights({ viewWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Like Score</label>
          <input 
            type="number" 
            min="0"
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            value={likeWeight}
            onChange={(e) => setWeights({ likeWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Comment Score</label>
          <input 
            type="number" 
            min="0"
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            value={commentWeight}
            onChange={(e) => setWeights({ commentWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Share Score</label>
          <input 
            type="number" 
            min="0"
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            value={shareWeight}
            onChange={(e) => setWeights({ shareWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Save Score</label>
          <input 
            type="number" 
            min="0"
            step="0.1"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            value={saveWeight}
            onChange={(e) => setWeights({ saveWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>

      </div>
    </div>
  );
}
