import React, { useState } from 'react';
import { DollarSign, Send, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';
import { GameState } from '../types';

interface CashAppTransferModalProps {
  gameState: GameState;
  onTransferComplete: (amountBtc: number, amountUsd: number, cashtag: string) => void;
  onClose: () => void;
}

export const CashAppTransferModal: React.FC<CashAppTransferModalProps> = ({
  gameState,
  onTransferComplete,
  onClose,
}) => {
  const [cashtag, setCashtag] = useState<string>('');
  const [transferType, setTransferType] = useState<'btc' | 'usd'>('btc');
  const [amount, setAmount] = useState<string>('0.01');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'transferring' | 'success'>('idle');
  const [transferSteps, setTransferSteps] = useState<string[]>([]);

  const handleTransfer = () => {
    setErrorMessage(null);
    if (!cashtag.startsWith('$') || cashtag.length <= 1) {
      setErrorMessage('Please enter a valid Cash App tag starting with $ (e.g. $SatoshiUser)');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid transfer amount');
      return;
    }

    if (transferType === 'btc' && val > gameState.btcBalance) {
      setErrorMessage('Insufficient Bitcoin balance in wallet');
      return;
    }

    if (transferType === 'usd' && val > gameState.usdBalance) {
      setErrorMessage('Insufficient USD balance in wallet');
      return;
    }

    setStatus('transferring');
    setTransferSteps(['Connecting to Cash App secure API gateway...', 'Verifying cryptographic signature & ECDSA hash...', 'Broadcasting real-time data stream to $'+cashtag.replace('$','') + '...']);

    setTimeout(() => {
      setTransferSteps((prev) => [...prev, 'Transfer confirmed by Cash App decentralized node!']);
      setTimeout(() => {
        setStatus('success');
        const btcAmt = transferType === 'btc' ? val : 0;
        const usdAmt = transferType === 'usd' ? val : 0;
        onTransferComplete(btcAmt, usdAmt, cashtag);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
              $
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cash App Real-Time Transfer</h3>
              <p className="text-xs text-zinc-400">Instant payout via Cash App API gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Recipient Cash App Tag ($Cashtag)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-emerald-400 font-bold">$</span>
                <input
                  type="text"
                  placeholder="SatoshiBuilder"
                  value={cashtag.startsWith('$') ? cashtag.slice(1) : cashtag}
                  onChange={(e) => setCashtag('$' + e.target.value.replace('$', ''))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransferType('btc')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  transferType === 'btc'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                Transfer Bitcoin (BTC)
              </button>
              <button
                onClick={() => setTransferType('usd')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  transferType === 'usd'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                Transfer Fiat (USD)
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Transfer Amount</span>
                <span>
                  Available: {transferType === 'btc' ? `₿ ${gameState.btcBalance.toFixed(6)}` : `$${gameState.usdBalance.toLocaleString()}`}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={transferType === 'btc' ? '0.001' : '10'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setAmount(transferType === 'btc' ? gameState.btcBalance.toString() : gameState.usdBalance.toString())}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap"
                >
                  Max
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleTransfer}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Smartphone className="w-4 h-4" />
                Initiate Cash App Real-Time Transfer
              </button>
            </div>
          </div>
        )}

        {status === 'transferring' && (
          <div className="py-8 text-center space-y-4 font-mono">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Streaming Real-Time Data to {cashtag}...</div>
              {transferSteps.map((step, idx) => (
                <div key={idx} className="text-xs text-zinc-400 animate-pulse">{step}</div>
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Transfer Successful!</h4>
              <p className="text-xs text-zinc-400 font-mono">
                Successfully transferred {transferType === 'btc' ? `₿ ${amount} BTC` : `$${amount} USD`} to {cashtag}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-all"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
