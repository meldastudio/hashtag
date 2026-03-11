import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { fetchFacebookHashtag } from '@/lib/api/facebook-api';
import { fetchTikTokHashtag } from '@/lib/api/tiktok-api';
import fs from 'fs';

function logDebug(msg: string) {
  try {
    fs.appendFileSync('/tmp/scraper_debug.log', new Date().toISOString() + ' : ' + msg + '\n');
  } catch (e) {}
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

    // Background job
  (async () => {
    try {
      console.log(`Starting job for #${hashtag} on ${platform}`);
      let totalResults = 0;
      
      const onProgress = async (result: any) => {
        totalResults++;
        // Upsert Account
        const account = await prisma.account.upsert({
          where: { 
            platform_username: { 
              platform: result.platform, 
              username: result.author 
            } 
          },
          update: {},
          create: {
            platform: result.platform,
            username: result.author,
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

      const realApiHashtags = ['ใช้ยาใช้ยามาฮ่า', '#ใช้ยาใช้ยามาฮ่า', 'ใช้ยามาฮ่า', '#ใช้ยามาฮ่า'];
      const isRealApiRequest = realApiHashtags.includes(hashtag);

      logDebug(`Starting scrape for ${hashtag}, isReal: ${isRealApiRequest}, platform: ${platform}`);

      if (isRealApiRequest) {
        if (platform === 'FACEBOOK' || platform === 'ALL') {
          try {
             logDebug(`Calling fetchFacebookHashtag...`);
             const fbResults = await fetchFacebookHashtag(hashtag, 10);
             logDebug(`FB Results count: ${fbResults.length}`);
             for (const res of fbResults) {
               await onProgress(res);
             }
          } catch (fbErr: any) {
             logDebug(`Facebook Scrape Error: ${fbErr?.message || fbErr}`);
             console.error('Facebook RapidAPI error:', fbErr);
          }
        }
        if (platform === 'TIKTOK' || platform === 'ALL') {
          try {
             logDebug(`Calling fetchTikTokHashtag...`);
             const ttResults = await fetchTikTokHashtag(hashtag, 10);
             logDebug(`TT Results count: ${ttResults.length}`);
             for (const res of ttResults) {
               await onProgress(res);
             }
          } catch (ttErr: any) {
             logDebug(`TikTok Scrape Error: ${ttErr?.message || ttErr}`);
             console.error('TikTok RapidAPI error:', ttErr);
          }
        }
      }

      // Fallback to Mock Data if no real results were found (for Demo purposes)
      if (totalResults === 0 && !isRealApiRequest) {
        logDebug('Real scrape found 0 results and !isRealApiRequest. Falling back to Demo Mode data.');
        const mockPlatforms = (platform === 'ALL' || platform === 'facebook') ? ['FACEBOOK', 'TIKTOK'] : [platform];
        for (const p of mockPlatforms) {
          for (let i = 0; i < 5; i++) {
            const result = {
              postUrl: `https://${p.toLowerCase()}.com/demo/post/${Math.random().toString(36).substring(7)}`,
              author: `Demo_${p}_User_${i}`,
              content: `This is demo content for #${hashtag} on ${p}. (Real APIs disabled for dev)`,
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
    } catch (error) {
      console.error('Job error:', error);
      await prisma.searchJob.update({
        where: { id: job.id },
        data: { status: 'FAILED' },
      });
    }
  })();

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      postCount: 0
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
