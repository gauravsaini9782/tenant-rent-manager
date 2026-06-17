const API = "http://localhost:3000/api";

// ===== TENANTS =====

async function loadTenants() {
  const res = await fetch(`${API}/tenants`);
  const tenants = await res.json();
  const div = document.getElementById("tenantsList");

  if (tenants.length === 0) {
    div.innerHTML = "<p>No tenants found.</p>";
    return;
  }

  div.innerHTML = tenants
    .map(
      (t) => `
    <div style="border:1px solid #ccc; padding:10px; margin:5px 0;">
      <strong>${t.name}</strong> — Room ${t.roomNumber} — €${t.rentAmount}/month<br/>
      Move-in: ${t.moveInDate} | Deposit: €${t.depositAmount} (${t.depositStatus})<br/>
      <button onclick="deleteTenant(${t.id})">Delete</button>
      <button onclick="editTenant(${t.id}, '${t.name}', ${t.roomNumber}, ${t.rentAmount})">Edit Rent</button>
    </div>
  `,
    )
    .join("");
}

async function addTenant() {
  const name = document.getElementById("tenantName").value;
  const roomNumber = document.getElementById("tenantRoom").value;
  const rentAmount = document.getElementById("tenantRent").value;
  const moveInDate = document.getElementById("tenantMoveIn").value;
  const depositAmount = document.getElementById("tenantDeposit").value;
  const depositStatus = document.getElementById("tenantDepositStatus").value;

  if (!name || !roomNumber || !rentAmount || !moveInDate || !depositAmount) {
    alert("Please fill in all tenant fields");
    return;
  }

  await fetch(`${API}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      roomNumber,
      rentAmount,
      moveInDate,
      depositAmount,
      depositStatus,
    }),
  });

  // clear fields after adding
  document.getElementById("tenantName").value = "";
  document.getElementById("tenantRoom").value = "";
  document.getElementById("tenantRent").value = "";
  document.getElementById("tenantMoveIn").value = "";
  document.getElementById("tenantDeposit").value = "";

  loadTenants();
}

async function deleteTenant(id) {
  if (!confirm("Are you sure you want to delete this tenant?")) return;

  await fetch(`${API}/tenants/${id}`, { method: "DELETE" });
  loadTenants();
}

async function editTenant(id, currentName, currentRoom, currentRent) {
  const newRent = prompt(
    `Update rent for ${currentName} (current: €${currentRent}):`,
    currentRent,
  );
  if (newRent === null) return;

  await fetch(`${API}/tenants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rentAmount: newRent }),
  });

  loadTenants();
}

// ===== BILLS =====

async function loadBills() {
  const res = await fetch(`${API}/bills`);
  const bills = await res.json();
  const div = document.getElementById("billsList");

  if (bills.length === 0) {
    div.innerHTML = "<p>No bills found.</p>";
    return;
  }

  div.innerHTML = bills
    .map(
      (b) => `
    <div style="border:1px solid #ccc; padding:10px; margin:5px 0;">
      <strong>${b.type.toUpperCase()}</strong> — €${b.amount} — Due: ${b.dueDate}<br/>
      Period: ${b.billingPeriod} | Split: ${b.splitMethod} | Status: ${b.status}<br/>
      <button onclick="deleteBill(${b.id})">Delete</button>
      <button onclick="markBillPaid(${b.id})">Mark as Paid</button>
    </div>
  `,
    )
    .join("");
}

async function addBill() {
  const type = document.getElementById("billType").value;
  const amount = document.getElementById("billAmount").value;
  const dueDate = document.getElementById("billDueDate").value;
  const billingPeriod = document.getElementById("billPeriod").value;
  const splitMethod = document.getElementById("billSplit").value;

  if (!amount || !dueDate || !billingPeriod) {
    alert("Please fill in all bill fields");
    return;
  }

  await fetch(`${API}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      amount,
      dueDate,
      billingPeriod,
      splitMethod,
      status: "unpaid",
    }),
  });

  document.getElementById("billAmount").value = "";
  document.getElementById("billDueDate").value = "";
  document.getElementById("billPeriod").value = "";

  loadBills();
}

async function deleteBill(id) {
  if (!confirm("Are you sure you want to delete this bill?")) return;

  await fetch(`${API}/bills/${id}`, { method: "DELETE" });
  loadBills();
}

async function markBillPaid(id) {
  await fetch(`${API}/bills/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "paid" }),
  });

  loadBills();
}

// ===== PAYMENTS =====

async function loadPayments() {
  const res = await fetch(`${API}/payments`);
  const payments = await res.json();
  const div = document.getElementById("paymentsList");

  if (payments.length === 0) {
    div.innerHTML = "<p>No payments found.</p>";
    return;
  }

  div.innerHTML = payments
    .map(
      (p) => `
    <div style="border:1px solid #ccc; padding:10px; margin:5px 0;">
      Tenant ID: ${p.tenantId} | Bill ID: ${p.billId}<br/>
      Amount Paid: €${p.amountPaid} — Date: ${p.datePaid} — Status: ${p.status}<br/>
      <button onclick="deletePayment(${p.id})">Delete</button>
    </div>
  `,
    )
    .join("");
}

async function addPayment() {
  const tenantId = document.getElementById("paymentTenantId").value;
  const billId = document.getElementById("paymentBillId").value;
  const amountPaid = document.getElementById("paymentAmount").value;
  const datePaid = document.getElementById("paymentDate").value;
  const status = document.getElementById("paymentStatus").value;

  if (!tenantId || !billId || !amountPaid || !datePaid) {
    alert("Please fill in all payment fields");
    return;
  }

  await fetch(`${API}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId, billId, amountPaid, datePaid, status }),
  });

  document.getElementById("paymentTenantId").value = "";
  document.getElementById("paymentBillId").value = "";
  document.getElementById("paymentAmount").value = "";
  document.getElementById("paymentDate").value = "";

  loadPayments();
}

async function deletePayment(id) {
  if (!confirm("Are you sure you want to delete this payment?")) return;

  await fetch(`${API}/payments/${id}`, { method: "DELETE" });
  loadPayments();
}

// Load all data when page opens
window.onload = () => {
  loadTenants();
  loadBills();
  loadPayments();
};
