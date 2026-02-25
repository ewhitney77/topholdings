import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getHoldingData } from '@/lib/yahoo-finance';
import { getNewsForTicker } from '@/lib/news';
import { getReasonForPriceMove } from '@/lib/claude';

// Allow up to 60s for this serverless function on Vercel
export const maxDuration = 60;

const TICKERS = ['PANW', 'AAPL', 'MSFT', 'GOOGL', 'NEOG'];

const getSecret = () => {
  const secret =
    process.env.JWT_SECRET || 'topholdings-default-secret-change-in-prod-2024';
  return new TextEncoder().encode(secret);
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await jwtVerify(token, getSecret());
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const holdingsData = await Promise.all(
    TICKERS.map(async (ticker) => {
      try {
        // Fetch Yahoo Finance data
        const holding = await getHoldingData(ticker);

        // Fetch news and generate AI analysis in parallel
        const news = await getNewsForTicker(ticker, holding.name);
        const reason = await getReasonForPriceMove(
          ticker,
          holding.name,
          holding.weekChangePercent,
          news
        );

        return { ...holding, reason, error: null };
      } catch (err) {
        console.error(`Error processing ${ticker}:`, err);
        return {
          ticker,
          name: ticker,
          marketCap: 0,
          currentPrice: 0,
          weekChangePercent: 0,
          reason: 'Data temporarily unavailable.',
          error: 'Failed to fetch data',
        };
      }
    })
  );

  // Sort by market cap descending (largest first)
  holdingsData.sort((a, b) => b.marketCap - a.marketCap);

  return NextResponse.json(holdingsData);
}
