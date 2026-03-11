export interface ScrapeResult {
  postUrl: string;
  author: string;
  content: string;
  postedAt: string;
  views?: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  platform: 'TIKTOK' | 'FACEBOOK';
}
