---
project: "[[POLARIS MOC]]"
title: 'Project CERES: Automated Grain-Size Measurement with Deep Learning'
description: A production computer-vision system that replaces a subjective manual metallography test with an objective, validated grain-size measurement — packaged as an offline desktop app with an active-learning correction loop.
pubdate: '2026-06-06'
category: Computer Vision
tags:
- Computer Vision
- Deep Learning
- Python
- PyTorch
- Metallurgy
- MLOps
- Electron
type: website-case-study
revision: R01
date_created: '2026-06-06'
date_modified: '2026-06-13'
---

# Project CERES: Automated Grain-Size Measurement with Deep Learning

## The Challenge

Grain size is one of the most important quality indicators for cast metal parts — it governs mechanical properties and signals upstream process problems. But measuring it reliably is surprisingly hard:

- The incumbent shop-floor method was a subjective "breaking-surface" visual assessment. A formal measurement-system analysis (Gage R&R) showed it was **not capable** — two trained assessors could disagree on the same sample.
- An earlier automation prototype collapsed on fine-grained microstructures, where polish texture and annealing twins were misread as grain boundaries.
- Manual grain counting under the microscope is slow and does not scale to production volumes.

## The Approach

CERES treats grain measurement as an **instance-segmentation** problem and wraps it in a workflow a metallurgist can actually run.

### A fine-tuned segmentation model
A Cellpose-SAM instance-segmentation model was fine-tuned on a hand-vetted, gold-standard set of micrographs. A hybrid "seed + watershed fill" strategy handles both extremes at once — large, wall-spanning grains and fine-grained regions — which a single-scale model cannot.

### Measurement, not just detection
The pipeline computes the metrics quality engineers actually use: ASTM E112 grain-size number, full size distributions (D10/D50/D90), and a spatial-homogeneity metric that flags segregation as an independent quality axis beyond average grain size. Automatic scale-bar detection calibrates every image.

### An active-learning correction flywheel
CERES ships as an offline desktop application with an interactive correction editor: the model predicts, the metallurgist corrects (delete spurious grains, paint in missed ones), and those corrections feed back as new gold labels for the next training round. The system gets better the more it is used.

## Technical Stack

- **Deep learning:** PyTorch, Cellpose-SAM fine-tuning, multi-scale inference
- **Computer vision:** scikit-image (watershed, regionprops), CLAHE contrast enhancement, sub-pixel scale calibration
- **Application:** Electron + React frontend, FastAPI + SQLite backend, fully offline (vendored Python runtime + model)
- **Domain:** ASTM E112 planimetric grain sizing; robust across leaded and lead-free copper alloys

## Outcome

- **r = 0.97 agreement (≈2% MAPE)** against hand-vetted gold-standard measurements on held-out specimens.
- **~3× more accurate** on grain counts than the earlier prototype.
- Adopted as the **objective measurement gate** inside a foundry quality program — the role the not-capable manual test could never fill.
- The correction flywheel lifted fine-grain recall from 43% to 62% in a single retraining round, with a clear path to keep improving.

CERES turns a subjective, non-reproducible inspection into a fast, auditable, self-improving measurement — the kind of objective instrument a data-driven quality program is built on.
