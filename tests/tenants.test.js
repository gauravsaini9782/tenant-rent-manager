const request = require("supertest");
const express = require("express");
const fs = require("fs");
const path = require("path");

// ===== SETUP TEST APP =====
// We create a separate test version of the app
// so tests don't touch your real data files

const app = express();
app.use(express.json());

// Test data file paths (separate from real data)
const TEST_DIR = path.join(__dirname, "test-data");
const tenantsTestFile = path.join(TEST_DIR, "tenants.json");
const billsTestFile = path.join(TEST_DIR, "bills.json");
const paymentsTestFile = path.join(TEST_DIR, "payments.json");

// Helper functions (same as server.js)
function readJSON(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===== ROUTES (copied from server.js for testing) =====

app.get("/api/tenants", (req, res) => {
  let tenants = readJSON(tenantsTestFile);
  const search = req.query.search;
  if (search) {
    const keyword = search.toLowerCase();
    tenants = tenants.filter(
      (t) =>
        t.fullName.toLowerCase().includes(keyword) ||
        t.roomNumber.toString().includes(keyword) ||
        t.country.toLowerCase().includes(keyword) ||
        t.phone.includes(keyword),
    );
  }
  res.json(tenants);
});

app.get("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsTestFile);
  const tenant = tenants.find((t) => t.id === parseInt(req.params.id));
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json(tenant);
});

app.post("/api/tenants", (req, res) => {
  const tenants = readJSON(tenantsTestFile);
  const newTenant = {
    id: Date.now(),
    fullName: req.body.fullName,
    phone: req.body.phone,
    email: req.body.email,
    country: req.body.country,
    passportNumber: req.body.passportNumber,
    roomNumber: req.body.roomNumber,
    rentAmount: req.body.rentAmount,
    depositAmount: req.body.depositAmount,
    depositPaid: req.body.depositPaid || false,
    advancePaid: req.body.advancePaid || 0,
    pendingBalance: req.body.pendingBalance || 0,
    leaseStart: req.body.leaseStart,
    leaseEnd: req.body.leaseEnd,
    status: req.body.status || "active",
    notes: req.body.notes || "",
  };
  tenants.push(newTenant);
  writeJSON(tenantsTestFile, tenants);
  res.status(201).json(newTenant);
});

app.put("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsTestFile);
  const index = tenants.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Tenant not found" });
  tenants[index] = { ...tenants[index], ...req.body };
  writeJSON(tenantsTestFile, tenants);
  res.json(tenants[index]);
});

app.delete("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsTestFile);
  const index = tenants.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Tenant not found" });
  tenants.splice(index, 1);
  writeJSON(tenantsTestFile, tenants);
  res.status(204).send();
});

// Bills route for integration test
app.post("/api/bills", (req, res) => {
  const bills = readJSON(billsTestFile);
  const tenants = readJSON(tenantsTestFile);
  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const splitAmount =
    activeTenants > 0
      ? (req.body.totalAmount / activeTenants).toFixed(2)
      : req.body.totalAmount;

  const newBill = {
    id: Date.now(),
    type: req.body.type,
    totalAmount: req.body.totalAmount,
    billingPeriod: req.body.billingPeriod,
    dueDate: req.body.dueDate,
    status: "unpaid",
    splitAmount: parseFloat(splitAmount),
    activeTenantCount: activeTenants,
  };
  bills.push(newBill);
  writeJSON(billsTestFile, bills);
  res.status(201).json(newBill);
});

app.get("/api/bills", (req, res) => {
  const bills = readJSON(billsTestFile);
  res.json(bills);
});

// ===== TEST SETUP & TEARDOWN =====

beforeAll(() => {
  // Create test-data folder and empty files before tests run
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
  writeJSON(tenantsTestFile, []);
  writeJSON(billsTestFile, []);
  writeJSON(paymentsTestFile, []);
});

