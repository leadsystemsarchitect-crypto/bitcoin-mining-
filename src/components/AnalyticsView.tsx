import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GameState } from '../types';
import { getAccessToken, googleSignIn } from '../lib/auth';
import { createSpreadsheet, updateSheetData } from '../lib/googleSheets';

interface AnalyticsViewProps {
  gameState: GameState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ gameState }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  const handleExportToSheets = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    try {
      let token = await getAccessToken();
      if (!token) {
        try {
          const result = await googleSignIn();
          if (result) {
            token = result.accessToken;
          } else {
            throw new Error('Authentication failed');
          }
        } catch (err: any) {
          if (err.code === 'auth/popup-closed-by-user') {
            setIsExporting(false);
            return;
          }
          throw err;
        }
      }

      if (!token) throw new Error('No access token');

      // 1. Create a new spreadsheet
      const spreadsheet = await createSpreadsheet(token, `Bitcoin Miner - Mining Report ${new Date().toLocaleDateString()}`);
      const spreadsheetId = spreadsheet.spreadsheetId;
      setSpreadsheetUrl(spreadsheet.spreadsheetUrl);

      // 2. Prepare data
      const headers = ['Type', 'Amount BTC', 'Amount USD', 'Timestamp'];
      const rows = gameState.transactions.map((tx) => [
        tx.type,
        tx.amountBtc,
        tx.amountUsd,
        tx.timestamp,
      ]);

      const values = [headers, ...rows];

      // 3. Update the sheet with data
      await updateSheetData(token, spreadsheetId, 'Sheet1!A1', values);

      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Mining Analytics & Reports
            </h2>
            <p className="text-xs text-zinc-400">
              Export your decentralized mining history to Google Sheets for advanced tracking and audit.
            </p>
          </div>
        </div>

        <div className="pt-6 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Download className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Google Sheets Integration</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Generate a comprehensive spreadsheet with your full transaction history, including block rewards, hardware purchases, and energy costs.
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <button
                onClick={handleExportToSheets}
                disabled={isExporting}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  isExporting
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20 cursor-pointer'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Spreadsheet...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Transaction History
                  </>
                )}
              </button>

              {exportStatus === 'success' && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Export Successful!
                  </div>
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-emerald-400 text-xs underline underline-offset-4 flex items-center gap-1"
                    >
                      Open in Google Sheets
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {exportStatus === 'error' && (
                <div className="flex items-center gap-2 text-rose-400 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Failed to export. Please try again.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Historical Records</span>
              <div className="text-2xl font-bold text-white font-mono">
                {gameState.transactions.length}
              </div>
              <p className="text-[10px] text-zinc-500">Total transaction entries ready for export.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Export Format</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                .XLSX / GSheet
              </div>
              <p className="text-[10px] text-zinc-500">Standardized Google Workspace spreadsheet format.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
