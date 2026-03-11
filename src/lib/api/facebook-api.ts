import { ScrapeResult } from './types';

export async function fetchFacebookHashtag(hashtag: string, count: number = 10): Promise<ScrapeResult[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is missing');
  }

  const cleanHashtag = hashtag.replace('#', '');

  console.log(`Fetching Facebook posts for #${cleanHashtag} via RapidAPI...`);
  
  // RapidAPI config for facebook-scraper3.p.rapidapi.com
  const response = await fetch(`https://facebook-scraper3.p.rapidapi.com/search/posts?query=${cleanHashtag}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com',
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    console.warn("Facebook API returned no results array", data);
    return [];
  }

  const results: ScrapeResult[] = data.results.slice(0, count).map((p: any) => ({
    postUrl: p.url || '',
    author: p.author?.name || 'Unknown User',
    content: p.message || '',
    postedAt: p.timestamp ? new Date(p.timestamp * 1000).toISOString() : new Date().toISOString(),
    likes: p.reactions_count || 0,
    comments: p.comments_count || 0,
    shares: p.reshare_count || 0,
    platform: 'FACEBOOK'
  }));
  
  console.log(`Fetched ${results.length} posts from Facebook`);
  return results;
}
