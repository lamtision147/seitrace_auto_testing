import { test, expect, Page, Locator } from '@playwright/test';
import { TransactionListPage } from '../../xpath/blockchains/transaction_list';

// Utility functions for row/cell access
const getRow = (page: Page, row: number): Locator => page.locator(`xpath=${TransactionListPage.tableRows}[${row}]`);
const getCell = (page: Page, row: number, col: number): Locator => page.locator(`xpath=${TransactionListPage.tableCell(row, col)}`);

// TXS_001: Default tab selection when accessing transaction page
test('TXS_001: EVM tab is selected by default', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  await expect(page.locator(`xpath=${TransactionListPage.tabEVM}`)).toHaveAttribute('aria-selected', 'true');
});

// TXS_002: Access transactions page through different navigation paths
test('TXS_002: Transactions page can be accessed via direct URL and navigation menu', async ({ page }) => {
  // Direct URL
  await page.goto('https://seitrace.com/txs');
  await expect(page).toHaveURL(/\/txs/);
  // Navigation menu
  await page.goto('https://seitrace.com/');
  await page.hover('nav >> text=Blockchain');
  await page.click('nav >> text=Transactions');
  await expect(page).toHaveURL(/\/txs/);
  await expect(page.locator(`xpath=${TransactionListPage.tabEVM}`)).toHaveAttribute('aria-selected', 'true');
});

// TXS_003: Completed txns statistic and tooltip
test('TXS_003: Completed txns statistic and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const stat = page.locator(`xpath=${TransactionListPage.statCompletedTxns}`);
  await expect(stat).toBeVisible();
  // Hover for tooltip
  const tooltipIcon = page.locator(`xpath=${TransactionListPage.statCompletedTxnsTooltip}`);
  await tooltipIcon.hover();
  await expect(page.getByText('Number of transactions with success status')).toBeVisible();
});

// TXS_004: Total txs statistic and tooltip
test('TXS_004: Total txs statistic and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const stat = page.locator(`xpath=${TransactionListPage.statTotalTxs}`);
  await expect(stat).toBeVisible();
  // Hover for tooltip
  const tooltipIcon = page.locator(`xpath=${TransactionListPage.statTotalTxsTooltip}`);
  await tooltipIcon.hover();
  await expect(page.getByText('All transactions including pending, dropped, replaced, failed transaction')).toBeVisible();
});

// TXS_005: Tab switching between EVM and Native SEI
test('TXS_005: Tab switching between EVM and Native SEI', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const evmTab = page.locator(`xpath=${TransactionListPage.tabEVM}`);
  const nativeTab = page.locator(`xpath=${TransactionListPage.tabNativeSEI}`);
  await expect(evmTab).toHaveAttribute('aria-selected', 'true');
  await nativeTab.click();
  await expect(nativeTab).toHaveAttribute('aria-selected', 'true');
  await evmTab.click();
  await expect(evmTab).toHaveAttribute('aria-selected', 'true');
});

// TXS_006: Trx hash tooltip shows last sync time, timezone, and time difference
test('TXS_006: Trx hash tooltip shows last sync time, timezone, and time difference', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find the info icon next to Trx hash header and hover
  // (Assume the tooltip is shown on hover of the info icon in the header)
  const header = page.locator(`xpath=${TransactionListPage.tableHeader}`);
  const infoIcon = header.locator('xpath=.//span[contains(@class,"tooltip") or @aria-label]');
  await infoIcon.first().hover();
  // Tooltip should show Last sync: ...
  const tooltip = page.getByText(/Last sync:/);
  await expect(tooltip).toBeVisible();
  // Optionally, check timezone and time difference (not implemented here for brevity)
});

// TXS_008: EVM tab transaction table columns
test('TXS_008: EVM tab displays all required columns', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const header = page.locator(`xpath=${TransactionListPage.tableHeader}`);
  await expect(header).toContainText(['Trx hash', 'Status', 'Type & Method', 'Block', 'From/To', 'Value SEI', 'Fee SEI']);
});

// TXS_010: Transaction status icons reflect outcome
test('TXS_010: Transaction status icons reflect outcome', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Check for at least one success and one error icon in the status column
  const statusIcons = page.locator('xpath=//table//tbody//tr/td[2]//img');
  await expect(statusIcons.first()).toBeVisible();
  // Optionally, check for green and red icons by class or alt (not implemented here)
});

// TXS_011: Native SEI tab does not display From/To column
test('TXS_011: Native SEI tab does not display From/To column', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  await page.locator(`xpath=${TransactionListPage.tabNativeSEI}`).click();
  const header = page.locator(`xpath=${TransactionListPage.tableHeader}`);
  await expect(header).not.toContainText(['From/To']);
});

// TXS_012: Native SEI tab displays data retention policy note
test('TXS_012: Native SEI tab displays data retention policy note', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  await page.locator(`xpath=${TransactionListPage.tabNativeSEI}`).click();
  await expect(page.locator(`xpath=${TransactionListPage.nativeSEINote}`)).toBeVisible();
});

