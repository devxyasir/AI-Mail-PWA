# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inbox.spec.ts >> Inbox Smoke Test >> should allow searching messages
- Location: tests\e2e\inbox.spec.ts:79:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/inbox
Call log:
  - navigating to "http://127.0.0.1:3000/inbox", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Inbox Smoke Test', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Mock the session check
  6  |     await page.route('**/api/auth/session', async (route) => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         contentType: 'application/json',
  10 |         body: JSON.stringify({
  11 |           user: { id: '0000', email: 'test@example.com', name: 'Test User' },
  12 |           expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  13 |         }),
  14 |       });
  15 |     });
  16 | 
  17 |     // Mock accounts API
  18 |     await page.route('**/api/accounts', async (route) => {
  19 |       await route.fulfill({
  20 |         status: 200,
  21 |         contentType: 'application/json',
  22 |         body: JSON.stringify([
  23 |           { id: 'acc1', provider: 'gmail', email: 'test@gmail.com', display_name: 'Work Gmail' }
  24 |         ]),
  25 |       });
  26 |     });
  27 | 
  28 |     // Mock email list API
  29 |     await page.route('**/api/email/list*', async (route) => {
  30 |       await route.fulfill({
  31 |         status: 200,
  32 |         contentType: 'application/json',
  33 |         body: JSON.stringify({
  34 |           messages: [
  35 |             {
  36 |               id: 'msg1',
  37 |               accountId: 'acc1',
  38 |               from: 'boss@work.com',
  39 |               subject: 'Urgent Project Update',
  40 |               snippet: 'Please check the latest slides...',
  41 |               receivedAt: new Date().toISOString(),
  42 |               isRead: false,
  43 |               priorityLabel: 'urgent',
  44 |               priorityScore: 95
  45 |             },
  46 |             {
  47 |               id: 'msg2',
  48 |               accountId: 'acc1',
  49 |               from: 'newsletter@tech.com',
  50 |               subject: 'Weekly Tech Digest',
  51 |               snippet: 'Here are the top stories...',
  52 |               receivedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  53 |               isRead: true,
  54 |               priorityLabel: 'low',
  55 |               priorityScore: 20
  56 |             }
  57 |           ],
  58 |           errors: []
  59 |         }),
  60 |       });
  61 |     });
  62 | 
> 63 |     await page.goto('/inbox');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/inbox
  64 |   });
  65 | 
  66 |   test('should display the unified inbox with messages', async ({ page }) => {
  67 |     // Check for app title or logo
  68 |     await expect(page.locator('h1')).toContainText('Inbox');
  69 |     
  70 |     // Check for message items
  71 |     const inboxItems = page.locator('[data-testid^="inbox-item-"]');
  72 |     await expect(inboxItems).toHaveCount(2);
  73 |     
  74 |     // Check for specific content
  75 |     await expect(page.getByText('Urgent Project Update')).toBeVisible();
  76 |     await expect(page.getByText('Weekly Tech Digest')).toBeVisible();
  77 |   });
  78 | 
  79 |   test('should allow searching messages', async ({ page }) => {
  80 |     const searchInput = page.getByPlaceholder(/search/i);
  81 |     await expect(searchInput).toBeVisible();
  82 |     await searchInput.fill('Urgent');
  83 |     // In a real app, this would trigger a re-fetch. 
  84 |     // For smoke test, we just verify the input works.
  85 |     await expect(searchInput).toHaveValue('Urgent');
  86 |   });
  87 | });
  88 | 
```