const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// ===== FILE PATHS =====
const tenantsFilePath = path.join(__dirname, "data", "tenants.json");
const billsFilePath = path.join(__dirname, "data", "bills.json");
const paymentsFilePath = path.join(__dirname, "data", "payments.json");

// ===== HELPER FUNCTIONS =====
function readJSON(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===========================
// TENANTS ENDPOINTS
// ===========================

// GET all tenants (with optional search)
app.get("/api/tenants", (req, res) => {
  let tenants = readJSON(tenantsFilePath);
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

// GET single tenant by ID
app.get("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsFilePath);
  const tenant = tenants.find((t) => t.id === parseInt(req.params.id));

  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json(tenant);
});

// POST - Create new tenant
app.post("/api/tenants", (req, res) => {
  const tenants = readJSON(tenantsFilePath);

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
  writeJSON(tenantsFilePath, tenants);
  res.status(201).json(newTenant);
});

// PUT - Update tenant
app.put("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsFilePath);
  const index = tenants.findIndex((t) => t.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Tenant not found" });

  tenants[index] = { ...tenants[index], ...req.body };
  writeJSON(tenantsFilePath, tenants);
  res.json(tenants[index]);
});

// DELETE - Remove tenant
app.delete("/api/tenants/:id", (req, res) => {
  const tenants = readJSON(tenantsFilePath);
  const index = tenants.findIndex((t) => t.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Tenant not found" });

  tenants.splice(index, 1);
  writeJSON(tenantsFilePath, tenants);
  res.status(204).send();
});

// ===========================
// BILLS ENDPOINTS
// ===========================

// GET all bills
app.get("/api/bills", (req, res) => {
  const bills = readJSON(billsFilePath);
  res.json(bills);
});

// POST - Create new shared bill (auto split)
app.post("/api/bills", (req, res) => {
  const bills = readJSON(billsFilePath);
  const tenants = readJSON(tenantsFilePath);

  // count only active tenants for splitting
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
  writeJSON(billsFilePath, bills);
  res.status(201).json(newBill);
});

// PUT - Update bill (e.g mark as paid)
app.put("/api/bills/:id", (req, res) => {
  const bills = readJSON(billsFilePath);
  const index = bills.findIndex((b) => b.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Bill not found" });

  bills[index] = { ...bills[index], ...req.body };
  writeJSON(billsFilePath, bills);
  res.json(bills[index]);
});

// DELETE - Remove bill
app.delete("/api/bills/:id", (req, res) => {
  const bills = readJSON(billsFilePath);
  const index = bills.findIndex((b) => b.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Bill not found" });

  bills.splice(index, 1);
  writeJSON(billsFilePath, bills);
  res.status(204).send();
});

// ===========================
// PAYMENTS ENDPOINTS
// ===========================

// GET all payments (optionally filter by tenantId)
app.get("/api/payments", (req, res) => {
  let payments = readJSON(paymentsFilePath);
  const tenantId = req.query.tenantId;

  if (tenantId) {
    payments = payments.filter((p) => p.tenantId === parseInt(tenantId));
  }

  res.json(payments);
});

// POST - Record a payment
app.post("/api/payments", (req, res) => {
  const payments = readJSON(paymentsFilePath);

  const newPayment = {
    id: Date.now(),
    tenantId: req.body.tenantId,
    type: req.body.type, // 'rent', 'electricity', 'wifi', 'water', 'gas'
    amount: req.body.amount,
    month: req.body.month, // e.g. "June 2026"
    datePaid: req.body.datePaid,
    status: req.body.status || "paid",
  };

  payments.push(newPayment);
  writeJSON(paymentsFilePath, payments);
  res.status(201).json(newPayment);
});

// PUT - Update payment
app.put("/api/payments/:id", (req, res) => {
  const payments = readJSON(paymentsFilePath);
  const index = payments.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Payment not found" });

  payments[index] = { ...payments[index], ...req.body };
  writeJSON(paymentsFilePath, payments);
  res.json(payments[index]);
});

// DELETE - Remove payment
app.delete("/api/payments/:id", (req, res) => {
  const payments = readJSON(paymentsFilePath);
  const index = payments.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ error: "Payment not found" });

  payments.splice(index, 1);
  writeJSON(paymentsFilePath, payments);
  res.status(204).send();
});

// ===========================
// DASHBOARD ENDPOINT
// ===========================

app.get("/api/dashboard", (req, res) => {
  const tenants = readJSON(tenantsFilePath);
  const bills = readJSON(billsFilePath);
  const payments = readJSON(paymentsFilePath);

  const activeTenants = tenants.filter((t) => t.status === "active");
  const inactiveTenants = tenants.filter((t) => t.status === "inactive");
  const unpaidBills = bills.filter((b) => b.status === "unpaid");

  // current month rent status per tenant
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const rentPaymentsThisMonth = payments.filter(
    (p) => p.type === "rent" && p.month === currentMonth,
  );

  const rentStatus = activeTenants.map((t) => {
    const paid = rentPaymentsThisMonth.find((p) => p.tenantId === t.id);
    return {
      tenantId: t.id,
      fullName: t.fullName,
      roomNumber: t.roomNumber,
      rentAmount: t.rentAmount,
      rentPaid: !!paid,
      datePaid: paid ? paid.datePaid : null,
    };
  });

  res.json({
    totalTenants: tenants.length,
    activeTenants: activeTenants.length,
    inactiveTenants: inactiveTenants.length,
    unpaidBillsCount: unpaidBills.length,
    unpaidBillsTotal: unpaidBills.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount),
      0,
    ),
    currentMonth,
    rentStatus,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
