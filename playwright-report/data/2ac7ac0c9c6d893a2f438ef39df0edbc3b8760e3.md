# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compose.spec.ts >> Compose Smoke Test >> should open compose modal and allow typing
- Location: tests\e2e\compose.spec.ts:30:7

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
  3  | test.describe('Compose Smoke Test', () => {
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
  16 |     // Mock accounts
  17 |     await page.route('**/api/accounts', async (route) => {
  18 |       await route.fulfill({
  19 |         status: 200,
  20 |         contentType: 'application/json',
  21 |         body: JSON.stringify([
  22 |           { id: 'acc1', provider: 'gmail', email: 'test@gmail.com', display_name: 'Work' }
  23 |         ]),
  24 |       });
  25 |     });
  26 | 
> 27 |     await page.goto('/inbox');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/inbox
  28 |   });
  29 | 
  30 |   test('should open compose modal and allow typing', async ({ page }) => {
  31 |     // Look for a Floating Action Button or Compose button
  32 |     const composeBtn = page.getByRole('button', { name: /compose/i }).or(page.locator('a[href="/compose"]'));
  33 |     await expect(composeBtn).toBeVisible();
  34 |     await composeBtn.click();
  35 | 
  36 |     // Check if we are on the compose page or if a modal appeared
  37 |     // The app has app/(app)/compose/page.tsx, so it might navigate
  38 |     await expect(page).toHaveURL(/\/compose/);
  39 | 
  40 |     // Verify form fields
  41 |     const toInput = page.getByLabel(/to/i).or(page.getByPlaceholder(/to/i));
  42 |     const subjectInput = page.getByLabel(/subject/i).or(page.getByPlaceholder(/subject/i));
  43 |     const bodyInput = page.locator('textarea').or(page.getByRole('textbox'));
  44 | 
  45 |     await expect(toInput).toBeVisible();
  46 |     await expect(subjectInput).toBeVisible();
  47 |     
  48 |     await toInput.fill('friend@example.com');
  49 |     await subjectInput.fill('Test Subject');
  50 |     await bodyInput.fill('Hello from E2E test!');
  51 | 
  52 |     await expect(toInput).toHaveValue('friend@example.com');
  53 |     await expect(subjectInput).toHaveValue('Test Subject');
  54 |   });
  55 | });
  56 | 
```