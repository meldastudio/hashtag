import { ScrapeResult } from './types';

export async function fetchTikTokHashtag(hashtag: string, count: number = 10): Promise<ScrapeResult[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is missing');
  }

  const cleanHashtag = hashtag.replace('#', '');
  console.log(`Fetching TikTok videos for #${cleanHashtag} via RapidAPI (tiktok-api23)...`);

  const response = await fetch(`https://tiktok-api23.p.rapidapi.com/api/search/general?keyword=${cleanHashtag}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
  }

  let data;
  try {
    const text = await response.text();
    if (!text) {
      console.warn("TikTok API returned empty response body");
      return [];
    }
    data = JSON.parse(text);
  } catch (parseErr) {
    console.warn("Failed to parse TikTok API JSON response. The API might be returning an HTML error page or hitting a rate limit format.");
    return [];
  }

  if (!data?.data || !Array.isArray(data.data)) {
    console.warn("TikTok API returned no data array", data);
    return [];
  }

  const results: ScrapeResult[] = [];
  
  for (const item of data.data) {
    if (results.length >= count) break;
    
    // Some search results might be users or sounds instead of distinct video posts
    if (!item.item) continue;
    const p = item.item;
    
    results.push({
      postUrl: `https://www.tiktok.com/@${p.author?.uniqueId || 'user'}/video/${p.id}`,
      author: p.author?.uniqueId || 'Unknown User',
      content: p.desc || '',
      postedAt: p.createTime ? new Date(p.createTime * 1000).toISOString() : new Date().toISOString(),
      views: p.stats?.playCount || 0,
      likes: p.stats?.diggCount || 0,
      comments: p.stats?.commentCount || 0,
      shares: p.stats?.shareCount || 0,
      saves: p.stats?.collectCount || 0,
      platform: 'TIKTOK'
    });
  }
  
  console.log(`Fetched ${results.length} videos from TikTok`);
  return results;
}
