# DocFlow QA Automation Project

This project is a full-stack document workflow system that I built to practice and demonstrate real-world QA and automation practices.

Instead of just focusing on UI automation, I wanted this to reflect how testing actually works in production—covering UI, APIs, database validation, performance checks, and CI integration.

---

## What this project does

The app simulates a typical document lifecycle:

* Upload documents (PDF, DOCX, images, ZIP, etc.)
* Assign a reviewer
* Approve or reject documents
* Track all actions through audit logs
* Role-based access (Editor, Reviewer, Viewer, Admin)
* Download documents
* Delete documents (soft delete with restrictions)

The main focus is validating the **entire workflow end-to-end**, not just individual pieces.

---

## Why I built this

In real QA roles, testing goes beyond clicking UI elements. You deal with:

* APIs
* databases
* async behavior
* file uploads/downloads
* workflow rules
* performance considerations

So I built this project to bring all of that into one place.

---

## Tech stack

* Frontend: React (Vite)
* Backend: Node.js + Express
* Database: PostgreSQL
* Automation: Playwright
* Performance Testing: k6
* CI/CD: GitHub Actions

---

## What I automated

### UI (Playwright)

* Full workflow: upload → assign reviewer → approve/reject
* File upload using real files (multipart)
* File download validation
* Role-based UI checks
* Delete flow (only for pending documents)
* Negative scenarios (invalid file type, large file)
* Handling async UI updates using polling where needed

---

### API

* Document creation (multipart upload)
* Reviewer assignment
* Approval / rejection
* Soft delete validation
* Negative scenarios (invalid state, invalid inputs)

---

### Database validation

* Verified document status after operations
* Confirmed soft delete flags (`is_deleted`, `deleted_at`, `deleted_by`)
* Validated audit log entries for each action

---

### Performance testing (k6)

Added lightweight load tests for core APIs:

* document listing
* document search

Focus:

* response time thresholds (p95)
* failure rate validation

---

## Key features I focused on

### File handling (real-world scenario)

* Multipart upload
* File type validation (extension + MIME)
* Size restriction (10MB)
* File download support

---

### Workflow rules

* Reviewer must be assigned before approval
* Only assigned reviewer can approve/reject
* Only pending documents can be deleted

---

### Soft delete (important improvement)

Instead of physically deleting records:

* Documents are marked with:

  * `is_deleted = true`
  * `deleted_at`
  * `deleted_by`
* Hidden from UI and API responses
* Audit logs are preserved
* Files remain available for traceability

This better reflects how real systems handle deletion.

---

### Audit logging

Every important action is tracked:

* REVIEWER_ASSIGNED
* APPROVED
* REJECTED
* DOCUMENT_SOFT_DELETED

---

## Project structure

```id="l8c0n3"
docflow-qa-project/
├── backend/
├── frontend/
├── tests/
│   ├── specs/
│   ├── pages/
│   ├── utils/
│   └── fixtures/
├── performance/
└── .github/workflows/
```

---

## How to run locally

### Backend

```bash id="2m9h8s"
cd backend
npm install
npm run dev
```

### Frontend

```bash id="e2o3b5"
cd frontend
npm install
npm run dev
```

### Tests

```bash id="a4k9s1"
cd tests
npm install
npx playwright install
npx playwright test
```

---

## Running performance tests

```bash id="7f3xk2"
k6 run performance/document-list.js
k6 run performance/document-search.js
```

---

## CI (GitHub Actions)

The pipeline is split into separate jobs:

* UI tests
* API tests
* DB validation tests

Each job:

* starts PostgreSQL
* runs backend
* builds frontend (for UI tests)
* executes Playwright tests

This setup improves:

* failure isolation
* execution speed
* debugging

---

## Things I focused on while building this

* Keeping UI, API, and DB tests aligned
* Handling async UI behavior properly
* Writing meaningful negative test cases
* Making tests stable enough for CI
* Designing reusable page objects
* Testing real-world scenarios like file uploads and workflow rules

---

## What I would improve next

* Add proper authentication (JWT instead of passing emails)
* Introduce document versioning logic
* Add soft delete recovery (restore)
* Add performance testing for write APIs
* Improve CI caching and job reuse

---

## Author

Chandrasekhar Inti
QA Engineer / SDET

---

This project reflects how I approach testing in real systems—looking at quality from UI, API, database, and system behavior, not just one layer.
