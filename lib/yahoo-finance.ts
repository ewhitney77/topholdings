export interface HoldingData {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
}

const FMP = 'https://financialmodelingprep.com/api/v3';

export async function getHoldingData(ticker: string): Promise<HoldingData> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error('FMP_API_KEY environment variable is not set');

  // --- Current quote: price, name, market cap ---
  const quoteRes = await fetch(`${FMP}/quote/${ticker}?apikey=${apiKey}`);

  if (!quoteRes.ok) {
    throw new Error(`FMP quote API returned HTTP ${quoteRes.status} for ${ticker}`);
  }

  const quoteJson = await quoteRes.json();
  const quote = Array.isArray(quoteJson) ? quoteJson[0] : quoteJson;

  if (!quote || typeof quote.price === 'undefined') {
    throw new Error(`No quote data from FMP for ${ticker}`);
  }

  const currentPrice: number = quote.price ?? 0;
  const name: string = quote.name ?? ticker;
  const marketCap: number = quote.marketCap ?? 0;

  // --- Historical prices for 1-week change ---
  const from = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const to = new Date().toISOString().split('T')[0];

  let weekAgoPrice = currentPrice;
  try {
    const histRes = await fetch(
      `${FMP}/historical-price-full/${ticker}?from=${from}&to=${to}&apikey=${apiKey}`
    );
    if (histRes.ok) {
      const histJson = await histRes.json();
      // FMP returns newest-first; last entry is ~10 days ago
      const historical: { date: string; close: number }[] =
        histJson?.historical ?? [];
      if (historical.length > 0) {
        weekAgoPrice = historical[historical.length - 1].close ?? currentPrice;
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
