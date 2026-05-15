export interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: DocBlock[];
}

export type DocBlock = 
  | { type: 'text'; content: string }
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'image'; src: string; alt: string; caption?: string; annotations?: DocAnnotation[] }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; variant: 'info' | 'warning' | 'tip'; content: string }
  | { type: 'steps'; items: { title: string; content: string }[] };

export interface DocAnnotation {
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  type: 'arrow' | 'box' | 'dot';
  width?: number; // for box
  height?: number; // for box
}

export const DOC_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'unified-inbox', title: 'Unified Inbox' },
  { id: 'ai-features', title: 'AI Intelligence' },
  { id: 'comms', title: 'Communications' },
  { id: 'management', title: 'Organization' },
  { id: 'mobile', title: 'Mobile & PWA' },
];

export const DOC_ARTICLES: DocArticle[] = [
  {
    id: 'intro',
    slug: 'introduction',
    category: 'getting-started',
    title: 'Welcome to SmartMail AI',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'SmartMail AI is a professional email tool that combines all your different email accounts into one place. It uses Artificial Intelligence to help you read long emails faster and write replies in seconds.' },
      
      { type: 'heading', level: 2, content: 'How it works' },
      { type: 'steps', items: [
        { title: 'Connect', content: 'Link your Gmail, Outlook, or custom email accounts.' },
        { title: 'Unified View', content: 'See every email in one clean, fast list.' },
        { title: 'AI Assistant', content: 'Use built-in tools to summarize and draft messages automatically.' }
      ]},

      { type: 'image', src: '/docs/screenshots/landing.png', alt: 'SmartMail AI Entry', caption: 'Your new, faster way to handle email.' },

      { type: 'callout', variant: 'info', content: 'Key Takeaway: SmartMail AI saves you time by putting all your emails in one place and doing the hard reading for you.' }
    ]
  },
  {
    id: 'accounts',
    slug: 'connecting-accounts',
    category: 'getting-started',
    title: 'Connecting Your Accounts',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'To use SmartMail AI, you first need to connect your existing email accounts. We support Google, Microsoft, and most other providers.' },
      
      { type: 'heading', level: 2, content: 'Step-by-Step Logic' },
      { type: 'steps', items: [
        { title: 'Step 1: Open Settings', content: 'Click the Settings button at the bottom of the sidebar.' },
        { title: 'Step 2: Choose Provider', content: 'Pick your email service (like Gmail or Outlook).' },
        { title: 'Step 3: Login', content: 'Log in through the secure popup. We never see your password directly.' },
        { title: 'Step 4: Sync', content: 'Wait a few seconds while your emails are securely loaded.' }
      ]},

      { type: 'image', src: '/docs/screenshots/signin.png', alt: 'Sign In Page', caption: 'The secure login screen for your providers.' },

      { type: 'callout', variant: 'tip', content: 'Key Takeaway: Connecting an account takes less than 30 seconds and is completely secure.' }
    ]
  },
  {
    id: 'unified',
    slug: 'unified-inbox',
    category: 'unified-inbox',
    title: 'Mastering the Unified Inbox',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'A Unified Inbox means you don\'t have to switch between tabs. All your emails from different accounts show up in one single list.' },
      
      { type: 'heading', level: 2, content: 'How to use it' },
      { type: 'list', items: [
        'All Accounts: See everything at once.',
        'Single Account: Filter to see only one specific email address.',
        'Fast Switching: Jump between accounts in one click.'
      ]},

      { type: 'image', src: '/docs/screenshots/accounts.png', alt: 'Account Switcher', caption: 'Switching between your connected accounts.', annotations: [
        { x: 30, y: 40, label: 'Choose Account', type: 'dot' }
      ]},

      { type: 'callout', variant: 'info', content: 'Key Takeaway: You stay organized by seeing the big picture or focusing on one account at a time.' }
    ]
  },
  {
    id: 'ai-summary',
    slug: 'ai-summarization',
    category: 'ai-features',
    title: 'Neural Summarization',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'The Summarization tool reads long, boring emails for you and tells you the main points in just 3 sentences.' },
      
      { type: 'heading', level: 2, content: 'Step-by-Step Logic' },
      { type: 'steps', items: [
        { title: 'Open Email', content: 'Click on any message in your inbox.' },
        { title: 'View Summary', content: 'Look at the top right panel to see the AI summary.' },
        { title: 'Take Action', content: 'Decide if you need to read the full text or just reply based on the summary.' }
      ]},

      { type: 'image', src: '/docs/screenshots/email-detail.png', alt: 'Email Detail View', caption: 'The AI Summary panel appearing next to your email.', annotations: [
        { x: 70, y: 20, label: 'AI Summary', type: 'box', width: 25, height: 30 }
      ]},

      { type: 'callout', variant: 'tip', content: 'Key Takeaway: You can understand a 10-paragraph email in less than 5 seconds.' }
    ]
  },
  {
    id: 'ai-write',
    slug: 'neural-drafting',
    category: 'ai-features',
    title: 'Neural Expansion (AI Write)',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'AI Write (Neural Expansion) turns a short note into a full, professional email automatically.' },
      
      { type: 'heading', level: 2, content: 'Example' },
      { type: 'text', content: 'You type: "Tell them I\'m sick and can\'t come to the meeting."' },
      { type: 'text', content: 'AI Writes: "Dear Team, I am unfortunately feeling unwell today and will not be able to attend our scheduled meeting. I apologize for the short notice and will follow up with you soon."' },

      { type: 'heading', level: 2, content: 'Step-by-Step Logic' },
      { type: 'steps', items: [
        { title: 'Step 1: Open Compose', content: 'Click the Compose button.' },
        { title: 'Step 2: Enter Prompt', content: 'Type a short instruction in the AI box.' },
        { title: 'Step 3: Generate', content: 'Click "Craft Email" and watch the magic happen.' }
      ]},

      { type: 'image', src: '/docs/screenshots/compose.png', alt: 'Compose Modal', caption: 'Writing emails with the help of AI.', annotations: [
        { x: 50, y: 85, label: 'Click to Generate', type: 'dot' }
      ]},

      { type: 'callout', variant: 'tip', content: 'Key Takeaway: You never have to stare at a blank screen again. Just tell the AI what you want to say.' }
    ]
  },
  {
    id: 'pwa',
    slug: 'mobile-pwa',
    category: 'mobile',
    title: 'PWA & Mobile Usage',
    content: [
      { type: 'heading', level: 2, content: 'Simple Explanation' },
      { type: 'text', content: 'AI Mail is a "Progressive Web App." This means you can install it on your phone just like a normal app from the App Store.' },
      
      { type: 'heading', level: 2, content: 'How to install' },
      { type: 'list', items: [
        'On iPhone: Open Safari -> Tap Share -> Tap "Add to Home Screen".',
        'On Android: Open Chrome -> Tap Menu -> Tap "Install App".'
      ]},

      { type: 'callout', variant: 'info', content: 'Key Takeaway: Installing the app makes it faster to open and lets you use it even when your internet is slow.' }
    ]
  }
];
