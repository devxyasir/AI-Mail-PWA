export interface AIConfigState {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const STORAGE_KEY = 'ai_mail_ai_config';

/**
 * Retrieves the saved AI config from localStorage.
 */
export function getSavedAIConfig(): Partial<AIConfigState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves the AI config to localStorage.
 */
export function saveAIConfig(config: Partial<AIConfigState>) {
  if (typeof window === 'undefined') return;
  const current = getSavedAIConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...config }));
}

/**
 * Clears the saved AI config from localStorage.
 */
export function clearAIConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Generates HTTP headers for AI requests based on saved config.
 */
export function getAIHeaders(): Record<string, string> {
  const config = getSavedAIConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) headers['x-ai-api-key'] = config.apiKey;
  if (config.baseUrl) headers['x-ai-base-url'] = config.baseUrl;
  if (config.model) headers['x-ai-model'] = config.model;

  return headers;
}
