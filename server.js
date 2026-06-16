const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const tenantsFilePath = path.join(__dirname, 'data', 'tenants.json');

// Helper function to read tenants from JSON file
function readTenants() {
  const data = fs.readFileSync(tenantsFilePath, 'utf-8');
  return JSON.parse(data);
}

// GET all tenants
app.get('/api/tenants', (req, res) => {
  const tenants = readTenants();
  res.json(tenants);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// TENANT MANAGEMENT API ENDPOINTS

// Helper function to write tenants to JSON file
function writeTenants(tenants) {
  fs.writeFileSync(tenantsFilePath, JSON.stringify(tenants, null, 2));
}

// POST - Create a new tenant
app.post('/api/tenants', (req, res) => {
  const tenants = readTenants();

  const newTenant = {
    id: Date.now(), // simple unique id using timestamp
    name: req.body.name,
    roomNumber: req.body.roomNumber,
    rentAmount: req.body.rentAmount,
    moveInDate: req.body.moveInDate,
    depositAmount: req.body.depositAmount,
    depositStatus: req.body.depositStatus || 'pending'
  };

  tenants.push(newTenant);
  writeTenants(tenants);

  res.status(201).json(newTenant);
});

// PUT - Update an existing tenant
app.put('/api/tenants/:id', (req, res) => {
  const tenants = readTenants();
  const id = parseInt(req.params.id);

  const index = tenants.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  tenants[index] = { ...tenants[index], ...req.body };
  writeTenants(tenants);

  res.json(tenants[index]);
});

// DELETE - Remove a tenant
app.delete('/api/tenants/:id', (req, res) => {
  const tenants = readTenants();
  const id = parseInt(req.params.id);

  const index = tenants.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  tenants.splice(index, 1);
  writeTenants(tenants);

  res.status(204).send();
});

// BILLING MANAGEMENT API ENDPOINTS

const billsFilePath = path.join(__dirname, 'data', 'bills.json');

// Helper functions for bills
function readBills() {
  const data = fs.readFileSync(billsFilePath, 'utf-8');
  return JSON.parse(data);
}

function writeBills(bills) {
  fs.writeFileSync(billsFilePath, JSON.stringify(bills, null, 2));
}

// GET all bills
app.get('/api/bills', (req, res) => {
  const bills = readBills();
  res.json(bills);
});

// POST - Create a new bill
app.post('/api/bills', (req, res) => {
  const bills = readBills();

  const newBill = {
    id: Date.now(),
    type: req.body.type,         // e.g. "electricity", "wifi", "water"
    amount: req.body.amount,
    dueDate: req.body.dueDate,
    billingPeriod: req.body.billingPeriod,  // e.g. "June 2026"
    splitMethod: req.body.splitMethod || 'equal',  // equal or per-room
    status: req.body.status || 'unpaid'
  };

  bills.push(newBill);
  writeBills(bills);

  res.status(201).json(newBill);
});

// PUT - Update a bill
app.put('/api/bills/:id', (req, res) => {
  const bills = readBills();
  const id = parseInt(req.params.id);

  const index = bills.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bill not found' });
  }

  bills[index] = { ...bills[index], ...req.body };
  writeBills(bills);

  res.json(bills[index]);
});

// DELETE - Remove a bill
app.delete('/api/bills/:id', (req, res) => {
  const bills = readBills();
  const id = parseInt(req.params.id);

  const index = bills.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bill not found' });
  }

  bills.splice(index, 1);
  writeBills(bills);

  res.status(204).send();
});
