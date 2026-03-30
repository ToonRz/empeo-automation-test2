# Test Coverage Review (Automation Tester Exam 1.0)

Reviewed on: 2026-03-30

## Requirement Coverage Matrix

| Requirement from exam | Current coverage status | Evidence in project | Gap/Risk |
|---|---|---|---|
| Successful registration with valid data | **Partially covered** | TC-020, TC-021, TC-022 submit valid data in `tests/registration.spec.js` | Tests mostly log errors and take screenshots; they do not assert clear success criteria (success URL, success text, API response, or state) |
| OTP verification flow | **Partially covered** | TC-030 to TC-033 try OTP flow and OTP invalid inputs | OTP tests are conditional (`if (otpVisible)`) and can pass without OTP UI; no hard assertion that OTP step is reached or that OTP verification succeeds/fails correctly |
| Promo code validation | **Partially covered** | TC-040 to TC-044 include valid, invalid, empty, and SQL-injection-like promo | No deterministic assertion for promo accepted/rejected outcome; mostly screenshot + console logging |
| Validation of required fields and error handling | **Partially covered** | TC-050 to TC-056, plus email/phone/tax checks | Many tests only assert staying on same URL, not specific field-level error messages; weak proof of correct validation messaging |
| Edge cases (invalid phone, expired OTP, reused promo code) | **Partially covered** | Invalid phone in TC-070..072 and some security/boundary tests | **Expired OTP** and **reused promo code** are missing explicitly |
| Clear test case design | **Good** | Test cases are grouped and numbered by topic | No standalone test case doc (Gherkin/table) mapped to acceptance criteria |
| Run locally / CI clarity | **Partial** | `package.json` scripts and Playwright config exist | No README/runbook and no CI workflow file in repository |

## Key Technical Findings

1. There are **48 Playwright tests** in one spec file (`tests/registration.spec.js`).
2. Test data includes fixed values required by the exam (`0967690708`, `123456`, `FREE15DAY`).
3. The suite has broad scenario breadth, but pass/fail signal is weak in many critical flows because assertions are often missing or non-deterministic.

## Recommendation to pass exam criteria more confidently

1. Add **hard assertions for success flows** (e.g., OTP screen shown, registration completion message).
2. Add explicit negative tests for:
   - Expired OTP
   - Reused promo code
3. Replace URL-only checks with **field-level error message assertions**.
4. Split tests by domain (`happy-path`, `otp`, `promo`, `validation`) and add tags.
5. Add `README.md` with setup/run steps and expected env.
6. Add CI workflow (e.g., GitHub Actions) to run headless tests automatically.

## Verdict

Current project is **close in breadth but not complete in verification depth** for this exam requirement. It should be considered **~70% complete** for evaluation purposes until deterministic assertions and missing edge cases are added.
