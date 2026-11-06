# Embedded Job Match

**A personalized job-search dashboard for embedded software, firmware, validation and test automation opportunities.**

- **Live application:** https://embedded-job-match.hatchable.site
- **Author:** [Ibtihel JALEL](https://github.com/ibtiheljl)

## Overview

Embedded Job Match is a personal portfolio project that brings job opportunities into one dashboard and helps organize the application process. It combines job discovery records, profile-match estimates, application-status tracking and job-specific CV generation.

The project was built around a practical embedded-engineering job search. It is designed to make opportunities easier to review while keeping a clear distinction between demonstrated experience and skills that may still need to be learned.

## Features

- Centralized job dashboard with company, location, source and contract information.
- Search and filtering by keyword, source, compatibility score and application status.
- Match-score estimates and visible skill-gap notes.
- Manual job entry and backend job-ingestion endpoint.
- Duplicate prevention using company, title and location.
- Application-status tracking.
- Job-specific CV profile and experience selection.
- PDF generation for a tailored CV and application letter.
- CSV export.
- Search-run history endpoint and custom MCP tools for job ingestion/reporting.

> Match scores are heuristic estimates for prioritization. They are not official ATS scores and do not guarantee suitability or an interview.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| UI utilities | Alpine.js, Tailwind CSS |
| PDF generation | jsPDF |
| Backend | JavaScript API routes |
| Database | PostgreSQL |
| Platform / hosting | Hatchable |
| Tool integration | Custom MCP tools |
| Development support | ChatGPT-assisted development |

**Automation status:** n8n is not part of the currently published application implementation. It remains a possible future integration and is therefore not listed as an implemented technology.

## Architecture

1. The browser renders the dashboard and handles filtering, status updates, CSV export and PDF generation.
2. File-based JavaScript API routes read and write job records.
3. PostgreSQL stores job opportunities and search-run history.
4. Protected ingestion routes validate a bearer token configured as a Hatchable secret.
5. Custom MCP tools provide structured operations for job upserts and search-run reporting.

## Repository structure

```text
embedded-job-match/
├── public/
│   ├── index.html
│   ├── app.js
│   └── theme.css
├── api/
│   ├── jobs.js
│   ├── jobs/
│   │   ├── ingest.js
│   │   ├── manual.js
│   │   └── status.js
│   ├── search-runs.js
│   └── search-runs/
│       └── record.js
├── mcp/
│   ├── upsert_jobs.js
│   └── record_search_run.js
├── migrations/
│   └── 0001_jobs_and_search_runs.sql
├── hatchable.toml
└── README.md
```

## Setup and platform requirements

The backend uses Hatchable-specific runtime modules (including the `hatchable` SDK), file-based API routing and a managed PostgreSQL database. The project is therefore **not a standalone Node.js application** that can be started with `npm start`.

To run it in a compatible Hatchable project:

1. Import the project files into a Hatchable project.
2. Apply the SQL migration in `migrations/`.
3. Configure the `JOBS_INGEST_API_KEY` secret in the platform settings if external ingestion is required.
4. Deploy through Hatchable.
5. Add or ingest job records through the supported application/API workflow.

The static frontend is in `public/`. Third-party frontend libraries are currently loaded from CDNs, so an internet connection is required for those assets.

## Security and privacy

- No API key, password, database credential or environment file is included in this repository.
- Configure `JOBS_INGEST_API_KEY` as a platform secret; never paste its value into source code or commit history.
- Personal email and phone details have been removed from the public source copy of the generated CV template.
- The personal job-tracking database and original seed data are intentionally not included.
- Do not commit private application records, generated CVs, access tokens or personal documents.

See [SECURITY.md](SECURITY.md) for the public-repository handling notes.

## Roadmap

- Optional n8n workflow for scheduled multi-source job discovery.
- Broader source coverage and improved duplicate resolution.
- More transparent match explanations and configurable scoring.
- Search-run monitoring and notifications.

These are roadmap ideas, not claims about functionality already deployed.

## Author

**Ibtihel JALEL** — Embedded Software & Validation Engineer

- [LinkedIn](https://www.linkedin.com/in/ibtihel-jalel-a7546b185/)
- [Portfolio](https://ibtiheljl.github.io/portfolio/)
- [GitHub](https://github.com/ibtiheljl)

---

*Built as a personal portfolio project with ChatGPT-assisted development.*