afterAll(() => {
  // Clean up test files after all tests done
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

beforeEach(() => {
  // Reset to empty before each test for clean state
  writeJSON(tenantsTestFile, []);
  writeJSON(billsTestFile, []);
});

// ===== UNIT TESTS =====

describe("Tenants API - Unit Tests", () => {
  // TEST 1
  test("GET /api/tenants returns empty array initially", async () => {
    const res = await request(app).get("/api/tenants");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  // TEST 2
  test("POST /api/tenants creates a new tenant", async () => {
    const newTenant = {
      fullName: "John Murphy",
      phone: "+353871234567",
      email: "john@email.com",
      country: "Ireland",
      passportNumber: "PA123456",
      roomNumber: 101,
      rentAmount: 650,
      depositAmount: 650,
      leaseStart: "2026-01-01",
      leaseEnd: "2027-01-01",
    };

    const res = await request(app).post("/api/tenants").send(newTenant);
    expect(res.statusCode).toBe(201);
    expect(res.body.fullName).toBe("John Murphy");
    expect(res.body.country).toBe("Ireland");
    expect(res.body.id).toBeDefined();
  });

  // TEST 3
  test("GET /api/tenants returns all tenants after adding", async () => {
    await request(app).post("/api/tenants").send({
      fullName: "Sara Khan",
      phone: "+353871111111",
      country: "Pakistan",
      passportNumber: "PK999",
      roomNumber: 102,
      rentAmount: 700,
      leaseStart: "2026-02-01",
    });

    const res = await request(app).get("/api/tenants");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].fullName).toBe("Sara Khan");
  });

  // TEST 4
  test("PUT /api/tenants/:id updates tenant rent amount", async () => {
    const created = await request(app).post("/api/tenants").send({
      fullName: "Ali Raza",
      phone: "+353872222222",
      country: "India",
      passportNumber: "IN888",
      roomNumber: 103,
      rentAmount: 600,
      leaseStart: "2026-03-01",
    });

    const id = created.body.id;
    const res = await request(app)
      .put(`/api/tenants/${id}`)
      .send({ rentAmount: 750 });

    expect(res.statusCode).toBe(200);
    expect(res.body.rentAmount).toBe(750);
  });

  // TEST 5
  test("DELETE /api/tenants/:id removes tenant", async () => {
    const created = await request(app).post("/api/tenants").send({
      fullName: "Test User",
      phone: "+353873333333",
      country: "Nigeria",
      passportNumber: "NG777",
      roomNumber: 104,
      rentAmount: 550,
      leaseStart: "2026-04-01",
    });

    const id = created.body.id;
    const deleteRes = await request(app).delete(`/api/tenants/${id}`);
    expect(deleteRes.statusCode).toBe(204);

    const getRes = await request(app).get("/api/tenants");
    expect(getRes.body.length).toBe(0);
  });

  // TEST 6
  test("GET /api/tenants/:id returns 404 for non-existent tenant", async () => {
    const res = await request(app).get("/api/tenants/99999");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Tenant not found");
  });

  // TEST 7
  test("GET /api/tenants?search= filters tenants by name", async () => {
    await request(app).post("/api/tenants").send({
      fullName: "David Walsh",
      phone: "+353874444444",
      country: "Ireland",
      passportNumber: "IE123",
      roomNumber: 105,
      rentAmount: 620,
      leaseStart: "2026-01-01",
    });

    await request(app).post("/api/tenants").send({
      fullName: "Priya Patel",
      phone: "+353875555555",
      country: "India",
      passportNumber: "IN456",
      roomNumber: 106,
      rentAmount: 680,
      leaseStart: "2026-01-01",
    });

    const res = await request(app).get("/api/tenants?search=priya");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].fullName).toBe("Priya Patel");
  });
});

// ===== INTEGRATION TEST =====

describe("Integration Test - Tenant and Bill Flow", () => {
  test("Adding a tenant then a bill correctly splits the bill amount", async () => {
    // Step 1: Add 2 active tenants
    await request(app).post("/api/tenants").send({
      fullName: "Tenant One",
      phone: "+353876666666",
      country: "Ireland",
      passportNumber: "IE001",
      roomNumber: 201,
      rentAmount: 600,
      leaseStart: "2026-01-01",
      status: "active",
    });

    await request(app).post("/api/tenants").send({
      fullName: "Tenant Two",
      phone: "+353877777777",
      country: "France",
      passportNumber: "FR002",
      roomNumber: 202,
      rentAmount: 600,
      leaseStart: "2026-01-01",
      status: "active",
    });

    // Step 2: Add a shared bill
    const billRes = await request(app).post("/api/bills").send({
      type: "electricity",
      totalAmount: 120,
      billingPeriod: "June 2026",
      dueDate: "2026-06-30",
    });

    // Step 3: Check split amount is correct (120 / 2 tenants = 60)
    expect(billRes.statusCode).toBe(201);
    expect(billRes.body.splitAmount).toBe(60);
    expect(billRes.body.activeTenantCount).toBe(2);

    // Step 4: Verify bill appears in GET /api/bills
    const billsRes = await request(app).get("/api/bills");
    expect(billsRes.body.length).toBe(1);
    expect(billsRes.body[0].type).toBe("electricity");
  });
});
