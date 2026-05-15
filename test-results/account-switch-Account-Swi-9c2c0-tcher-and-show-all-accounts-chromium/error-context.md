# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: account-switch.spec.ts >> Account Switching Smoke Test >> should display account switcher and show all accounts
- Location: tests\e2e\account-switch.spec.ts:31:7

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
  3  | test.describe('Account Switching Smoke Test', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Mock the session check
  6  |     await page.route('**/api/auth/session', async (route) => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         contentType: 'application/json',
  10 |         body: JSON.stringify({
  11 |           user: { id: '0000', email: 'test@example.com', name: 'Test User' },
  12 |         }),
  13 |       });
  14 |     });
  15 | 
  16 |     // Mock multiple accounts
  17 |     await page.route('**/api/accounts', async (route) => {
  18 |       await route.fulfill({
  19 |         status: 200,
  20 |         contentType: 'application/json',
  21 |         body: JSON.stringify([
  22 |           { id: 'acc1', provider: 'gmail', email: 'work@gmail.com', display_name: 'Work' },
  23 |           { id: 'acc2', provider: 'microsoft', email: 'personal@outlook.com', display_name: 'Personal' }
  24 |         ]),
  25 |       });
  26 |     });
  27 | 
> 28 |     await page.goto('/inbox');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/inbox
  29 |   });
  30 | 
  31 |   test('should display account switcher and show all accounts', async ({ page }) => {
  32 |     // Account switcher is likely a button with the user's avatar or name
  33 |     const switcherBtn = page.getByRole('button', { name: /switch account/i }).or(page.locator('[data-testid="account-switcher"]'));
  34 |     
  35 |     // If it's always visible in the sidebar/header
  36 |     if (await switcherBtn.isVisible()) {
  37 |       await switcherBtn.click();
  38 |     }
  39 | 
  40 |     // Check for account names in the UI
  41 |     await expect(page.getByText('Work')).toBeVisible();
  42 |     await expect(page.getByText('Personal')).toBeVisible();
  43 |     await expect(page.getByText('Unified Inbox').or(page.getByText('All Accounts'))).toBeVisible();
  44 |   });
  45 | });
  46 | 
```