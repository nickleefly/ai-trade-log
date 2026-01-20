# Project Constitution: TradeZella Clone

This document defines the architectural DNA and development principles for the TradeZella Clone project. All specifications and implementations must adhere to these articles.

---

## Article I: Repository Truth
The specification documents (`spec.md`, `plan.md`) are the primary artifacts. Code is a derived asset. All architectural decisions must be documented in the `plan.md` with rationale tracing back to the `spec.md`.

## Article II: Modular UI (Library-First)
UI components should be built as reusable, standalone components in `src/components`. Avoid placing business logic directly in page components. Page components should primarily compose smaller, tested components.

## Article III: Type Safety Mandate
Total TypeScript coverage is non-negotiable.
- No `any` types.
- Strict Zod validation for all data boundaries (API, Forms, CSV).
- Drizzle ORM schemas are the source of truth for the database.

## Article IV: Test-Driven Integrity
Every calculated metric in the `analyticsEngine` must have unit tests. UI components should have associated validation scenarios defined in `spec.md`.

## Article V: Framework Discipline
Stick to standard Next.js and Shadcn/Tailwind patterns.
- Prefer server components for data fetching.
- Use Redux only for global application state (e.g., loaded trade records).
- Use React Hook Form with Zod for all inputs.

## Article VI: Simplicity & Anti-Abstraction
Avoid premature abstraction.
- Use framework features directly rather than building wrappers.
- Don't build for "future brokers" until the current ones are robust.
- Keep the project structure minimal.

## Article VII: Observability
All critical logic (parsers, analytics) must include informative logging or return structured error objects to ensure easy debugging.
