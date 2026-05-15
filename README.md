# SmartMail AI — Intelligent Unified Inbox PWA

SmartMail AI is a professional, AI-powered email client designed for high-performance inbox management. It unifies Gmail, Outlook, and IMAP accounts into a single, clean interface with powerful AI features.

## Live Deployment

The application is deployed on Vercel:
[https://smartmail-ai.vercel.app](https://smartmail-ai.vercel.app)

## Core Features

- **Unified Inbox**: Manage multiple accounts (Gmail, Microsoft, IMAP) in one place.
- **AI Summary**: Get instant, clear summaries of long email threads.
- **AI Write**: Draft professional replies from short notes or expand existing drafts.
- **AI Priority**: Automatic scoring and categorization of incoming mail.
- **PWA Support**: Installable on mobile and desktop for a native experience.
- **Docs Center**: Integrated help guides with visual walkthroughs.

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- OpenAI / Anthropic API keys (via OpenRouter)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devxyasir/AI-Mail-PWA.git
cd AI-Mail-PWA
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AI_API_KEY=...
CREDENTIAL_ENCRYPTION_KEY=... # 32 character string
```

4. Run the development server:
```bash
npm run dev
```

## Build and Deployment

### Production Build
```bash
npm run build
npm run start
```

### Vercel Deployment
The project is optimized for Vercel. Ensure all environment variables listed above are configured in the Vercel Dashboard.

## Documentation

Comprehensive documentation is available in-app at `/docs`.

## License

MIT
