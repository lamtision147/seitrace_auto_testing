import { test, expect } from '@playwright/test';
import { TransactionPage } from '../page-objects/transaction-page';

test.describe('Transaction Page Tests', () => {
    let transactionPage: TransactionPage;

    test.beforeEach(async ({ page }) => {
        transactionPage = new TransactionPage(page);
        await transactionPage.goto();
    });

    test('TXS_001: Verify that when accessing the transactions page, EVM tab is automatically selected', async ({ page }) => {
        await expect(transactionPage.evmTab).toHaveAttribute('aria-selected', 'true');
    });

    test('TXS_002: Verify that transactions page can be accessed through direct URL', async ({ page }) => {
        await expect(page).toHaveURL(/.*txs/);
        await expect(page).toHaveTitle(/Transactions/);
    });

    test('TXS_003: Verify that the tooltip for completed transactions is displayed', async ({ page }) => {
        await transactionPage.completedTxnsTooltipIcon.hover();
        const tooltip = page.locator('.chakra-popover__content:visible');
        const tooltipText = await tooltip.innerText();
        expect(tooltipText).toContain(transactionPage.completedTxnsTooltipText);
    });

    test('TXS_004: Verify that the tooltip for total transactions is displayed', async ({ page }) => {
        await transactionPage.totalTxnsTooltipIcon.hover();
        const tooltip = page.locator('.chakra-popover__content:visible');
        const tooltipText = await tooltip.innerText();
        expect(tooltipText).toContain(transactionPage.totalTxnsTooltipText);
    });

    test('TXS_005: Verify that switching between EVM and Native SEI tabs shows corresponding data', async ({ page }) => {
        await transactionPage.clickNativeSeiTab();
        await expect(transactionPage.nativeSeiTab).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('text=Notes: As part of data retention policies')).toBeVisible();

        await transactionPage.clickEvmTab();
        await expect(transactionPage.evmTab).toHaveAttribute('aria-selected', 'true');
        await expect(transactionPage.transactionRows.first()).toBeVisible();
    });

    test('TXS_006: Verify that clicking on a transaction hash navigates to the correct transaction details page', async ({ page }) => {
        await transactionPage.transactionRows.first().waitFor({ state: 'visible' });
        const txHash = await transactionPage.firstTransactionHash.innerText();
        await transactionPage.clickFirstTransactionHash();
        await expect(page).toHaveURL(new RegExp(`.*tx\\/${txHash}`));
    });

    test('TXS_008: Verify that EVM tab displays all required columns', async ({ page }) => {
        const expectedColumns = ['Trx hash', 'Status', 'Type & Method', 'Block', 'From/To', 'Value SEI', 'Fee SEI'];
        const tableHeaders = page.locator('table thead tr th');
        
        const actualHeaders = await tableHeaders.allInnerTexts();
        
        for (const col of expectedColumns) {
            expect(actualHeaders.some(header => header.includes(col))).toBeTruthy();
        }
    });

    test('TXS_010: Verify that transaction status icons correctly reflect the transaction outcome', async ({ page }) => {
        // This test case is to verify the status icons. Since it's hard to check icons directly,
        // we will check for the status text 'Success' or 'Error'. A more thorough test would involve visual regression testing.
        await transactionPage.clickEvmTab();
        const firstStatus = transactionPage.transactionRows.first().locator('td').nth(1);
        await expect(firstStatus).toHaveText(/Success|Error/);
    });

    test('TXS_011: Verify that the Native SEI tab transaction table does not display From/To column', async ({ page }) => {
        await transactionPage.clickNativeSeiTab();
        const activeTable = page.locator('[role="tabpanel"]:not([hidden]) table');
        await activeTable.waitFor({ state: 'visible' });
        const tableHeaders = activeTable.locator('thead tr th');
        const headersText = await tableHeaders.allInnerTexts();
        expect(headersText.join()).not.toContain('From/To');
        expect(headersText.join()).not.toContain('From');
        expect(headersText.join()).not.toContain('To');
    });

    test('TXS_015 - Verify that clicking on a "To" address navigates to the correct address page', async ({ page }) => {
        const transactionPage = new TransactionPage(page);

        const toAddressLink = transactionPage.page.locator('td:nth-child(5) a.css-osuhv9').first();
        await toAddressLink.waitFor({ state: 'visible' });

        const href = await toAddressLink.getAttribute('href');
        expect(href).not.toBeNull();

        await toAddressLink.click();

        await page.waitForURL(`**${href}`);

        const url = page.url();
        expect(url).toContain(href);
    });

    test('TXS_018: Verify contract tooltips and navigation', async ({ page, context }) => {
        test.setTimeout(150000);
        const transactionPage = new TransactionPage(page);
        await page.waitForSelector('table');

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} rows in the transaction table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cell = row.locator('td:nth-child(5)');
            const triggers = cell.locator('div[id^="popover-trigger-"]');
            const triggerCount = await triggers.count();

            for (let j = 0; j < triggerCount; j++) {
                const trigger = triggers.nth(j);
                const icon = trigger.locator('svg, img');

                if (await icon.count() === 0) {
                    continue; // Skip triggers that do not contain an icon.
                }

                await trigger.scrollIntoViewIfNeeded();
                await trigger.hover({ force: true });

                const tooltip = page.locator('.chakra-popover__content:visible');
                let tooltipText = '';
                try {
                    tooltipText = await tooltip.innerText({ timeout: 2000 });
                } catch (e) {
                    console.log(`Row ${i}, Trigger ${j}: Could not get tooltip text. Error: ${e.message}`);
                    await page.mouse.move(0, 0);
                    await page.waitForTimeout(200);
                    continue;
                }

                console.log(`Row ${i}, Trigger ${j}: Found tooltip text: "${tooltipText.trim()}"`);

                if (tooltipText.match(/Verified contract|Contract|Verified proxy contract|Proxy contract/)) {
                    console.log(`SUCCESS: Found matching tooltip: "${tooltipText.trim()}"`);

                    const addressLink = trigger.locator('xpath=..').locator('a[href*="/address/"]');
                    const href = await addressLink.getAttribute('href');
                    console.log(`Found address link: ${href}. Clicking it now.`);
                    
                    await addressLink.click();
                    await page.waitForLoadState('domcontentloaded');

                    const h1 = page.locator('h1');
                    await expect(h1).toContainText('Contract details', { timeout: 5000 });
                    
                    console.log('Successfully navigated to and verified the Contract Details page.');
                    
                    return; // Test passes, exit.
                }

                await page.mouse.move(0, 0);
                await page.waitForTimeout(500);
            }
        }

        throw new Error('Test failed: After checking all rows, no matching contract tooltip was found to click and verify.');
    });
    
    test('TXS_019: Verify tooltip for "Unverify contract"', async ({ page }) => {
        test.setTimeout(150000);
        const transactionPage = new TransactionPage(page);
        await page.waitForSelector('table');

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} rows in the transaction table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cell = row.locator('td:nth-child(5)');
            const triggers = cell.locator('div[id^="popover-trigger-"]');
            const triggerCount = await triggers.count();

            for (let j = 0; j < triggerCount; j++) {
                const trigger = triggers.nth(j);
                const icon = trigger.locator('svg, img');

                if (await icon.count() === 0) {
                    continue; // Skip triggers that do not contain an icon.
                }

                await trigger.scrollIntoViewIfNeeded();
                await trigger.hover({ force: true });

                const tooltip = page.locator('.chakra-popover__content:visible');
                let tooltipText = '';
                try {
                    // Reduce timeout for faster check
                    tooltipText = await tooltip.innerText({ timeout: 100 });
                } catch (e) {
                    // Tooltip not found or other error, move on quickly.
                    await page.mouse.move(0, 0);
                    continue;
                }

                console.log(`Row ${i}, Trigger ${j}: Found tooltip text: "${tooltipText.trim()}"`);

                if (tooltipText.trim() === 'Contract') {
                    console.log(`SUCCESS: Found matching tooltip: "${tooltipText.trim()}"`);
                    return; // Test passes, exit.
                }

                // Move mouse away to dismiss popover without extra wait
                await page.mouse.move(0, 0);
            }
        }

        throw new Error('Test failed: After checking all rows, no "Contract" tooltip was found.');
    });

    test('TXS_020: Verify tooltip for "Verified contract"', async ({ page }) => {
        test.setTimeout(150000);
        const transactionPage = new TransactionPage(page);
        await page.waitForSelector('table');

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} rows in the transaction table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cell = row.locator('td:nth-child(5)');
            const triggers = cell.locator('div[id^="popover-trigger-"]');
            const triggerCount = await triggers.count();

            for (let j = 0; j < triggerCount; j++) {
                const trigger = triggers.nth(j);
                const icon = trigger.locator('svg, img');

                if (await icon.count() === 0) {
                    continue; // Skip triggers that do not contain an icon.
                }

                await trigger.scrollIntoViewIfNeeded();
                await trigger.hover({ force: true });

                const tooltip = page.locator('.chakra-popover__content:visible');
                let tooltipText = '';
                try {
                    // Reduce timeout for faster check
                    tooltipText = await tooltip.innerText({ timeout: 100 });
                } catch (e) {
                    // Tooltip not found or other error, move on quickly.
                    await page.mouse.move(0, 0);
                    continue;
                }

                console.log(`Row ${i}, Trigger ${j}: Found tooltip text: "${tooltipText.trim()}"`);

                if (tooltipText.trim() === 'Verified contract') {
                    console.log(`SUCCESS: Found matching tooltip: "${tooltipText.trim()}"`);
                    return; // Test passes, exit.
                }

                // Move mouse away to dismiss popover without extra wait
                await page.mouse.move(0, 0);
            }
        }

        throw new Error('Test failed: After checking all rows, no "Verified contract" tooltip was found.');
    });

    test('TXS_021: Verify tooltip for "Verified proxy contract"', async ({ page }) => {
        test.setTimeout(150000);
        const transactionPage = new TransactionPage(page);
        await page.waitForSelector('table');

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} rows in the transaction table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cell = row.locator('td:nth-child(5)');
            const triggers = cell.locator('div[id^="popover-trigger-"]');
            const triggerCount = await triggers.count();

            for (let j = 0; j < triggerCount; j++) {
                const trigger = triggers.nth(j);
                const icon = trigger.locator('svg, img');

                if (await icon.count() === 0) {
                    continue; // Skip triggers that do not contain an icon.
                }

                await trigger.scrollIntoViewIfNeeded();
                await trigger.hover({ force: true });

                const tooltip = page.locator('.chakra-popover__content:visible');
                let tooltipText = '';
                try {
                    // Reduce timeout for faster check
                    tooltipText = await tooltip.innerText({ timeout: 100 });
                } catch (e) {
                    // Tooltip not found or other error, move on quickly.
                    await page.mouse.move(0, 0);
                    continue;
                }

                console.log(`Row ${i}, Trigger ${j}: Found tooltip text: "${tooltipText.trim()}"`);

                if (tooltipText.trim() === 'Verified proxy contract') {
                    console.log(`SUCCESS: Found matching tooltip: "${tooltipText.trim()}"`);
                    return; // Test passes, exit.
                }

                // Move mouse away to dismiss popover without extra wait
                await page.mouse.move(0, 0);
            }
        }

        throw new Error('Test failed: After checking all rows, no "Verified proxy contract" tooltip was found.');
    });

    test('TXS_022: Verify tooltip for "Proxy contract"', async ({ page }) => {
        test.setTimeout(150000);
        const transactionPage = new TransactionPage(page);
        await page.waitForSelector('table');

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        console.log(`Found ${rowCount} rows in the transaction table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cell = row.locator('td:nth-child(5)');
            const triggers = cell.locator('div[id^="popover-trigger-"]');
            const triggerCount = await triggers.count();

            for (let j = 0; j < triggerCount; j++) {
                const trigger = triggers.nth(j);
                const icon = trigger.locator('svg, img');

                if (await icon.count() === 0) {
                    continue; // Skip triggers that do not contain an icon.
                }

                await trigger.scrollIntoViewIfNeeded();
                await trigger.hover({ force: true });

                const tooltip = page.locator('.chakra-popover__content:visible');
                let tooltipText = '';
                try {
                    // Reduce timeout for faster check
                    tooltipText = await tooltip.innerText({ timeout: 100 });
                } catch (e) {
                    // Tooltip not found or other error, move on quickly.
                    await page.mouse.move(0, 0);
                    continue;
                }

                console.log(`Row ${i}, Trigger ${j}: Found tooltip text: "${tooltipText.trim()}"`);

                if (tooltipText.trim() === 'Proxy contract') {
                    console.log(`SUCCESS: Found matching tooltip: "${tooltipText.trim()}"`);
                    return; // Test passes, exit.
                }
                // Move mouse away to dismiss popover without extra wait
                await page.mouse.move(0, 0);
            }
        }

        throw new Error('Test failed: After checking all rows, no "Proxy contract" tooltip was found.');
    });

    test('TXS_025: Verify that Fee SEI values are rounded to 6 decimal places', async ({ page }) => {
        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const feeCell = row.locator('td:nth-child(7)');
            const feeText = await feeCell.innerText();
            const feeValue = feeText.trim();

            console.log(`Checking row ${i + 1}: Fee SEI = "${feeValue}"`); // Log the value being checked

            // Regex to check if the number has at most 6 decimal places
            const regex = /^-?\d*\.?\d{0,6}$/;

            if (feeValue !== '' && feeValue !== '-') {
                expect(regex.test(feeValue), `Fee SEI value "${feeValue}" in row ${i + 1} is not rounded to at most 6 decimal places.`).toBeTruthy();
            }
        }
    });

    test('TXS_027: Verify that First button is disabled when on the first page', async ({ page }) => {
        await page.waitForSelector('table');
        await expect(transactionPage.firstPageButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('TXS_028: Verify that Previous button is disabled when on the first page', async ({ page }) => {
        await expect(transactionPage.previousPageButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('TXS_029: Verify that Next button navigates to the next page correctly', async ({ page }) => {
        await transactionPage.nextPageButton.click();
        await expect(page).toHaveURL(/.*_page%22%3A2/);
        await expect(transactionPage.previousPageButton).toBeEnabled();
    });

    test('TXS_030: Verify that Previous button navigates to the previous page correctly', async ({ page }) => {
        await transactionPage.nextPageButton.click();
        await page.waitForURL(/.*_page%22%3A2/);
        await transactionPage.previousPageButton.click();
        await expect(page).not.toHaveURL(/.*_page%22%3A2/);
        await expect(transactionPage.firstPageButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('TXS_031: Verify that First button navigates to the first page correctly from any page', async ({ page }) => {
        await transactionPage.nextPageButton.click();
        await page.waitForURL(/.*_page%22%3A2/);
        await transactionPage.nextPageButton.click();
        await page.waitForURL(/.*_page%22%3A3/);
        await transactionPage.firstPageButton.click();
        await expect(transactionPage.firstPageButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('TXS_032: Verify that the current page number is displayed correctly', async ({ page }) => {
        await transactionPage.nextPageButton.click();
        await transactionPage.nextPageButton.click();
        await expect(transactionPage.currentPageNumber).toHaveText('3');
    });

    test('TXS_033: Verify that there is no Last page button in the pagination', async ({ page }) => {
        await expect(transactionPage.lastPageButton).not.toBeVisible();
    });

    test('TXS_034: Verify that the transactions page loads within 3 seconds', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('https://seitrace.com/txs');
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000);
    });

    test('TXS_035: Verify that switching between EVM and Native SEI tabs takes less than 2 seconds', async ({ page }) => {
        await transactionPage.goto();
        const nativeSeiTabSwitchTime = await transactionPage.measureTabSwitchTime('nativeSei');
        expect(nativeSeiTabSwitchTime).toBeLessThan(2000);
        const evmTabSwitchTime = await transactionPage.measureTabSwitchTime('evm');
        expect(evmTabSwitchTime).toBeLessThan(2000);
    });

    test('TXS_037: Verify that navigation to transaction or block details occurs within 3 seconds', async ({ page }) => {
        await transactionPage.goto();
        const transactionNavigationTime = await transactionPage.measureNavigationTime('transaction');
        expect(transactionNavigationTime).toBeLessThan(3000);
        await transactionPage.goto();
        const blockNavigationTime = await transactionPage.measureNavigationTime('block');
        expect(blockNavigationTime).toBeLessThan(3000);
    });
});