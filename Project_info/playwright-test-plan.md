# Playwright Test Plan

## Info Pages Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9 | FAQ page loads | Navigate to /support | FAQ accordion visible with 8+ questions |
| 10 | FAQ accordion | Click a question | Answer expands smoothly |
| 11 | FAQ search | Type "аккаунт" in search | Filters to matching questions |
| 12 | About page | Navigate to /about | Stats and mission visible |
| 13 | Contacts page | Navigate to /contacts | Contact info and form visible |
| 14 | Privacy page | Navigate to /privacy | Full policy text rendered |
| 15 | Terms page | Navigate to /terms | Full terms text rendered |
| 16 | 404 page | Navigate to /nonexistent | Custom 404 page shows |

## Changelog
| Date | Description |
|------|-------------|
| 2026-04-04 | Info pages tests added by infopages agent |
