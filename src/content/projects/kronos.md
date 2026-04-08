---
project: "[[POLARIS MOC]]"
title: 'Project KRONOS: Building a Personal AI Operating System'
description: Replacing a file-scan knowledge base with a live SQLite runtime, 38 MCP tools, and a full-stack Electron management console.
pubdate: '2026-04-07'
heroimage: /projects/kronos-hero.png
category: Software Engineering
tags:
- Python
- Electron
- FastAPI
- SQLite
- AI Infrastructure
type: website-case-study
revision: R01
date_created: '2026-04-07'
date_modified: '2026-04-07'
---

# Project KRONOS: A Personal AI Operating System

## The Challenge

A knowledge vault of 2,000+ notes is only as useful as the speed at which information can be retrieved. The FuSiON vault started as an Obsidian notebook and evolved into an AI-augmented productivity system — but the architecture underneath hadn't kept pace. File-scan-based indexing meant:

- Rebuilding indexes manually after every significant vault update
- Agent queries scanning thousands of files on every request (3–8 second latency)
- External data (calendar, email, fitness) fetched live on every call with no caching
- Windows Task Scheduler managing dozens of fragile scheduled jobs

The goal of **Project KRONOS** was to close this structural gap by replacing the file-scan layer with a live, always-current database backend.

## The Architecture

KRONOS introduces a persistent Python runtime sitting between the vault and the AI agent layer. It runs four concurrent threads:

```
Obsidian (human UI — unchanged)
        ↕ filesystem events
FuSiON Runtime (single Python process)
    ├── MCP Server       (38 tools, SQL-backed)
    ├── Watcher Thread   (vault → SQLite sync, <2s)
    ├── Scheduler Thread (APScheduler, replaces Task Scheduler)
    └── API Broker       (calendar / email / fitness, cached)
        ↕ fusion.db (SQLite, WAL mode)
        ↕ delta export/import
openFusion SQLite — replicated backup node
        ↕ FastAPI
Electron Frontend — runtime health console
```

## Key Technical Work

### 1. Real-Time Vault Watcher
A filesystem event listener propagates any Obsidian file save to SQLite within 2 seconds. The database schema mirrors the vault structure (notes, tasks, projects, tags, links, journal entries) in WAL mode for concurrent read performance.

### 2. MCP Tool Rewrite (38 Tools)
All 38 Model Context Protocol tools were migrated from file-scan implementations to SQL queries. External signatures remain identical — the AI agent layer required no changes. Query latency dropped from file-scan baseline to sub-100ms for most operations.

### 3. API Broker
A caching broker pre-fetches Google Calendar, Gmail, and fitness data on a configurable schedule. MCP tool calls that previously hit external APIs live now return from cache in under 100ms.

### 4. Scheduler Consolidation
All scheduled FuSiON jobs (daily digest, index refresh, fitness sync, evening ritual) migrated from Windows Task Scheduler to APScheduler running in-process. Jobs are visible and controllable from the Electron console.

### 5. 5-Tier Python Environment Architecture
To manage dependency isolation across a mixed workload (real-time MCP gateway, direct ChromaDB operations, ML/vision, UI layer, development sandbox), the project uses five purpose-built virtual environments:

| Tier | Environment | Purpose |
|------|-------------|---------|
| 1 | `mcp` | Gateway, real-time tools |
| 2 | `analysis` | Reports, direct ChromaDB |
| 3 | `research` | ML/Vision (TensorFlow, OpenCV) |
| 4 | `vector` | UI application layer |
| 5 | `antigravity` | Dev sandbox |

### 6. Electron Management Console
An Electron desktop app provides runtime health monitoring: watcher status, scheduler job list, API broker cache state, and SQLite stats. No note viewing — purely an operational dashboard.

## Outcome

- Zero manual index rebuilds in standard working sessions
- Sub-100ms agent context delivery for task, project, and calendar queries
- Full vault-to-AI pipeline observable and controllable from a single console
- Scheduler, broker, and watcher lifecycle managed as a single process

KRONOS demonstrates that the same engineering discipline applied to enterprise software (event-driven architecture, WAL databases, connection pool management, multi-threaded service design) transfers directly to personal productivity infrastructure.
