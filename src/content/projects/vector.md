---
project: "[[POLARIS MOC]]"
title: 'Project VECTOR: A Visual AI Research Engine for Engineering Analytics'
description: A graph-within-graph analysis platform that treats AI as a constrained execution worker — ensuring full traceability, reproducibility, and auditability in AI-assisted foundry research.
pubdate: '2026-04-07'
heroimage: /projects/vector-hero.png
category: Software Engineering
tags:
- Python
- Electron
- React
- AI Infrastructure
- Research Methodology
type: website-case-study
revision: R01
date_created: '2026-04-07'
date_modified: '2026-04-07'
---

# Project VECTOR: A Visual AI Research Engine for Engineering Analytics

## The Challenge

AI assistants are increasingly capable of generating analysis code, interpreting data, and producing reports. But this capability introduces a reproducibility problem: when an AI generates a Python script from a conversational prompt, there is no formal record of the logic it was asked to implement, no dependency chain linking the output to its source data, and no mechanism to verify that the same analysis would be reconstructed identically tomorrow.

In a research context — particularly in regulated or audited environments — this is not acceptable. The output of an analysis must be traceable back to its input sources, and the logic that transformed one into the other must be explicitly defined, not inferred from a conversation transcript.

**Project VECTOR** was designed to solve this by creating a structured visual environment that constrains AI to execute within a user-defined logic graph rather than operating with free hand.

## The Core Concept: AI as Execution Worker

The fundamental design principle of VECTOR is the separation of **logic definition** (done by the analyst) from **code generation** (done by the AI).

The analyst defines *what* the analysis should do using a visual graph of building blocks. The system compiles that graph into a structured execution guide. The AI receives only the guide — not a freeform prompt — and generates the corresponding Python script within those constraints.

This prevents "hallucinated complexity": the AI cannot invent steps the analyst didn't specify, and cannot make assumptions about the analysis structure.

## Architecture: Graph Within a Graph

VECTOR uses a two-level graph architecture:

### Level 1 — Project Graph (Module Flow)

The top-level view shows the full analysis as a directed graph of modules. Each module has a type:

| Module Type | Purpose |
|------------|---------|
| Source | Raw data ingestion and validation |
| Data Model | ETL, joins, aggregation (Star Model pattern) |
| Analyze | Statistical analysis, correlation, SPC |
| Machine Learning | Predictive models, clustering, classification |
| Tool | Utilities, format conversion, checksum validation |
| Report | Templated output generation |

Modules are connected by drag-and-drop data flow links. Each link tracks whether the upstream module has changed — if a source is updated, all downstream modules are automatically flagged as stale via checksum comparison.

### Level 2 — Module Internal Graph (Building Blocks)

Opening any module reveals its internal logic: a secondary graph of **building blocks** that define the transformation in detail.

Standard blocks include Input/Output, Join, Filter, Calculate, Visualize, Regression Model, and Custom. Each block has:
- A name and goal (user-defined)
- A context field (pre-filled with standard templates, editable)
- Configurable shortcuts for common outputs (chart types, model parameters)

The system compiles the building block chain into a structured guide that is passed to the AI agent. The AI generates code strictly within this structure.

## Key Technical Work

### `vector` CLI Tool
The command-line backbone manages project lifecycle:
- `vector init-system` — Hub and Kernel setup
- `vector create` — Standardized project scaffolding
- `vector run` — Execution with automatic hashing and archiving
- `vector release` — Stable version freezing
- `vector scan` — Global dashboard across all projects
- `vector health` — Dependency graph visualization (Mermaid output)

### Checksum-Based Dependency Validation
Every source file and analysis artifact carries an MD5/SHA checksum. The dependency graph uses these to implement a **Traffic Light system**: green (current), amber (upstream changed, re-run needed), red (broken dependency). No manual staleness checking required.

### Non-Destructive Archiving
Every execution run is archived before overwriting. Analysis history is preserved automatically — rolling back to a previous state of any module is a single command.

### Automated Reporting Layer
A Jinja2-based templating system generates standardized reports from completed analysis graphs. Output formats include PDF and HTML. Reports include source checksums, module revision history, and execution metadata — making them self-describing from an audit perspective.

### Electron + React UI
The visual interface runs as an Electron desktop application with a React frontend. The graph layout uses a frosted/glazed visual style. Module tiles are draggable, collapsible into containers, and inspectable without leaving the graph view — minimizing context switching during complex multi-module analyses.

## Outcome

VECTOR establishes a research methodology where AI assistance is rigorous by construction:

- Every analysis output links back to its source data via checksum
- Every logic decision is captured in the building block graph, not in a conversation transcript
- Re-running any analysis produces an identical result (reproducibility)
- Every version of every module is archived (non-destructive history)
- Reports are self-documenting and suitable for external stakeholder review

The platform is designed as the execution environment for all future AI-assisted engineering research — NOSTRADAMUS, VulcanOps, and any subsequent studies run inside VECTOR projects, giving every finding a complete audit trail from raw data to published result.
