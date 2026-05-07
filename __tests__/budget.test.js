/**
 * Budget App Test Suite
 * Tests all core functionality of the budget application
 * @author Team Member 1
 */

const budgetApp = require('../budget.js');

describe('Budget App - Core Functions', () => {
  beforeEach(() => {
    budgetApp.resetState();
    
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  describe('Amount Validation', () => {
    test('should validate positive numbers', () => {
      expect(budgetApp.validateAmount(10)).toBe(true);
      expect(budgetApp.validateAmount(0.01)).toBe(true);
      expect(budgetApp.validateAmount(1000)).toBe(true);
    });

    test('should reject zero', () => {
      expect(budgetApp.validateAmount(0)).toBe(false);
    });

    test('should reject negative numbers', () => {
      expect(budgetApp.validateAmount(-10)).toBe(false);
      expect(budgetApp.validateAmount(-0.01)).toBe(false);
    });

    test('should reject non-numeric values', () => {
      expect(budgetApp.validateAmount('abc')).toBe(false);
      expect(budgetApp.validateAmount(null)).toBe(false);
      expect(budgetApp.validateAmount(undefined)).toBe(false);
    });
  });

  describe('Add Entry', () => {
    test('should add valid expense entry', () => {
      const result = budgetApp.addEntry('expense', 'Food', 50);
      expect(result).toBe(true);
      expect(budgetApp.getEntryList()).toHaveLength(1);
    });

    test('should add valid income entry', () => {
      const result = budgetApp.addEntry('income', 'Salary', 1000);
      expect(result).toBe(true);
    });

    test('should reject invalid amount', () => {
      const result = budgetApp.addEntry('expense', 'Test', -10);
      expect(result).toBe(false);
    });
  });

  describe('Delete Entry', () => {
    test('should delete entry by index', () => {
      budgetApp.addEntry('expense', 'Food', 50);
      const result = budgetApp.deleteEntry(0);
      expect(result).toBe(true);
    });

    test('should handle invalid index', () => {
      const result = budgetApp.deleteEntry(-1);
      expect(result).toBe(false);
    });
  });

  describe('Calculations', () => {
    test('should calculate total income', () => {
      budgetApp.addEntry('income', 'Salary', 1000);
      budgetApp.addEntry('income', 'Bonus', 500);
      expect(budgetApp.calculateTotal('income')).toBe(1500);
    });

    test('should calculate total expense', () => {
      budgetApp.addEntry('expense', 'Food', 100);
      budgetApp.addEntry('expense', 'Transport', 50);
      expect(budgetApp.calculateTotal('expense')).toBe(150);
    });

    test('should calculate balance correctly', () => {
      expect(budgetApp.calculateBalance(1000, 500)).toBe(500);
      expect(budgetApp.calculateBalance(500, 1000)).toBe(-500);
    });
  });

  describe('Language Management', () => {
    test('should get default language', () => {
      expect(budgetApp.getLanguage()).toBe('en');
    });

    test('should set language', () => {
      expect(budgetApp.setLanguage('zh')).toBe('zh');
    });

    test('should fallback to default for invalid language', () => {
      expect(budgetApp.setLanguage('invalid')).toBe('en');
    });
  });

  describe('Cookie Consent', () => {
    test('should accept cookies', () => {
      expect(budgetApp.acceptCookies()).toBe(true);
    });

    test('should get cookie consent status', () => {
      budgetApp.acceptCookies();
      expect(budgetApp.getCookieConsent()).toBe('accepted');
    });
  });

  describe('Storage', () => {
    test('should handle invalid JSON', () => {
      localStorage.setItem('entry_list', 'invalid-json');
      expect(() => budgetApp.loadFromStorage()).not.toThrow();
    });

    test('should fallback to empty array for invalid data', () => {
      localStorage.setItem('entry_list', JSON.stringify('not-an-array'));
      const result = budgetApp.loadFromStorage();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Translations', () => {
    test('should return translations object', () => {
      const translations = budgetApp.getTranslations();
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('zh');
    });
  });

  describe('generateEntryHTML', () => {
    test('should generate correct HTML for expense', () => {
      const html = budgetApp.generateEntryHTML('expense', 'Food', 50, 0);
      expect(html).toContain('expense');
      expect(html).toContain('Food');
      expect(html).toContain('$50');
      expect(html).toContain('id="0"');
    });

    test('should generate correct HTML for income', () => {
      const html = budgetApp.generateEntryHTML('income', 'Salary', 1000, 1);
      expect(html).toContain('income');
      expect(html).toContain('Salary');
      expect(html).toContain('$1000');
      expect(html).toContain('id="1"');
    });
  });

  describe('formatBalance', () => {
    test('should format positive balance', () => {
      const result = budgetApp.formatBalance(1000, 500);
      expect(result.balance).toBe(500);
      expect(result.sign).toBe('$');
      expect(result.formatted).toBe('<small>$</small>500');
    });

    test('should format negative balance', () => {
      const result = budgetApp.formatBalance(500, 1000);
      expect(result.balance).toBe(500);
      expect(result.sign).toBe('-$');
      expect(result.formatted).toBe('<small>-$</small>500');
    });

    test('should format zero balance', () => {
      const result = budgetApp.formatBalance(500, 500);
      expect(result.balance).toBe(0);
      expect(result.sign).toBe('$');
    });
  });

  describe('toggleVisibility', () => {
    test('should toggle visibility of elements', () => {
      const element = { classList: { remove: jest.fn() } };
      const elementsToHide = [{ classList: { add: jest.fn() } }];
      const elementToActive = { classList: { add: jest.fn() } };
      const elementsToDeactivate = [{ classList: { remove: jest.fn() } }];

      budgetApp.toggleVisibility(element, elementsToHide, elementToActive, elementsToDeactivate);

      expect(element.classList.remove).toHaveBeenCalledWith('hide');
      expect(elementsToHide[0].classList.add).toHaveBeenCalledWith('hide');
      expect(elementToActive.classList.add).toHaveBeenCalledWith('focus');
      expect(elementsToDeactivate[0].classList.remove).toHaveBeenCalledWith('focus');
    });

    test('should handle null/undefined elements', () => {
      expect(() => {
        budgetApp.toggleVisibility(null, [null], null, [null]);
      }).not.toThrow();
    });
  });

  describe('clearElements', () => {
    test('should clear innerHTML of elements', () => {
      const elements = [{ innerHTML: '<div>content</div>' }];
      budgetApp.clearElements(elements);
      expect(elements[0].innerHTML).toBe('');
    });

    test('should handle null elements', () => {
      expect(() => {
        budgetApp.clearElements([null]);
      }).not.toThrow();
    });

    test('should handle undefined elements', () => {
      expect(() => {
        budgetApp.clearElements(undefined);
      }).not.toThrow();
    });
  });

  describe('clearInputs', () => {
    test('should clear input values', () => {
      const inputs = [{ value: 'test' }];
      budgetApp.clearInputs(inputs);
      expect(inputs[0].value).toBe('');
    });

    test('should handle null inputs', () => {
      expect(() => {
        budgetApp.clearInputs([null]);
      }).not.toThrow();
    });

    test('should handle undefined inputs', () => {
      expect(() => {
        budgetApp.clearInputs(undefined);
      }).not.toThrow();
    });
  });

  describe('renderEntries', () => {
    test('should render entries correctly', () => {
      budgetApp.addEntry('expense', 'Food', 50);
      budgetApp.addEntry('income', 'Salary', 1000);

      const expenseList = { innerHTML: '', insertAdjacentHTML: jest.fn() };
      const incomeList = { innerHTML: '', insertAdjacentHTML: jest.fn() };
      const allList = { innerHTML: '', insertAdjacentHTML: jest.fn() };

      budgetApp.renderEntries(budgetApp.getEntryList(), expenseList, incomeList, allList);

      expect(expenseList.insertAdjacentHTML).toHaveBeenCalled();
      expect(incomeList.insertAdjacentHTML).toHaveBeenCalled();
      expect(allList.insertAdjacentHTML).toHaveBeenCalledTimes(2);
    });

    test('should handle null list elements', () => {
      budgetApp.addEntry('expense', 'Food', 50);
      expect(() => {
        budgetApp.renderEntries(budgetApp.getEntryList(), null, null, null);
      }).not.toThrow();
    });
  });

  describe('updateLanguageDOM', () => {
    test('should update language to Chinese', () => {
      const translatableText = [{ dataset: { i18n: 'balance' }, textContent: '' }];
      const translatablePlaceholders = [{ dataset: { i18nPlaceholder: 'titlePlaceholder' }, placeholder: '' }];
      const translatableAriaLabels = [{ dataset: { i18nAriaLabel: 'expenseTitleLabel' }, setAttribute: jest.fn() }];
      const languageButtons = [{ dataset: { lang: 'zh' }, classList: { toggle: jest.fn() } }];

      const result = budgetApp.updateLanguageDOM(translatableText, translatablePlaceholders, translatableAriaLabels, languageButtons, 'zh');

      expect(result).toBe('zh');
      expect(translatableText[0].textContent).toBe('余额');
    });

    test('should update language to English', () => {
      const translatableText = [{ dataset: { i18n: 'balance' }, textContent: '' }];
      const result = budgetApp.updateLanguageDOM(translatableText, undefined, undefined, undefined, 'en');

      expect(result).toBe('en');
      expect(translatableText[0].textContent).toBe('Balance');
    });

    test('should handle null parameters', () => {
      expect(() => {
        budgetApp.updateLanguageDOM(null, null, null, null, 'en');
      }).not.toThrow();
    });
  });
});