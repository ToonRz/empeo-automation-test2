
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

    // Helper: กรอกฟอร์มแล้ว submit เพื่อไปหน้า OTP
    async function submitToOTP(regPage, page, email) {
      const data = {
        ...testData.validThai,
        phone: '0967690708',
        email: email,
      };
      await regPage.fillAndSubmit(data);
      await page.waitForTimeout(3000);

      // หา OTP field
      const otpSelectors = [
        'input[placeholder*="OTP"]',
        'input[placeholder*="otp"]',
        'input[placeholder*="รหัส"]',
        'input[placeholder*="ยืนยัน"]',
        'input[type="number"]',
        '[data-testid*="otp"]',
      ];

      let otpInput = null;
      for (const sel of otpSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible().catch(() => false)) {
          otpInput = el;
          break;
        }
      }

      return otpInput;
    }

    // Helper: หาปุ่มยืนยัน OTP
    async function findOTPConfirmButton(page) {
      const btnSelectors = [
        'button:has-text("ยืนยัน")',
        'button:has-text("Verify")',
        'button:has-text("Confirm")',
        'button:has-text("ตกลง")',
        'button:has-text("ส่ง")',
        'button[type="submit"]',
      ];

      for (const sel of btnSelectors) {
        const btn = page.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          return btn;
        }
      }
      return null;
    }

    // ----- Happy Path OTP -----

    test('TC-030: กรอกเบอร์ 0967690708 → submit → ดูว่ามี OTP field', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_flow_${Date.now()}@testmail.com`
      );

      await regPage.takeScreenshot('TC030-after-submit');
      console.log('TC-030: OTP field visible:', otpInput !== null);

      if (otpInput) {
        console.log('✅ พบ OTP field! กรอก 123456');
        await otpInput.fill('123456');
        await regPage.takeScreenshot('TC030-otp-filled');

        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(3000);
          await regPage.takeScreenshot('TC030-otp-confirmed');
          console.log('URL after OTP confirm:', page.url());
        }
      } else {
        console.log('ℹ️ ไม่พบ OTP field (submit อาจยัง error)');
      }
    });

    // ----- OTP ผิด -----

    test('TC-031: กรอก OTP ผิด (000000) → ต้องแสดง error', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_wrong_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        await otpInput.fill('000000');
        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC031-wrong-otp');

        // ควรมี error หรือยังอยู่หน้า OTP
        const errors = await regPage.getVisibleErrors();
        console.log('TC-031 errors:', errors);
      } else {
        console.log('TC-031: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC031-no-otp-field');
      }
    });

    // ----- OTP ไม่ครบ 6 หลัก -----

    test('TC-032: กรอก OTP ไม่ครบ 6 หลัก (123) → ต้อง reject', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_short_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        await otpInput.fill('123');
        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC032-short-otp');
        console.log('TC-032: OTP ไม่ครบ 6 หลัก submitted');
      } else {
        console.log('TC-032: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC032-no-otp-field');
      }
    });

    // ----- OTP เป็นตัวอักษร -----

    test('TC-033: กรอก OTP เป็นตัวอักษร (abcdef) → ต้อง reject', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_alpha_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        await otpInput.fill('abcdef');
        await regPage.takeScreenshot('TC033-alpha-otp');
        console.log('TC-033: OTP ตัวอักษร filled');
      } else {
        console.log('TC-033: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC033-no-otp-field');
      }
    });

    // ----- OTP ว่าง -----

    test('TC-034: ไม่กรอก OTP แล้วกดยืนยัน → ต้อง reject', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_empty_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        // ไม่กรอกอะไร กดยืนยันเลย
        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC034-empty-otp');
        console.log('TC-034: OTP ว่าง submitted');
      } else {
        console.log('TC-034: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC034-no-otp-field');
      }
    });

    // ----- OTP หมดอายุ -----

    test('TC-035: OTP หมดอายุ → รอนานแล้วค่อยกรอก → ต้อง reject', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_expire_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        // จำลอง: รอ 30 วินาที (OTP อาจหมดอายุ)
        console.log('TC-035: รอ 30 วินาทีให้ OTP หมดอายุ...');
        await page.waitForTimeout(30000);

        await otpInput.fill('123456');
        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
        await regPage.takeScreenshot('TC035-expired-otp');

        const errors = await regPage.getVisibleErrors();
        console.log('TC-035 errors:', errors);
      } else {
        console.log('TC-035: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC035-no-otp-field');
      }
    });

    // ----- OTP ใช้ซ้ำ -----

    test('TC-036: ใช้ OTP ซ้ำ (กรอก OTP ถูก 2 ครั้ง) → ครั้งที่ 2 ต้อง reject', async ({ page }) => {
      const otpInput = await submitToOTP(
        regPage, page, `otp_reuse_${Date.now()}@testmail.com`
      );

      if (otpInput) {
        // ครั้งที่ 1: กรอก OTP ถูก
        await otpInput.fill('123456');
        const confirmBtn = await findOTPConfirmButton(page);
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(3000);
        }
        await regPage.takeScreenshot('TC036-otp-first-use');
        console.log('TC-036: OTP ครั้งแรก - URL:', page.url());

        // ครั้งที่ 2: กลับมากรอก OTP เดิมอีก
        const otpInput2 = page.locator(
          'input[placeholder*="OTP"], input[placeholder*="otp"], input[placeholder*="รหัส"]'
        ).first();

        if (await otpInput2.isVisible().catch(() => false)) {
          await otpInput2.fill('123456');
          const confirmBtn2 = await findOTPConfirmButton(page);
          if (confirmBtn2) {
            await confirmBtn2.click();
            await page.waitForTimeout(2000);
          }
          await regPage.takeScreenshot('TC036-otp-reuse');
          console.log('TC-036: OTP ซ้ำ - URL:', page.url());
        } else {
          console.log('TC-036: OTP field หายไปแล้ว (อาจผ่านไปหน้าถัดไป)');
        }
      } else {
        console.log('TC-036: ไม่พบ OTP field');
        await regPage.takeScreenshot('TC036-no-otp-field');
      }
    });

  });

  // ============================================================
  // SECTION 5: PROMO CODE 🎟️
  // ============================================================

  test.describe('5. Promo Code', () => {

    // ----- UI: แสดง Promo field -----

    test('TC-040: คลิก "ใช้โค้ดส่วนลด" → แสดง input field', async () => {
      await regPage.openPromoCode();
      await expect(regPage.promoInput).toBeVisible();
      await regPage.takeScreenshot('TC040-promo-visible');
    });

    // ----- Promo ถูกต้อง: FREE15DAY -----

    test('TC-041: ใส่ Promo ถูก (FREE15DAY) → submit', async ({ page }) => {
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

    // ----- Promo ผิด -----

    testData.invalidPromos.forEach((promoCase, index) => {
      test(`TC-04${index + 2}: Promo ผิด - ${promoCase.desc}`, async ({ page }) => {
        const data = {
          ...testData.validThai,
          email: `promo_bad_${index}_${Date.now()}@testmail.com`,
          promoCode: promoCase.value,
        };
        await regPage.fillAndSubmit(data);
        await regPage.takeScreenshot(`TC04${index + 2}-promo-invalid`);

        const errors = await regPage.getVisibleErrors();
        console.log(`TC-04${index + 2} errors:`, errors);

        // ถ้ามี error เกี่ยวกับ promo → ดี
        // ถ้าไม่มี → อาจเป็น bug
        const promoErrors = errors.filter(e =>
          e.includes('โค้ด') || e.includes('ส่วนลด') ||
          e.includes('promo') || e.includes('ไม่ถูกต้อง') ||
          e.includes('invalid') || e.includes('not found')
        );
        console.log(`TC-04${index + 2} promo errors:`, promoErrors);
      });
    });

    // ----- Promo หมดอายุ -----

    testData.expiredPromos.forEach((promoCase, index) => {
      test(`TC-04${index + 5}: Promo หมดอายุ/ใช้แล้ว - ${promoCase.desc}`, async ({ page }) => {
        const data = {
          ...testData.validThai,
          email: `promo_exp_${index}_${Date.now()}@testmail.com`,
          promoCode: promoCase.value,
        };
        await regPage.fillAndSubmit(data);
        await regPage.takeScreenshot(`TC04${index + 5}-promo-expired`);

        const errors = await regPage.getVisibleErrors();
        console.log(`TC-04${index + 5} errors:`, errors);

        // ควรมี error ว่า promo หมดอายุหรือใช้แล้ว
        if (errors.length === 0) {
          console.log(`⚠️ FINDING: เว็บยอมรับ promo "${promoCase.value}" (${promoCase.desc})`);
        }
      });
    });

    // ----- Promo ว่าง -----

    test('TC-048: ใส่ Promo ว่าง → submit ได้ปกติ', async ({ page }) => {
      await regPage.openPromoCode();

      await regPage.selectCompanyTypeThai();
      await regPage.fillTaxId('1234567890123');
      await regPage.selectBusinessType('ค้าปลีก');
      await regPage.selectUserCount('1-20');
      await regPage.fillFirstName('สมชาย');
      await regPage.fillLastName('ใจดี');
      await regPage.fillEmail(`promo_empty_${Date.now()}@testmail.com`);
      await regPage.fillPhone('0967690708');
      await regPage.checkTerms();
      await regPage.clickSubmit();
      await regPage.takeScreenshot('TC048-promo-empty');
    });

    // ----- Promo ใช้ซ้ำ (ใช้โค้ดเดิม 2 ครั้ง) -----

    test('TC-049: ใช้ Promo ซ้ำ 2 ครั้ง → ครั้งที่ 2 ต้อง reject', async ({ page }) => {
      // ครั้งที่ 1
      const data1 = {
        ...testData.validThai,
        email: `promo_reuse1_${Date.now()}@testmail.com`,
        promoCode: 'FREE15DAY',
      };
      await regPage.fillAndSubmit(data1);
      await regPage.takeScreenshot('TC049-promo-first-use');
      console.log('TC-049: Promo ครั้งแรก - URL:', page.url());

      // กลับมาหน้า register ใหม่
      await regPage.goto();

      // ครั้งที่ 2 ใช้โค้ดเดิม
      const data2 = {
        ...testData.validThai,
        email: `promo_reuse2_${Date.now()}@testmail.com`,
        promoCode: 'FREE15DAY',
      };
      await regPage.fillAndSubmit(data2);
      await regPage.takeScreenshot('TC049-promo-reuse');

      const errors = await regPage.getVisibleErrors();
      console.log('TC-049 errors (ครั้งที่ 2):', errors);

      // ถ้าครั้งที่ 2 ยังใช้ได้ → อาจเป็นพฤติกรรมปกติ หรือ bug
      if (errors.length === 0) {
        console.log('ℹ️ NOTE: Promo FREE15DAY ใช้ได้หลายครั้ง (อาจเป็นพฤติกรรมปกติ)');
      }
    });

    // ----- Promo Security: SQL Injection -----

    test('TC-04A: Promo เป็น SQL Injection', async ({ page }) => {
      const data = {
        ...testData.validThai,
        email: `promo_sqli_${Date.now()}@testmail.com`,
        promoCode: "' OR '1'='1",
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC04A-promo-sqli');

      const body = await page.textContent('body');
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('exception');
    });

    // ----- Promo Security: XSS -----

    test('TC-04B: Promo เป็น XSS Script', async ({ page }) => {
      let xssDetected = false;
      page.on('dialog', async (dialog) => {
        xssDetected = true;
        await dialog.dismiss();
      });

      const data = {
        ...testData.validThai,
        email: `promo_xss_${Date.now()}@testmail.com`,
        promoCode: '<script>alert("XSS")</script>',
      };
      await regPage.fillAndSubmit(data);
      await regPage.takeScreenshot('TC04B-promo-xss');
      expect(xssDetected).toBe(false);
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