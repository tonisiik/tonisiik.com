---
project: "[[POLARIS MOC]]"
title: 'Closed-Loop Quality Intelligence: From Messy Data to a Production Fix'
description: A multi-year root-cause program that traced a recurring casting defect to a supplier-chemistry × furnace-state interaction — using multi-source data integration, causal inference, and designed experiments — then drove the fix into production.
pubdate: '2026-06-11'
category: Manufacturing Decision Science
tags:
- Causal Inference
- Design of Experiments
- SPC
- Data Integration
- Metallurgy
- Quality Engineering
- Python
type: website-case-study
revision: R01
date_created: '2026-06-11'
date_modified: '2026-06-13'
---

# Closed-Loop Quality Intelligence: From Messy Data to a Production Fix

## The Challenge

A precision-casting foundry had a recurring, sporadic microstructure defect that had resisted explanation for years. Investigations cycled through the usual suspects — furnace lining, gas absorption, equipment wear — and never produced a stable root cause. Meanwhile the defect drove scrap, and the only quality gate was a subjective visual test that couldn't be trusted (see [Project CERES](/projects/ceres)).

The deeper problem: the evidence lived in five disconnected systems — spectrometer chemistry, melt and pour records, MES production data, warehouse movements, and shake-out quality outcomes. No single view existed to even ask *"what actually predicts this defect?"*

## The Approach

This was a decision-science problem, not a modelling contest. The loop was **integrate → diagnose → measure → intervene → standardize.**

### Integrate the evidence
Roughly 2,000 production charges were linked across all five source systems — incoming-material chemistry tied to the specific charges it ended up in, joined to process sensors, temperatures, and final QC outcomes.

### Find the cause, not the correlation
Instead of chasing a predictive model, the analysis used dose-response stratification, stratified contingency tests, and chemistry-adjusted logistic regression — and, crucially, **designed experiments**. A controlled doping trial and an overnight "bath-memory" natural experiment (re-pouring the same melt the next day) isolated causation that observational data alone could not.

The finding: the defect was driven by a **conjunction** — elevated incoming-supplier iron *and* an adverse furnace-atmosphere state, acting together as a strong interaction effect. A nine-element screen confirmed iron as the single chemical axis. The defect was actually *over-refinement* via iron-phosphide nucleation — the opposite of what its name implied.

### Close the loop
The findings became operator-facing decisions: a risk calculator (decision-tree, AUC 0.787), a **zero-CAPEX pour-temperature and batch-sequencing policy**, an incoming-material specification change, and quantitative acceptance criteria that replaced the subjective visual test.

## Technical Stack

- **Data integration:** Python (Pandas), SQL warehouse extraction, multi-key entity resolution across 5 systems
- **Causal analysis:** dose-response stratification, stratified χ²/Fisher tests, adjusted logistic regression, Design of Experiments
- **Measurement:** SEM/EDX particle analysis; objective grain measurement via CERES; Gage R&R
- **Delivery:** interactive risk calculator + structured technical and management reporting

## Outcome

- Operations adopted the pour-temperature and sequencing policy with **immediate effect and zero capital cost**.
- A process fix went **live in production**, with early quality stabilization, and supplier-iron limits were written into specification.
- A subjective, not-capable inspection was replaced with quantitative, auditable acceptance criteria.
- Behaviour changed across production, quality, supply chain, and suppliers — the hardest part of any quality improvement.

The value here wasn't a clever algorithm. It was closing the full loop — from fragmented plant data to a measured, adopted change on the shop floor.
