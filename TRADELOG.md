# Trade Log CSV Import Guide

## Overview

The AI Trading Journal can import trades from CSV files. This is designed to work with exports from Sierra Chart's Trade Activity Log.

## Required CSV Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `symbol` | ✅ | Trading symbol | `MESZ5.CME` |
| `position_type` | ✅ | `long` or `short` | `short` |
| `open_date` | ✅ | Entry date (YYYY-MM-DD) | `2025-12-03` |
| `open_time` | ✅ | Entry time (HH:MM:SS) | `09:39:34` |
| `close_date` | ✅ | Exit date (YYYY-MM-DD) | `2025-12-03` |
| `close_time` | ✅ | Exit time (HH:MM:SS) | `10:45:58` |
| `entry_price` | Optional | Entry price | `6832.00` |
| `exit_price` | Optional | Exit price | `6840.00` |
| `quantity` | Optional | Number of contracts | `4` |
| `profit_loss` | Optional | P/L (rounded to integer) | `56.00` |
| `note` | Optional | Trade notes | `ES-14tp-7sl.twconfig` |

## Example CSV

```csv
symbol,position_type,open_date,open_time,close_date,close_time,entry_price,exit_price,quantity,profit_loss,note
MESZ5.CME,short,2025-12-03,09:39:34,2025-12-03,09:46:21,6832.00,6832.00,2,-4.00,ES-14tp-7sl.twconfig
MESZ5.CME,short,2025-12-03,10:28:41,2025-12-03,10:29:14,6843.00,6840.00,4,56.00,ES-14tp-7sl.twconfig
```

## Converting from Sierra Chart

Use the provided Python script:

```bash
python scripts/convert_trades.py TradesList.txt trades.csv
```

This converts Sierra Chart's tab-separated format to the CSV format above.

## Notes

- Only **closed trades** (with close date/time) are imported
- **Duplicates** are automatically skipped (based on symbol + open date/time + position type)
- **Instrument names** are auto-derived from symbols (e.g., `MES` → "Micro E-mini S&P 500")
- **Deposit** defaults to `0` for imported trades
