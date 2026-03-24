\# DocFlow QA Automation Project



This project is a full-stack document workflow system that I built mainly to demonstrate real-world QA and automation practices.



Instead of just focusing on UI automation, I wanted this to reflect how testing actually works in production, covering UI, APIs, database validation, and CI integration in one place.



\---



\## What this project does



At a high level, this app simulates a document workflow:



\* Upload documents (PDF, DOCX, images, etc.)

\* Assign a reviewer

\* Approve or reject documents

\* Track all actions in audit logs

\* Enforce role-based access (Editor, Reviewer, Viewer)

\* Download and delete documents with proper restrictions



The goal wasn’t just to build the app, but to \*\*test the entire lifecycle end-to-end\*\*.



\---



\## Why I built this



In most real QA roles, testing is not limited to just UI clicks.



You deal with:



\* API validation

\* database checks

\* async issues

\* file uploads/downloads

\* role-based workflows



\---



\## Tech stack



\* Frontend: React (Vite)

\* Backend: Node.js + Express

\* Database: PostgreSQL

\* Automation: Playwright

\* CI/CD: GitHub Actions



\---



\## What I automated



\### UI (Playwright)



\* Full workflow: upload → assign reviewer → approve

\* File upload using real files (not mocks)

\* File download validation

\* Role-based UI behavior (Editor vs Viewer vs Reviewer)

\* Negative cases (invalid file type, large file)

\* Delete flow (only allowed for pending documents)



\### API



\* Document creation (multipart upload)

\* Reviewer assignment

\* Approval/rejection

\* Delete validation (pending vs approved)

\* Negative scenarios



\### Database



\* Verified document status after operations

\* Checked audit logs for correct actions

\* Ensured data consistency across flows



\---



\## Key features I focused on



\### File handling (realistic scenario)



\* Multipart file upload

\* MIME type + extension validation

\* File size restriction (10MB)

\* Download support

\* Deletion with constraints



\### Workflow logic



\* Reviewer must be assigned before approval

\* Only the assigned reviewer can approve/reject

\* Only pending documents can be deleted



\### Audit logs



Every important action is tracked:



\* REVIEWER\_ASSIGNED

\* APPROVED

\* REJECTED

\* DOCUMENT\_DELETED



\---



\## Project structure



```

docflow-qa-project/

├── backend/

├── frontend/

├── tests/

│   ├── specs/

│   ├── pages/

│   ├── utils/

│   └── fixtures/

└── .github/workflows/

```



\---



\## How to run locally



\### Backend



```

cd backend

npm install

npm run dev

```



\### Frontend



```

cd frontend

npm install

npm run dev

```



\### Tests



```

cd tests

npm install

npx playwright install

npx playwright test

```



\---



\## CI (GitHub Actions)



The project includes a CI pipeline that:



\* Spins up PostgreSQL

\* Starts backend + frontend

\* Runs Playwright tests

\* Uploads test reports and logs



This helped me validate that everything works in a clean environment, not just locally.



\---



\## Things I learned/focused on



\* Handling file uploads in automation (multipart testing)

\* Dealing with async UI updates (used polling where needed)

\* Keeping UI, API, and DB tests aligned

\* Designing reusable page objects (POM)

\* Writing meaningful negative test cases

\* Making tests stable enough for CI



\---



\## What I would improve next



\* Add proper authentication (JWT instead of passing emails)

\* Introduce soft delete instead of hard delete

\* Add performance testing (API load scenarios)

\* Improve test parallelization in CI

\* Add more security-focused test cases



\---



\## Author



Chandrasekhar Inti

QA Engineer / SDET





