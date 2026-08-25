# ADR 001: Financial Truth Isolation

## Context & Problem
Generative AI models are prone to hallucinations when performing floating point arithmetic or computing financial totals. In a payment recovery system, miscalculating GMV or fees leads to bad recovery decisions and non-compliant actions.

## Decision
All GMV, transaction metrics, fees, and Expected Value (EV) math must be computed deterministically in TypeScript (`core/revenue/`) using integer paise. LLMs are strictly prohibited from performing financial calculations.

## Consequences
- 100% accurate financial math.
- Zero accounting hallucinations.
- AI receives read-only facts context.
