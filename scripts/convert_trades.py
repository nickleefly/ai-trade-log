#!/usr/bin/env python3
"""
Convert Sierra Chart TradesList.txt (TSV) to CSV format.
Aggregates trades into flat-to-flat positions (marked with 'F' or 'EP' suffix).
"""

import csv
import re
from datetime import datetime
from typing import Optional


def parse_datetime(dt_string: str) -> tuple[str, str]:
    """
    Parse datetime string like '2025-12-03  09:39:34.000 BP' or '2025-12-03  09:45:46.000'
    Returns (date, time) tuple.
    """
    # Remove trailing markers like 'BP', 'EP', 'F'
    clean = re.sub(r'\s*(BP|EP|F)$', '', dt_string.strip())
    # Remove extra spaces
    clean = re.sub(r'\s+', ' ', clean)
    
    try:
        dt = datetime.strptime(clean, '%Y-%m-%d %H:%M:%S.%f')
        return dt.strftime('%Y-%m-%d'), dt.strftime('%H:%M:%S')
    except ValueError:
        try:
            dt = datetime.strptime(clean, '%Y-%m-%d %H:%M:%S')
            return dt.strftime('%Y-%m-%d'), dt.strftime('%H:%M:%S')
        except ValueError:
            return clean, ''


def is_position_close(row: dict) -> bool:
    """
    Check if this row marks the close of a flat-to-flat position.
    Indicated by 'F' suffix in FlatToFlat Profit/Loss column or 'EP' in Exit DateTime.
    """
    ftf_pl = row.get('FlatToFlat Profit/Loss (C)', '')
    exit_dt = row.get('Exit DateTime', '')
    return ftf_pl.strip().endswith('F') or 'EP' in exit_dt


def clean_numeric(value: str) -> str:
    """Remove 'F' suffix and clean numeric values."""
    return re.sub(r'\s*F$', '', value.strip())


def extract_symbol_base(symbol: str) -> tuple[str, str]:
    """
    Extract base symbol and account from full symbol.
    e.g., 'MESZ5.CME (LFE050-3T7H2I3H-TEST001)' -> ('MESZ5.CME', 'LFE050-3T7H2I3H-TEST001')
    """
    match = re.match(r'^([^\(]+?)(?:\s*\(([^)]+)\))?$', symbol.strip())
    if match:
        base = match.group(1).strip()
        account = match.group(2) if match.group(2) else ''
        return base, account
    return symbol.strip(), ''


def convert_tradeslist_to_csv(input_file: str, output_file: str):
    """
    Convert TradesList.txt to CSV, keeping only flat-to-flat position closes.
    """
    trades = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        for row in reader:
            # Skip empty rows
            if not row.get('Symbol', '').strip():
                continue
            
            # Only keep rows that mark position close (flat-to-flat)
            if not is_position_close(row):
                continue
            
            symbol_raw = row.get('Symbol', '')
            symbol_base, account = extract_symbol_base(symbol_raw)
            
            open_date, open_time = parse_datetime(row.get('Entry DateTime', ''))
            close_date, close_time = parse_datetime(row.get('Exit DateTime', ''))
            
            trade_type = row.get('Trade Type', '').strip()
            position_type = 'long' if trade_type.lower() == 'long' else 'short'
            
            trade = {
                'symbol': symbol_base,
                'account': account,
                'quantity': row.get('Trade Quantity', '').strip(),
                'position_type': position_type,
                'entry_price': row.get('Entry Price', '').strip(),
                'exit_price': row.get('Exit Price', '').strip(),
                'open_date': open_date,
                'open_time': open_time,
                'close_date': close_date,
                'close_time': close_time,
                'duration': row.get('Duration', '').strip(),
                'profit_loss': clean_numeric(row.get('FlatToFlat Profit/Loss (C)', '')),
                'cumulative_pl': row.get('Cumulative Profit/Loss (C)', '').strip(),
                'max_open_loss': row.get('Max Open Loss (C)', '').strip(),
                'max_open_profit': row.get('Max Open Profit (C)', '').strip(),
                'commission': row.get('Commission (C)', '').strip(),
                'note': row.get('Note', '').strip(),
                'exit_efficiency': row.get('Exit Efficiency', '').strip(),
                'entry_efficiency': row.get('Entry Efficiency', '').strip(),
            }
            trades.append(trade)
    
    # Write to CSV
    if trades:
        fieldnames = list(trades[0].keys())
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(trades)
        
        print(f"Successfully converted {len(trades)} trades to {output_file}")
    else:
        print("No trades found to convert")


def convert_all_trades_to_csv(input_file: str, output_file: str):
    """
    Convert ALL rows from TradesList.txt to CSV (not just flat-to-flat closes).
    Use this if you want every trade record.
    """
    trades = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        for row in reader:
            # Skip empty rows
            if not row.get('Symbol', '').strip():
                continue
            
            symbol_raw = row.get('Symbol', '')
            symbol_base, account = extract_symbol_base(symbol_raw)
            
            open_date, open_time = parse_datetime(row.get('Entry DateTime', ''))
            close_date, close_time = parse_datetime(row.get('Exit DateTime', ''))
            
            trade_type = row.get('Trade Type', '').strip()
            position_type = 'long' if trade_type.lower() == 'long' else 'short'
            
            trade = {
                'symbol': symbol_base,
                'account': account,
                'quantity': row.get('Trade Quantity', '').strip(),
                'position_type': position_type,
                'entry_price': row.get('Entry Price', '').strip(),
                'exit_price': row.get('Exit Price', '').strip(),
                'open_date': open_date,
                'open_time': open_time,
                'close_date': close_date,
                'close_time': close_time,
                'duration': row.get('Duration', '').strip(),
                'profit_loss': clean_numeric(row.get('Profit/Loss (C)', '')),
                'ftf_profit_loss': clean_numeric(row.get('FlatToFlat Profit/Loss (C)', '')),
                'cumulative_pl': row.get('Cumulative Profit/Loss (C)', '').strip(),
                'max_open_loss': row.get('Max Open Loss (C)', '').strip(),
                'max_open_profit': row.get('Max Open Profit (C)', '').strip(),
                'commission': row.get('Commission (C)', '').strip(),
                'note': row.get('Note', '').strip(),
                'exit_efficiency': row.get('Exit Efficiency', '').strip(),
                'entry_efficiency': row.get('Entry Efficiency', '').strip(),
                'is_position_close': 'Y' if is_position_close(row) else 'N',
            }
            trades.append(trade)
    
    # Write to CSV
    if trades:
        fieldnames = list(trades[0].keys())
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(trades)
        
        print(f"Successfully converted {len(trades)} trades to {output_file}")
    else:
        print("No trades found to convert")


if __name__ == '__main__':
    import sys
    
    input_file = 'TradesList.txt'
    output_file = 'trades.csv'
    
    # Check command line args
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    print(f"Converting {input_file} to {output_file}...")
    
    # Use flat-to-flat aggregated trades (recommended)
    convert_tradeslist_to_csv(input_file, output_file)
    
    # Uncomment below to export ALL trade records instead:
    # convert_all_trades_to_csv(input_file, output_file.replace('.csv', '_all.csv'))
