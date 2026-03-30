// pages/registrationPage.js
class RegistrationPage {

  constructor(page) {
    this.page = page;

    // ===== Radio Buttons =====
    this.radioCompanyThai = page.getByTestId(
      'input_radio_registration_company_thai'
    ).locator('#undefined');
    this.radioCompanyOthers = page.getByTestId(
      'input_radio_registration_company_others'
    ).locator('#undefined');

    // ===== Tax ID (thai only) =====
    this.taxIdInput = page.getByTestId(
      'input_textfield_input_registration_tax_id'
    );

    // ===== Company Name (others only) =====
    this.companyNameInput = page.getByTestId(
      'input_textfield_input_register_company_name'
    );

    // ===== Dropdowns =====
    this.allDropdowns = page.locator('.go5-dropdown-input-selection');

    // ===== User Info =====
    this.firstNameInput = page.getByTestId(
      'input_textfield_input_register_first_name'
    );
    this.lastNameInput = page.getByTestId(
      'input_textfield_input_register_last_name'
    );
    this.emailInput = page.getByTestId(
      'input_textfield_input_registration_email'
    );
    this.phoneInput = page.getByRole('textbox', { name: 'เบอร์มือถือ*' });

    // ===== Promo Code =====
    this.promoToggle = page.getByText('ใช้โค้ดส่วนลด');
    this.promoInput = page.getByTestId('input_text_registration_coupon_code');

    // ===== Checkbox =====
    this.termsCheckbox = page.getByTestId(
      'input_checkbox_registration_checkbox'
    );
    this.termsLabel = page.getByText('ฉันยอมรับ');

    // ===== Button =====
    this.submitButton = page.getByTestId(
      'button_submit_registration_try_for_free'
    );

    // ===== Error Messages =====
    this.errorMessages = page.locator('[class*="error"]');
  }

  // ===============================================
  // NAVIGATION
  // ===============================================

  async goto() {
    await this.page.goto('/Register/empeo');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  // ===============================================
  // COMPANY TYPE
  // ===============================================

  async selectCompanyTypeThai() {
    await this.radioCompanyThai.check();
    await this.page.waitForTimeout(1000);
  }

  async selectCompanyTypeOthers() {
    await this.radioCompanyOthers.check();
    await this.page.waitForTimeout(1000);
  }

  // ===============================================
  // TAX ID / COMPANY NAME
  // ===============================================

  async fillTaxId(value) {
    const isVisible = await this.taxIdInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.taxIdInput.click();
      await this.taxIdInput.fill(value);
      await this.page.waitForTimeout(1000);

      // ปิด Tax ID popup ถ้ามี
      // กดที่อื่นเพื่อปิด popup
      await this.page.locator('body').click({ position: { x: 10, y: 10 } });
      await this.page.waitForTimeout(500);

      // กด Escape เพื่อปิด popup ที่อาจค้างอยู่
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    }
  }

