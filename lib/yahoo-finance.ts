import yahooFinance from 'yahoo-finance2';

export interface HoldingData {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
}

async function getWeekAgoPrice(ticker: string, currentPrice: number): Promise<number> {
  try {
    // Yahoo Finance chart API — 10 days of daily data
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=10d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return currentPrice;

    const data = await res.json();
    const closes: number[] | undefined =
      data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    const timestamps: number[] | undefined =
      data?.chart?.result?.[0]?.timestamp;

    if (!closes || !timestamps || closes.length < 2) return currentPrice;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Find close price from the timestamp closest to 7 days ago
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < timestamps.length; i++) {
      const diff = Math.abs(timestamps[i] * 1000 - sevenDaysAgo);
      if (diff < bestDiff && closes[i] != null) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    return closes[bestIdx] ?? currentPrice;
  } catch {
    return currentPrice;
  }
}

export async function getHoldingData(ticker: string): Promise<HoldingData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote = await (yahooFinance as any).quote(ticker);

  const currentPrice: number = quote?.regularMarketPrice ?? 0;
  const name: string = quote?.shortName ?? quote?.longName ?? ticker;
  const marketCap: number = quote?.marketCap ?? 0;

  const weekAgoPrice = await getWeekAgoPrice(ticker, currentPrice);
  const weekChangePercent =
    weekAgoPrice !== 0
      ? ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100
      : 0;

  return { ticker, name, marketCap, currentPrice, weekChangePercent };
}
