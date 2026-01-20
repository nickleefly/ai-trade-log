# Execution Tasks: TradeZella Clone

This document lists the specific, actionable tasks required to implement the TradeZella Clone features, derived from `plan.md`.

---

## Phase 1: Navigation & Global Filters [x]
- [x] Implement `TopNavBar.tsx` with university/mentor/tracking links.
- [x] Implement `SidebarMenu.tsx` logic for collapsible navigation.
- [x] Add new routes to `PrivateLayoutClient.tsx`.
- [x] Build global `AccountSelector` and `DateRangePicker` components.
- [x] Integrate `GlobalFiltersBar` into Dashboard and History views.

## Phase 2: Day View & Metrics
- [ ] [P] Create `FullCalendar.tsx` with daily P&L color logic.
- [ ] [P] Build `DayTradeList.tsx` with expandable summary rows.
- [ ] Implement `MetricsBar.tsx` for `Trade View` and `Day View`.
- [ ] Integrate metrics calculation from `analyticsEngine.ts` into page data fetching.

## Phase 3: Dashboard Widgets [P]
- [ ] Build `WeeklySummaryCards.tsx`.
- [ ] Build `TradeTimeHeatmap.tsx` using MUI Charts.
- [ ] Build `DurationPerformanceChart.tsx`.
- [ ] Build `DrawdownChart.tsx`.

## Phase 4: Notebook & Knowledge Base
- [ ] Setup TipTap dependencies and basic configuration.
- [ ] Build `NotebookSidebar.tsx` with folder/tag tree.
- [ ] Implement `NoteEditor.tsx` with image upload support.
- [ ] Add "Link to Trade" typeahead slash-command to editor.

## Phase 5: Advanced Reports
- [ ] Refactor `/private/reports` into tabbed sub-navigation.
- [ ] Implement `PerformanceReport.tsx` (Zella Score focus).
- [ ] Implement `CompareReport.tsx` (Group vs Group logic).

## Phase 6: Polish & Verification
- [ ] Final visual audit against reference screenshots.
- [ ] Run full build: `npm run build`.
- [ ] Manual test of CSV imports for 4 different brokers.
- [ ] Finalize `walkthrough.md`.

---

*Legend: [P] = Can be executed in parallel.*
