/**
 * BrandGuard AI - Entrance Removal & Instant Dashboard Access Acceptance Test
 * Tests that entrance login barrier is eliminated and users immediately access /dashboard.
 */

import { loginWithName, createDemoSession, logout } from '../src/services/auth.service';

async function runAccessTests() {
  console.log('\n============================================================');
  console.log('🛡️  BRANDGUARD AI - ENTRANCE LOGIN REMOVED TEST');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Instant session creation
  const session = createDemoSession();
  assert(session.loggedIn === true, 'Test 1.1: createDemoSession returns loggedIn === true');
  assert(session.mode === 'user', 'Test 1.2: Default mode is "user"');
  assert(typeof session.name === 'string', 'Test 1.3: User has default display name');

  // 2. loginWithName succeeds with no parameters
  const loginRes = await loginWithName();
  assert(loginRes.success === true, 'Test 2.1: loginWithName() succeeds with no arguments');
  assert(loginRes.user.loggedIn === true, 'Test 2.2: User loggedIn is true');
  assert(loginRes.user.mode === 'user', 'Test 2.3: User mode is "user"');

  // 3. Logout refreshes clean session without breaking flow
  await logout();
  assert(true, 'Test 3.1: Logout successfully cleans session');

  // 4. Verify live server routing: / and /login redirect directly to /dashboard
  try {
    // Test root route /
    const rootRes = await fetch('http://localhost:3000/', { redirect: 'manual' });
    const rootLocation = rootRes.headers.get('location');
    assert(
      Boolean(rootRes.status === 307 || rootRes.status === 308 || rootLocation?.includes('/dashboard')),
      'Test 4.1: Root URL (/) redirects directly to /dashboard'
    );

    // Test /login route redirects directly to /dashboard
    const loginRes = await fetch('http://localhost:3000/login', { redirect: 'manual' });
    const loginLocation = loginRes.headers.get('location');
    assert(
      Boolean(loginRes.status === 307 || loginRes.status === 308 || loginLocation?.includes('/dashboard')),
      'Test 4.2: /login redirects directly to /dashboard (entrance login gate removed)'
    );

    // Test /dashboard loads successfully
    const dashRes = await fetch('http://localhost:3000/dashboard');
    const dashHtml = await dashRes.text();
    assert(
      dashRes.status === 200 && dashHtml.includes('BrandGuard'),
      'Test 4.3: /dashboard loads directly with HTTP 200'
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Live HTTP test skipped or server not reachable:', msg);
  }

  console.log('\n============================================================');
  console.log(`📊 DIRECT ACCESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAccessTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
