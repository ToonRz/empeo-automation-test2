# empeo Registration Automation (Automation Tester Exam 1.0)

- Target URL: `https://portal.uat.gofive.co.th/Register/empeo`
- Framework: Playwright (JavaScript)

## 1) Test Case Design


| Area | Test IDs | Notes |
|---|---|---|
| Page/UI | TC-001..005 | ตรวจการโหลดหน้าและ element หลัก |
| Company Type | TC-010..012 | ไทย/ต่างประเทศ + การสลับชนิด |
| Happy Path | TC-020..022 | สมัครสำเร็จ: ไทย/ต่างประเทศ/มีโปรโมชัน |
| OTP Flow | TC-030..034 | เข้า OTP, OTP ผิด, OTP ไม่ครบ, OTP ว่าง, OTP หมดอายุ |
| Promo Code | TC-040..045 | เปิดช่องกรอก, โค้ดถูก/ผิด/ว่าง/SQLi/ใช้ซ้ำ |
| Required Fields | TC-050..056 | ฟิลด์บังคับทั้งหมด |
| Input Validation | TC-060..064, TC-070..072, TC-080..082 | Email/Phone/Tax ID invalid |
| Terms | TC-090..091 | ไม่ติ๊ก/ติ๊กแล้วเอาออก |
| Edge & Security | TC-100..104 | spam submit, long input, XSS, SQLi, refresh |
| Responsive | TC-110..112 | mobile/tablet/desktop |

## 2) Fixed Test Data

ใช้ค่าคงที่ดังนี้:

- Phone: `0967690708`
- OTP: `123456`
- Promo Code: `FREE15DAY`

กำหนดในไฟล์ `test-data/testData.js`

## 3) How to Run

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
npx playwright install
```

### Run all tests
```bash
npm test
```

### Useful commands
```bash
npm run test:headed
npm run test:debug
npm run test:ui
npm run report
```

ถ้าต้องการแนบวิดีโอเพิ่ม สามารถอัดขณะรัน `npm run test:headed`
