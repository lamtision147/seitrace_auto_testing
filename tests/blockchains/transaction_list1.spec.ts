import { test, expect, Page, Locator } from '@playwright/test';
import { TransactionListPage } from '../../xpath/blockchains/transaction_list';

// Utility functions for row/cell access
const getRow = (page: Page, row: number): Locator => page.locator(`xpath=${TransactionListPage.tableRows}[${row}]`);
const getCell = (page: Page, row: number, col: number): Locator => page.locator(`xpath=${TransactionListPage.tableCell(row, col)}`);

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
