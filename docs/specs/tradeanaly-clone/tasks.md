# Execution Tasks: TradeAnaly Clone

This document lists the specific, actionable tasks required to implement the TradeAnaly Clone features, derived from `plan.md`.

---

## Phase 1: Navigation & Global Filters [x]
- [x] Implement `TopNavBar.tsx` with university/mentor/tracking links.
- [x] Implement `SidebarMenu.tsx` logic for collapsible navigation.
- [x] Add new routes to `PrivateLayoutClient.tsx`.
- [x] Build global `AccountSelector` and `DateRangePicker` components.
- [x] Integrate `GlobalFiltersBar` into Dashboard and History views.

## Phase 2: Day View & Metrics [x]
- [x] Setup Day View page structure at `/private/day-view`
- [x] Create `DayMetricsBar.tsx` using `analyticsEngine.ts`
- [x] Implement `DailyTradeGroup.tsx` for expandable day rows
- [x] Integrate `useFilteredTrades` for real-time data in Day View
- [x] Add Day View metrics to Trade History page

## Phase 3: Dashboard Widgets [x]
- [x] Create `WeeklySummary.tsx` for rolling 4-week performance
- [x] Implement `TradeTimeHeatmap.tsx` using MUI X-Charts (Time of Day vs Day of Week)
- [x] Build `DurationPerformanceChart.tsx` (Hold Time vs Profitability)
- [x] Implement `AdvancedDrawdownChart.tsx` with peak-to-trough visualization
- [x] Integrated widgets into the main Dashboard page

## Phase 4: Notebook & Knowledge Base
- [ ] Setup TipTap dependencies and basic configuration.
- [ ] Build `NotebookSidebar.tsx` with folder/tag tree.
- [ ] Implement `NoteEditor.tsx` with image upload support.
- [ ] Add "Link to Trade" typeahead slash-command to editor.

## Phase 5: Advanced Reports
- [ ] Refactor `/private/reports` into tabbed sub-navigation.
- [ ] Implement `PerformanceReport.tsx` (Analy Score focus).
- [ ] Implement `CompareReport.tsx` (Group vs Group logic).

## Phase 6: Polish & Verification
- [ ] Final visual audit against reference screenshots.
- [ ] Run full build: `npm run build`.
- [ ] Manual test of CSV imports for 4 different brokers.
- [ ] Finalize `walkthrough.md`.

---

*Legend: [P] = Can be executed in parallel.*
