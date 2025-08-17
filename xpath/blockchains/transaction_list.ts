// Transaction List Page Object Model (POM) for Seitrace Transactions Page
// All selectors are XPath-based for Playwright tests

export const TransactionListPage = {
  // Tabs (verified structure)
  tabEVM: "//div[@role='tablist']//button[@role='tab' and .='EVM']",
  tabNativeSEI: "//div[@role='tablist']//button[@role='tab' and .='Native SEI']",

  // Statistics (verified structure)
  statCompletedTxns: "//div[contains(@class,'statistic')]//*[contains(text(),'Completed txns')]/ancestor::div[contains(@class,'statistic')]",
  statCompletedTxnsTooltip: "//html/body/div[2]/div[2]/main/div[2]/div[1]/div[2]/div[1]/div/div/svg",
  statTotalTxs: "//div[contains(@class,'statistic')]//*[contains(text(),'Total txns')]/ancestor::div[contains(@class,'statistic')]",
  statTotalTxsTooltip: "//div[contains(@class,'statistic')]//*[contains(text(),'Total txns')]/following-sibling::img",

  // Table headers (verified structure)
  tableHeader: "//table//thead//tr",
  tableHeaderCell: (col: number) => `//table//thead//tr/th[${col}]`,

  // Table rows and cells (verified structure)
  tableRows: "//table//tbody//tr",
  tableCell: (row: number, col: number) => `//table//tbody//tr[${row}]/td[${col}]`,

  // Transaction hash cell and copy icon (verified structure)
  trxHashCell: (row: number) => `//table//tbody//tr[${row}]/td[1]//span[contains(@class,'pointer')]`,
  trxHashCopyIcon: (row: number) => `//table//tbody//tr[${row}]/td[1]//button` ,

  // Status cell and icon (verified structure)
  statusCell: (row: number) => `//table//tbody//tr[${row}]/td[2]`,
  statusIcon: (row: number) => `//table//tbody//tr[${row}]/td[2]//img`,

  // Type & Method cell, method indicator, and popup (verified structure)
  typeMethodCell: (row: number) => `//table//tbody//tr[${row}]/td[3]`,
  methodIndicator: (row: number) => `//table//tbody//tr[${row}]/td[3]//span[contains(text(),'+')]`,
  methodPopup: "//div[contains(@class,'popup') and .//span[contains(text(),'Method')]]",

  // Block cell (clickable, verified structure)
  blockCell: (row: number) => `//table//tbody//tr[${row}]/td[4]//a`,

  // From/To cell, address icons, and copy icon (verified structure)
  fromToCell: (row: number) => `//table//tbody//tr[${row}]/td[5]`,
  addressIcon: (row: number) => `//table//tbody//tr[${row}]/td[5]//img[contains(@alt,'address')]`,
  addressCopyIcon: (row: number) => `//table//tbody//tr[${row}]/td[5]//button` ,

  // Value SEI and Fee SEI cells (verified structure)
  valueSEICell: (row: number) => `//table//tbody//tr[${row}]/td[6]`,
  feeSEICell: (row: number) => `//table//tbody//tr[${row}]/td[7]`,
  // No tooltip found for fee in snapshot, so omitting feeSEITooltip

  // Pagination controls (verified structure)
  paginationFirst: "//div[contains(@class,'pagination')]//span[contains(text(),'First')]/parent::button",
  paginationPrevious: "//div[contains(@class,'pagination')]//span[contains(text(),'Previous')]/parent::button",
  paginationNext: "//div[contains(@class,'pagination')]//span[contains(text(),'Next')]/parent::button",
  paginationCurrent: "//div[contains(@class,'pagination')]//button[contains(@class,'active') or @aria-current='page']",
  paginationControls: "//div[contains(@class,'pagination')]//button",

  // Data retention note (Native SEI tab, verified structure)
  nativeSEINote: "//div[contains(text(),'Notes: As part of data retention policies')]"
};

