"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseCSV, ParsedTrade } from "@/lib/csvParser";
import { importTradesFromCSV } from "@/server/actions/trades";
import { toast } from "sonner";

interface CSVImportDialogProps {
    onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        imported: number;
        skipped: number;
        errors: string[];
    } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const result = parseCSV(content);
            setParsedTrades(result.trades);
            setParseErrors(result.errors);
        };
        reader.readAsText(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "text/plain": [".txt"],
        },
        maxFiles: 1,
    });

    const handleImport = async () => {
        if (parsedTrades.length === 0) return;

        setIsImporting(true);
        try {
            const result = await importTradesFromCSV(parsedTrades);
            setImportResult(result);

            if (result.imported > 0) {
                toast.success(`Successfully imported ${result.imported} trades`);
                onImportComplete?.();
            }

            if (result.skipped > 0) {
                toast.info(`Skipped ${result.skipped} duplicate trades`);
            }

            if (result.errors.length > 0) {
                toast.error(`${result.errors.length} errors occurred during import`);
            }
        } catch (error) {
            toast.error("Failed to import trades");
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setParsedTrades([]);
        setParseErrors([]);
        setFileName("");
        setImportResult(null);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) handleClose();
            else setOpen(true);
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Upload size={16} />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Trades from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file exported from Sierra Chart (via convert_trades.py)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <FileText className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                        {isDragActive ? (
                            <p className="text-blue-600">Drop the file here...</p>
                        ) : (
                            <div>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    Drag & drop a CSV file here, or click to select
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    Accepts .csv or .txt files
                                </p>
                            </div>
                        )}
                    </div>

                    {/* File info and preview */}
                    {fileName && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText size={16} />
                                <span className="font-medium">{fileName}</span>
                                <span className="text-zinc-500">
                                    ({parsedTrades.length} trades found)
                                </span>
                            </div>

                            {/* Preview table */}
                            {parsedTrades.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="max-h-[200px] overflow-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Symbol</th>
                                                    <th className="px-3 py-2 text-left">Type</th>
                                                    <th className="px-3 py-2 text-left">Date</th>
                                                    <th className="px-3 py-2 text-right">P/L</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedTrades.slice(0, 5).map((trade, i) => (
                                                    <tr key={i} className="border-t">
                                                        <td className="px-3 py-2">{trade.symbolName}</td>
                                                        <td className="px-3 py-2 capitalize">{trade.positionType}</td>
                                                        <td className="px-3 py-2">{trade.closeDate}</td>
                                                        <td className={`px-3 py-2 text-right ${parseFloat(trade.result) >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                            }`}>
                                                            {trade.result}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {parsedTrades.length > 5 && (
                                        <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-500 border-t">
                                            ...and {parsedTrades.length - 5} more trades
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Parse errors */}
                            {parseErrors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                                        <AlertCircle size={16} />
                                        Parse Errors
                                    </div>
                                    <ul className="text-sm text-red-600 space-y-1">
                                        {parseErrors.slice(0, 3).map((error, i) => (
                                            <li key={i}>{error}</li>
                                        ))}
                                        {parseErrors.length > 3 && (
                                            <li>...and {parseErrors.length - 3} more errors</li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Import result */}
                            {importResult && (
                                <div className={`rounded-lg p-3 ${importResult.errors.length === 0
                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                    }`}>
                                    <div className="flex items-center gap-2 font-medium mb-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        Import Complete
                                    </div>
                                    <ul className="text-sm space-y-1">
                                        <li className="text-green-600">✓ {importResult.imported} trades imported</li>
                                        {importResult.skipped > 0 && (
                                            <li className="text-zinc-500">↷ {importResult.skipped} duplicates skipped</li>
                                        )}
                                        {importResult.errors.length > 0 && (
                                            <li className="text-red-600">✗ {importResult.errors.length} errors</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClose}>
                            {importResult ? "Close" : "Cancel"}
                        </Button>
                        {parsedTrades.length > 0 && !importResult && (
                            <Button
                                onClick={handleImport}
                                disabled={isImporting}
                            >
                                {isImporting ? "Importing..." : `Import ${parsedTrades.length} Trades`}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
