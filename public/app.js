const API = window.location.origin + "/api";

// ===== TOAST =====
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// ===== NAVIGATION =====
function showPage(pageId, btn) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  if (btn) btn.classList.add("active");
}

// ===== VALIDATION HELPERS =====
function clearErrors() {
  document
    .querySelectorAll(".error-msg")
    .forEach((e) => e.classList.remove("show"));
  document
    .querySelectorAll(".error")
    .forEach((e) => e.classList.remove("error"));
}

function showError(fieldId, msgId) {
  const field = document.getElementById(fieldId);
  const msg = document.getElementById(msgId);
  if (field) field.classList.add("error");
  if (msg) msg.classList.add("show");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\+\-\(\)]{7,15}$/.test(phone);
}

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/dashboard`);
    const data = await res.json();

    document.getElementById("statTotal").textContent = data.totalTenants;
    document.getElementById("statActive").textContent = data.activeTenants;
    document.getElementById("statUnpaidBills").textContent =
      data.unpaidBillsCount;
    document.getElementById("statUnpaidAmount").textContent =
      data.unpaidBillsTotal.toFixed(2);
    document.getElementById("currentMonth").textContent = data.currentMonth;

    // Bills breakdown by type
    const breakdown = document.getElementById("billsBreakdown");
    const bills = await fetch(`${API}/bills`).then((r) => r.json());

    const billTypes = ["electricity", "wifi", "water", "gas"];
    breakdown.innerHTML = billTypes
      .map((type) => {
        const typeBills = bills.filter((b) => b.type === type);
        const unpaid = typeBills.filter((b) => b.status === "unpaid");
        const total = unpaid.reduce((s, b) => s + parseFloat(b.totalAmount), 0);
        return `
        <div class="bill-stat-box">
          <div class="bill-type">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div class="bill-amount">€${total.toFixed(2)}</div>
          <div class="bill-meta">${unpaid.length} unpaid bill${unpaid.length !== 1 ? "s" : ""}</div>
        </div>
      `;
      })
      .join("");

    // Rent status
    const rentDiv = document.getElementById("rentStatus");
    if (data.rentStatus.length === 0) {
      rentDiv.innerHTML = '<p class="empty-state">No active tenants found.</p>';
      return;
    }

    rentDiv.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Room</th>
            <th>Rent (€)</th>
            <th>Status</th>
            <th>Date Paid</th>
          </tr>
        </thead>
        <tbody>
          ${data.rentStatus
            .map(
              (t) => `
            <tr>
              <td>${t.fullName}</td>
              <td>Room ${t.roomNumber}</td>
              <td>€${t.rentAmount}</td>
              <td><span class="badge ${t.rentPaid ? "badge-green" : "badge-red"}">${t.rentPaid ? "Paid" : "Unpaid"}</span></td>
              <td>${t.datePaid || "—"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

// ===== SEARCH (Dashboard) =====
async function searchTenants() {
  const keyword = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("searchResults");

  if (!keyword) {
    resultsDiv.innerHTML = "";
    return;
  }

  const res = await fetch(
    `${API}/tenants?search=${encodeURIComponent(keyword)}`,
  );
  const tenants = await res.json();

  if (tenants.length === 0) {
    resultsDiv.innerHTML = '<p class="empty-state">No tenants found.</p>';
    return;
  }

  resultsDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Room</th><th>Country</th>
          <th>Phone</th><th>Rent</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tenants
          .map(
            (t) => `
          <tr>
            <td>${t.fullName}</td>
            <td>Room ${t.roomNumber}</td>
            <td>${t.country}</td>
            <td>${t.phone}</td>
            <td>€${t.rentAmount}/mo</td>
            <td><span class="badge ${t.status === "active" ? "badge-green" : "badge-red"}">${t.status}</span></td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// ===== TENANTS =====
async function loadTenants() {
  const res = await fetch(`${API}/tenants`);
  const tenants = await res.json();
  renderTenantsTable(tenants);
}

async function filterTenants() {
  const keyword = document.getElementById("tenantSearchInput").value.trim();
  const url = keyword
    ? `${API}/tenants?search=${encodeURIComponent(keyword)}`
    : `${API}/tenants`;
  const res = await fetch(url);
  const tenants = await res.json();
  renderTenantsTable(tenants);
}

function renderTenantsTable(tenants) {
  const div = document.getElementById("tenantsList");

  if (tenants.length === 0) {
    div.innerHTML = '<p class="empty-state">No tenants found.</p>';
    return;
  }

  div.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Country</th>
          <th>Passport/ID</th>
          <th>Room</th>
          <th>Rent</th>
          <th>Deposit</th>
          <th>Advance</th>
          <th>Pending</th>
          <th>Lease Start</th>
          <th>Lease End</th>
          <th>Status</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${tenants.map((t) => renderTenantRow(t)).join("")}
      </tbody>
    </table>
  `;
}

function renderTenantRow(t) {
  const depositPaid = t.depositPaid === true || t.depositPaid === "true";
  return `
    <tr id="row-${t.id}">
      <td>${t.fullName}</td>
      <td>${t.phone}</td>
      <td>${t.email || "—"}</td>
      <td>${t.country}</td>
      <td>${t.passportNumber}</td>
      <td>Room ${t.roomNumber}</td>
      <td>€${t.rentAmount}/mo</td>
      <td>
        €${t.depositAmount || 0}
        <span class="badge ${depositPaid ? "badge-green" : "badge-orange"}">
          ${depositPaid ? "Paid" : "Pending"}
        </span>
      </td>
      <td>€${t.advancePaid || 0}</td>
      <td>€${t.pendingBalance || 0}</td>
      <td>${t.leaseStart || "—"}</td>
      <td>${t.leaseEnd || "—"}</td>
      <td>
        <span class="badge ${t.status === "active" ? "badge-green" : "badge-red"}">
          ${t.status}
        </span>
      </td>
      <td>${t.notes || "—"}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="showEditForm(${t.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTenant(${t.id})" style="margin-left:4px">Delete</button>
      </td>
    </tr>
    <tr id="edit-${t.id}" style="display:none;">
      <td colspan="15">
        <div class="edit-form">
          <h4>Edit Tenant — ${t.fullName}</h4>
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" id="e-fullName-${t.id}" value="${t.fullName}" />
              <span class="error-msg" id="e-err-fullName-${t.id}">Full name is required</span>
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input type="text" id="e-phone-${t.id}" value="${t.phone}" />
              <span class="error-msg" id="e-err-phone-${t.id}">Valid phone number is required</span>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" id="e-email-${t.id}" value="${t.email || ""}" />
              <span class="error-msg" id="e-err-email-${t.id}">Valid email is required</span>
            </div>
            <div class="form-group">
              <label>Country *</label>
              <input type="text" id="e-country-${t.id}" value="${t.country}" />
              <span class="error-msg" id="e-err-country-${t.id}">Country is required</span>
            </div>
            <div class="form-group">
              <label>Passport/ID *</label>
              <input type="text" id="e-passport-${t.id}" value="${t.passportNumber || ""}" />
              <span class="error-msg" id="e-err-passport-${t.id}">Passport/ID is required</span>
            </div>
            <div class="form-group">
              <label>Room Number *</label>
              <input type="number" id="e-room-${t.id}" value="${t.roomNumber}" />
              <span class="error-msg" id="e-err-room-${t.id}">Room number is required</span>
            </div>
            <div class="form-group">
              <label>Monthly Rent (€) *</label>
              <input type="number" id="e-rent-${t.id}" value="${t.rentAmount}" />
              <span class="error-msg" id="e-err-rent-${t.id}">Rent amount is required</span>
            </div>
            <div class="form-group">
              <label>Deposit Amount (€)</label>
              <input type="number" id="e-deposit-${t.id}" value="${t.depositAmount || 0}" />
            </div>
            <div class="form-group">
              <label>Deposit Status</label>
              <select id="e-depositPaid-${t.id}">
                <option value="false" ${!depositPaid ? "selected" : ""}>Not Paid</option>
                <option value="true" ${depositPaid ? "selected" : ""}>Paid</option>
              </select>
            </div>
            <div class="form-group">
              <label>Advance Paid (€)</label>
              <input type="number" id="e-advance-${t.id}" value="${t.advancePaid || 0}" />
            </div>
            <div class="form-group">
              <label>Pending Balance (€)</label>
              <input type="number" id="e-pending-${t.id}" value="${t.pendingBalance || 0}" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="e-status-${t.id}">
                <option value="active" ${t.status === "active" ? "selected" : ""}>Active</option>
                <option value="inactive" ${t.status === "inactive" ? "selected" : ""}>Inactive</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lease Start *</label>
              <input type="date" id="e-leaseStart-${t.id}" value="${t.leaseStart || ""}" />
              <span class="error-msg" id="e-err-leaseStart-${t.id}">Lease start is required</span>
            </div>
            <div class="form-group">
              <label>Lease End</label>
              <input type="date" id="e-leaseEnd-${t.id}" value="${t.leaseEnd || ""}" />
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea id="e-notes-${t.id}">${t.notes || ""}</textarea>
            </div>
          </div>
          <div class="edit-actions">
            <button class="btn btn-success" onclick="saveEditTenant(${t.id})">Save Changes</button>
            <button class="btn btn-secondary" onclick="hideEditForm(${t.id})">Cancel</button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function showEditForm(id) {
  document.getElementById(`edit-${id}`).style.display = "table-row";
  const editBtn = document
    .getElementById(`row-${id}`)
    .querySelector(".btn-warning");
  editBtn.textContent = "Close";
  editBtn.setAttribute("onclick", `hideEditForm(${id})`);
}

function hideEditForm(id) {
  document.getElementById(`edit-${id}`).style.display = "none";
  const editBtn = document
    .getElementById(`row-${id}`)
    .querySelector(".btn-warning");
  editBtn.textContent = "Edit";
  editBtn.setAttribute("onclick", `showEditForm(${id})`);
}

async function saveEditTenant(id) {
  const fullName = document.getElementById(`e-fullName-${id}`).value.trim();
  const phone = document.getElementById(`e-phone-${id}`).value.trim();
  const email = document.getElementById(`e-email-${id}`).value.trim();
  const country = document.getElementById(`e-country-${id}`).value.trim();
  const passportNumber = document
    .getElementById(`e-passport-${id}`)
    .value.trim();
  const roomNumber = document.getElementById(`e-room-${id}`).value;
  const rentAmount = document.getElementById(`e-rent-${id}`).value;
  const leaseStart = document.getElementById(`e-leaseStart-${id}`).value;

  let valid = true;

  if (!fullName) {
    document.getElementById(`e-err-fullName-${id}`).classList.add("show");
    document.getElementById(`e-fullName-${id}`).classList.add("error");
    valid = false;
  }
  if (!phone || !validatePhone(phone)) {
    document.getElementById(`e-err-phone-${id}`).classList.add("show");
    document.getElementById(`e-phone-${id}`).classList.add("error");
    valid = false;
  }
  if (!email || !validateEmail(email)) {
    document.getElementById(`e-err-email-${id}`).classList.add("show");
    document.getElementById(`e-email-${id}`).classList.add("error");
    valid = false;
  }
  if (!country) {
    document.getElementById(`e-err-country-${id}`).classList.add("show");
    document.getElementById(`e-country-${id}`).classList.add("error");
    valid = false;
  }
  if (!passportNumber) {
    document.getElementById(`e-err-passport-${id}`).classList.add("show");
    document.getElementById(`e-passport-${id}`).classList.add("error");
    valid = false;
  }
  if (!roomNumber) {
    document.getElementById(`e-err-room-${id}`).classList.add("show");
    document.getElementById(`e-room-${id}`).classList.add("error");
    valid = false;
  }
  if (!rentAmount) {
    document.getElementById(`e-err-rent-${id}`).classList.add("show");
    document.getElementById(`e-rent-${id}`).classList.add("error");
    valid = false;
  }
  if (!leaseStart) {
    document.getElementById(`e-err-leaseStart-${id}`).classList.add("show");
    document.getElementById(`e-leaseStart-${id}`).classList.add("error");
    valid = false;
  }

  if (!valid) {
    showToast("Please fix the errors in the edit form", "error");
    return;
  }

  const updated = {
    fullName,
    phone,
    email,
    country,
    passportNumber,
    roomNumber,
    rentAmount,
    depositAmount: document.getElementById(`e-deposit-${id}`).value,
    depositPaid: document.getElementById(`e-depositPaid-${id}`).value,
    advancePaid: document.getElementById(`e-advance-${id}`).value,
    pendingBalance: document.getElementById(`e-pending-${id}`).value,
    status: document.getElementById(`e-status-${id}`).value,
    leaseStart,
    leaseEnd: document.getElementById(`e-leaseEnd-${id}`).value,
    notes: document.getElementById(`e-notes-${id}`).value.trim(),
  };

  await fetch(`${API}/tenants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  showToast("Tenant updated successfully");
  loadTenants();
  loadDashboard();
}

async function addTenant() {
  clearErrors();
  let valid = true;

  const fullName = document.getElementById("tFullName").value.trim();
  const phone = document.getElementById("tPhone").value.trim();
  const email = document.getElementById("tEmail").value.trim();
  const country = document.getElementById("tCountry").value.trim();
  const passportNumber = document.getElementById("tPassport").value.trim();
  const roomNumber = document.getElementById("tRoom").value;
  const rentAmount = document.getElementById("tRent").value;
  const depositAmount = document.getElementById("tDeposit").value;
  const depositPaid = document.getElementById("tDepositPaid").value;
  const advancePaid = document.getElementById("tAdvance").value || 0;
  const pendingBalance = document.getElementById("tPending").value || 0;
  const status = document.getElementById("tStatus").value;
  const leaseStart = document.getElementById("tLeaseStart").value;
  const leaseEnd = document.getElementById("tLeaseEnd").value;
  const notes = document.getElementById("tNotes").value.trim();

  // Validate all required fields
  if (!fullName) {
    showError("tFullName", "err-tFullName");
    valid = false;
  }
  if (!phone || !validatePhone(phone)) {
    showError("tPhone", "err-tPhone");
    valid = false;
  }
  if (!email || !validateEmail(email)) {
    showError("tEmail", "err-tEmail");
    valid = false;
  }
  if (!country) {
    showError("tCountry", "err-tCountry");
    valid = false;
  }
  if (!passportNumber) {
    showError("tPassport", "err-tPassport");
    valid = false;
  }
  if (!roomNumber) {
    showError("tRoom", "err-tRoom");
    valid = false;
  }
  if (!rentAmount || rentAmount <= 0) {
    showError("tRent", "err-tRent");
    valid = false;
  }
  if (!leaseStart) {
    showError("tLeaseStart", "err-tLeaseStart");
    valid = false;
  }

  if (!valid) {
    showToast("Please fix the errors above", "error");
    return;
  }

  await fetch(`${API}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      phone,
      email,
      country,
      passportNumber,
      roomNumber,
      rentAmount,
      depositAmount,
      depositPaid,
      advancePaid,
      pendingBalance,
      status,
      leaseStart,
      leaseEnd,
      notes,
    }),
  });

  // Clear all form fields
  [
    "tFullName",
    "tPhone",
    "tEmail",
    "tCountry",
    "tPassport",
    "tRoom",
    "tRent",
    "tDeposit",
    "tAdvance",
    "tPending",
    "tLeaseStart",
    "tLeaseEnd",
    "tNotes",
  ].forEach((id) => (document.getElementById(id).value = ""));

  showToast("Tenant added successfully");
  loadTenants();
  loadDashboard();
}

async function deleteTenant(id) {
  if (!confirm("Are you sure you want to delete this tenant?")) return;
  await fetch(`${API}/tenants/${id}`, { method: "DELETE" });
  showToast("Tenant deleted");
  loadTenants();
  loadDashboard();
}

// ===== BILLS =====
async function loadBills() {
  const res = await fetch(`${API}/bills`);
  const bills = await res.json();
  const div = document.getElementById("billsList");

  if (bills.length === 0) {
    div.innerHTML = '<p class="empty-state">No bills added yet.</p>';
    return;
  }

  div.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Type</th><th>Total (€)</th><th>Per Tenant (€)</th>
          <th>Tenants</th><th>Period</th><th>Due Date</th>
          <th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${bills
          .map(
            (b) => `
          <tr>
            <td>${b.type.charAt(0).toUpperCase() + b.type.slice(1)}</td>
            <td>€${b.totalAmount}</td>
            <td>€${b.splitAmount}</td>
            <td>${b.activeTenantCount}</td>
            <td>${b.billingPeriod}</td>
            <td>${b.dueDate}</td>
            <td>
              <span class="badge ${b.status === "paid" ? "badge-green" : "badge-red"}">
                ${b.status}
              </span>
            </td>
            <td>
              ${
                b.status === "unpaid"
                  ? `<button class="btn btn-success btn-sm" onclick="markBillPaid(${b.id})" style="margin-right:4px">Mark Paid</button>`
                  : ""
              }
              <button class="btn btn-danger btn-sm" onclick="deleteBill(${b.id})">Delete</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function addBill() {
  clearErrors();
  let valid = true;

  const type = document.getElementById("bType").value;
  const totalAmount = document.getElementById("bAmount").value;
  const billingPeriod = document.getElementById("bPeriod").value.trim();
  const dueDate = document.getElementById("bDueDate").value;

  if (!totalAmount || totalAmount <= 0) {
    showError("bAmount", "err-bAmount");
    valid = false;
  }
  if (!billingPeriod) {
    showError("bPeriod", "err-bPeriod");
    valid = false;
  }
  if (!dueDate) {
    showError("bDueDate", "err-bDueDate");
    valid = false;
  }

  if (!valid) {
    showToast("Please fill in all bill fields", "error");
    return;
  }

  const res = await fetch(`${API}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, totalAmount, billingPeriod, dueDate }),
  });

  const bill = await res.json();

  document.getElementById("bAmount").value = "";
  document.getElementById("bPeriod").value = "";
  document.getElementById("bDueDate").value = "";

  showToast(`Bill added. Split per tenant: €${bill.splitAmount}`);
  loadBills();
  loadDashboard();
}

async function markBillPaid(id) {
  await fetch(`${API}/bills/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "paid" }),
  });
  showToast("Bill marked as paid");
  loadBills();
  loadDashboard();
}

async function deleteBill(id) {
  if (!confirm("Delete this bill?")) return;
  await fetch(`${API}/bills/${id}`, { method: "DELETE" });
  showToast("Bill deleted");
  loadBills();
  loadDashboard();
}

// ===== PAYMENTS =====
async function loadPayments() {
  const res = await fetch(`${API}/payments`);
  const payments = await res.json();
  const div = document.getElementById("paymentsList");

  if (payments.length === 0) {
    div.innerHTML = '<p class="empty-state">No payments recorded yet.</p>';
    return;
  }

  div.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Tenant ID</th><th>Type</th><th>Amount</th>
          <th>Month</th><th>Date Paid</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${payments
          .map(
            (p) => `
          <tr>
            <td>${p.tenantId}</td>
            <td>${p.type.charAt(0).toUpperCase() + p.type.slice(1)}</td>
            <td>€${p.amount}</td>
            <td>${p.month}</td>
            <td>${p.datePaid}</td>
            <td>
              <span class="badge ${
                p.status === "paid"
                  ? "badge-green"
                  : p.status === "overdue"
                    ? "badge-red"
                    : "badge-orange"
              }">${p.status}</span>
            </td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.id})">Delete</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function addPayment() {
  clearErrors();
  let valid = true;

  const tenantId = document.getElementById("pTenantId").value;
  const type = document.getElementById("pType").value;
  const amount = document.getElementById("pAmount").value;
  const month = document.getElementById("pMonth").value.trim();
  const datePaid = document.getElementById("pDate").value;
  const status = document.getElementById("pStatus").value;

  if (!tenantId) {
    showError("pTenantId", "err-pTenantId");
    valid = false;
  }
  if (!amount || amount <= 0) {
    showError("pAmount", "err-pAmount");
    valid = false;
  }
  if (!month) {
    showError("pMonth", "err-pMonth");
    valid = false;
  }
  if (!datePaid) {
    showError("pDate", "err-pDate");
    valid = false;
  }

  if (!valid) {
    showToast("Please fill in all payment fields", "error");
    return;
  }

  await fetch(`${API}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantId: parseInt(tenantId),
      type,
      amount,
      month,
      datePaid,
      status,
    }),
  });

  document.getElementById("pTenantId").value = "";
  document.getElementById("pAmount").value = "";
  document.getElementById("pMonth").value = "";
  document.getElementById("pDate").value = "";

  showToast("Payment recorded successfully");
  loadPayments();
  loadDashboard();
}

async function deletePayment(id) {
  if (!confirm("Delete this payment?")) return;
  await fetch(`${API}/payments/${id}`, { method: "DELETE" });
  showToast("Payment deleted");
  loadPayments();
}

// ===== INIT =====
window.onload = () => {
  loadDashboard();
  loadTenants();
  loadBills();
  loadPayments();
};
