---
project: "[[POLARIS MOC]]"
title: 'Project V3CTOR: A Reproducibility Engine for Data-Driven Decisions'
description: An MCP server that makes reproducible, auditable analysis the path of least resistance — enforcing pre-registration, full lineage, deterministic execution, and tamper-evident integrity at the tool layer. The adoption-first successor to an earlier research engine.
pubdate: '2026-06-14'
category: AI Infrastructure
tags:
- MCP
- Python
- Reproducibility
- Data Governance
- AI Infrastructure
- Research Methodology
type: website-case-study
revision: R02
date_created: '2026-06-13'
date_modified: '2026-06-14'
---

# Project V3CTOR: A Reproducibility Engine for Data-Driven Decisions

## The Challenge

When analysis drives real decisions — process changes, supplier specifications, quality gates — the analysis itself has to be trustworthy. Not "the chart looks right," but: can you reproduce it next month? Trace every reported number back to its source? Prove the hypothesis wasn't invented *after* seeing the data? Show exactly what changed when a result changes? Most analysis quietly fails this bar. The logic lives in notebooks and chat transcripts, and "reproducible" really means "probably."

## The Lesson That Shaped It

V3CTOR's predecessor, **VECTOR**, tried to solve this with a graph-based desktop UI that constrained AI to execute inside a user-defined logic graph. The data model was right — but it failed where it mattered: **adoption**. It demanded ceremony before it delivered value, so it didn't get used. That failure produced V3CTOR's founding rule: *make the rigorous path the path of least resistance, and enforce it at the tool layer rather than relying on discipline.*

## The Approach

V3CTOR is an **MCP (Model Context Protocol) server**: an AI agent — or a person — does analysis through a set of tools that *cannot* skip the guardrails.

- **Tamper-evident integrity** — an append-only, hash-chained event log records every action; lockfile manifests are verified at read time; a traffic-light status (green / amber / red) shows at a glance whether anything downstream is stale or broken.
- **Pre-registration, enforced** — confirmatory analyses must declare hypothesis, method, data pins, filters, and seed *before* running, logged and hash-pinned. This makes HARKing (hypothesising after results are known) structurally impossible, not merely discouraged.
- **A two-tier golden-source library** — curated, immutable source snapshots with canonical keys and join edges, so every analysis draws from vetted, versioned data instead of ad-hoc extracts.
- **Determinism by default** — canonical writers, fixed seeds, and pinned environments make outputs byte-stable and reproducible by construction; stochastic outputs get explicit tolerance semantics.
- **A module state machine** — analysis modules move draft → developed → validated → released through hard gates; a red light blocks promotion.
- **A self-contained atlas** — every project renders to a single navigable HTML file showing the module graph, hypothesis board, data dictionary, and decision log — readable without the tool that produced it.

## Technical Stack

- Python 3.12, FastMCP (MCP server), pydantic + pandera (schema contracts)
- SQLite (derivable index), networkx (DAG), Jinja2 (atlas), DuckDB / Polars / statsmodels (analysis kernel, pinned environment)
- Cryptographic hash-chained event log; deterministic canonical serialisers

## Status

Built and proven on real data. The full lifecycle — capture → model → analyse → validate → release → report → reproduce — is implemented with enforcement at every gate: roughly 3,700 lines of Python running as a live MCP toolset of **22 tools**, backed by a full automated test suite. The specification was frozen only after two independent adversarial reviews and 30+ findings were incorporated.

It has now been **proven end-to-end on a real foundry quality root-cause study** — tiered sources → modelled → validated → released → reported → independently reviewed → reproduced to identical hashes. Next: a live data-warehouse connector, out-of-sample confirmation of the headline findings, and broader rollout.

> V3CTOR is the system layer: it turns one-off expert analysis into a reusable, auditable capability that an engineer — or an AI agent — can run without re-deriving the discipline each time.
