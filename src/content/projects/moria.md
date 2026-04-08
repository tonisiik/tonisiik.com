---
project: "[[POLARIS MOC]]"
title: 'Project MORIA: Automating the Biannual Scrap Rate Review'
description: A full-stack Electron + FastAPI desktop application that replaces a manual scrap rate correction workflow with predictive modeling, Human-in-the-Loop override, and MD5-signed compliance output.
pubdate: '2026-04-07'
heroimage: /projects/moria-hero.png
category: Software Engineering
tags:
- Python
- Electron
- FastAPI
- Machine Learning
- Manufacturing
type: website-case-study
revision: R01
date_created: '2026-04-07'
date_modified: '2026-04-07'
---

# Project MORIA: Automating the Biannual Scrap Rate Review

## The Challenge

In manufacturing, scrap rates feed directly into material planning, production costing, and capacity calculations. When rates are stale, every downstream calculation drifts — over-ordering materials, understating production costs, and mispricing capacity.

The standard process corrects these rates twice per year. Without tooling, this correction cycle is manual: analysts extract historical data, estimate correction factors by hand, and enter changes into the production system without a formal review structure or audit trail.

Three specific failure modes drove the MORIA project:

1. **No forecasting:** Corrections were based on simple averages, ignoring seasonal trends and recent process changes
2. **No audit record:** There was no structured record of why each rate was set, who approved it, or what the previous value was
3. **Succession gaps:** When a material number changes (article renamed, replaced, or split), historical production data becomes disconnected — making rate estimation for the new number unreliable

## The Solution

MORIA is a standalone Electron + FastAPI desktop application that formalizes the entire correction workflow:

```
Data Ingestion → Prediction → Human Review → Compliance Output
```

### Predictive Engine

The engine selects the forecasting algorithm based on available historical data:

| Data Available | Algorithm | Notes |
|----------------|-----------|-------|
| ≥ 18 months | Prophet | Handles seasonality and trend |
| 6–17 months | Holt-Winters | Exponential smoothing |
| < 6 months | Standard Default | Conservative fallback |

All predictions include confidence intervals. The UI displays the interval alongside the point estimate so the analyst can assess uncertainty before approving.

### Human-in-the-Loop Override Interface

Every proposed rate change is pre-populated with the model's prediction — not a blank field. The analyst can accept, adjust, or reject each proposal individually. Override reasons are recorded in the audit log.

This design reflects a deliberate principle: the model assists the analyst, but the analyst retains final authority. The system is designed to be trusted precisely because it cannot act without a human decision.

### Succession Stitching

Before predictions are generated, production history is matched across material number transitions. This "stitching" step joins the old and new article histories into a continuous series, so the predictive engine sees full data depth even for recently renamed materials.

### Compliance Output

After review and approval, the application generates a signed PDF report containing:
- All proposed and approved rates with comparison to previous values
- Override decisions and reasons
- MD5 hash of the dataset used for predictions
- Session metadata (analyst, date, data snapshot version)

The hash enables independent verification that the output was generated from a specific, unmodified dataset.

## Technical Stack

- **Frontend:** Electron (desktop shell), React (UI components)
- **Backend:** FastAPI (Python, localhost only — no network exposure)
- **Prediction:** Facebook Prophet, Statsmodels Holt-Winters, custom succession stitching
- **Data source:** Shared production data cube (BIOME Unified Cube — read-only)
- **Audit layer:** SQLite for session records, MD5-signed PDF for compliance output

## Outcome

MORIA transforms a twice-yearly manual exercise into a structured, auditable workflow that can be completed in a single guided session. The compliance output satisfies audit requirements without additional documentation effort. The predictive engine reduces systematic under- and over-estimation caused by simple average calculations.

The Human-in-the-Loop architecture also serves as a training tool: analysts see model confidence intervals, review historical trends, and develop a data-driven intuition for rate setting over successive review cycles.