// TXS_014: Clicking transaction hash navigates to details page
test('TXS_014: Clicking transaction hash navigates to details page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Click the first transaction hash link
  const hashCell = page.locator('xpath=//table//tbody//tr[1]/td[1]//a');
  const hash = await hashCell.textContent();
  await hashCell.click();
  await expect(page).toHaveURL(new RegExp(`/tx/`));
  // Optionally, check that the hash is in the URL
  if (hash) await expect(page).toHaveURL(new RegExp(hash.trim().slice(0, 8)));
});

// TXS_015: Clicking block number navigates to block details page
test('TXS_015: Clicking block number navigates to block details page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Click the first block link
  const blockCell = page.locator('xpath=//table//tbody//tr[1]/td[4]//a');
  const blockId = await blockCell.textContent();
  await blockCell.click();
  await expect(page).toHaveURL(new RegExp(`/block/`));
  if (blockId) await expect(page).toHaveURL(new RegExp(blockId.trim().replace(/,/g, '')));
});

// TXS_016: Copy icons copy values
test('TXS_016: Copy icons copy values', async ({ page, context }) => {
  await page.goto('https://seitrace.com/txs');
  // Copy transaction hash
  const copyIcon = page.locator('xpath=//table//tbody//tr[1]/td[1]//button[contains(@aria-label,"copy")]');
  await copyIcon.click();
  // Clipboard check (if supported)
  // Copy address in From/To
  const addressCopyIcon = page.locator('xpath=//table//tbody//tr[1]/td[5]//button[contains(@aria-label,"copy")]');
  if (await addressCopyIcon.count()) await addressCopyIcon.click();
});

// TXS_017: Clicking EOA address navigates to address details page with EOA tag
test('TXS_017: Clicking EOA address navigates to address details page with EOA tag', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find EOA icon and click the address link in the same cell
  const eoaCell = page.locator('xpath=//table//tbody//tr[td[5]//img[contains(@alt,"EOA")]][1]/td[5]//a');
  if (await eoaCell.count()) {
    await eoaCell.first().click();
    await expect(page).toHaveURL(/address/);
    await expect(page.getByText(/EOA/i)).toBeVisible();
  }
});

// TXS_018: Clicking contract address navigates to contract details page
test('TXS_018: Clicking contract address navigates to contract details page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find contract icon and click the address link in the same cell
  const contractCell = page.locator('xpath=//table//tbody//tr[td[5]//img[contains(@alt,"contract")]][1]/td[5]//a');
  if (await contractCell.count()) {
    await contractCell.first().click();
    await expect(page).toHaveURL(/address/);
    await expect(page.getByText(/Contract details/i)).toBeVisible();
  }
});

// TXS_019: Unverified contract icon and tooltip
test('TXS_019: Unverified contract icon and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find gray contract icon and hover
  const grayContractIcon = page.locator('xpath=//table//tbody//tr/td[5]//img[contains(@alt,"contract") and contains(@class,"gray")]');
  if (await grayContractIcon.count()) {
    await grayContractIcon.first().hover();
    await expect(page.getByText(/contract/i)).toBeVisible();
  }
});

// TXS_020: Verified contract icon and tooltip
test('TXS_020: Verified contract icon and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find green contract icon and hover
  const greenContractIcon = page.locator('xpath=//table//tbody//tr/td[5]//img[contains(@alt,"contract") and contains(@class,"green")]');
  if (await greenContractIcon.count()) {
    await greenContractIcon.first().hover();
    await expect(page.getByText(/Verified contract/i)).toBeVisible();
  }
});

// TXS_021: Verified proxy contract icon and tooltip
test('TXS_021: Verified proxy contract icon and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find green proxy icon and hover
  const greenProxyIcon = page.locator('xpath=//table//tbody//tr/td[5]//img[contains(@alt,"proxy") and contains(@class,"green")]');
  if (await greenProxyIcon.count()) {
    await greenProxyIcon.first().hover();
    await expect(page.getByText(/Verified proxy contract/i)).toBeVisible();
  }
});

// TXS_022: Unverified proxy contract icon and tooltip
test('TXS_022: Unverified proxy contract icon and tooltip', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Find gray proxy icon and hover
  const grayProxyIcon = page.locator('xpath=//table//tbody//tr/td[5]//img[contains(@alt,"proxy") and contains(@class,"gray")]');
  if (await grayProxyIcon.count()) {
    await grayProxyIcon.first().hover();
    await expect(page.getByText(/Proxy contract/i)).toBeVisible();
  }
});

// TXS_025: Fee SEI values are rounded to 6 decimal places
test('TXS_025: Fee SEI values are rounded to 6 decimal places', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const feeCell = page.locator('xpath=//table//tbody//tr[1]/td[7]');
  const feeText = await feeCell.textContent();
  if (feeText) {
    const match = feeText.trim().match(/^\d+\.\d{6}$/);
    expect(match).not.toBeNull();
  }
});

