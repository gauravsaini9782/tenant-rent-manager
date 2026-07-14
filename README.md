# Tenant Rent Manager

A proof-of-concept web application developed for the B9IS123 Programming for Information Systems module. The system helps landlords and house managers manage tenants, shared bills and rent payments through a responsive web interface, providing full CRUD (Create, Read, Update, Delete) functionality via a RESTful API.

## B9IS123 - Programming for Information Systems

**Student Name:** Gaurav Saini
**Student Number:** 20100591
**Module:** B9IS123 - Programming for Information Systems  
**Lecturer:** Paul Laird
**Submission Date:** July 14, 2026

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
11. [Commit Declaration](#commit-declaration)
12. [AI Usage Declaration](#ai-usage-declaration)
13. [References & Attributions](#references--attributions)

---

## Project Overview

Tenant Rent Manager is a proof-of-concept information system designed to help a landlord or house manager manage tenants, shared bills, and rent payments for a shared residential property. The system replaces manual tracking via spreadsheets or WhatsApp messages with a structured, digital solution.

The application provides complete CRUD (Create, Read, Update and Delete) functionality for tenants, bills and payments, together with an interactive dashboard for monitoring rent status, shared utility bills and payment information.

---

**Live Demo:** https://tenants-rent-manager.onrender.com

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

| Layer           | Technology                    | Reason                                                |
| --------------- | ----------------------------- | ----------------------------------------------------- |
| Frontend        | HTML, CSS, Vanilla JavaScript | Assignment requirement; no frameworks                 |
| Backend         | Node.js + Express             | Lightweight, JavaScript throughout                    |
| Storage         | JSON flat files               | Appropriate for POC scale (see Storage Justification) |
| Testing         | Jest + Supertest              | Industry standard Node.js testing tools               |
| Version Control | Git + GitHub                  | Assignment requirement                                |
| API Style       | RESTful API                   | Resource-based CRUD endpoints                         |

---

## Architecture

```text
tenant-rent-manager/
│
├── data/
│   ├── tenants.json
│   ├── bills.json
│   └── payments.json
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── tests/
│   └── tenants.test.js
│
├── server.js
├── package.json
└── README.md
```

### How it Works

The frontend is served statically by Express. All CRUD operations are performed through JavaScript `fetch()` requests to the REST API. The server reads from and writes to JSON files, allowing data to persist without requiring a database. The user interface updates dynamically without requiring page reloads.

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

| Method | Endpoint         | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| GET    | /api/tenants     | Get all tenants (supports ?search= query) |
| GET    | /api/tenants/:id | Get single tenant by ID                   |
| POST   | /api/tenants     | Create new tenant                         |
| PUT    | /api/tenants/:id | Update tenant                             |
| DELETE | /api/tenants/:id | Delete tenant                             |

### Bills

| Method | Endpoint       | Description                             |
| ------ | -------------- | --------------------------------------- |
| GET    | /api/bills     | Get all bills                           |
| POST   | /api/bills     | Create new bill (auto-calculates split) |
| PUT    | /api/bills/:id | Update bill (e.g. mark as paid)         |
| DELETE | /api/bills/:id | Delete bill                             |

### Payments

| Method | Endpoint          | Description                                   |
| ------ | ----------------- | --------------------------------------------- |
| GET    | /api/payments     | Get all payments (supports ?tenantId= filter) |
| POST   | /api/payments     | Record new payment                            |
| PUT    | /api/payments/:id | Update payment                                |
| DELETE | /api/payments/:id | Delete payment                                |

### Dashboard

| Method | Endpoint       | Description                            |
| ------ | -------------- | -------------------------------------- |
| GET    | /api/dashboard | Get summary statistics and rent status |

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

### Manual API Testing (Postman)

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

## Commit Declaration

| #   | Commit ID | Commit Message                                                                                      | Declaration                                                                                                                                                                                                                                |
| --- | --------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 02175f5   | Initial commit                                                                                      | Self — GitHub auto-generated when the repository was created.                                                                                                                                                                              |
| 2   | 19d608e   | Initial project setup with folder structure                                                         | Self — created the project structure, initialised npm and installed the required dependencies.                                                                                                                                             |
| 3   | 52bd900   | Add CRUD endpoints for tenants API                                                                  | AI Assisted — AI explained Express routing and middleware concepts. I implemented, tested and debugged all CRUD endpoints myself.                                                                                                          |
| 4   | 0d76fec   | Add CRUD endpoints for bills API                                                                    | Self — implemented independently by following the project structure established earlier.                                                                                                                                                   |
| 5   | 5e6d133   | Add CRUD endpoints for payments API                                                                 | Self — developed and tested the payments endpoints independently using the existing API pattern.                                                                                                                                           |
| 6   | 5a134f3   | Redesign server.js with full tenant profile, shared bill splitting, dashboard and search endpoints  | AI Assisted — I designed the required features and application flow. AI helped explain the bill-splitting logic and suggested improvements to the dashboard implementation. The final solution was implemented, modified and tested by me. |
| 7   | fab6721   | Redesign full frontend with responsive layout, inline edit, validation and bill breakdown dashboard | AI Assisted — AI provided guidance on JavaScript Fetch API and DOM manipulation. I designed the interface, implemented the functionality and completed all testing myself.                                                                 |
| 8   | e223b22   | Add Jest unit tests and integration test for tenants and bills API                                  | AI Assisted — AI explained the Jest and Supertest testing structure. I wrote, executed and refined all test cases independently.                                                                                                           |
| 9   | 88fac3b   | Add full project documentation to README                                                            | Self — wrote and organised the project documentation independently.                                                                                                                                                                        |
| 10  | a0d1b4b   | Use environment PORT for deployment compatibility                                                   | Self — identified the deployment issue during testing and implemented the solution independently.                                                                                                                                          |
| 11  | 4028e1d   | Fix main entry point in package.json                                                                | Self — debugged the deployment issue and corrected the package configuration independently.                                                                                                                                                |
| 12  | fca20f2   | Fix API URL to work on both local and deployed environment                                          | Self — identified the issue during deployment testing and implemented the fix independently.                                                                                                                                               |
| 13  | e7195c1   | Fix tenant table to show all fields and strengthen validation                                       | Self — identified the issues during manual testing and implemented the required fixes independently.                                                                                                                                       |
| 14  | c65b0ac   | Fix tenant table layout with fixed column widths                                                    | Self — resolved the layout issue independently after testing different approaches.                                                                                                                                                         |
| 15  | 8098490   | Replace tenant ID input with tenant name dropdown in payments                                       | AI Assisted — I identified the usability improvement. AI suggested an implementation approach, which I integrated and tested myself.                                                                                                       |

## AI Usage Declaration

This project was primarily designed, implemented and tested by the student.

Generative AI was used selectively as a learning resource to better understand unfamiliar concepts and to validate implementation approaches during development.

AI assistance was limited to:

- Understanding Express.js routing and middleware
- Clarifying the Fetch API and asynchronous JavaScript
- Understanding Jest and Supertest testing workflows
- Discussing the shared bill-splitting implementation
- Exploring an implementation approach for the tenant selection dropdown

The project requirements, application design and overall implementation were completed by the student. AI was used only for concept clarification and guidance on selected technical tasks. All AI-assisted suggestions were reviewed, modified and tested before being integrated into the final solution.

**Overall AI Usage Level:** **Level 2–3** (AI used primarily for learning and concept clarification rather than generating the complete solution.)

## References & Attributions

- Node.js Documentation: https://nodejs.org/en/docs
- Express.js Documentation: https://expressjs.com/en/guide/routing.html
- Jest Documentation: https://jestjs.io/docs/getting-started
- Supertest Documentation: https://github.com/ladjs/supertest
- MDN Web Docs - Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- MDN Web Docs - Async/Await: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises
- MDN Web Docs - Array.findIndex(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
- MDN Web Docs - JSON.parse() and JSON.stringify(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
- MDN Web Docs - window.location: https://developer.mozilla.org/en-US/docs/Web/API/Window/location
- Node.js fs Module: https://nodejs.org/api/fs.html

### Deployment

- Render Deployment Documentation: https://render.com/docs/deploy-node-express-ap

### Libraries & Frameworks

| Library   | Version | Purpose                         | Source                             |
| --------- | ------- | ------------------------------- | ---------------------------------- |
| Express   | ^4.x    | HTTP server and API routing     | https://expressjs.com              |
| Jest      | ^29.x   | Unit and integration testing    | https://jestjs.io                  |
| Supertest | ^6.x    | HTTP endpoint testing           | https://github.com/ladjs/supertest |
| Nodemon   | ^3.x    | Auto-restart during development | https://nodemon.io                 |
