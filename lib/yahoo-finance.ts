export interface HoldingData {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
}

const YF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function getHoldingData(ticker: string): Promise<HoldingData> {
  // v8 chart: returns current price, company name, and OHLCV history in one call
  const chartUrl =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
    `?interval=1d&range=10d&includePrePost=false`;

  const chartRes = await fetch(chartUrl, { headers: YF_HEADERS });

  if (!chartRes.ok) {
    throw new Error(`Yahoo Finance returned HTTP ${chartRes.status} for ${ticker}`);
  }

  const chartData = await chartRes.json();
  const result = chartData?.chart?.result?.[0];
  if (!result) throw new Error(`No data returned for ${ticker}`);

  const meta = result.meta ?? {};
  const currentPrice: number = meta.regularMarketPrice ?? 0;
  const name: string = meta.shortName ?? meta.longName ?? ticker;

  // Weekly change: find close price closest to 7 calendar days ago
  const closes: (number | null)[] =
    result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps: number[] = result?.timestamp ?? [];

  let weekAgoPrice = currentPrice;
  if (closes.length >= 2 && timestamps.length >= 2) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < timestamps.length; i++) {
      const diff = Math.abs(timestamps[i] * 1000 - sevenDaysAgo);
      if (diff < bestDiff && closes[i] != null) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    weekAgoPrice = closes[bestIdx] ?? currentPrice;
  }

  const weekChangePercent =
    weekAgoPrice !== 0 && weekAgoPrice !== currentPrice
      ? ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100
      : 0;

  // Market cap — v7 quote API (best effort, graceful fallback)
  let marketCap = 0;
  try {
    const quoteRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
      { headers: YF_HEADERS }
    );
    if (quoteRes.ok) {
      const quoteData = await quoteRes.json();
      marketCap = quoteData?.quoteResponse?.result?.[0]?.marketCap ?? 0;
    }
  } catch {
    // proceed with marketCap = 0
  }

  return { ticker, name, marketCap, currentPrice, weekChangePercent };
}
