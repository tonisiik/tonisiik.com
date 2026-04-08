---
project: "[[POLARIS MOC]]"
title: 'Project BIOME: A Unified Production Intelligence Ecosystem'
description: Three specialized analytics modules — BOM visualization, automated data governance, and SPC stability monitoring — built on a single validated SQL data cube.
pubdate: '2026-04-07'
heroimage: /projects/biome-hero.png
category: Data Engineering
tags:
- SQL
- React
- Python
- Data Governance
- Manufacturing
- SPC
type: website-case-study
revision: R01
date_created: '2026-04-07'
date_modified: '2026-04-07'
---

# Project BIOME: A Unified Production Intelligence Ecosystem

## The Challenge

Manufacturing engineering data doesn't live in one place. Bills of Materials, routing times, scrap classifications, process parameters, and costing data are spread across ERP modules, MES exports, and local spreadsheets. The result is a predictable set of problems:

- Every analysis starts from scratch with a fresh data extraction
- Data governance issues (orphaned BOMs, inconsistent routings, stale standard costs) are invisible until they surface as planning errors or costing variances
- Process stability monitoring is reactive — deviations are investigated after the fact, not forecasted

**BIOME** was designed to solve this by building a single validated data foundation and three specialized intelligence modules on top of it.

## Architecture

```
Production SQL Warehouse
        ↓ (shared extraction pipeline)
BIOME Unified Data Cube (Parquet — shared asset)
        ↓
┌─────────────────────────────────────────────────────────┐
│  MANGROVE          BONSAI              DENDRO            │
│  Relationship      Data Governance     Process Stability │
│  Intelligence      10-Pillar Audit     SPC + Cycle Time  │
└─────────────────────────────────────────────────────────┘
        ↓
   MORIA (external consumer — scrap rate automation)
```

The shared data cube means that all three modules — and downstream projects like MORIA — work from the same validated snapshot. There is no inconsistency between what BONSAI flags as a data issue and what MORIA uses for predictions.

## The Three Modules

### 🌿 MANGROVE — Relationship Intelligence

MANGROVE provides an interactive graph view of the Bill of Materials using **React Flow** with a Dagre auto-layout engine. Unlike tabular BOM reports, the graph makes structural problems immediately visible:

- **Shortage simulation:** Remove a component node and trace the downstream impact on all assemblies
- **Audit overlays:** BONSAI findings are overlaid directly onto the BOM graph — an orange node is an orphan, a red path is a routing inconsistency
- **Critical path identification:** Automatically highlights which components have the fewest alternative sourcing routes

### 🧹 BONSAI — Data Governance (10-Pillar Audit)

BONSAI runs a structured audit across 10 data integrity pillars covering BOM completeness, routing consistency, scrap classification, component linkage, and standard cost alignment.

Key design decisions:

- **Correction classification workflow:** Each finding is classified by correction authority (self-service / department head / master data team), so the right person gets the right task
- **Stakeholder buy-in strategy:** BONSAI was designed from the outset to produce output that non-technical stakeholders can act on — findings are expressed as business impact (planning risk, costing variance) rather than database conditions
- **Rulebook:** A published rulebook documents every audit rule, its data source, and the correction procedure — making the audit reproducible and auditable itself

### 🌳 DENDRO — Process Stability & Forensic Variance

DENDRO provides multi-layer Statistical Process Control (SPC) charts and a forensic variance ledger across workcenter-level production data.

- **Speed / availability / labor forensic ledger:** Decomposes efficiency variance into its component causes, enabling targeted intervention
- **Article-level EBIT waterfall:** Maps the contribution of process deviations to standard cost variance at the article level
- **Cycle time tracking:** Monitors process time distributions to flag emerging instability before it manifests as scrap or rework

## Technical Stack

- **Data layer:** Python (Pandas, Polars) + SQL extraction → shared Parquet cube
- **MANGROVE frontend:** React, React Flow, Dagre layout
- **BONSAI engine:** Python rule evaluation pipeline, structured correction workflow
- **DENDRO analytics:** Python (SciPy, Plotly) for SPC, waterfall, and cycle time analysis
- **Integration:** MORIA reads `BIOME_UNIFIED_CUBE.parquet` directly — no data duplication

## Outcome

BIOME replaced a fragmented, per-project data extraction approach with a single validated foundation. The three modules address different time horizons of the same underlying problem:

| Module | Time Horizon | Problem Addressed |
|--------|-------------|------------------|
| BONSAI | Persistent (data debt) | Structural quality of master data |
| MANGROVE | Current (structural analysis) | BOM relationships and supply risk |
| DENDRO | Recurring (process variance) | Production stability and cost drivers |

By sharing a common data cube, findings from each module reinforce the others: BONSAI flags the orphans that MANGROVE visualizes; DENDRO quantifies the production instability that MORIA models.
