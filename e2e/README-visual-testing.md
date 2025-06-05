# Visual Regression Testing

This document provides instructions for running and maintaining the visual regression tests for the EveAssistant application.

## Overview

Visual regression testing ensures that changes to the codebase do not inadvertently affect the visual appearance of the application. The tests work by:

1. Taking screenshots of the application's UI components
2. Comparing these screenshots to baseline images
3. Flagging any visual differences that exceed a configurable threshold

## Running Visual Tests

### Prerequisites

- Make sure you have built the application first using:
  ```
  npm run pre-e2e
  ```

### Running Tests Locally

To run all visual regression tests:

```
npx playwright test visual-regression.test.ts component-visual.test.ts
```

### Initial Run: Generating Baseline Images

On the first run, Playwright will generate baseline screenshots which will be stored in the `-snapshots` directories. These should be committed to version control.

### Updating Baseline Images

When there are intentional UI changes, update the baseline images with:

```
npx playwright test visual-regression.test.ts component-visual.test.ts --update-snapshots
```

## Test Structure

- `visual-regression.test.ts`: Tests the overall application appearance 
- `component-visual.test.ts`: Tests individual UI components
- `screenshot.css`: CSS used to mask dynamic elements during screenshot capture

## Best Practices

1. **Consistent Environment**: Run tests in a consistent environment to avoid false positives
2. **Element Selection**: Use reliable selectors that are unlikely to change
3. **Dynamic Content**: Use `screenshot.css` to hide dynamic content that changes between runs
4. **Threshold Settings**: Adjust the `maxDiffPixels` setting in `playwright.config.ts` if needed
5. **Review Changes**: Always manually review visual diffs before updating baselines

## CI/CD Integration

Visual regression tests are automatically run in GitHub Actions on pull requests and pushes to the master branch. The workflow is defined in `.github/workflows/visual-regression.yml`.

If tests fail in CI:

1. Review the uploaded artifacts to see the visual differences
2. Fix the issues or update the baselines locally
3. Commit the updated baselines

## Troubleshooting

### Common Issues

- **Different OS/Browser**: Screenshots may differ slightly across operating systems or browsers
- **Animation**: Ensure animations are disabled or completed before taking screenshots
- **Dynamic Content**: Use the CSS file to hide elements that change between runs

### Fixing Broken Tests

1. Run tests locally to reproduce the issue
2. Review the differences in the generated report
3. Fix the application code if there's an actual regression
4. Update baselines if the changes are intentional 