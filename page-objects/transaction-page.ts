import { Page, Locator } from '@playwright/test';

export class TransactionPage {
    readonly page: Page;
    readonly evmTab: Locator;
    readonly nativeSeiTab: Locator;
    readonly transactionRows: Locator;
    readonly completedTxnsLabel: Locator;
    readonly totalTxnsLabel: Locator;
    readonly tooltip: Locator;
    readonly completedTxnsTooltipIcon: Locator;
    readonly totalTxnsTooltipIcon: Locator;
    readonly completedTxnsTooltipText: string;
    readonly totalTxnsTooltipText: string;
    readonly firstPageButton: Locator;
    readonly previousPageButton: Locator;
    readonly nextPageButton: Locator;
    readonly lastPageButton: Locator;
    readonly currentPageNumber: Locator;

    constructor(page: Page) {
        this.page = page;
        this.evmTab = page.getByRole('tab', { name: 'EVM' });
        this.nativeSeiTab = page.getByRole('tab', { name: 'Native SEI' });
        this.transactionRows = page.locator('table tbody tr');
        this.completedTxnsLabel = page.getByText('Completed txns');
        this.totalTxnsLabel = page.getByText('Total txns');
        this.tooltip = page.locator('.chakra-popover__content');
        this.completedTxnsTooltipIcon = page.getByText('Completed txns').locator('..').locator('svg');
        this.totalTxnsTooltipIcon = this.page.getByText('Total txns').locator('..').locator('svg');
        this.completedTxnsTooltipText = 'Number of transactions with success status';
        this.totalTxnsTooltipText = 'All transactions including pending, dropped, replaced, failed transactions';
        this.firstPageButton = page.locator("xpath=//div[@role='tabpanel' and not(@hidden)]/div/div[1]/div[2]/div/div/div/div[1]/span");
        this.previousPageButton = page.locator("xpath=//div[@role='tabpanel' and not(@hidden)]/div/div[1]/div[2]/div/div/div/div[2]/span");
        this.nextPageButton = page.locator("xpath=//div[@role='tabpanel' and not(@hidden)]/div/div[1]/div[2]/div/div/div/div[4]/span");
        this.lastPageButton = page.locator("xpath=//div[@role='tabpanel' and not(@hidden)]/div/div[1]/div[2]/div/div/div/div[5]/span");
        this.currentPageNumber = page.locator("xpath=//div[@role='tabpanel' and not(@hidden)]/div/div[1]/div[2]/div/div/div/div[3]/span");
    }

    get firstTransactionHash(): Locator {
        return this.page.locator('table tbody tr:first-child td:nth-child(1) a');
    }

    get firstBlock(): Locator {
        return this.page.locator('table tbody tr:first-child td:nth-child(4) a');
    }

    async goto() {
        await this.page.goto('https://seitrace.com/txs', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForLoadState('networkidle');
        await this.evmTab.waitFor({ state: 'visible' });
    }

    async clickEvmTab() {
        await this.evmTab.click();
    }

    async clickNativeSeiTab() {
        await this.nativeSeiTab.click();
    }

    async clickFirstTransactionHash() {
        await this.firstTransactionHash.click();
    }

    async clickFirstBlock() {
        await this.firstBlock.click();
    }

    async clickFirstFromAddress() {
        await this.firstFromAddress.click();
    }

    async clickFirstToAddress() {
    await this.firstToAddress.click();
  }

  async waitForTransactionTable() {
    return this.page.waitForSelector('table');
  }

  get firstFromAddress() {
    return this.page.locator('table tbody tr:first-child td:nth-child(5) a.css-1dwezpv');
  }

  get firstToAddress() {
    return this.page.locator('table tbody tr:first-child td:nth-child(5) a.css-osuhv9');
  }

    async measureTabSwitchTime(tabName: 'nativeSei' | 'evm'): Promise<number> {
        const startTime = Date.now();
        if (tabName === 'nativeSei') {
            await this.clickNativeSeiTab();
        } else {
            await this.clickEvmTab();
        }
        await this.page.waitForLoadState('networkidle');
        return Date.now() - startTime;
    }

    async measureNavigationTime(navigationType: 'transaction' | 'block'): Promise<number> {
        const startTime = Date.now();
        if (navigationType === 'transaction') {
            await this.clickFirstTransactionHash();
        } else {
            await this.clickFirstBlock();
        }
        await this.page.waitForLoadState('load');
        return Date.now() - startTime;
    }
}