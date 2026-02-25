export async function getNewsForTicker(
  ticker: string,
  companyName: string
): Promise<string[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const query = `${ticker} stock OR "${companyName}"`;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${from}&sortBy=relevancy&language=en&pageSize=5&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok' || !data.articles) return [];

    return data.articles
      .slice(0, 5)
      .map(
        (article: { title: string; description?: string }) =>
          `${article.title}${article.description ? ': ' + article.description : ''}`
      );
  } catch (error) {
    console.error(`News fetch error for ${ticker}:`, error);
    return [];
  }
}