  async fillCompanyName(value) {
    const isVisible = await this.companyNameInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.companyNameInput.click();
      await this.companyNameInput.fill(value);
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    }
  }

  // ===============================================
  // DROPDOWN HELPER
  // ===============================================

  async closeAllPopups() {
    // ปิด popup/dropdown ที่อาจค้างอยู่
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    await this.firstNameInput.click();
    await this.page.waitForTimeout(300);
  }

  async clickDropdownOption(optionText) {
    const selectors = [
      '.go5-dropdown-item-body',
      '.go5-dropdown-item',
      '.go5-dropdown-item-label',
    ];

    for (const sel of selectors) {
      try {
        const option = this.page.locator(sel)
          .filter({ hasText: optionText }).first();
        if (await option.isVisible({ timeout: 2000 })) {
          await option.click({ force: true });
          await this.page.waitForTimeout(500);
          return;
        }
      } catch { /* ลอง selector ถัดไป */ }
    }

    // fallback: ใช้ force click
    try {
      await this.page.getByText(optionText, { exact: true })
        .first().click({ force: true });
      await this.page.waitForTimeout(500);
    } catch {
      console.log(`⚠️ ไม่สามารถเลือก "${optionText}" ได้`);
    }
  }

  async selectBusinessType(optionText) {
    // ปิด popup ก่อน
    await this.closeAllPopups();

    const dd = this.allDropdowns.filter({ hasText: 'ประเภทธุรกิจ' });
    await dd.first().click({ force: true });
    await this.page.waitForTimeout(1500);
    await this.clickDropdownOption(optionText);
  }

  async selectUserCount(optionText) {
    // ปิด popup ก่อน
    await this.closeAllPopups();

    const dd = this.allDropdowns.filter({ hasText: 'ผู้ใช้งาน' });
    await dd.first().click({ force: true });
    await this.page.waitForTimeout(1500);
    await this.clickDropdownOption(optionText);
  }

  // ===============================================
  // USER INFO
  // ===============================================

  async fillFirstName(value) {
    await this.firstNameInput.click();
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value) {
    await this.lastNameInput.click();
    await this.lastNameInput.fill(value);
  }

  async fillEmail(value) {
    await this.emailInput.click();
    await this.emailInput.fill(value);
  }

  async fillPhone(value) {
    await this.phoneInput.click();
    await this.phoneInput.fill(value);
  }

  // ===============================================
  // PROMO CODE
  // ===============================================

  async openPromoCode() {
    const isPromoVisible = await this.promoInput.isVisible().catch(() => false);
    if (!isPromoVisible) {
      await this.promoToggle.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async fillPromoCode(value) {
    await this.openPromoCode();
    await this.promoInput.click();
    await this.promoInput.fill(value);
  }

  // ===============================================
  // CHECKBOX
  // ===============================================

  async checkTerms() {
    const isChecked = await this.termsCheckbox.isChecked();
    if (!isChecked) {
      try {
        await this.termsLabel.click();
      } catch {
        await this.termsCheckbox.check({ force: true });
      }
      await this.page.waitForTimeout(500);
    }
  }

  async uncheckTerms() {
    const isChecked = await this.termsCheckbox.isChecked();
    if (isChecked) {
      try {
        await this.termsLabel.click();
      } catch {
        await this.termsCheckbox.uncheck({ force: true });
      }
      await this.page.waitForTimeout(500);
    }
  }

  // ===============================================
  // SUBMIT
  // ===============================================

  async clickSubmit() {
    await this.submitButton.click();
    await this.page.waitForTimeout(3000);
  }

  // ===============================================
  // FILL COMPLETE FORM
  // ===============================================

  async fillCompleteForm(data) {
    if (data.companyType === 'thai') {
      await this.selectCompanyTypeThai();
    } else if (data.companyType === 'others') {
      await this.selectCompanyTypeOthers();
    }

    if (data.taxId) await this.fillTaxId(data.taxId);
    if (data.companyName) await this.fillCompanyName(data.companyName);
    if (data.businessType) await this.selectBusinessType(data.businessType);
    if (data.userCount) await this.selectUserCount(data.userCount);
    if (data.firstName) await this.fillFirstName(data.firstName);
    if (data.lastName) await this.fillLastName(data.lastName);
    if (data.email) await this.fillEmail(data.email);
    if (data.phone) await this.fillPhone(data.phone);
    if (data.promoCode) await this.fillPromoCode(data.promoCode);
    if (data.acceptTerms) await this.checkTerms();
  }

  async fillAndSubmit(data) {
    await this.fillCompleteForm(data);
    await this.clickSubmit();
  }

  // ===============================================
  // ERROR CHECKING
  // ===============================================

  async getVisibleErrors() {
    await this.page.waitForTimeout(1000);
    const errorTexts = [];
    const items = await this.errorMessages.all();
    for (const item of items) {
      if (await item.isVisible()) {
        const text = await item.textContent();
        if (text && text.trim() && text.trim().length < 200) {
          errorTexts.push(text.trim());
        }
      }
    }
    return [...new Set(errorTexts)];
  }

  async hasErrors() {
    const errors = await this.getVisibleErrors();
    return errors.length > 0;
  }

  // ===============================================
  // SCREENSHOT
  // ===============================================

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true
    });
  }
}

module.exports = { RegistrationPage };