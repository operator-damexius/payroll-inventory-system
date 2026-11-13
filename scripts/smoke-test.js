/**
 * Smoke test script for Payroll & Inventory Management System
 * Run with:  node scripts/smoke-test.js
 *
 * Prerequisites:
 * 1. Dev server running:  npm run dev
 * 2. .env configured with MONGODB_URI and JWT_SECRET
 * 3. Admin account seeded:  npx tsx scripts/seed.ts
 *
 * This script hits the API endpoints and reports PASS/FAIL.
 */

const BASE = "http://localhost:3000";

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body };
}

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${name} ${detail}`);
    failed++;
  }
}

async function main() {
  console.log("🧪 Starting smoke tests against", BASE, "\n");

  // ── Auth: login ──────────────────────────────────────────
  console.log("1. Authentication");
  const loginRes = await fetchJSON("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@payroll.local", password: "admin" }),
  });
  const token = loginRes.body.token || null;
  const tokenCookie = loginRes.body;
  check("Login returns 200", loginRes.status === 200, `(got ${loginRes.status})`);

  // Extract session cookie from response headers (not available via fetch JSON alone,
  // so we check status only). In a real browser, cookies are set automatically.

  // ── Auth: invalid login ──────────────────────────────────
  const badLogin = await fetchJSON("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "nope@test.local", password: "wrong" }),
  });
  check("Invalid login returns 401", badLogin.status === 401, `(got ${badLogin.status})`);

  // ── Employees: list ──────────────────────────────────────
  console.log("\n2. Employees");
  const empList = await fetchJSON("/api/employees");
  check("Employee list returns 200", empList.status === 200, `(got ${empList.status})`);

  // ── Payrolls: list ───────────────────────────────────────
  console.log("\n3. Payrolls");
  const payList = await fetchJSON("/api/payrolls");
  check("Payroll list returns 200", payList.status === 200, `(got ${payList.status})`);

  // ── Inventory: products ──────────────────────────────────
  console.log("\n4. Inventory");
  const prodList = await fetchJSON("/api/products");
  check("Product list returns 200", prodList.status === 200, `(got ${prodList.status})`);

  // ── Inventory: categories ────────────────────────────────
  const catList = await fetchJSON("/api/categories");
  check("Category list returns 200", catList.status === 200, `(got ${catList.status})`);

  // ── Inventory: suppliers ─────────────────────────────────
  const supList = await fetchJSON("/api/suppliers");
  check("Supplier list returns 200", supList.status === 200, `(got ${supList.status})`);

  // ── Audit logs ───────────────────────────────────────────
  console.log("\n5. Audit Logs");
  const auditList = await fetchJSON("/api/audit-logs");
  check("Audit log list returns 200", auditList.status === 200, `(got ${auditList.status})`);

  // ── Summary ──────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  if (failed === 0) {
    console.log("🎉 All smoke tests passed!");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Check the output above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
