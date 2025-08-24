# Seitrace Playwright Tests

This repository contains automated tests for the Seitrace application using Playwright.

## Installation

To get started, clone the repository and install the necessary dependencies.

```bash
git clone <repository-url>
cd cursor-playwright
npm install
```

## Running Tests

To run the entire test suite, use the following command:

```bash
npx playwright test
```

To run a specific test file, you can specify the file path:

```bash
npx playwright test tests/transaction-list.spec.ts
```