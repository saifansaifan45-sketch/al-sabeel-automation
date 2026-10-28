# AL-Sabeel Job Portal - End-to-End Test Automation Suite

Robust end-to-end test automation suite for the **AL-Sabeel Community Job Portal** using [Playwright](https://playwright.dev/) with TypeScript.

## 🚀 Overview
This repository contains automated test suites, accessibility/isolation validations, and responsive test execution across both Desktop (1440×900) and Mobile (360×800) environments.

### Test Suites Covered
- **P0: Authentication & Access Control** (`tests/p0-auth.spec.ts`)
  - Role-based route protection for Candidates and Providers.
  - Back navigation restriction after logout.
  - Public anonymous vacancy discovery verification vs login redirects.
- **P0: Vacancy Creation & Candidate Application** (`tests/p0-job-application.spec.ts`)
  - Provider creates uniquely prefixed vacancy (`E2E_ALSABEEL_[timestamp]`) with accommodation and food allowances.
  - Form validation on required fields.
  - Candidate vacancy discovery, detailed review, and application submission with cover letter.
  - Duplicate application prevention validation.
- **P0: Provider Pipeline & Applicant Management** (`tests/p0-pipeline-interview.spec.ts`)
  - Applicant pipeline tracking under active vacancies.
  - Pipeline stage transitions (`Applied` → `Under Review` → `Shortlist`).
  - Candidate dossier/resume verification.
  - Interview scheduling and slot selection audit.
- **P0: Security, Ownership & API Isolation** (`tests/p0-authorization-isolation.spec.ts`)
  - Cross-role authorization tests (Candidate denied access to provider endpoints).
  - 401 Unauthorized verification for unauthenticated API requests.
  - IDOR & ID tampering mitigation checks.
  - Absence of credentials or tokens leaked into console or network responses.
- **P1: Profile, i18n & Responsiveness** (`tests/p1-profile-cms-i18n.spec.ts`)
  - Candidate profile editing & Islamic qualification persistence.
  - Multilingual switcher (English, Urdu, Hindi) & RTL layout validation.
  - Cross-device layout checks: Desktop (1440×900) and Mobile (360×800).

---

## 📋 Test Cases & Findings
- Full test case catalog: [`test-cases-al-sabeel.csv`](./test-cases-al-sabeel.csv)

---

## 🛠️ Setup & Execution

### 1. Installation
```bash
npm install
npx playwright install chromium
```

### 2. Configure Environment
Copy `.env.example` to `.env` and supply your credentials:
```bash
cp .env.example .env
```

### 3. Run Tests
```bash
# Run all test suites
npx playwright test

# Run specific test suite
npx playwright test tests/p0-auth.spec.ts

# Run on mobile viewport
npx playwright test --project=mobile-chrome

# Open HTML test report
npx playwright show-report
```