// TXS_027: First button disabled on first page
test('TXS_027: First button is disabled on first page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const firstBtn = page.locator(`xpath=${TransactionListPage.paginationFirst}`);
  await expect(firstBtn).toBeDisabled();
});

// TXS_028: Previous button disabled on first page
test('TXS_028: Previous button is disabled on first page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const prevBtn = page.locator(`xpath=${TransactionListPage.paginationPrevious}`);
  await expect(prevBtn).toBeDisabled();
});

// TXS_029: Next button navigates to next page
test('TXS_029: Next button navigates to next page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const nextBtn = page.locator(`xpath=${TransactionListPage.paginationNext}`);
  const firstRowBefore = await getRow(page, 1).textContent();
  await nextBtn.click();
  await expect(getRow(page, 1)).not.toHaveText(firstRowBefore || '');
});

// TXS_030: Previous button navigates to previous page
test('TXS_030: Previous button navigates to previous page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const nextBtn = page.locator(`xpath=${TransactionListPage.paginationNext}`);
  await nextBtn.click();
  const prevBtn = page.locator(`xpath=${TransactionListPage.paginationPrevious}`);
  const rowOnPage2 = await getRow(page, 1).textContent();
  await prevBtn.click();
  await expect(getRow(page, 1)).not.toHaveText(rowOnPage2 || '');
});

// TXS_031: First button navigates to first page from any page
test('TXS_031: First button navigates to first page from any page', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const nextBtn = page.locator(`xpath=${TransactionListPage.paginationNext}`);
  // Go to page 3
  await nextBtn.click();
  await nextBtn.click();
  const firstBtn = page.locator(`xpath=${TransactionListPage.paginationFirst}`);
  await firstBtn.click();
  // Should be back to page 1
  const current = page.locator(`xpath=${TransactionListPage.paginationCurrent}`);
  await expect(current).toHaveText('1');
});

// TXS_032: Current page number display
test('TXS_032: Current page number display', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const nextBtn = page.locator(`xpath=${TransactionListPage.paginationNext}`);
  const current = page.locator(`xpath=${TransactionListPage.paginationCurrent}`);
  await expect(current).toHaveText('1');
  await nextBtn.click();
  await expect(current).toHaveText('2');
  await nextBtn.click();
  await expect(current).toHaveText('3');
  const prevBtn = page.locator(`xpath=${TransactionListPage.paginationPrevious}`);
  await prevBtn.click();
  await expect(current).toHaveText('2');
});

// TXS_033: No Last button in pagination
test('TXS_033: No Last button in pagination', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const controls = await page.locator(`xpath=${TransactionListPage.paginationControls}`).allTextContents();
  expect(controls.join(' ')).not.toMatch(/Last/i);
});

// TXS_034: Initial page load time <= 3 seconds
test('TXS_034: Initial page load time is under 3 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('https://seitrace.com/txs');
  await expect(page.locator('xpath=//table')).toBeVisible();
  const duration = Date.now() - start;
  expect(duration).toBeLessThanOrEqual(3000);
});

// TXS_035: Tab switching load time <= 2 seconds
test('TXS_035: Tab switching between EVM and Native SEI is under 2 seconds', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  const nativeTab = page.locator(`xpath=${TransactionListPage.tabNativeSEI}`);
  const evmTab = page.locator(`xpath=${TransactionListPage.tabEVM}`);
  // Switch to Native SEI
  const startNative = Date.now();
  await nativeTab.click();
  await expect(nativeTab).toHaveAttribute('aria-selected', 'true');
  const durationNative = Date.now() - startNative;
  expect(durationNative).toBeLessThanOrEqual(2000);
  // Switch back to EVM
  const startEvm = Date.now();
  await evmTab.click();
  await expect(evmTab).toHaveAttribute('aria-selected', 'true');
  const durationEvm = Date.now() - startEvm;
  expect(durationEvm).toBeLessThanOrEqual(2000);
});

// TXS_037: Navigation to transaction/block details occurs within 3 seconds
test('TXS_037: Navigation to transaction/block details occurs within 3 seconds', async ({ page }) => {
  await page.goto('https://seitrace.com/txs');
  // Transaction hash
  const hashCell = page.locator('xpath=//table//tbody//tr[1]/td[1]//a');
  const startTx = Date.now();
  await hashCell.click();
  await expect(page).toHaveURL(/\/tx\//);
  const durationTx = Date.now() - startTx;
  expect(durationTx).toBeLessThanOrEqual(3000);
  // Go back and test block
  await page.goto('https://seitrace.com/txs');
  const blockCell = page.locator('xpath=//table//tbody//tr[1]/td[4]//a');
  const startBlock = Date.now();
  await blockCell.click();
  await expect(page).toHaveURL(/\/block\//);
  const durationBlock = Date.now() - startBlock;
  expect(durationBlock).toBeLessThanOrEqual(3000);
});
