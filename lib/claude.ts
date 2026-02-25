import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function getReasonForPriceMove(
  ticker: string,
  companyName: string,
  weekChangePercent: number,
  newsArticles: string[]
): Promise<string> {
  const newsText =
    newsArticles.length > 0
      ? newsArticles.join('\n')
      : 'No recent news available.';

  const direction = weekChangePercent >= 0 ? 'gained' : 'declined';
  const absChange = Math.abs(weekChangePercent).toFixed(2);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `Based on the following recent news about ${companyName} (${ticker}), write exactly 3 brief sentences explaining why the stock ${direction} ${absChange}% last week. Be factual and concise. Do not use bullet points or numbering.\n\nRecent news headlines:\n${newsText}`,
        },
      ],
    });

    return message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to determine reason for price movement.';
  } catch (error) {
    console.error(`Claude API error for ${ticker}:`, error);
    return 'Insufficient data available to determine reason for price movement.';
  }
}
