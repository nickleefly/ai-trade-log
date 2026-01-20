# Technical Implementation Plan: TradeAnaly Clone

This document maps the requirements defined in `spec.md` to technical architecture and implementation details, ensuring compliance with the project `constitution.md`.

---

## 1. Architectural Mapping

### [TECH-001] Page Structure
Implement new pages as Next.js App Router routes in `src/app/private/`.
- `/private/day-view`
- `/private/notebook`
- `/private/progress`
- `/private/resources`
- `/private/reports` (with sub-routes)

### [TECH-002] Data Layer
- **ORM**: Drizzle with PostgreSQL (Neon).
- **Caching**: React `useMemo` for heavy frontend calculations; Server-side fetching for initial payloads in Layout.
- **State**: Redux Toolkit for `tradeRecords` and `strategies`, as these are shared across multiple views.

### [TECH-003] Component Strategy
- **Base Components**: Shadcn/UI for consistent primitives (dropdowns, buttons, modals).
- **Charts**: MUI X-Charts for complex visualizations (Drawdown, Equity Curve); Recharts for simpler bars/lines.
- **Editor**: TipTap for the Notebook rich-text experience.

---

## 2. Implementation Phases

### Phase -1: Pre-Implementation Gates (Constitutional Check)
- [ ] **Simplicity Gate**: Using standard Next.js patterns?
- [ ] **Type Gate**: All new tables in `schema.ts` have Zod schemas?
- [ ] **Integration Gate**: `analyticsEngine.ts` covers the 20+ Analy metrics?

### Phase 1: Navigation & Layout Overhaul
- Update `PrivateLayoutClient.tsx` with new sidebar links.
- Create common `FiltersBar.tsx` for date/account selection across all pages.

### Phase 2: Analytics & Metrics
- Add calculated fields to `src/lib/analyticsEngine.ts` for Analy Score components.
- Implement `MetricsBar.tsx` as a reusable component for `History` and `Day-view`.

### Phase 3: Notebook & Organization
- Integrate TipTap into a new `NotebookEditor.tsx`.
- Implement folder/tag CRUD logic using Drizzle actions.

### Phase 4: Reports & Widgets
- Refactor `src/app/private/statistics/page.tsx` into a tabbed layout.
- Build the "Weekly Summary" cards using standard grid layouts.

---

## 3. Rationale & Trade-offs

| Decision | Rationale | Alternatives |
|----------|-----------|--------------|
| **TipTap Editor** | Highly extensible, block-based, headless UI matches our Tailwind setup. | Quill, Slate |
| **MUI X-Charts** | Better support for combined series and professional financial charts. | Chart.js, Recharts |
| **Centralized Analytics** | Ensures "Win Rate" is calculated the same way in Dashboard vs Reports. | Inline calculations |
