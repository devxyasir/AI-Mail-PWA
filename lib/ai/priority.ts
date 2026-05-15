import { callAI, AIConfig } from './client';

export type PriorityLabel = 'urgent' | 'high' | 'important' | 'direct' | 'digest' | 'receipt' | 'social' | 'low';

export interface PriorityScore {
  score: number;
  label: PriorityLabel;
  reason: string;
  category: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Deterministic rules to catch common email types before AI processing.
 */
function getDeterministicPriority(from: string, subject: string, snippet: string, labels: string[]): PriorityScore | null {
  const sender = from.toLowerCase();
  const sub = subject.toLowerCase();
  const snip = snippet.toLowerCase();
  const allLabels = labels.map(l => l.toUpperCase());

  // URGENT/HIGH (Security/Critical)
  if (
    sub.includes('security alert') || 
    sub.includes('unauthorized access') || 
    sub.includes('password reset') ||
    sub.includes('compromised') ||
    sub.includes('suspicious activity')
  ) {
    return { score: 95, label: 'urgent', category: 'URGENT', reason: 'Security alert detected via keywords' };
  }
  if (sub.includes('action required') && (sub.includes('urgent') || sub.includes('immediate') || sub.includes('asap'))) {
    return { score: 90, label: 'urgent', category: 'URGENT', reason: 'Urgent action request in subject' };
  }

  // SOCIAL (Comprehensive List)
  const socialDomains = [
    'linkedin.com', 'facebook.com', 'fb.com', 'twitter.com', 'x.com', 
    'instagram.com', 'tiktok.com', 'youtube.com', 'pinterest.com', 
    'snapchat.com', 'reddit.com', 'discord.com', 'whatsapp.com', 
    'twitch.tv', 'medium.com'
  ];
  
  const isSocial = socialDomains.some(d => sender.includes(d)) || 
                   allLabels.includes('SOCIAL') || 
                   allLabels.includes('CATEGORY_SOCIAL');

  if (isSocial) {
    return { score: 15, label: 'social', category: 'LOW', reason: 'Social platform notification' };
  }

  // DIGEST / NEWSLETTER / PROMOTIONS
  const promoKeywords = ['newsletter', 'weekly digest', 'monthly update', 'special offer', 'deal', 'discount', 'unsubscribe'];
  const isPromo = allLabels.includes('PROMOTIONS') || 
                  allLabels.includes('CATEGORY_PROMOTIONS') || 
                  promoKeywords.some(k => sub.includes(k) || snip.includes(k));

  if (isPromo) {
    return { score: 20, label: 'digest', category: 'LOW', reason: 'Automated newsletter or promotion' };
  }

  // RECEIPT
  if (sub.includes('receipt') || sub.includes('invoice') || sub.includes('order confirmation') || sub.includes('your payment') || sub.includes('billing')) {
    return { score: 35, label: 'receipt', category: 'LOW', reason: 'Financial receipt or confirmation' };
  }

  // GITHUB / DEV TOOLS (unless urgent)
  if (sender.includes('github') || sender.includes('gitlab') || sender.includes('bitbucket') || sender.includes('vercel')) {
    if (sub.includes('incident') || sub.includes('vulnerability') || sub.includes('failed') || sub.includes('error')) {
      return { score: 85, label: 'high', category: 'HIGH', reason: 'Critical dev-tool notification' };
    }
    return { score: 25, label: 'low', category: 'LOW', reason: 'Generic dev-tool notification' };
  }

  return null;
}

/**
 * Calculates a priority score and intelligence category for an email.
 */
export async function calculatePriority(
  from: string, 
  subject: string, 
  snippet: string, 
  labels: string[] = [],
  config?: AIConfig
): Promise<PriorityScore> {
  // 1. Try deterministic rules first
  const deterministic = getDeterministicPriority(from, subject, snippet, labels);
  if (deterministic) return deterministic;

  // 2. Use AI for nuanced human communication
  const prompt = `
Analyze the priority and intelligence category of the following email.
Return a JSON object with:
- "score": (integer 0-100)
- "label": One of ("urgent", "important", "direct", "digest", "receipt", "social", "low")
- "reason": (brief string)

SENDER: ${from}
SUBJECT: ${subject}
SNIPPET: ${snippet}
PROVIDER LABELS: ${labels.join(', ')}

SCORING BUCKETS:
- URGENT / HIGH (80-100): Immediate action, security/financial alerts, major milestones, human-to-human urgent requests.
- MEDIUM / IMPORTANT (40-79): Business updates, routine reports, tracking, person-to-person work chat.
- LOW (0-39): Newsletters, marketing, social alerts, receipts.

INTELLIGENCE LABELS:
- "urgent": Score 90-100.
- "high": Score 80-89.
- "important": Score 60-79.
- "direct": Score 40-59.
- "digest": Score 10-30.
- "receipt": Score 26-39.
- "social": Score 0-15.
- "low": Score 0-10.

STRICT INSTRUCTION: Be precise. Automated marketing is ALWAYS LOW. Human requests from managers/clients are HIGH/URGENT.
Return ONLY valid JSON.
  `.trim();

  try {
    const response = await callAI([
      { role: 'system', content: 'You are a professional email intelligence system. Output valid JSON only.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1, maxTokens: 150 }, config);

    const data = JSON.parse(response.replace(/```json|```/g, '').trim());
    
    const validLabels: PriorityLabel[] = ['urgent', 'high', 'important', 'direct', 'digest', 'receipt', 'social', 'low'];
    const label = validLabels.includes(data.label) ? data.label : 'low';
    const score = Math.max(0, Math.min(100, data.score || 0));
    
    // Map score to category
    let category: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 90) category = 'URGENT';
    else if (score >= 80) category = 'HIGH';
    else if (score >= 40) category = 'MEDIUM';

    return { score, label, reason: data.reason || 'AI Analysis', category };
  } catch (error) {
    console.error('[AI] Priority analysis failed:', error);
    return { score: 20, label: 'low', category: 'LOW', reason: 'Deterministic fallback active' };
  }
}
