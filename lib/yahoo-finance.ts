import yahooFinance from 'yahoo-finance2';

export interface HoldingData {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
}

export async function getHoldingData(ticker: string): Promise<HoldingData> {
  // yahoo-finance2 handles Yahoo's crumb/cookie auth automatically.
  // Type assertion required: the package's `this: ModuleThis` signature
  // doesn't reconcile with the exported class instance in TypeScript.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yf = yahooFinance as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quoteResult: any[] = await yf.quote(ticker);

  // quote() always returns an array; grab the first (and only) element.
  const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;
  if (!quote) throw new Error(`No quote data returned for ${ticker}`);

  const currentPrice: number = quote.regularMarketPrice ?? 0;
  const name: string = quote.shortName ?? quote.longName ?? ticker;
  const marketCap: number = quote.marketCap ?? 0;

  // Fetch 10 days of daily closes from Yahoo Finance's chart API.
  // This endpoint typically does not require a crumb token.
  let weekAgoPrice = currentPrice;
  try {
    const chartRes = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=10d&interval=1d&includePrePost=false`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; topholdings/1.0)',
          Accept: 'application/json',
        },
      },
    );

    if (chartRes.ok) {
      const chartJson = await chartRes.json();
      const closes: (number | null)[] =
        chartJson?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
      const valid = closes.filter(
        (c): c is number => c !== null && typeof c === 'number',
      );
      if (valid.length > 0) {
        // valid[0] is the oldest close in the window (~10 days ago)
        weekAgoPrice = valid[0];
      }
    }
  } catch {
    // weekAgoPrice stays as currentPrice → weekChangePercent = 0
  }

  const weekChangePercent =
    weekAgoPrice !== 0 && weekAgoPrice !== currentPrice
      ? ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100
      : 0;

  return { ticker, name, marketCap, currentPrice, weekChangePercent };
}
