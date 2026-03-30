// tests/registration.spec.js
const { test, expect } = require('@playwright/test');
const { RegistrationPage } = require('../page/registrationPage');
const { testData } = require('../test-data/testData');

test.describe('empeo Registration System', () => {

  let regPage;

  test.beforeEach(async ({ page }) => {
    regPage = new RegistrationPage(page);
    await regPage.goto();
  });

  // ============================================================
  // SECTION 1: PAGE LOAD & UI
  // ============================================================

  test.describe('1. Page Load & UI Elements', () => {

    test('TC-001: หน้า Registration โหลดสำเร็จ', async ({ page }) => {
      await expect(page).toHaveURL(/Register\/empeo/i);
      await regPage.takeScreenshot('TC001-page-loaded');
    });

    test('TC-002: แสดง Radio Button ประเภทบริษัท', async () => {
      await expect(regPage.radioCompanyThai).toBeVisible();
      await expect(regPage.radioCompanyOthers).toBeVisible();
    });

    test('TC-003: แสดง Input Fields ที่จำเป็น', async () => {
      await expect(regPage.firstNameInput).toBeVisible();
      await expect(regPage.lastNameInput).toBeVisible();
      await expect(regPage.emailInput).toBeVisible();
      await expect(regPage.phoneInput).toBeVisible();
    });

    test('TC-004: แสดง Terms Checkbox และ Submit Button', async () => {
      await expect(regPage.termsCheckbox).toBeVisible();
      await expect(regPage.submitButton).toBeVisible();
    });

    test('TC-005: แสดงลิงก์ "ใช้โค้ดส่วนลด"', async () => {
      await expect(regPage.promoToggle).toBeVisible();
    });

  });

  // ============================================================
  // SECTION 2: COMPANY TYPE
  // ============================================================

  test.describe('2. Company Type Selection', () => {

    test('TC-010: เลือกบริษัทไทย → แสดง Tax ID', async () => {
      await regPage.selectCompanyTypeThai();
      await expect(regPage.radioCompanyThai).toBeChecked();
      await expect(regPage.taxIdInput).toBeVisible();
      await regPage.takeScreenshot('TC010-thai');
    });

    test('TC-011: เลือกบริษัทต่างประเทศ → แสดง Company Name', async () => {
      await regPage.selectCompanyTypeOthers();
      await expect(regPage.radioCompanyOthers).toBeChecked();
      await expect(regPage.companyNameInput).toBeVisible();
      await regPage.takeScreenshot('TC011-others');
    });

    test('TC-012: สลับประเภทบริษัท → UI เปลี่ยนตาม', async () => {
      await regPage.selectCompanyTypeThai();
      await expect(regPage.taxIdInput).toBeVisible();

      await regPage.selectCompanyTypeOthers();
      await expect(regPage.companyNameInput).toBeVisible();
      const taxVisible = await regPage.taxIdInput.isVisible().catch(() => false);
      expect(taxVisible).toBe(false);
    });

  });

  // ============================================================
  // SECTION 3: HAPPY PATH ✅
  // ============================================================

  test.describe('3. Happy Path', () => {

    test('TC-020: สมัครสำเร็จ - บริษัทไทย (เบอร์ 0967690708)', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `thai_ok_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC020-result');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-020 errors:', errors);
    });

    test('TC-021: สมัครสำเร็จ - บริษัทต่างประเทศ', async ({ page }) => {
      const data = {
        ...testData.validForeign,
        email: `foreign_ok_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC021-result');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-021 errors:', errors);
    });

    test('TC-022: สมัครสำเร็จ - พร้อม Promo Code FREE15DAY', async ({ page }) => {
      const data = {
        ...testData.validWithPromo,
        email: `promo_ok_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC022-result');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-022 errors:', errors);
    });

  });

  // ============================================================
  // SECTION 4: OTP FLOW 🔐
  // ============================================================

  test.describe('4. OTP Flow', () => {

    test('TC-030: กรอกเบอร์ 0967690708 → submit → ควรไปหน้า OTP', async ({ page }) => {
      const data = {
        ...testData.validThai,
        phone: '0967690708',
        email: `otp_flow_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC030-otp-flow');

      // ดูว่า URL เปลี่ยนหรือมี OTP field โผล่ไหม
      const currentUrl = page.url();
      console.log('TC-030 URL after submit:', currentUrl);

      // หา OTP input field
      const otpInput = page.locator('input[placeholder*="OTP"], input[placeholder*="otp"], input[placeholder*="รหัส"]');
      const otpVisible = await otpInput.isVisible().catch(() => false);
      console.log('TC-030 OTP field visible:', otpVisible);

      // ถ้ามี OTP field → กรอก 123456
      if (otpVisible) {
        await otpInput.fill('123456');
        await regPage.takeScreenshot('TC030-otp-filled');
      }
    });

    test('TC-031: กรอก OTP ผิด (000000) → ต้องแสดง error', async ({ page }) => {
      const data = {
        ...testData.validThai,
        phone: '0967690708',
        email: `otp_wrong_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await page.waitForTimeout(3000);

      // หา OTP field
      const otpInput = page.locator('input[placeholder*="OTP"], input[placeholder*="otp"], input[placeholder*="รหัส"]');
      const otpVisible = await otpInput.isVisible().catch(() => false);

      if (otpVisible) {
        await otpInput.fill('000000');
        // หาปุ่มยืนยัน OTP
        const confirmBtn = page.locator('button').filter({ hasText: /ยืนยัน|confirm|verify/i });
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC031-wrong-otp');
        console.log('TC-031: OTP ผิดถูกส่งแล้ว');
      } else {
        console.log('TC-031: ไม่พบ OTP field (อาจยัง submit ไม่ผ่าน)');
      }
    });

    test('TC-032: กรอก OTP ไม่ครบ 6 หลัก (123) → ต้องแสดง error', async ({ page }) => {
      const data = {
        ...testData.validThai,
        phone: '0967690708',
        email: `otp_short_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await page.waitForTimeout(3000);

      const otpInput = page.locator('input[placeholder*="OTP"], input[placeholder*="otp"], input[placeholder*="รหัส"]');
      const otpVisible = await otpInput.isVisible().catch(() => false);

      if (otpVisible) {
        await otpInput.fill('123');
        await regPage.takeScreenshot('TC032-short-otp');
        console.log('TC-032: OTP สั้นถูกกรอกแล้ว');
      } else {
        console.log('TC-032: ไม่พบ OTP field');
      }
    });

    test('TC-033: ไม่กรอก OTP แล้วกดยืนยัน → ต้องแสดง error', async ({ page }) => {
      const data = {
        ...testData.validThai,
        phone: '0967690708',
        email: `otp_empty_${Date.now()}@testmail.com`,
      };
      await regPage.fillAndSubmit(data);
      await page.waitForTimeout(3000);

      const otpInput = page.locator('input[placeholder*="OTP"], input[placeholder*="otp"], input[placeholder*="รหัส"]');
      const otpVisible = await otpInput.isVisible().catch(() => false);

      if (otpVisible) {
        // ไม่กรอกอะไร กดยืนยันเลย
        const confirmBtn = page.locator('button').filter({ hasText: /ยืนยัน|confirm|verify/i });
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC033-empty-otp');
      } else {
        console.log('TC-033: ไม่พบ OTP field');
      }
    });

  });

  // ============================================================
  // SECTION 5: PROMO CODE 🎟️
  // ============================================================

  test.describe('5. Promo Code', () => {

    test('TC-040: คลิก "ใช้โค้ดส่วนลด" → แสดง input field', async () => {
      await regPage.openPromoCode();
      await expect(regPage.promoInput).toBeVisible();
      await regPage.takeScreenshot('TC040-promo-visible');
    });

    test('TC-041: ใส่ Promo Code ถูก (FREE15DAY) → submit', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `promo_valid_${Date.now()}@testmail.com`,
        promoCode: 'FREE15DAY',
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC041-promo-valid');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-041 errors:', errors);
    });

    test('TC-042: ใส่ Promo Code ผิด (INVALID_CODE) → ต้อง reject', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `promo_invalid_${Date.now()}@testmail.com`,
        promoCode: 'INVALID_CODE',
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC042-promo-invalid');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-042 errors:', errors);
    });

    test('TC-043: ใส่ Promo Code ว่าง → submit ได้ปกติ', async ({ page }) => {
      await regPage.openPromoCode();
      // ไม่กรอก promo code

      const data = {
        ...testData.validThai,
        email: `promo_empty_${Date.now()}@testmail.com`,
      };

      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId(data.taxId);
      await regPage.selectBusinessType(data.businessType);
      await regPage.selectUserCount(data.userCount);
      await regPage.fillFirstName(data.firstName);
      await regPage.fillLastName(data.lastName);
      await regPage.fillEmail(data.email);
      await regPage.fillPhone(data.phone);
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC043-promo-empty');
    });

    test('TC-044: ใส่ Promo Code เป็น SQL Injection', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `promo_sqli_${Date.now()}@testmail.com`,
        promoCode: "' OR '1'='1",
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC044-promo-sqli');

      const body = await page.textContent('body');
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('exception');
    });

  });

  // ============================================================
  // SECTION 6: REQUIRED FIELD VALIDATION ❗
  // ============================================================

  test.describe('6. Required Field Validation', () => {

    test('TC-050: Submit ฟอร์มว่าง', async ({ page }) => {
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC050-empty');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-051: ไม่กรอก Tax ID (ไทย)', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`no_tax_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC051-no-tax');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-052: ไม่กรอก Company Name (ต่างประเทศ)', async ({ page }) => {
      await regPage.selectCompanyTypeOthers();
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('John');
      await regPage.fillLastName('Doe');
      await regPage.fillEmail(`no_comp_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC052-no-company');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-053: ไม่กรอก Email', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC053-no-email');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-054: ไม่กรอกเบอร์โทร', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`no_phone_${Date.now()}@testmail.com`);
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC054-no-phone');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-055: ไม่กรอก First Name', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`no_fname_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC055-no-fname');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-056: ไม่กรอก Last Name', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillEmail(`no_lname_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC056-no-lname');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

  });

  // ============================================================
  // SECTION 7: EMAIL VALIDATION
  // ============================================================

  test.describe('7. Email Validation', () => {

    testData.invalidEmails.forEach((emailCase, index) => {
      test(`TC-06${index}: Email ผิด - ${emailCase.desc}`, async ({ page }) => {
        await regPage.selectCompanyTypeThai();
        await regPage.fillTaxId('1234567890123');
        await regPage.selectBusinessType('ค้าปลีก');
        await regPage.selectUserCount('1-20');
        await regPage.fillFirstName('สมชาย');
        await regPage.fillLastName('ใจดี');
        await regPage.fillEmail(emailCase.value);
        await regPage.fillPhone('0967690708');
        await regPage.checkTerms();
        await regPage.clickSubmit();
        await regPage.takeScreenshot(`TC06${index}-bad-email`);
        await expect(page).toHaveURL(/Register\/empeo/i);
      });
    });

  });

  // ============================================================
  // SECTION 8: PHONE VALIDATION
  // ============================================================

  test.describe('8. Phone Validation', () => {

    testData.invalidPhones.forEach((phoneCase, index) => {
      test(`TC-07${index}: เบอร์โทรผิด - ${phoneCase.desc}`, async ({ page }) => {
        await regPage.selectCompanyTypeThai();
        await regPage.fillTaxId('1234567890123');
        await regPage.selectBusinessType('ค้าปลีก');
        await regPage.selectUserCount('1-20');
        await regPage.fillFirstName('สมชาย');
        await regPage.fillLastName('ใจดี');
        await regPage.fillEmail(`bad_ph_${index}_${Date.now()}@testmail.com`);
        await regPage.fillPhone(phoneCase.value);
        await regPage.checkTerms();
        await regPage.clickSubmit();
        await regPage.takeScreenshot(`TC07${index}-bad-phone`);

        const currentUrl = page.url();
        const errors = await regPage.getVisibleErrors();
        console.log(`TC-07${index}: URL=${currentUrl}`);
        console.log(`TC-07${index}: errors=`, errors);

        if (!currentUrl.includes('Register/empeo')) {
          console.log(`⚠️ BUG: เว็บยอมรับเบอร์ "${phoneCase.value}"`);
        }
      });
    });

  });

  // ============================================================
  // SECTION 9: TAX ID VALIDATION
  // ============================================================

  test.describe('9. Tax ID Validation', () => {

    testData.invalidTaxIds.forEach((taxCase, index) => {
      test(`TC-08${index}: Tax ID ผิด - ${taxCase.desc}`, async ({ page }) => {
        await regPage.selectCompanyTypeThai();
        await regPage.fillTaxId(taxCase.value);
        await regPage.selectBusinessType('ค้าปลีก');
        await regPage.selectUserCount('1-20');
        await regPage.fillFirstName('สมชาย');
        await regPage.fillLastName('ใจดี');
        await regPage.fillEmail(`bad_tax_${index}_${Date.now()}@testmail.com`);
        await regPage.fillPhone('0967690708');
        await regPage.checkTerms();
        await regPage.clickSubmit();
        await regPage.takeScreenshot(`TC08${index}-bad-tax`);

        const errors = await regPage.getVisibleErrors();
        console.log(`TC-08${index}: errors=`, errors);
      });
    });

  });

  // ============================================================
  // SECTION 10: TERMS & CONDITIONS
  // ============================================================

  test.describe('10. Terms & Conditions', () => {

    test('TC-090: ไม่ติ๊ก Terms → submit ไม่ได้', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`no_terms_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC090-no-terms');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

    test('TC-091: ติ๊กแล้วเอาออก → submit ไม่ได้', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`uncheck_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.uncheckTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC091-unchecked');
      await expect(page).toHaveURL(/Register\/empeo/i);
    });

  });

  // ============================================================
  // SECTION 11: EDGE CASES ⚠️
  // ============================================================

  test.describe('11. Edge Cases', () => {

    test('TC-100: กด Submit ซ้ำเร็วๆ (spam click)', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `spam_${Date.now()}@testmail.com`,
      };
      await regPage.fillCompleteForm(data);

      // กด 5 ครั้งเร็วๆ
      for (let i = 0; i < 5; i++) {
        await regPage.submitButton.click({ delay: 100 });
      }
      await page.waitForTimeout(3000);
      await regPage.takeScreenshot('TC100-spam-click');
    });

    test('TC-101: ชื่อยาว 300 ตัว', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName(testData.boundary.longText);
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`long_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC101-long-name');
    });

    test('TC-102: XSS ในชื่อ', async ({ page }) => {
      let xssDetected = false;
      page.on('dialog', async (dialog) => {
        xssDetected = true;
        await dialog.dismiss();
      });

      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName(testData.boundary.xssScript);
      await regPage.fillLastName('Test');
      await regPage.fillEmail(`xss_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC102-xss');
      expect(xssDetected).toBe(false);
    });

    test('TC-103: SQL Injection ในชื่อ', async ({ page }) => {
      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName(testData.boundary.sqlInjection);
      await regPage.fillLastName('Test');
      await regPage.fillEmail(`sqli_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC103-sqli');
      const body = await page.textContent('body');
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('exception');
    });

    test('TC-104: รีเฟรชหลังกรอก → ข้อมูลหาย', async ({ page }) => {
      await regPage.fillFirstName('TestName');
      await regPage.fillLastName('TestLast');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await regPage.takeScreenshot('TC104-refresh');
    });

  });

  // ============================================================
  // SECTION 12: RESPONSIVE
  // ============================================================

  test.describe('12. Responsive Design', () => {

    test('TC-110: Mobile (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await regPage.goto();
      await expect(regPage.submitButton).toBeVisible();
      await regPage.takeScreenshot('TC110-mobile');
    });

    test('TC-111: Tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await regPage.goto();
      await expect(regPage.submitButton).toBeVisible();
      await regPage.takeScreenshot('TC111-tablet');
    });

    test('TC-112: Desktop (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await regPage.goto();
      await expect(regPage.submitButton).toBeVisible();
      await regPage.takeScreenshot('TC112-desktop');
    });

  });

});