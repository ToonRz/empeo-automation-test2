// test-data/testData.js
// ใช้ Test Data ตามที่โจทย์ fix ให้!

const testData = {

  // ===== โจทย์ fix ให้ =====
  fixedPhone: '0967690708',
  fixedOTP: '123456',
  fixedPromo: 'FREE15DAY',

  // ===== บริษัทไทย =====
  validThai: {
    companyType: 'thai',
    taxId: '1234567890123',
    businessType: 'ค้าปลีก',
    userCount: '1-20',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: `test_${Date.now()}@testmail.com`,
    phone: '0967690708',
    acceptTerms: true,
  },

  // ===== บริษัทต่างประเทศ =====
  validForeign: {
    companyType: 'others',
    companyName: 'ABC International Ltd.',
    businessType: 'eCommerce',
    userCount: '21-50',
    firstName: 'John',
    lastName: 'Doe',
    email: `foreign_${Date.now()}@testmail.com`,
    phone: '0967690708',
    acceptTerms: true,
  },

  // ===== บริษัทไทย + Promo =====
  validWithPromo: {
    companyType: 'thai',
    taxId: '1234567890123',
    businessType: 'ค้าปลีก',
    userCount: '1-20',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: `promo_${Date.now()}@testmail.com`,
    phone: '0967690708',
    promoCode: 'FREE15DAY',
    acceptTerms: true,
  },

  // ===== Email ผิด =====
  invalidEmails: [
    { value: 'notanemail', desc: 'ไม่มี @' },
    { value: 'test@', desc: 'ไม่มี domain' },
    { value: '@domain.com', desc: 'ไม่มี local part' },
    { value: 'test @domain.com', desc: 'มี space' },
    { value: 'test@@domain.com', desc: 'มี @@ สองตัว' },
  ],

  // ===== Tax ID ผิด =====
  invalidTaxIds: [
    { value: '123', desc: 'สั้นเกินไป' },
    { value: 'abcdefghijklm', desc: 'เป็นตัวอักษร' },
    { value: '12345678901234567', desc: 'ยาวเกินไป' },
  ],

  // ===== เบอร์โทรผิด =====
  invalidPhones: [
    { value: 'abcdefghij', desc: 'เป็นตัวอักษร' },
    { value: '123', desc: 'สั้นเกินไป' },
    { value: '0000000000000000', desc: 'ยาวเกินไป' },
  ],

  // ===== Promo Code ผิด =====
  invalidPromos: [
    { value: 'INVALID_CODE', desc: 'โค้ดไม่มีอยู่' },
    { value: '12345', desc: 'โค้ดเป็นตัวเลข' },
    { value: '', desc: 'ว่างเปล่า' },
    { value: 'FREE15DAY FREE15DAY', desc: 'ใส่ซ้ำ' },
  ],

  // ===== OTP ผิด =====
  invalidOTPs: [
    { value: '000000', desc: 'OTP ไม่ถูกต้อง' },
    { value: '123', desc: 'OTP ไม่ครบ 6 หลัก' },
    { value: 'abcdef', desc: 'OTP เป็นตัวอักษร' },
    { value: '', desc: 'OTP ว่าง' },
  ],

  // ===== Boundary =====
  boundary: {
    longText: 'A'.repeat(300),
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    sqlInjection: "' OR '1'='1'; DROP TABLE users; --",
    xssScript: '<script>alert("XSS")</script>',
    emptySpaces: '     ',
    emoji: '😀🎉🚀',
  },
};

module.exports = { testData };