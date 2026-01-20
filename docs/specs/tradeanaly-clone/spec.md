# Feature Specification: TradeAnaly Clone

This specification defines the functional requirements for replicating the TradeAnaly trading journal experience.

---

## 1. User Stories

### Dashboard & Analytics
- **As a trader**, I want to see my monthly P&L at a glance on a calendar so I can quickly identify profitable days.
- **As a trader**, I want to see my account balance curve and drawdown to understand my risk exposure.
- **As a trader**, I want to see my performance by trade time and duration to optimize my trading session.

### Trade Management
- **As a trader**, I want to group my trades by day to review my daily performance in context.
- **As a trader**, I want to see high-level metrics (Win Rate, Profit Factor, etc.) directly on my trade list.
- **As a trader**, I want to import my trades from multiple brokers (ThinkorSwim, Sierra Chart) seamlessly.

### Organization
- **As a trader**, I want to organize my journal entries into folders and tags for easy retrieval.
- **As a trader**, I want to link specific trades to my notebook entries for deep reflection.

---

## 2. Functional Requirements

### [FR-001] Dashboard Calendar
- The main view must show a monthly calendar grid.
- Each cell must display the date and the net P&L for that day.
- Profitable days should be green, losing days red, and break-even/empty days neutral.

### [FR-002] Analytics Widgets
- Implement "Weekly Summary" cards showing total P&L and days traded per week.
- Implement "Account Balance" line chart.
- Implement "Drawdown" area chart.
- Implement "Trade Time" heatmap (P&L vs. Hour of Day).

### [FR-003] Trade View Metrics Bar
- Top of the trade history page must display: Net P&L (Cumulative), Profit Factor, Win %, and Avg Win/Loss.

### [FR-004] Day View Grouping
- Create a view that groups trades by `closeDate`.
- Each "Day" row must be expandable to show the individual trades within it.

### [FR-005] Notebook Management
- Support folder-based organization for notes.
- Support a rich-text editor for journaling.
- Allow tagging notes with multiple color-coded tags.

---

## 3. Acceptance Criteria

| ID | Criteria |
|----|----------|
| **AC-001** | Calendar cells must accurately reflect the sum of trade `result` fields for that day. |
| **AC-002** | Analytics charts must update instantly when filters (date range, account) change. |
| **AC-003** | CSV Import must detect the broker format automatically and map columns correctly. |
| **AC-004** | Analy Score calculation must match the documented formula in the engine. |
| **AC-005** | Sidebar navigation must include links to all new pages (Day View, Notebook, Progress). |
