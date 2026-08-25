# ADR 006: Reproducible Synthetic Batch Benchmarking

## Context & Problem
To demonstrate measured revenue recovery across 1,000+ payment failures without using private merchant data or fabricating results, a reproducible evaluation harness is required.

## Decision
Build a seeded PRNG batch generator (`--seed 20260825`) with an 80% calibration / 20% held-out dataset split, comparing 3 baseline strategies (No-Action, Deterministic Rules, MerchantPulse AI).

## Consequences
- 100% reproducible benchmark evaluation.
- Explicitly labeled synthetic dataset complying with Buildathon evaluation standards.
- Honest, empirical comparative measurement of AI net recovered GMV vs baselines.
