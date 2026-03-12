export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { fetchFacebookHashtag } from '@/lib/api/facebook-api';
import { fetchTikTokHashtag } from '@/lib/api/tiktok-api';

function logDebug(msg: string) {
  console.log(`[DEBUG] ${new Date().toISOString()} : ${msg}`);
}

export async function POST(req: Request) {
  try {
    const { hashtag, platform, startDate, endDate } = await req.json();

    if (!hashtag || !platform || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new search job in the database
    const job = await prisma.searchJob.create({
      data: {
        hashtag,
        platform,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING',
      },
    });

    // Scraper function
    const runScrape = async () => {
      try {
        const hasApiKey = !!process.env.RAPIDAPI_KEY;
        logDebug(`Starting scrape for ${hashtag}, hasApiKey: ${hasApiKey}, platform: ${platform}`);
        if (!hasApiKey) {
          logDebug('WARNING: RAPIDAPI_KEY is missing in environment variables.');
        }

        let totalResults = 0;
        
        const onProgress = async (result: any) => {
          totalResults++;
          // Upsert Account
          const account = await prisma.account.upsert({
            where: { 
              platform_username: { 
                platform: result.platform, 
                username: result.username || result.author 
              } 
            },
            update: {},
            create: {
              platform: result.platform,
              username: result.username || result.author,
            },
          });

          // Upsert Post
          await prisma.post.upsert({
            where: { postUrl: result.postUrl },
            update: {
              content: result.content,
              likes: result.likes,
              comments: result.comments,
              shares: result.shares,
              views: result.views,
              saves: result.saves || 0,
              searchJobId: job.id,
            },
            create: {
              searchJobId: job.id,
              accountId: account.id,
              platform: result.platform,
              postUrl: result.postUrl,
              content: result.content,
              postedAt: result.postedAt,
              likes: result.likes,
              comments: result.comments,
              shares: result.shares,
              views: result.views,
              saves: result.saves || 0,
            },
          });
        };

        const tasks: Promise<void>[] = [];

        if (hasApiKey) {
          if (platform === 'FACEBOOK' || platform === 'ALL') {
            tasks.push((async () => {
              try {
                 logDebug(`[FB] Starting fetch for ${hashtag}...`);
                 const fbResults = await fetchFacebookHashtag(hashtag, 10);
                 logDebug(`[FB] Results count: ${fbResults.length}`);
                 for (const res of fbResults) {
                   await onProgress(res);
                 }
              } catch (fbErr: any) {
                 logDebug(`[FB] Error: ${fbErr?.message || fbErr}`);
                 console.error('Facebook RapidAPI error:', fbErr);
              }
            })());
          }
          if (platform === 'TIKTOK' || platform === 'ALL') {
            tasks.push((async () => {
              try {
                 logDebug(`[TT] Starting fetch for ${hashtag}...`);
                 const ttResults = await fetchTikTokHashtag(hashtag, 10);
                 logDebug(`[TT] Results count: ${ttResults.length}`);
                 for (const res of ttResults) {
                   await onProgress(res);
                 }
              } catch (ttErr: any) {
                 logDebug(`[TT] Error: ${ttErr?.message || ttErr}`);
                 console.error('TikTok RapidAPI error:', ttErr);
              }
            })());
          }
        }

        if (tasks.length > 0) {
          logDebug(`Awaiting ${tasks.length} scraping tasks in parallel...`);
          await Promise.all(tasks);
        }

        // Fallback to Mock Data if no real results were found (or if API key is missing)
        if (totalResults === 0) {
          logDebug(`No real results found for ${hashtag}. Falling back to Demo Mode data.`);
          const mockPlatforms = (platform === 'ALL') ? ['FACEBOOK', 'TIKTOK'] : [platform];
          for (const p of mockPlatforms) {
            logDebug(`Generating mock data for ${p}...`);
            for (let i = 0; i < 5; i++) {
              const result = {
                postUrl: `https://${p.toLowerCase()}.com/demo/post/${Math.random().toString(36).substring(7)}`,
                author: `Demo_${p}_User_${i}`,
                content: `This is demo content for #${hashtag} on ${p}. (No real results found)`,
                postedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                views: Math.floor(Math.random() * 50000),
                likes: Math.floor(Math.random() * 5000),
                comments: Math.floor(Math.random() * 500),
                shares: Math.floor(Math.random() * 200),
                saves: Math.floor(Math.random() * 100),
                platform: p,
              };
              await onProgress(result);
            }
          }
        }

        await prisma.searchJob.update({
          where: { id: job.id },
          data: { status: 'COMPLETED' },
        });
        return totalResults;
      } catch (error) {
        console.error('Job error:', error);
        await prisma.searchJob.update({
          where: { id: job.id },
          data: { status: 'FAILED' },
        });
        throw error;
      }
    };

    // On Vercel (Production), we MUST await the scrape or it will be killed
    // On Local Dev, we can fire and forget for better UX
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      logDebug('Detected Vercel/Production environment. Awaiting scrape synchronously...');
      const finalCount = await runScrape();
      return NextResponse.json({
        jobId: job.id,
        status: 'COMPLETED',
        postCount: finalCount
      });
    } else {
      logDebug('Detected Local/Dev environment. Running scrape in background...');
      runScrape();
      return NextResponse.json({
        jobId: job.id,
        status: job.status,
        postCount: 0
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
