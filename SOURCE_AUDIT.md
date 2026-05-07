# Source Code Audit

This audit records four concrete defects found in the existing Budget App source code. These are implementation defects in the current codebase, not missing future requirements.

## Audit Method

- Manual source inspection of `index.html`, `budget.js`, `chart.js`, and `style.css`.
- Browser availability check: Chrome and Edge executables are installed locally.
- Command-line audit limitation: `lighthouse`, `npx`, and axe CLI are not available in this environment, so Lighthouse/axe DevTools findings should be re-run from the browser UI for screenshot evidence.
- Accessibility issues below are the kind of issues axe DevTools/Lighthouse Accessibility should report or help confirm, especially missing form labels.

## Defect 1: Chart Calculation Uses `NaN` When No Data Exists

Status: **Fixed** in `chart.js`.

Discovery method: manual source inspection; reproducible on initial page load with empty storage.

Source evidence:

- `chart.js`, `updateChart(income, outcome)`
- Original logic calculated `income / (outcome + income)`.

Steps to reproduce:

1. Clear `localStorage`.
2. Open `index.html`.
3. The app calls `updateUI()`, then `updateChart(0, 0)`.
4. The chart ratio becomes `0 / 0`, which is `NaN`.

Impact:

Canvas drawing receives an invalid numeric value. This can cause the chart to render incorrectly or fail silently in the initial empty state.

Fix applied:

```js
const total = income + outcome;
if (total <= 0) return;

let ratio = income / total;
```

## Defect 2: Invalid Amounts Are Accepted

Status: **Fixed** in `index.html` and `budget.js`.

Discovery method: manual source inspection and input validation review.

Source evidence:

- `index.html`: amount inputs use only `type="number"` without `min`, `step`, or validation constraints.
- `budget.js`: expense add handler only checks empty values at lines 58-67.
- `budget.js`: income add handler only checks empty values at lines 74-83.

Steps to reproduce:

1. Open the Expense tab.
2. Enter title `Food`.
3. Enter amount `-50`.
4. Click add.
5. The app accepts the value and stores it as an expense.

Impact:

Negative or zero amounts make the budget totals mathematically wrong. For example, a negative expense reduces total spending instead of increasing it.

Fix applied:

- Added `min="0.01"` and `step="0.01"` to both expense and income amount inputs in `index.html`.
- Added JavaScript validation using `isFinite()` and checking `amount > 0` before adding entries.

## Defect 3: Corrupted `localStorage` Crashes the App

Status: **Fixed** in `budget.js`.

Discovery method: manual source inspection of persistent data loading.

Source evidence:

- `budget.js`, line 35:

```js
ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
```

Steps to reproduce:

1. Open browser DevTools.
2. Set `localStorage.entry_list` to invalid JSON, such as `abc`.
3. Refresh the page.
4. `JSON.parse(...)` throws a `SyntaxError`, preventing the app from initializing.

Impact:

The application can become unusable after corrupted local storage data, old incompatible data, or manual user/browser modification.

Fix applied:

- Wrapped `JSON.parse()` in `try...catch` block.
- Added validation to check that parsed value is an array using `Array.isArray()`.
- Falls back to empty array `[]` when storage is invalid or corrupted.

## Defect 4: Form Inputs Have No Accessible Labels

Status: **Fixed** in `index.html` and `budget.js`.

Discovery method: accessibility source inspection; should be confirmed with axe DevTools or Lighthouse Accessibility.

Source evidence:

- `index.html`, lines 42-53: expense title and amount inputs use placeholders only.
- `index.html`, lines 60-71: income title and amount inputs use placeholders only.
- There are no `<label>`, `aria-label`, or `aria-labelledby` attributes for these controls.

Steps to reproduce:

1. Open `index.html` in Chrome or Edge.
2. Run axe DevTools or Lighthouse Accessibility.
3. Inspect the form controls in the Expense and Income tabs.

Impact:

Screen reader users may not receive reliable names for the input fields. Placeholder text is not a proper accessible label and may disappear once the user types.

Fix applied:

- Added `aria-label` and `data-i18n-aria-label` attributes to all form inputs.
- Added corresponding translation keys in `TRANSLATIONS` object for both English and Chinese.

## Additional Enhancement: Cookie Banner and Privacy Policy

Status: **Implemented**.

To meet Legal Compliance baseline standards, a functional Cookie banner and dedicated Privacy Policy modal have been added:

- Cookie banner appears on initial page load if user hasn't given consent.
- Privacy Policy modal explains data collection, usage, storage, and cookies practices.
- All text supports English and Chinese localization.

