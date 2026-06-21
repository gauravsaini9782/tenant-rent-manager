# Tenant Rent Manager

## B9IS123 - Programming for Information Systems
**Student Name:** Gaurav Saini 
**Student Number:** 20100195
**Module:** B9IS123 - Programming for Information Systems  
**Lecturer:** Paul Laird
**Submission Date:** July 13, 2026  

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Organisation Background](#organisation-background)
3. [System Requirements](#system-requirements)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [Installation & Setup](#installation--setup)
7. [API Documentation](#api-documentation)
8. [Features](#features)
9. [Testing](#testing)
10. [Storage Justification](#storage-justification)
11. [Attributions](#attributions)

---

## Project Overview

Tenant Rent Manager is a proof-of-concept information system designed to help a landlord or house manager manage tenants, shared bills, and rent payments for a shared residential property. The system replaces manual tracking via spreadsheets or WhatsApp messages with a structured, digital solution.

The system provides full CRUD (Create, Read, Update, Delete) operations for tenants, bills and payments, along with a real-time dashboard showing rent status and bill breakdowns.

---

## Organisation Background

**Organisation:** A privately rented shared house in Dublin, Ireland  
**Context:** A shared house with multiple tenants from different countries. The landlord currently tracks rent payments, utility bills, and tenant information manually using spreadsheets and WhatsApp messages. This leads to disputes over payments, missed bills, and difficulty tracking tenant lease dates and deposits.  
**Justification:** This system digitises and centralises all tenant and financial management for the property, reducing errors and improving transparency for both landlord and tenants.

---

## System Requirements

### Functional Requirements

**Tenant Management:**
- Add a new tenant with full personal and legal details
- View all tenants in a searchable table
- Edit tenant information inline without page refresh
- Delete a tenant record
- Search tenants by name, room number, country or phone number

**Bill Management:**
- Add shared utility bills (electricity, wifi, water, gas)
- Automatically calculate and display each tenant's share
- Mark bills as paid
- Delete bill records
- View bills broken down by type on the dashboard

**Payment Management:**
- Record rent and bill payments per tenant
- Track payment status (paid, pending, overdue)
- View full payment history
- Delete payment records

**Dashboard:**
- Display total, active and inactive tenant counts
- Show unpaid bills count and total amount
- Show per-bill-type breakdown (electricity, wifi, water, gas)
- Display current month rent status per tenant (paid/unpaid)
- Search tenants from dashboard

### Non-Functional Requirements
- All data operations via API calls (no page refresh)
- Responsive design for desktop and mobile devices
- Input validation with inline error messages
- Real-time updates across all sections after any change

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | HTML, CSS, Vanilla JavaScript | Assignment requirement; no frameworks |
| Backend | Node.js + Express | Lightweight, JavaScript throughout |
| Storage | JSON flat files | Appropriate for POC scale (see Storage Justification) |
| Testing | Jest + Supertest | Industry standard Node.js testing tools |
| Version Control | Git + GitHub | Assignment requirement |

---

## Architecture
tenant-rent-manager/

├── data/

│   ├── tenants.json       # Tenant records

│   ├── bills.json         # Shared bill records

│   └── payments.json      # Payment records

├── public/

│   ├── index.html         # Single page frontend

│   ├── style.css          # Responsive styles

│   └── app.js             # Frontend logic (fetch API calls)

├── tests/

│   └── tenants.test.js    # Jest unit + integration tests

├── server.js              # Express API server

├── package.json

└── README.md

### How it works

The frontend (HTML/CSS/JS) is served statically by Express. All data operations are performed via JavaScript `fetch()` calls to the REST API endpoints. The API reads from and writes to JSON files on the server. There is no page reload at any point — all updates happen dynamically in the DOM.

---

## Installation & Setup

### Prerequisites
- Node.js (v20.19.6)
- npm
- Git

### Steps

1. Clone the repository:
```In terminal
git clone https://github.com/gauravsaini9782/tenant-rent-manager.git
cd tenant-rent-manager
```

2. Install dependencies:
```In terminal
npm install
```

3. Start the server:
```In terminal
npm start
```

4. Open in browser:http://localhost:3000

### Run Tests
```In terminal
npm test
```

---

## API Documentation

### Tenants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tenants | Get all tenants (supports ?search= query) |
| GET | /api/tenants/:id | Get single tenant by ID |
| POST | /api/tenants | Create new tenant |
| PUT | /api/tenants/:id | Update tenant |
| DELETE | /api/tenants/:id | Delete tenant |

### Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bills | Get all bills |
| POST | /api/bills | Create new bill (auto-calculates split) |
| PUT | /api/bills/:id | Update bill (e.g. mark as paid) |
| DELETE | /api/bills/:id | Delete bill |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payments | Get all payments (supports ?tenantId= filter) |
| POST | /api/payments | Record new payment |
| PUT | /api/payments/:id | Update payment |
| DELETE | /api/payments/:id | Delete payment |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Get summary statistics and rent status |

---

## Features

### CRUD Operations
- Full Create, Read, Update, Delete for Tenants, Bills and Payments
- Inline edit form for tenants (no page refresh)
- Confirmation before delete

### Search & Filter
- Search tenants by name, room number, country or phone
- Filter payments by tenant ID

### Bill Splitting
- Shared bills automatically split equally among all active tenants
- Split amount and tenant count displayed per bill

### Dashboard
- Real-time summary statistics
- Per-bill-type breakdown (electricity, wifi, water, gas)
- Current month rent status per tenant

### Validation
- Required field validation with red inline error messages
- Email format validation
- Phone number format validation

### Responsive Design
- Works on desktop, tablet and mobile devices
- Horizontal scroll on tables for small screens

---

## Testing

## Manual API Testing (Postman)

All API endpoints (Tenants, Bills, Payments) were manually tested in Postman during development before writing automated tests — covering GET, POST, PUT and DELETE for each resource. This included checking correct status codes (200, 201, 204, 404), verifying the bill auto-split calculation and confirming data persisted correctly in the JSON files. All manual tests passed.

Tests are written using **Jest** and **Supertest**.

### Unit Tests (7 tests)
- GET /api/tenants returns empty array initially
- POST /api/tenants creates a new tenant
- GET /api/tenants returns all tenants after adding
- PUT /api/tenants/:id updates tenant rent amount
- DELETE /api/tenants/:id removes tenant
- GET /api/tenants/:id returns 404 for non-existent tenant
- GET /api/tenants?search= filters tenants by name

### Integration Test (1 test)
- Adding tenants then a shared bill correctly calculates the split amount per tenant, verifying that the tenants data and bills logic work correctly together

### Run Tests
```In Terminal
npm test
```

All 8 tests pass successfully.

---

## Storage Justification

JSON flat-file storage was chosen as the storage solution for this proof-of-concept system. A shared house typically manages a small number of tenants (under 20), making a full database server unnecessary overhead for this scale.

JSON files are lightweight, human-readable, and easy to inspect and version-control alongside the codebase. They require no additional installation or configuration, making the system easy to set up and run locally.

In a production system, this could be migrated to SQLite for structured relational queries or MongoDB for document-based storage to support larger data volumes and concurrent users.

---

## Attributions

### Libraries & Frameworks
| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| Express | ^4.x | HTTP server and API routing | https://expressjs.com |
| Jest | ^29.x | Unit and integration testing | https://jestjs.io |
| Supertest | ^6.x | HTTP endpoint testing | https://github.com/ladjs/supertest |
| Nodemon | ^3.x | Auto-restart during development | https://nodemon.io |

## AI Assistance

This project was primarily designed, implemented, and tested by me. During development, AI-based learning tools were occasionally used as supplementary educational resources to clarify concepts and improve understanding of specific technologies.

**Areas where AI was used for learning and clarification:**

* Understanding Express.js routing and middleware concepts
* Clarifying the use of the Fetch API and asynchronous JavaScript (async/await)
* Learning best practices for REST API development
* Understanding Jest and Supertest testing workflows
* Exploring different user interface approaches before implementing the final design

AI assistance was limited to explanation, learning support, and concept clarification. All application design decisions, coding, debugging, testing and final implementation were completed independently by me.


### External Code & References
- Express documentation: https://expressjs.com/en/guide/routing.html
- Jest documentation: https://jestjs.io/docs/getting-started
- MDN Web Docs (fetch API): https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Node.js fs module documentation: https://nodejs.org/api/fs.html