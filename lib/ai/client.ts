/**
 * Shared AI client for calling LLMs via OpenRouter/OpenAI/Anthropic.
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export async function callAI(
  messages: ChatMessage[], 
  options: { temperature?: number; maxTokens?: number } = {},
  config?: AIConfig
) {
  const apiKey = config?.apiKey || process.env.AI_API_KEY;
  const baseUrl = config?.baseUrl || process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = config?.model || process.env.AI_MODEL || 'anthropic/claude-3-haiku';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured on the server and no custom key was provided.');
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ai-mail-pwa.vercel.app', // Required for some providers like OpenRouter
      'X-Title': 'AI Mail PWA',
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI Provider Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
