import fs from 'fs';

const original = fs.readFileSync('catalyst_sheet.csv', 'utf8').trim();

const newEntries = [
  {
    id: 'TC_JP_052',
    scenario: 'Verify Section 5 interview scheduling modal and distinct time slots creation in provider applicant pipeline',
    preconditions: 'User is logged into institution account, navigates to Applicants section, and views shortlisted applicant',
    testData: 'Applicant profile, Stage: Shortlisted, Interview scheduling controls',
    expected: 'Provider should have interactive scheduling controls to propose two distinct future interview slots and attach or generate a meeting link',
    actual: 'Interview scheduling controls and slot creation inputs are missing entirely from the provider applications UI (dropdown only offers status changes)',
    status: 'Fail',
    priority: 'P0'
  },
  {
    id: 'TC_JP_053',
    scenario: 'Verify candidate interview slot selection and confirmation controls under application tracking',
    preconditions: 'User is logged into candidate account and navigates to My Applications tab',
    testData: 'My Applications tab, Interview notification, Proposed slots picker',
    expected: 'Candidate should see the two proposed interview slots and be able to select and confirm one slot',
    actual: 'Candidate application tracking view has no slot selection or confirmation controls',
    status: 'Fail',
    priority: 'P0'
  },
  {
    id: 'TC_JP_054',
    scenario: 'Verify sidebar Sign Out button functionality on candidate and provider dashboards',
    preconditions: 'User is logged into candidate (/seeker/dashboard) or institution (/provider/dashboard) portal',
    testData: "Dashboard sidebar, 'Sign Out' button",
    expected: "Clicking 'Sign Out' should terminate the session, clear jp_token cookie and localStorage, and redirect to /auth/login",
    actual: "Clicking 'Sign Out' leaves session cookies and localStorage intact; user remains on authenticated dashboard without redirecting",
    status: 'Fail',
    priority: 'P0'
  },
  {
    id: 'TC_JP_055',
    scenario: 'Verify anonymous public vacancy discovery and detail view on /jobs and /jobs/{id} without login',
    preconditions: 'User accesses portal as an anonymous/unauthenticated guest visitor',
    testData: 'Public URLs: /jobs and /jobs/{id}',
    expected: 'Anonymous users should browse active Islamic vacancies, filter roles, and inspect details without being forced to authenticate',
    actual: 'Routing middleware forcibly intercepts anonymous visitors and redirects them to /auth/login (public browsing disabled)',
    status: 'Fail',
    priority: 'P1'
  },
  {
    id: 'TC_JP_056',
    scenario: 'Verify Urdu language switch updates root document direction attribute to dir="rtl"',
    preconditions: 'User is on portal header and switches interface language from English to Urdu (UR / اردو)',
    testData: 'Language selector: EN -> UR, root html element',
    expected: 'Switching to Urdu should set dir="rtl" on root html element for correct right-to-left layout and alignment',
    actual: 'Interface text changes to Urdu strings but root element retains dir="ltr", causing incorrect LTR layout alignment',
    status: 'Fail',
    priority: 'P2'
  }
];

function escapeCsv(val) {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const formattedRows = newEntries.map(e => 
  [e.id, escapeCsv(e.scenario), escapeCsv(e.preconditions), escapeCsv(e.testData), escapeCsv(e.expected), escapeCsv(e.actual), e.status, e.priority].join(',')
);

const updatedContent = original + '\n' + formattedRows.join('\n');
fs.writeFileSync('catalyst_sheet_updated.csv', updatedContent, 'utf8');

console.log('Successfully generated catalyst_sheet_updated.csv with rows TC_JP_052 through TC_JP_056');
