/**
 * CSV Parser utility for importing trades from Sierra Chart export.
 * Parses CSV content and maps columns to TradeTable fields.
 */

export interface ParsedTrade {
    id: string;
    positionType: string;
    openDate: string;
    openTime: string;
    closeDate: string;
    closeTime: string;
    isActiveTrade: boolean;
    instrumentName: string;
    symbolName: string;
    entryPrice: string;
    sellPrice: string;
    quantity: string;
    result: string;
    deposit: string;
    notes: string;
}

export interface CSVParseResult {
    trades: ParsedTrade[];
    errors: string[];
    skippedRows: number;
}

/**
 * Generate a unique ID for a trade based on its properties.
 */
function generateTradeId(symbol: string, openDate: string, openTime: string, positionType: string): string {
    const base = `${symbol}-${openDate}-${openTime}-${positionType}`;
    // Create a simple hash from the string
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        const char = base.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return `csv-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}`;
}

/**
 * Derive instrument name from symbol.
 * e.g., "MESZ5.CME" -> "MES Futures"
 */
function deriveInstrumentName(symbol: string): string {
    if (!symbol) return "Unknown";

    // Extract base symbol (before any period or number suffix)
    const baseMatch = symbol.match(/^([A-Z]+)/i);
    const base = baseMatch ? baseMatch[1].toUpperCase() : symbol;

    // Map common futures symbols to names
    const symbolMap: Record<string, string> = {
        'MES': 'Micro E-mini S&P 500',
        'ES': 'E-mini S&P 500',
        'MNQ': 'Micro E-mini Nasdaq-100',
        'NQ': 'E-mini Nasdaq-100',
        'MYM': 'Micro E-mini Dow',
        'YM': 'E-mini Dow',
        'M2K': 'Micro E-mini Russell 2000',
        'RTY': 'E-mini Russell 2000',
        'MCL': 'Micro WTI Crude Oil',
        'CL': 'WTI Crude Oil',
        'MGC': 'Micro Gold',
        'GC': 'Gold',
        'MBT': 'Micro Bitcoin',
        'BTC': 'Bitcoin',
        '6E': 'Euro FX',
        '6J': 'Japanese Yen',
        '6B': 'British Pound',
        'ZB': 'US Treasury Bond',
        'ZN': '10-Year T-Note',
        'ZF': '5-Year T-Note',
    };

    return symbolMap[base] || `${base} Futures`;
}

/**
 * Parse CSV content into trade objects.
 * Expects CSV format from convert_trades.py output.
 */
export function parseCSV(csvContent: string): CSVParseResult {
    const lines = csvContent.trim().split('\n');
    const trades: ParsedTrade[] = [];
    const errors: string[] = [];
    let skippedRows = 0;

    if (lines.length < 2) {
        return { trades: [], errors: ['CSV file is empty or has no data rows'], skippedRows: 0 };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    // Find column indices
    const columnMap: Record<string, number> = {};
    const requiredColumns = ['symbol', 'position_type', 'open_date', 'open_time'];

    header.forEach((col, index) => {
        columnMap[col] = index;
    });

    // Check required columns
    for (const col of requiredColumns) {
        if (columnMap[col] === undefined) {
            errors.push(`Missing required column: ${col}`);
        }
    }

    if (errors.length > 0) {
        return { trades: [], errors, skippedRows: 0 };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            skippedRows++;
            continue;
        }

        // Parse CSV line (handle quoted values)
        const values = parseCSVLine(line);

        try {
            const getValue = (colName: string): string => {
                const idx = columnMap[colName];
                return idx !== undefined ? (values[idx] || '').trim().replace(/['"]/g, '') : '';
            };

            const symbol = getValue('symbol');
            const positionType = getValue('position_type').toLowerCase();
            const openDate = getValue('open_date');
            const openTime = getValue('open_time');
            const closeDate = getValue('close_date');
            const closeTime = getValue('close_time');

            // Skip if missing critical data
            if (!symbol || !positionType || !openDate || !openTime) {
                errors.push(`Row ${i + 1}: Missing required fields`);
                skippedRows++;
                continue;
            }

            // Only import closed trades
            if (!closeDate || !closeTime) {
                skippedRows++;
                continue;
            }

            const entryPrice = getValue('entry_price');
            const sellPrice = getValue('exit_price');
            const quantity = getValue('quantity');

            // Convert profit_loss from decimal (e.g., "-4.00") to integer string (e.g., "-4")
            const rawResult = getValue('profit_loss') || getValue('ftf_profit_loss');
            const result = rawResult ? Math.round(parseFloat(rawResult)).toString() : '';

            const trade: ParsedTrade = {
                id: generateTradeId(symbol, openDate, openTime, positionType),
                positionType: positionType,
                openDate: openDate,
                openTime: openTime,
                closeDate: closeDate,
                closeTime: closeTime,
                isActiveTrade: false,
                instrumentName: deriveInstrumentName(symbol),
                symbolName: symbol,
                entryPrice: entryPrice,
                sellPrice: sellPrice,
                quantity: quantity,
                result: result,
                deposit: '0', // Default deposit
                notes: getValue('note'),
            };

            trades.push(trade);
        } catch (err) {
            errors.push(`Row ${i + 1}: Parse error - ${err instanceof Error ? err.message : 'Unknown error'}`);
            skippedRows++;
        }
    }

    return { trades, errors, skippedRows };
}

/**
 * Parse a single CSV line, handling quoted values.
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * Create a unique key for duplicate detection.
 */
export function getTradeKey(trade: ParsedTrade): string {
    return `${trade.symbolName}|${trade.openDate}|${trade.openTime}|${trade.positionType}`;
}
