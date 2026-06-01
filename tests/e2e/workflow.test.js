import { by, device, element, expect, waitFor } from 'detox';

const WORKER_EMAIL = process.env.MINESHIELD_WORKER_EMAIL || 'worker@mineshield.com';
const WORKER_PASSWORD = process.env.MINESHIELD_WORKER_PASSWORD || 'Password123!';
const SUPERVISOR_EMAIL = process.env.MINESHIELD_SUPERVISOR_EMAIL || 'supervisor@mineshield.com';
const SUPERVISOR_PASSWORD = process.env.MINESHIELD_SUPERVISOR_PASSWORD || 'Password123!';
const VISITOR_NAME = process.env.MINESHIELD_VISITOR_NAME || 'Detox Visitor';
const HAZARD_DESCRIPTION = `Detox hazard ${Math.random().toString(36).slice(2, 8)}`;

const loginPlaceholders = {
  email: 'example@mineshield.com',
  password: 'Enter your password',
  visitorName: 'Enter your full name',
  hazardDescription: 'Describe the hazard, affected area, and immediate risk.',
  hazardZone: 'e.g. Zone A1, Shaft 3, Loading Bay',
  manualArea: 'Area or zone',
  manualLandmark: 'Landmark or extra detail',
};

async function launchFreshApp() {
  await device.launchApp({
    delete: true,
    newInstance: true,
  });
}

async function expectVisibleText(value, timeout = 60000) {
  await waitFor(element(by.text(value))).toBeVisible().withTimeout(timeout);
}

async function selectRole(roleLabel) {
  const roleButton = element(by.text(roleLabel));
  await waitFor(roleButton).toBeVisible().withTimeout(30000);
  await roleButton.tap();
}

async function fillWorkerCredentials(email, password) {
  await element(by.placeholder(loginPlaceholders.email)).replaceText(email);
  await element(by.placeholder(loginPlaceholders.password)).replaceText(password);
}

async function loginAsWorker() {
  await selectRole('Worker');
  await fillWorkerCredentials(WORKER_EMAIL, WORKER_PASSWORD);
  await element(by.text('Secure Login')).tap();
  await expectVisibleText('WORKER DASHBOARD');
}

async function loginAsSupervisor() {
  await selectRole('Supervisor');
  await fillWorkerCredentials(SUPERVISOR_EMAIL, SUPERVISOR_PASSWORD);
  await element(by.text('Secure Login')).tap();
  await expectVisibleText('SUPERVISOR DASHBOARD');
}

async function loginAsVisitor() {
  await selectRole('Visitor');
  await element(by.placeholder(loginPlaceholders.visitorName)).replaceText(VISITOR_NAME);
  await element(by.text('Enter Visitor Area')).tap();
  await expectVisibleText('Visitor Access');
}

async function openWorkerHazardForm() {
  await waitFor(element(by.text('Report Hazard'))).toBeVisible().withTimeout(30000);
  await element(by.text('Report Hazard')).tap();
  await expectVisibleText('Report a hazard');
}

const hazardLabel = (suffix) => `${HAZARD_DESCRIPTION}-${suffix}`;

async function submitHazardAsWorker(description = HAZARD_DESCRIPTION) {
  await openWorkerHazardForm();
  await element(by.placeholder(loginPlaceholders.hazardDescription)).replaceText(description);
  await element(by.placeholder(loginPlaceholders.hazardZone)).replaceText('Zone A1');
  await element(by.text('Manual')).tap();
  await element(by.placeholder(loginPlaceholders.manualArea)).replaceText('Zone A1');
  await element(by.placeholder(loginPlaceholders.manualLandmark)).replaceText('Conveyor walkway');
  await element(by.text('Use Manual Location')).tap();
  await expectVisibleText('Location selected');
  await element(by.text('OK')).tap();
  await element(by.text('Submit Hazard')).tap();
  await expectVisibleText('Submitted');
  await element(by.text('OK')).tap();
  await expectVisibleText('WORKER DASHBOARD');
}

async function resolveHazardAsSupervisor(description) {
  await launchFreshApp();
  await loginAsSupervisor();
  await waitFor(element(by.text('Open Logs'))).toBeVisible().withTimeout(30000);
  await element(by.text('Open Logs')).tap();
  await expectVisibleText('HAZARD LOGS');
  await expectVisibleText(description);
  await waitFor(element(by.text('Mark as resolved'))).toBeVisible().withTimeout(30000);
  await element(by.text('Mark as resolved')).tap();
  await expectVisibleText('RESOLVED');
}

describe('MineShield workflow', () => {
  beforeEach(async () => {
    await launchFreshApp();
  });

  it('worker submits hazard and sees it reflected on the dashboard', async () => {
    const description = hazardLabel('dashboard');
    await loginAsWorker();
    await submitHazardAsWorker(description);
    await expectVisibleText('Hazard Level: HIGH');
    await resolveHazardAsSupervisor(description);
  });

  it('supervisor resolves a hazard and the worker sees the resolved alert after refresh', async () => {
    const description = hazardLabel('resolved');
    await loginAsWorker();
    await submitHazardAsWorker(description);
    await resolveHazardAsSupervisor(description);

    await launchFreshApp();
    await loginAsWorker();
    await expectVisibleText('Hazard Report Resolved');
  });

  it('hazard resolution updates the live map with safe zones visible', async () => {
    const description = hazardLabel('map');
    await loginAsWorker();
    await submitHazardAsWorker(description);
    await resolveHazardAsSupervisor(description);
    await launchFreshApp();
    await loginAsSupervisor();
    await waitFor(element(by.text('Open Live Map with Hazard Markers'))).toBeVisible().withTimeout(
      30000
    );
    await element(by.text('Open Live Map with Hazard Markers')).tap();
    await expectVisibleText('LIVE MONITORING');
    await expectVisibleText('Safe zones:');
    await expectVisibleText('Live safe and critical zones stay visible here.');
  });

  it('visitor sees alerts when entering hazard zones', async () => {
    await loginAsWorker();
    await submitHazardAsWorker(hazardLabel('visitor'));

    await launchFreshApp();
    await loginAsVisitor();
    await waitFor(element(by.text('Alerts'))).toBeVisible().withTimeout(30000);
    await element(by.text('Alerts')).tap();
    await expectVisibleText('Hazard Level: HIGH');
  });

  it('supports navigation between auth, worker, supervisor, and visitor roles', async () => {
    await loginAsWorker();
    await expectVisibleText('WORKER DASHBOARD');

    await launchFreshApp();
    await loginAsSupervisor();
    await expectVisibleText('SUPERVISOR DASHBOARD');

    await launchFreshApp();
    await loginAsVisitor();
    await expectVisibleText('Visitor Access');
  });
});
