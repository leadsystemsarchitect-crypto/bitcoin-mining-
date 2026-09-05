import React, { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, DollarSign, Coins, RefreshCw, Smartphone } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { GameState } from '../types';
import { CashAppTransferModal } from './CashAppTransferModal';

interface WalletViewProps {
  gameState: GameState;
  onSellBtc: (amount: number) => void;
  onBuyBtc: (amountUsd: number) => void;
  onCashAppTransfer: (amountBtc: number, amountUsd: number, cashtag: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  gameState,
  onSellBtc,
  onBuyBtc,
  onCashAppTransfer,
}) => {
  const [sellAmount, setSellAmount] = useState<string>('0.01');
  const [buyAmountUsd, setBuyAmountUsd] = useState<string>('1000');
  const [showCashAppModal, setShowCashAppModal] = useState<boolean>(false);


  // Mock historical price chart data
  const chartData = [
    { time: '00:00', price: gameState.bitcoinPrice * 0.96 },
    { time: '04:00', price: gameState.bitcoinPrice * 0.98 },
    { time: '08:00', price: gameState.bitcoinPrice * 0.97 },
    { time: '12:00', price: gameState.bitcoinPrice * 1.01 },
    { time: '16:00', price: gameState.bitcoinPrice * 0.99 },
    { time: '20:00', price: gameState.bitcoinPrice * 1.02 },
    { time: 'Now', price: gameState.bitcoinPrice },
  ];

  const handleSell = () => {
    const amt = parseFloat(sellAmount);
    if (!isNaN(amt) && amt > 0 && amt <= gameState.btcBalance) {
      onSellBtc(amt);
    }
  };

  const handleBuy = () => {
    const usd = parseFloat(buyAmountUsd);
    if (!isNaN(usd) && usd > 0 && usd <= gameState.usdBalance) {
      onBuyBtc(usd);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Bitcoin Vault</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              ₿
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              ₿ {gameState.btcBalance.toFixed(8)}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-mono">
              Estimated Value: ${(gameState.btcBalance * gameState.bitcoinPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="text-xs font-medium text-zinc-300">Convert BTC to USD (Instant Liquidity)</div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white w-full focus:outline-none focus:border-emerald-500"
                placeholder="Amount BTC"
              />
              <button
                onClick={handleSell}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Sell BTC
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Fiat Capital (USD)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono">
              ${gameState.usdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-mono">
              Available for Rig Upgrades & Electricity
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="text-xs font-medium text-zinc-300">Buy Bitcoin with USD</div>
            <div className="flex gap-2">
              <input
                type="number"
                step="100"
                value={buyAmountUsd}
                onChange={(e) => setBuyAmountUsd(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white w-full focus:outline-none focus:border-emerald-500"
                placeholder="Amount USD"
              />
              <button
                onClick={handleBuy}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border border-zinc-700"
              >
                Buy BTC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cash App Transfer Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold shadow-lg">
            $
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cash App Real-Time Data Payout
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Instant Stream
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Instantly transfer your mined Bitcoin or fiat balance to any Cash App tag with real-time websocket verification.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCashAppModal(true)}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 whitespace-nowrap"
        >
          <Smartphone className="w-4 h-4" />
          Transfer to Cash App
        </button>
      </div>

      {/* Recharts Bitcoin Price Chart */}

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Live Bitcoin Market Ticker (USD)
          </h3>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ${gameState.bitcoinPrice.toLocaleString()} per BTC
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="btcColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Price']}
              />
              <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#btcColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Transaction & Activity Log
        </h3>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          <div className="divide-y divide-zinc-900 max-h-60 overflow-y-auto">
            {gameState.transactions.slice().reverse().map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'mined' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'sold' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {tx.type === 'mined' ? <Coins className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-white font-bold capitalize">{tx.type.replace('_', ' ')}</div>
                    <div className="text-[10px] text-zinc-500">{tx.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  {tx.amountBtc !== 0 && (
                    <div className={`font-bold ${tx.amountBtc > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amountBtc > 0 ? '+' : ''}{tx.amountBtc.toFixed(6)} BTC
                    </div>
                  )}
                  {tx.amountUsd !== 0 && (
                    <div className="text-zinc-400 text-[11px]">
                      {tx.amountUsd > 0 ? '+' : ''}${tx.amountUsd.toLocaleString()} USD
                    </div>
                  )}
                </div>
              </div>
            ))}
            {gameState.transactions.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {showCashAppModal && (
        <CashAppTransferModal
          gameState={gameState}
          onTransferComplete={(btc, usd, tag) => {
            onCashAppTransfer(btc, usd, tag);
            setShowCashAppModal(false);
          }}
          onClose={() => setShowCashAppModal(false)}
        />
      )}
    </div>
  );
};
