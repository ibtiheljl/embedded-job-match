# Security and privacy notes

This is a public portfolio repository. Please follow these rules when contributing or deploying:

- Never commit API keys, access tokens, passwords, database URLs, private keys, or environment files.
- Keep JOBS_INGEST_API_KEY in Hatchable's secret/configuration manager.
- Do not commit private job-application history, generated CVs, personal contact details, or exports containing personal data.
- The public source copy intentionally uses generic contact placeholders in the PDF template. Configure private contact details only in a local/private deployment if needed.
- Job descriptions and source URLs should be handled in accordance with the source website's terms and applicable privacy rules.
- Treat match scores as estimates; manually verify each vacancy before applying.

If you discover an exposed credential, revoke/rotate it immediately and remove it from all reachable history. A later deletion commit does not invalidate a leaked secret.
