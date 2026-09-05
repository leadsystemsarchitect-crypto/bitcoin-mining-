import React from 'react';
import { Search, HardDrive, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { GameState } from '../types';
import { INITIAL_LOST_WALLETS, LostWalletTarget } from '../data/lostWallets';

interface LostBitcoinViewProps {
  gameState: GameState;
  onStartCracking: (walletId: string) => void;
  totalHashRate: number;
}

export const LostBitcoinView: React.FC<LostBitcoinViewProps> = ({
  gameState,
  onStartCracking,
  totalHashRate,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              Lost Bitcoin & Wallet Recovery Scanner
            </h2>
            <p className="text-xs text-zinc-400">
              Scavenge abandoned hardware drives and use your cluster's SHA-256 hash rate to brute-force forgotten passphrases and recover lost Satoshi-era Bitcoins.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono">
            <span className="text-zinc-400">Cluster Power:</span>
            <span className="text-emerald-400 font-bold">{totalHashRate.toFixed(1)} GH/s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {INITIAL_LOST_WALLETS.map((wallet) => {
            const savedState = gameState.lostWallets[wallet.id] || { status: 'hidden', progress: 0 };
            const status = savedState.status;
            const progress = savedState.progress;
            const isRecovered = status === 'recovered';
            const isCracking = status === 'cracking' || status === 'scanning';

            return (
              <div
                key={wallet.id}
                className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  isRecovered
                    ? 'bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : isCracking
                    ? 'bg-amber-500/5 border-amber-500/40 animate-pulse'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isRecovered ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-amber-400 border border-zinc-800'
                      }`}>
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{wallet.name}</h3>
                        <span className="text-[11px] text-zinc-400">{wallet.source}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-amber-400">+₿ {wallet.rewardBtc}</div>
                      <span className="text-[10px] text-zinc-500">Reward</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400">{wallet.description}</p>

                  <div className="bg-zinc-900/60 rounded-lg p-3 space-y-2 text-xs font-mono border border-zinc-800/60">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                        Passphrase Hint:
                      </span>
                      <span className="text-zinc-200 italic">{wallet.hint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Difficulty Target:</span>
                      <span className="text-emerald-400 font-bold">{wallet.difficulty.toLocaleString()} GH/s</span>
                    </div>
                  </div>

                  {isCracking && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-amber-400">Cracking SHA-256 Hashes...</span>
                        <span className="text-white font-bold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-900 flex items-center justify-between">
                  {isRecovered ? (
                    <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Successfully Swept & Recovered ({wallet.rewardBtc} BTC)
                    </div>
                  ) : isCracking ? (
                    <div className="w-full py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-pulse">
                      <Cpu className="w-4 h-4" />
                      Rig Brute-Forcing in Progress...
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartCracking(wallet.id)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <Search className="w-4 h-4" />
                      Connect Rig & Crack Wallet
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
