// @ts-check
const { test, expect } = require('@playwright/test');

// Test suite: Top Accounts Page (TC_001 - TC_005)
test.describe('Seitrace Top Accounts Page', () => {
  // TC_001: Navigation to Top Accounts page via Blockchain dropdown
  test('TC_001: User can navigate to Top Accounts page from Blockchain menu', async ({ page }) => {
    // Step 1: Go to homepage
    await page.goto('https://seitrace.com/');
    await expect(page).toHaveTitle(/Seitrace/);

    // Step 2: Hover over "Blockchain" in the navigation bar
    await page.hover('nav >> text=Blockchain');
    // Step 3: Click on "Top Accounts" in the dropdown
    await page.click('nav >> text=Top Accounts');
    // Step 4: Assert URL and page title
    await expect(page).toHaveURL(/\/accounts\?chain=pacific-1/);
    await expect(page.getByRole('heading', { name: /Top Accounts/i })).toBeVisible();
    await expect(page.getByText(/by SEI balance/i)).toBeVisible();
  });

  // TC_002: Back button display
  test('TC_002: Back button is displayed in the top left corner', async ({ page }) => {
    await page.goto('https://seitrace.com/accounts?chain=pacific-1');
    // The back button is the first button in the main header area
    const backButton = page.locator('main button').first();
    await expect(backButton).toBeVisible();
    // Optionally, check for an arrow icon or aria-label if available
  });

  // TC_003: Tab switching between EVM and Native SEI
  test('TC_003: User can switch between EVM and Native SEI tabs with correct URL', async ({ page }) => {
    await page.goto('https://seitrace.com/accounts?chain=pacific-1');
    // EVM tab is selected by default
    const evmTab = page.getByRole('tab', { name: /EVM/i });
    const nativeTab = page.getByRole('tab', { name: /Native SEI/i });
    await expect(evmTab).toHaveAttribute('aria-selected', 'true');
    // Click Native SEI tab
    await nativeTab.click();
    await expect(nativeTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/tab=native/);
    // Click EVM tab again
    await evmTab.click();
    await expect(evmTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/accounts\?chain=pacific-1$/);
  });

  // TC_004: Selected tab highlighting
  test('TC_004: Selected tab is visually highlighted', async ({ page }) => {
    await page.goto('https://seitrace.com/accounts?chain=pacific-1');
    const evmTab = page.getByRole('tab', { name: /EVM/i });
    const nativeTab = page.getByRole('tab', { name: /Native SEI/i });
    // EVM tab should have a highlight (e.g., a class or style)
    await expect(evmTab).toHaveAttribute('aria-selected', 'true');
    // Switch to Native SEI tab
    await nativeTab.click();
    await expect(nativeTab).toHaveAttribute('aria-selected', 'true');
    // Switch back to EVM tab
    await evmTab.click();
    await expect(evmTab).toHaveAttribute('aria-selected', 'true');
  });

  // TC_005: Data table columns display
  test('TC_005: Data table displays all required columns', async ({ page }) => {
    await page.goto('https://seitrace.com/accounts?chain=pacific-1');
    // Check for table headers in order
    const headers = page.locator('table thead tr th');
    await expect(headers.nth(0)).toHaveText(/Rank/i);
    await expect(headers.nth(1)).toHaveText(/Address/i);
    await expect(headers.nth(2)).toHaveText(/Associated/i);
    await expect(headers.nth(3)).toHaveText(/Balance SEI/i);
    await expect(headers.nth(4)).toHaveText(/Txn count/i);
    // Switch to Native SEI tab and check again
    await page.getByRole('tab', { name: /Native SEI/i }).click();
    await expect(headers.nth(0)).toHaveText(/Rank/i);
    await expect(headers.nth(1)).toHaveText(/Address/i);
    await expect(headers.nth(2)).toHaveText(/Associated/i);
    await expect(headers.nth(3)).toHaveText(/Balance SEI/i);
    await expect(headers.nth(4)).toHaveText(/Txn count/i);
  });
}); 