document.addEventListener('DOMContentLoaded', () => {
  const balanceEl = document.querySelector(".balance .value");
  const incomeTotalEl = document.querySelector(".income-total");
  const outcomeTotalEl = document.querySelector(".outcome-total");
  const incomeEl = document.querySelector("#income");
  const expenseEl = document.querySelector("#expense");
  const allEl = document.querySelector("#all");
  const incomeList = document.querySelector("#income .list");
  const expenseList = document.querySelector("#expense .list");
  const allList = document.querySelector("#all .list");
  const translatableText = document.querySelectorAll("[data-i18n]");
  const translatablePlaceholders = document.querySelectorAll("[data-i18n-placeholder]");
  const translatableAriaLabels = document.querySelectorAll("[data-i18n-aria-label]");
  const languageButtons = document.querySelectorAll(".lang-btn");
  const cookieBanner = document.getElementById("cookieBanner");
  const privacyModal = document.getElementById("privacyModal");
  const closeModal = document.getElementById("closeModal");
  const acceptCookiesBtn = document.querySelector(".accept-btn");
  const viewPolicyBtn = document.querySelector(".policy-btn");
  const expenseBtn = document.querySelector(".first-tab");
  const incomeBtn = document.querySelector(".second-tab");
  const allBtn = document.querySelector(".third-tab");
  const addExpenseBtn = document.querySelector(".add-expense");
  const expenseTitle = document.getElementById("expense-title-input");
  const expenseAmount = document.getElementById("expense-amount-input");
  const addIncomeBtn = document.querySelector(".add-income");
  const incomeTitle = document.getElementById("income-title-input");
  const incomeAmount = document.getElementById("income-amount-input");

  function updateUI() {
    const income = budgetApp.calculateTotal("income");
    const outcome = budgetApp.calculateTotal("expense");
    const { formatted: balanceFormatted } = budgetApp.formatBalance(income, outcome);

    if (balanceEl) balanceEl.innerHTML = balanceFormatted;
    if (outcomeTotalEl) outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
    if (incomeTotalEl) incomeTotalEl.innerHTML = `<small>$</small>${income}`;

    const entryList = budgetApp.getEntryList();
    budgetApp.renderEntries(entryList, expenseList, incomeList, allList);

    if (typeof updateChart === 'function') {
      updateChart(income, outcome);
    }

    budgetApp.saveToStorage();
  }

  function deleteOrEdit(event) {
    const targetBtn = event.target;
    const entry = targetBtn.parentNode;

    if (targetBtn.id === "edit") {
      const ENTRY = budgetApp.getEntryList()[entry.id];
      if (ENTRY.type === "income") {
        incomeTitle.value = ENTRY.title;
        incomeAmount.value = ENTRY.amount;
      } else if (ENTRY.type === "expense") {
        expenseTitle.value = ENTRY.title;
        expenseAmount.value = ENTRY.amount;
      }
      budgetApp.deleteEntry(Number(entry.id));
      updateUI();
    } else if (targetBtn.id === "delete") {
      budgetApp.deleteEntry(Number(entry.id));
      updateUI();
    }
  }

  budgetApp.loadFromStorage();
  budgetApp.updateLanguageDOM(translatableText, translatablePlaceholders, translatableAriaLabels, languageButtons, budgetApp.getLanguage());
  updateUI();

  const cookieConsent = budgetApp.getCookieConsent();
  if (!cookieConsent && cookieBanner) {
    setTimeout(() => {
      cookieBanner.classList.add("show");
    }, 500);
  }

  if (expenseBtn) {
    expenseBtn.addEventListener("click", () => {
      budgetApp.toggleVisibility(expenseEl, [incomeEl, allEl], expenseBtn, [incomeBtn, allBtn]);
    });
  }
  if (incomeBtn) {
    incomeBtn.addEventListener("click", () => {
      budgetApp.toggleVisibility(incomeEl, [expenseEl, allEl], incomeBtn, [expenseBtn, allBtn]);
    });
  }
  if (allBtn) {
    allBtn.addEventListener("click", () => {
      budgetApp.toggleVisibility(allEl, [incomeEl, expenseEl], allBtn, [incomeBtn, expenseBtn]);
    });
  }
  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      budgetApp.updateLanguageDOM(translatableText, translatablePlaceholders, translatableAriaLabels, languageButtons, button.dataset.lang);
    });
  });
  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener("click", () => {
      budgetApp.acceptCookies();
      cookieBanner.classList.remove("show");
    });
  }
  if (viewPolicyBtn) {
    viewPolicyBtn.addEventListener("click", () => {
      privacyModal.classList.add("show");
    });
  }
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      privacyModal.classList.remove("show");
    });
  }
  if (privacyModal) {
    privacyModal.addEventListener("click", (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.remove("show");
      }
    });
  }
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener("click", () => {
      if (!expenseTitle.value || !expenseAmount.value) return;
      if (budgetApp.addEntry("expense", expenseTitle.value, expenseAmount.value)) {
        updateUI();
        budgetApp.clearInputs([expenseTitle, expenseAmount]);
      }
    });
  }
  if (addIncomeBtn) {
    addIncomeBtn.addEventListener("click", () => {
      if (!incomeTitle.value || !incomeAmount.value) return;
      if (budgetApp.addEntry("income", incomeTitle.value, incomeAmount.value)) {
        updateUI();
        budgetApp.clearInputs([incomeTitle, incomeAmount]);
      }
    });
  }
  [incomeList, expenseList, allList].filter(Boolean).forEach(list => {
    list.addEventListener("click", deleteOrEdit);
  });
});
