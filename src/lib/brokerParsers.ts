/**
 * Broker-specific CSV parsers for TradeZella-style multi-broker import.
 * Supports: ThinkorSwim, Interactive Brokers, TradeStation, Sierra Chart
 */

import { ParsedTrade } from './csvParser';

// ============================================
// Types
// ============================================

export interface BrokerParser {
    name: string;
    displayName: string;
    detect: (headers: string[]) => boolean;
    parse: (rows: string[][], headers: string[]) => BrokerParseResult;
}

export interface BrokerParseResult {
    trades: ParsedTrade[];
    errors: string[];
    skippedRows: number;
}

// ============================================
// Helper Functions
// ============================================

function generateTradeId(symbol: string, openDate: string, openTime: string, positionType: string): string {
    const base = `${symbol}-${openDate}-${openTime}-${positionType}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        const char = base.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `import-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}`;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function normalizeDate(dateStr: string): string {
    // Convert various date formats to YYYY-MM-DD
    if (!dateStr) return '';

    // Already in correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    // MM/DD/YYYY or M/D/YYYY
    const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdyMatch) {
        const [, m, d, y] = mdyMatch;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // DD/MM/YYYY
    const dmyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    return dateStr;
}

function normalizeTime(timeStr: string): string {
    if (!timeStr) return '';

    // Remove AM/PM and convert to 24h if needed
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (match) {
        let [, h, m, s = '00', ampm] = match;
        let hour = parseInt(h, 10);

        if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
            if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
        }

        return `${hour.toString().padStart(2, '0')}:${m}:${s}`;
    }

    return timeStr;
}

function deriveInstrumentName(symbol: string): string {
    if (!symbol) return 'Unknown';

    const baseMatch = symbol.match(/^([A-Z]+)/i);
    const base = baseMatch ? baseMatch[1].toUpperCase() : symbol;

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
        'SPY': 'SPDR S&P 500 ETF',
        'QQQ': 'Invesco Nasdaq-100 ETF',
        'AAPL': 'Apple Inc',
        'MSFT': 'Microsoft Corp',
        'NVDA': 'NVIDIA Corp',
        'TSLA': 'Tesla Inc',
        'AMD': 'AMD Inc',
    };

    return symbolMap[base] || `${base}`;
}

// ============================================
// ThinkorSwim Parser
// ============================================

const thinkorswimParser: BrokerParser = {
    name: 'thinkorswim',
    displayName: 'TD Ameritrade / ThinkorSwim',

    detect: (headers) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        // TOS typically has these columns
        return (
            lowerHeaders.includes('exec time') ||
            lowerHeaders.includes('symbol') && lowerHeaders.includes('side') && lowerHeaders.includes('qty')
        ) && lowerHeaders.includes('price');
    },

    parse: (rows, headers) => {
        const trades: ParsedTrade[] = [];
        const errors: string[] = [];
        let skippedRows = 0;

        const lowerHeaders = headers.map(h => h.toLowerCase().trim());
        const getIdx = (name: string) => lowerHeaders.indexOf(name);

        // TOS column indices
        const execTimeIdx = getIdx('exec time');
        const symbolIdx = getIdx('symbol');
        const sideIdx = getIdx('side');
        const qtyIdx = getIdx('qty');
        const priceIdx = getIdx('price');
        const posEffectIdx = getIdx('pos effect');

        // Group trades by symbol to match opens with closes
        const openTrades: Map<string, { row: string[], idx: number }[]> = new Map();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4) {
                skippedRows++;
                continue;
            }

            try {
                const symbol = row[symbolIdx]?.replace(/['"]/g, '').trim();
                const side = row[sideIdx]?.toLowerCase().trim();
                const posEffect = row[posEffectIdx]?.toLowerCase().trim() || '';
                const qty = row[qtyIdx]?.replace(/['"]/g, '').trim();
                const price = row[priceIdx]?.replace(/[$,'"]/g, '').trim();
                const execTime = row[execTimeIdx]?.trim();

                if (!symbol || !side || !qty || !price) {
                    skippedRows++;
                    continue;
                }

                const isOpen = posEffect === 'to open' || side === 'buy';
                const isClose = posEffect === 'to close' || side === 'sell';

                if (isOpen && !isClose) {
                    // Store open trade for matching
                    const key = symbol;
                    if (!openTrades.has(key)) openTrades.set(key, []);
                    openTrades.get(key)!.push({ row, idx: i });
                } else if (isClose) {
                    // Match with open trade
                    const key = symbol;
                    const opens = openTrades.get(key);

                    if (opens && opens.length > 0) {
                        const openTrade = opens.shift()!;
                        const openRow = openTrade.row;

                        // Parse datetime
                        const openExecTime = openRow[execTimeIdx]?.trim();
                        const [openDate, openTime] = parseDateTime(openExecTime);
                        const [closeDate, closeTime] = parseDateTime(execTime);

                        const openPrice = openRow[priceIdx]?.replace(/[$,'"]/g, '').trim();
                        const openQty = openRow[qtyIdx]?.replace(/['"]/g, '').trim();
                        const openSide = openRow[sideIdx]?.toLowerCase().trim();

                        const positionType = openSide === 'buy' ? 'long' : 'short';
                        const entryP = parseFloat(openPrice || '0');
                        const exitP = parseFloat(price);
                        const quantity = parseFloat(openQty || qty);

                        // Calculate P&L
                        let pnl = 0;
                        if (positionType === 'long') {
                            pnl = (exitP - entryP) * quantity * 100; // *100 for options
                        } else {
                            pnl = (entryP - exitP) * quantity * 100;
                        }

                        trades.push({
                            id: generateTradeId(symbol, openDate, openTime, positionType),
                            positionType,
                            openDate,
                            openTime,
                            closeDate,
                            closeTime,
                            isActiveTrade: false,
                            instrumentName: deriveInstrumentName(symbol),
                            symbolName: symbol,
                            entryPrice: openPrice,
                            sellPrice: price,
                            quantity: openQty || qty,
                            result: pnl.toFixed(2),
                            deposit: '0',
                            notes: '',
                        });
                    } else {
                        errors.push(`Row ${i + 2}: No matching open trade for ${symbol}`);
                        skippedRows++;
                    }
                }
            } catch (err) {
                errors.push(`Row ${i + 2}: Parse error`);
                skippedRows++;
            }
        }

        return { trades, errors, skippedRows };
    }
};

function parseDateTime(execTime: string): [string, string] {
    if (!execTime) return ['', ''];

    // Format: "MM/DD/YY HH:MM:SS" or "YYYY-MM-DD HH:MM:SS"
    const parts = execTime.split(' ');
    if (parts.length >= 2) {
        return [normalizeDate(parts[0]), normalizeTime(parts[1])];
    }
    return [normalizeDate(execTime), '09:30:00'];
}

// ============================================
// Interactive Brokers Parser
// ============================================

const ibkrParser: BrokerParser = {
    name: 'ibkr',
    displayName: 'Interactive Brokers',

    detect: (headers) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        return (
            lowerHeaders.includes('symbol') &&
            (lowerHeaders.includes('date/time') || lowerHeaders.includes('datetime')) &&
            (lowerHeaders.includes('realized p/l') || lowerHeaders.includes('t. price'))
        );
    },

    parse: (rows, headers) => {
        const trades: ParsedTrade[] = [];
        const errors: string[] = [];
        let skippedRows = 0;

        const lowerHeaders = headers.map(h => h.toLowerCase().trim());
        const getIdx = (name: string) => lowerHeaders.findIndex(h => h.includes(name));

        const symbolIdx = getIdx('symbol');
        const dateTimeIdx = lowerHeaders.findIndex(h => h.includes('date/time') || h.includes('datetime'));
        const qtyIdx = getIdx('quantity');
        const priceIdx = lowerHeaders.findIndex(h => h.includes('t. price') || h.includes('trade price'));
        const pnlIdx = lowerHeaders.findIndex(h => h.includes('realized p/l'));
        const codeIdx = getIdx('code');

        // IBKR groups trades - look for completed trades with P&L
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4) {
                skippedRows++;
                continue;
            }

            try {
                const pnlStr = row[pnlIdx]?.replace(/[$,'"]/g, '').trim();
                const pnl = parseFloat(pnlStr || '0');

                // Skip rows without realized P&L (open positions)
                if (!pnlStr || pnl === 0) {
                    skippedRows++;
                    continue;
                }

                const symbol = row[symbolIdx]?.replace(/['"]/g, '').trim();
                const dateTime = row[dateTimeIdx]?.trim();
                const qty = row[qtyIdx]?.replace(/['"]/g, '').trim();
                const price = row[priceIdx]?.replace(/[$,'"]/g, '').trim();

                if (!symbol || !dateTime) {
                    skippedRows++;
                    continue;
                }

                const [date, time] = parseDateTime(dateTime);
                const quantity = parseFloat(qty || '0');
                const positionType = quantity > 0 ? 'long' : 'short';

                trades.push({
                    id: generateTradeId(symbol, date, time, positionType),
                    positionType,
                    openDate: date,
                    openTime: time,
                    closeDate: date,
                    closeTime: time,
                    isActiveTrade: false,
                    instrumentName: deriveInstrumentName(symbol),
                    symbolName: symbol,
                    entryPrice: price,
                    sellPrice: price,
                    quantity: Math.abs(quantity).toString(),
                    result: pnl.toFixed(2),
                    deposit: '0',
                    notes: '',
                });
            } catch (err) {
                errors.push(`Row ${i + 2}: Parse error`);
                skippedRows++;
            }
        }

        return { trades, errors, skippedRows };
    }
};

// ============================================
// TradeStation Parser
// ============================================

const tradeStationParser: BrokerParser = {
    name: 'tradestation',
    displayName: 'TradeStation',

    detect: (headers) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        return (
            lowerHeaders.includes('symbol') &&
            lowerHeaders.includes('filled') &&
            (lowerHeaders.includes('avgprice') || lowerHeaders.includes('avg price'))
        );
    },

    parse: (rows, headers) => {
        const trades: ParsedTrade[] = [];
        const errors: string[] = [];
        let skippedRows = 0;

        const lowerHeaders = headers.map(h => h.toLowerCase().trim());
        const getIdx = (name: string) => lowerHeaders.findIndex(h => h.includes(name));

        const symbolIdx = getIdx('symbol');
        const filledIdx = getIdx('filled');
        const typeIdx = getIdx('type');
        const qtyIdx = getIdx('qty') !== -1 ? getIdx('qty') : getIdx('quantity');
        const priceIdx = getIdx('avgprice') !== -1 ? getIdx('avgprice') : getIdx('avg price');

        // Similar grouping logic as TOS
        const openTrades: Map<string, { row: string[], idx: number }[]> = new Map();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4) {
                skippedRows++;
                continue;
            }

            try {
                const symbol = row[symbolIdx]?.replace(/['"]/g, '').trim();
                const type = row[typeIdx]?.toLowerCase().trim();
                const filled = row[filledIdx]?.trim();
                const qty = row[qtyIdx]?.replace(/['"]/g, '').trim();
                const price = row[priceIdx]?.replace(/[$,'"]/g, '').trim();

                if (!symbol || !type || !qty || !price) {
                    skippedRows++;
                    continue;
                }

                const isBuy = type.includes('buy');
                const isSell = type.includes('sell');

                if (isBuy) {
                    if (!openTrades.has(symbol)) openTrades.set(symbol, []);
                    openTrades.get(symbol)!.push({ row, idx: i });
                } else if (isSell) {
                    const opens = openTrades.get(symbol);

                    if (opens && opens.length > 0) {
                        const openTrade = opens.shift()!;
                        const openRow = openTrade.row;

                        const [openDate, openTime] = parseDateTime(openRow[filledIdx]?.trim());
                        const [closeDate, closeTime] = parseDateTime(filled);
                        const openPrice = openRow[priceIdx]?.replace(/[$,'"]/g, '').trim();

                        const entryP = parseFloat(openPrice || '0');
                        const exitP = parseFloat(price);
                        const quantity = parseFloat(qty);
                        const pnl = (exitP - entryP) * quantity;

                        trades.push({
                            id: generateTradeId(symbol, openDate, openTime, 'long'),
                            positionType: 'long',
                            openDate,
                            openTime,
                            closeDate,
                            closeTime,
                            isActiveTrade: false,
                            instrumentName: deriveInstrumentName(symbol),
                            symbolName: symbol,
                            entryPrice: openPrice,
                            sellPrice: price,
                            quantity: qty,
                            result: pnl.toFixed(2),
                            deposit: '0',
                            notes: '',
                        });
                    }
                }
            } catch (err) {
                errors.push(`Row ${i + 2}: Parse error`);
                skippedRows++;
            }
        }

        return { trades, errors, skippedRows };
    }
};

// ============================================
// Sierra Chart Parser (existing format)
// ============================================

const sierraChartParser: BrokerParser = {
    name: 'sierrachart',
    displayName: 'Sierra Chart',

    detect: (headers) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        return (
            lowerHeaders.includes('symbol') &&
            lowerHeaders.includes('position_type') &&
            lowerHeaders.includes('open_date') &&
            lowerHeaders.includes('profit_loss')
        );
    },

    parse: (rows, headers) => {
        const trades: ParsedTrade[] = [];
        const errors: string[] = [];
        let skippedRows = 0;

        const lowerHeaders = headers.map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
        const getIdx = (name: string) => lowerHeaders.indexOf(name);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                const getValue = (colName: string): string => {
                    const idx = getIdx(colName);
                    return idx !== -1 ? (row[idx] || '').trim().replace(/['"]/g, '') : '';
                };

                const symbol = getValue('symbol');
                const positionType = getValue('position_type').toLowerCase();
                const openDate = getValue('open_date');
                const openTime = getValue('open_time');
                const closeDate = getValue('close_date');
                const closeTime = getValue('close_time');

                if (!symbol || !positionType || !openDate || !openTime || !closeDate || !closeTime) {
                    skippedRows++;
                    continue;
                }

                const rawResult = getValue('profit_loss') || getValue('ftf_profit_loss');
                const result = rawResult ? Math.round(parseFloat(rawResult)).toString() : '';

                trades.push({
                    id: generateTradeId(symbol, openDate, openTime, positionType),
                    positionType,
                    openDate,
                    openTime,
                    closeDate,
                    closeTime,
                    isActiveTrade: false,
                    instrumentName: deriveInstrumentName(symbol),
                    symbolName: symbol,
                    entryPrice: getValue('entry_price'),
                    sellPrice: getValue('exit_price'),
                    quantity: getValue('quantity'),
                    result,
                    deposit: '0',
                    notes: getValue('note'),
                });
            } catch (err) {
                errors.push(`Row ${i + 2}: Parse error`);
                skippedRows++;
            }
        }

        return { trades, errors, skippedRows };
    }
};

// ============================================
// Parser Registry
// ============================================

export const brokerParsers: BrokerParser[] = [
    sierraChartParser,
    thinkorswimParser,
    ibkrParser,
    tradeStationParser,
];

/**
 * Auto-detect broker format and parse CSV
 */
export function parseCSVWithAutoDetect(csvContent: string): BrokerParseResult & { detectedBroker: string | null } {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
        return {
            trades: [],
            errors: ['CSV file is empty or has no data rows'],
            skippedRows: 0,
            detectedBroker: null
        };
    }

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line)).filter(row => row.some(cell => cell.trim()));

    // Try to detect broker
    for (const parser of brokerParsers) {
        if (parser.detect(headers)) {
            const result = parser.parse(rows, headers);
            return { ...result, detectedBroker: parser.displayName };
        }
    }

    // Fallback to Sierra Chart parser
    const result = sierraChartParser.parse(rows, headers);
    return { ...result, detectedBroker: 'Unknown (using generic parser)' };
}

/**
 * Parse CSV with specific broker
 */
export function parseCSVWithBroker(csvContent: string, brokerName: string): BrokerParseResult {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
        return { trades: [], errors: ['CSV file is empty'], skippedRows: 0 };
    }

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line)).filter(row => row.some(cell => cell.trim()));

    const parser = brokerParsers.find(p => p.name === brokerName);
    if (!parser) {
        return { trades: [], errors: [`Unknown broker: ${brokerName}`], skippedRows: 0 };
    }

    return parser.parse(rows, headers);
}

/**
 * Get list of supported brokers
 */
export function getSupportedBrokers(): { name: string; displayName: string }[] {
    return brokerParsers.map(p => ({ name: p.name, displayName: p.displayName }));
}
