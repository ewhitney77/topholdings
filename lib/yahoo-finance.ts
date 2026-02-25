export interface HoldingData {
  ticker: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  weekChangePercent: number;
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

const BASE_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://finance.yahoo.com/',
  Origin: 'https://finance.yahoo.com',
};

// Fetch a session cookie + crumb from Yahoo Finance
async function getYFSession(): Promise<{ cookie: string; crumb: string }> {
  // Hit the Yahoo Finance homepage to get session cookies
  const homeRes = await fetch('https://finance.yahoo.com/', {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
  });

  // Collect Set-Cookie values — Node 20 supports getSetCookie(), older uses get()
  let rawCookies: string[] = [];
  const h = homeRes.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof h.getSetCookie === 'function') {
    rawCookies = h.getSetCookie();
  } else {
    const c = homeRes.headers.get('set-cookie');
    if (c) rawCookies = c.split(/,(?=[^ ])/);
  }

  const cookieStr = rawCookies.map((c) => c.split(';')[0]).join('; ');

  // Fetch the crumb using those cookies
  const crumbRes = await fetch(
    'https://query1.finance.yahoo.com/v1/test/getcrumb',
    { headers: { ...BASE_HEADERS, Cookie: cookieStr } }
  );

  const crumb = crumbRes.ok ? (await crumbRes.text()).trim() : '';
  return { cookie: cookieStr, crumb };
}

export async function getHoldingData(ticker: string): Promise<HoldingData> {
  // Authenticate with Yahoo Finance
  const { cookie, crumb } = await getYFSession();

  const authHeaders: Record<string, string> = { ...BASE_HEADERS };
  if (cookie) authHeaders['Cookie'] = cookie;

  // v8 chart: 10 days of daily OHLCV + meta (price, name)
  const chartBase =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
    `?interval=1d&range=10d&includePrePost=false`;
  const chartUrl = crumb
    ? `${chartBase}&crumb=${encodeURIComponent(crumb)}`
    : chartBase;

  const chartRes = await fetch(chartUrl, { headers: authHeaders });

  if (!chartRes.ok) {
    throw new Error(
      `Yahoo Finance chart API: HTTP ${chartRes.status} for ${ticker}`
    );
  }

  const chartData = await chartRes.json();

  // Yahoo Finance can return 200 with an error object
  const chartError = chartData?.chart?.error;
  if (chartError) {
    throw new Error(
      `Yahoo Finance error for ${ticker}: ${chartError.code} — ${chartError.description}`
    );
  }

  const result = chartData?.chart?.result?.[0];
  if (!result) throw new Error(`No chart result for ${ticker}`);

  const meta = result.meta ?? {};
  const currentPrice: number = meta.regularMarketPrice ?? 0;
  const name: string = meta.shortName ?? meta.longName ?? ticker;

  // Weekly change: compare current price to close ~7 days ago
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

  // Market cap — v7 quote, same session
  let marketCap = 0;
  try {
    const quoteBase = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`;
    const quoteUrl = crumb
      ? `${quoteBase}&crumb=${encodeURIComponent(crumb)}`
      : quoteBase;
    const quoteRes = await fetch(quoteUrl, { headers: authHeaders });
    if (quoteRes.ok) {
      const quoteData = await quoteRes.json();
      marketCap = quoteData?.quoteResponse?.result?.[0]?.marketCap ?? 0;
    }
  } catch {
    // marketCap stays 0
  }

  return { ticker, name, marketCap, currentPrice, weekChangePercent };
}
