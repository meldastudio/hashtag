import { create } from 'zustand';

interface ScoringState {
  viewWeight: number;
  likeWeight: number;
  commentWeight: number;
  shareWeight: number;
  saveWeight: number;
  setWeights: (weights: Partial<Omit<ScoringState, 'setWeights'>>) => void;
}

export const useScoringStore = create<ScoringState>((set) => ({
  viewWeight: 1,
  likeWeight: 2,
  commentWeight: 5,
  shareWeight: 10,
  saveWeight: 10,
  setWeights: (weights) => set((state) => ({ ...state, ...weights })),
}));
