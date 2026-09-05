import React, { useState } from 'react';
import { Radio, ShieldAlert, CheckCircle2, ArrowRight, Zap, Database, Lock, Unlock } from 'lucide-react';
import { GameState } from '../types';
import { INITIAL_DORMANT_ACCOUNTS, DormantAccount } from '../data/dormantAccounts';

interface DormantAccountSweeperProps {
  gameState: GameState;
  onSweepAccount: (account: DormantAccount) => void;
}

export const DormantAccountSweeper: React.FC<DormantAccountSweeperProps> = ({
  gameState,
  onSweepAccount,
}) => {
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);

  const startSweep = (acc: DormantAccount) => {
    setScanningId(acc.id);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningId(null);
          onSweepAccount(acc);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              Inactive Account & Dormant Wallet Sweeper
            </h2>
            <p className="text-xs text-zinc-400">
              Scan the blockchain for abandoned or inactive Bitcoin wallets with unspent funds (10+ years of zero activity) and sweep their balances directly into your account using cryptographic recovery protocols.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono">
            <span className="text-zinc-400">Target Protocol:</span>
            <span className="text-emerald-400 font-bold">SHA-256 / ECDSA Sweep</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {INITIAL_DORMANT_ACCOUNTS.map((acc) => {
            const sweptState = gameState.dormantSwept?.[acc.id];
            const isSwept = sweptState || acc.status === 'swept';
            const isScanning = scanningId === acc.id;

            return (
              <div
                key={acc.id}
                className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  isSwept
                    ? 'bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : isScanning
                    ? 'bg-amber-500/5 border-amber-500/50 animate-pulse'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {acc.ownerAlias}
                        {isSwept && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Swept
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate max-w-[240px] sm:max-w-xs">{acc.address}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-amber-400">₿ {acc.balanceBtc}</div>
                      <span className="text-[10px] text-zinc-500">Unspent Balance</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                      <span className="text-zinc-500 block">Inactive Duration</span>
                      <span className="text-white font-bold">{acc.inactiveYears} Years</span>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                      <span className="text-zinc-500 block">Security Protocol</span>
                      <span className="text-emerald-400 font-bold">{acc.securityProtocol}</span>
                    </div>
                  </div>

                  {isScanning && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-amber-400">Executing cryptographic sweep...</span>
                        <span className="text-white font-bold">{scanProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-900">
                  {isSwept ? (
                    <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Successfully Pulled +{acc.balanceBtc} BTC to Your Account
                    </div>
                  ) : isScanning ? (
                    <div className="w-full py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-pulse">
                      <Zap className="w-4 h-4" />
                      Sweeping Dormant Funds...
                    </div>
                  ) : (
                    <button
                      onClick={() => startSweep(acc)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <Unlock className="w-4 h-4" />
                      Pull Bitcoin to My Account
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
