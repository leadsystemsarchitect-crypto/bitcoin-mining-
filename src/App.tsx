import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MiningDashboard } from './components/MiningDashboard';
import { HardwareShop } from './components/HardwareShop';
import { PoolsView } from './components/PoolsView';
import { BlockchainView } from './components/BlockchainView';
import { WalletView } from './components/WalletView';
import { AchievementsView } from './components/AchievementsView';
import { LostBitcoinView } from './components/LostBitcoinView';
import { DormantAccountSweeper } from './components/DormantAccountSweeper';
import { SatoshiAiAdvisor } from './components/SatoshiAiAdvisor';
import { INITIAL_HARDWARE, MINING_POOLS, INITIAL_ACHIEVEMENTS } from './data/hardware';
import { INITIAL_LOST_WALLETS } from './data/lostWallets';
import { DormantAccount } from './data/dormantAccounts';
import { GameState, HardwareItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('mining');
  const [hardwareList, setHardwareList] = useState<HardwareItem[]>(INITIAL_HARDWARE);

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('satoshrig_state_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.lostWallets) parsed.lostWallets = {};
        if (!parsed.dormantSwept) parsed.dormantSwept = {};
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      btcBalance: 0.0025,
      usdBalance: 2500,
      bitcoinPrice: 94250,
      totalHashesGenerated: 1420,
      electricityRatePerKwH: 0.12,
      activePoolId: 'solo',
      hardware: { usb_erupter: 1 },
      blocksMined: [],
      transactions: [
        {
          id: 'tx_init',
          type: 'mined',
          amountBtc: 0.0025,
          amountUsd: 0,
          timestamp: new Date().toLocaleTimeString(),
        }
      ],
      achievements: INITIAL_ACHIEVEMENTS,
      totalPowerConsumed: 5,
      overclockLevel: 1,
      autoClickerActive: false,
      lostWallets: {},
      dormantSwept: {},
    };
  });


  const [blockProgress, setBlockProgress] = useState<number>(12);
  const [priceChange24h, setPriceChange24h] = useState<number>(3.8);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('satoshrig_state_v3', JSON.stringify(gameState));
  }, [gameState]);

  // Calculate total hashrate and power
  const totalHashRate = hardwareList.reduce((acc, item) => {
    const count = gameState.hardware[item.id] || 0;
    return acc + item.hashRate * count;
  }, 0) * gameState.overclockLevel;

  const totalPower = hardwareList.reduce((acc, item) => {
    const count = gameState.hardware[item.id] || 0;
    return acc + item.powerConsumption * count;
  }, 0) * gameState.overclockLevel;

  // Main game loop (1 second tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        // Calculate hash reward proportional to total hashrate
        const pool = MINING_POOLS.find((p) => p.id === prev.activePoolId) || MINING_POOLS[0];
        const hashRewardBtc = (totalHashRate * 0.0000000008) * pool.luckBonus;
        const newBtc = prev.btcBalance + hashRewardBtc;
        const newHashes = prev.totalHashesGenerated + Math.round(totalHashRate * 10);

        // Price fluctuation
        const priceDelta = (Math.random() - 0.49) * 120;
        const newPrice = Math.max(10000, prev.bitcoinPrice + priceDelta);

        // Deduct electricity cost every tick
        const hourlyPowerCost = (totalPower / 1000) * prev.electricityRatePerKwH;
        const secondPowerCost = hourlyPowerCost / 3600;
        const newUsd = Math.max(0, prev.usdBalance - secondPowerCost);

        // Update active cracking lost wallets
        const updatedLostWallets = { ...prev.lostWallets };
        let addedBtcFromWallets = 0;
        const newTxList = [...prev.transactions];

        INITIAL_LOST_WALLETS.forEach((lw) => {
          const lwState = updatedLostWallets[lw.id];
          if (lwState && lwState.status === 'cracking') {
            const progressIncrement = Math.max(0.5, (totalHashRate / lw.difficulty) * 25);
            const nextProg = lwState.progress + progressIncrement;
            if (nextProg >= 100) {
              updatedLostWallets[lw.id] = { status: 'recovered', progress: 100 };
              addedBtcFromWallets += lw.rewardBtc;
              newTxList.push({
                id: `tx_wallet_${Date.now()}_${lw.id}`,
                type: 'lost_wallet_recovered',
                amountBtc: lw.rewardBtc,
                amountUsd: 0,
                timestamp: new Date().toLocaleTimeString(),
              });
            } else {
              updatedLostWallets[lw.id] = { status: 'cracking', progress: nextProg };
            }
          }
        });

        return {
          ...prev,
          btcBalance: newBtc + addedBtcFromWallets,
          usdBalance: newUsd,
          bitcoinPrice: Math.round(newPrice),
          totalHashesGenerated: newHashes,
          lostWallets: updatedLostWallets,
          transactions: newTxList,
        };
      });

      // Advance block progress
      setBlockProgress((prev) => {
        const pool = MINING_POOLS.find((p) => p.id === gameState.activePoolId) || MINING_POOLS[0];
        const increment = Math.max(0.5, (totalHashRate / 20000) * pool.luckBonus);
        const nextProg = prev + increment;

        if (nextProg >= 100) {
          triggerBlockSolved();
          return 0;
        }
        return nextProg;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalHashRate, totalPower, gameState.activePoolId]);

  const handleStartCracking = (walletId: string) => {
    setGameState((prev) => ({
      ...prev,
      lostWallets: {
        ...prev.lostWallets,
        [walletId]: { status: 'cracking', progress: 5 }
      }
    }));
  };

  const handleSweepAccount = (acc: DormantAccount) => {
    setGameState((prev) => {
      if (prev.dormantSwept?.[acc.id]) return prev;

      const newTx = {
        id: `tx_dormant_${Date.now()}_${acc.id}`,
        type: 'dormant_swept' as const,
        amountBtc: acc.balanceBtc,
        amountUsd: 0,
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        ...prev,
        btcBalance: prev.btcBalance + acc.balanceBtc,
        dormantSwept: {
          ...prev.dormantSwept,
          [acc.id]: true,
        },
        transactions: [...prev.transactions, newTx],
      };
    });
  };



  const triggerBlockSolved = () => {
    const pool = MINING_POOLS.find((p) => p.id === gameState.activePoolId) || MINING_POOLS[0];
    const reward = 0.005 + Math.random() * 0.015; // 0.005 to 0.02 BTC block reward
    const blockNum = gameState.blocksMined.length + 1;
    const mockHash = '0000000000000000000' + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15);

    setGameState((prev) => {
      const newBlocks = [
        ...prev.blocksMined,
        {
          blockNumber: blockNum,
          hash: mockHash,
          reward,
          minedAt: new Date().toLocaleTimeString(),
          pool: pool.name,
        }
      ];

      const newTx = {
        id: `tx_${Date.now()}`,
        type: 'mined' as const,
        amountBtc: reward,
        amountUsd: 0,
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        ...prev,
        btcBalance: prev.btcBalance + reward,
        blocksMined: newBlocks,
        transactions: [...prev.transactions, newTx],
      };
    });
  };

  // Manual hash clicker
  const handleManualHash = () => {
    setGameState((prev) => ({
      ...prev,
      btcBalance: prev.btcBalance + 0.0000001,
      totalHashesGenerated: prev.totalHashesGenerated + 1,
    }));
    setBlockProgress((prev) => Math.min(100, prev + 1.5));
  };

  // Buy Hardware
  const handleBuyHardware = (item: HardwareItem) => {
    const canAffordUsd = gameState.usdBalance >= item.cost;
    const canAffordBtc = gameState.btcBalance >= item.costBtc;

    if (!canAffordUsd && !canAffordBtc) return;

    setGameState((prev) => {
      let newUsd = prev.usdBalance;
      let newBtc = prev.btcBalance;

      if (canAffordUsd) {
        newUsd -= item.cost;
      } else {
        newBtc -= item.costBtc;
      }

      const currentOwned = prev.hardware[item.id] || 0;
      const updatedHardware = { ...prev.hardware, [item.id]: currentOwned + 1 };

      const newTx = {
        id: `tx_${Date.now()}`,
        type: 'bought_hardware' as const,
        amountBtc: canAffordUsd ? 0 : -item.costBtc,
        amountUsd: canAffordUsd ? -item.cost : 0,
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        ...prev,
        usdBalance: newUsd,
        btcBalance: newBtc,
        hardware: updatedHardware,
        transactions: [...prev.transactions, newTx],
      };
    });
  };

  // Select Pool
  const handleSelectPool = (poolId: string) => {
    setGameState((prev) => ({ ...prev, activePoolId: poolId }));
  };

  // Sell BTC
  const handleSellBtc = (amount: number) => {
    if (amount <= 0 || amount > gameState.btcBalance) return;
    const usdProceeds = amount * gameState.bitcoinPrice;

    setGameState((prev) => {
      const newTx = {
        id: `tx_${Date.now()}`,
        type: 'sold' as const,
        amountBtc: -amount,
        amountUsd: usdProceeds,
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        ...prev,
        btcBalance: prev.btcBalance - amount,
        usdBalance: prev.usdBalance + usdProceeds,
        transactions: [...prev.transactions, newTx],
      };
    });
  };

  // Buy BTC with USD
  const handleBuyBtc = (amountUsd: number) => {
    if (amountUsd <= 0 || amountUsd > gameState.usdBalance) return;
    const btcReceived = amountUsd / gameState.bitcoinPrice;

    setGameState((prev) => {
      const newTx = {
        id: `tx_${Date.now()}`,
        type: 'sold' as const,
        amountBtc: btcReceived,
        amountUsd: -amountUsd,
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        ...prev,
        usdBalance: prev.usdBalance - amountUsd,
        btcBalance: prev.btcBalance + btcReceived,
        transactions: [...prev.transactions, newTx],
      };
    });
  };

  const handleCashAppTransfer = (amountBtc: number, amountUsd: number, cashtag: string) => {
    setGameState((prev) => {
      const newTx = {
        id: `tx_cashapp_${Date.now()}`,
        type: 'sold' as const,
        amountBtc: -amountBtc,
        amountUsd: -amountUsd,
        timestamp: `${new Date().toLocaleTimeString()} (Cash App: ${cashtag})`,
      };

      return {
        ...prev,
        btcBalance: prev.btcBalance - amountBtc,
        usdBalance: prev.usdBalance - amountUsd,
        transactions: [...prev.transactions, newTx],
      };
    });
  };


  // Check & update achievements
  useEffect(() => {
    setGameState((prev) => {
      let updated = false;
      const newAchievements = prev.achievements.map((ach) => {
        if (ach.unlocked) return ach;
        let unlock = false;
        if (ach.id === 'first_satoshi' && prev.btcBalance >= 0.00001) unlock = true;
        if (ach.id === 'whole_bitcoin' && prev.btcBalance >= 1.0) unlock = true;
        if (ach.id === 'usb_tycoon' && (prev.hardware['usb_erupter'] || 0) >= 5) unlock = true;
        if (ach.id === 'asic_power' && (prev.hardware['asic_antminer'] || 0) >= 1) unlock = true;
        if (ach.id === 'quantum_leap' && (prev.hardware['quantum_core'] || 0) >= 1) unlock = true;
        if (ach.id === 'block_finder' && prev.blocksMined.length >= 1) unlock = true;

        if (unlock) {
          updated = true;
          return { ...ach, unlocked: true };
        }
        return ach;
      });

      if (!updated) return prev;
      return { ...prev, achievements: newAchievements };
    });
  }, [gameState.btcBalance, gameState.hardware, gameState.blocksMined.length]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        btcBalance={gameState.btcBalance}
        usdBalance={gameState.usdBalance}
        bitcoinPrice={gameState.bitcoinPrice}
        priceChange24h={priceChange24h}
        totalHashRate={totalHashRate}
        overclockLevel={gameState.overclockLevel}
        setOverclockLevel={(lvl) => setGameState((prev) => ({ ...prev, overclockLevel: lvl }))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'mining' && (
          <MiningDashboard
            gameState={gameState}
            hardwareList={hardwareList}
            onManualHash={handleManualHash}
            blockProgress={blockProgress}
            totalHashRate={totalHashRate}
            totalPower={totalPower}
          />
        )}
        {activeTab === 'ai_advisor' && (
          <SatoshiAiAdvisor
            gameState={gameState}
            totalHashRate={totalHashRate}
          />
        )}
        {activeTab === 'lost_wallets' && (
          <LostBitcoinView
            gameState={gameState}
            onStartCracking={handleStartCracking}
            totalHashRate={totalHashRate}
          />
        )}
        {activeTab === 'dormant_accounts' && (
          <DormantAccountSweeper
            gameState={gameState}
            onSweepAccount={handleSweepAccount}
          />
        )}
        {activeTab === 'shop' && (
          <HardwareShop
            hardwareList={hardwareList}
            gameState={gameState}
            onBuyHardware={handleBuyHardware}
          />
        )}
        {activeTab === 'pools' && (
          <PoolsView
            pools={MINING_POOLS}
            gameState={gameState}
            onSelectPool={handleSelectPool}
          />
        )}
        {activeTab === 'wallet' && (
          <WalletView
            gameState={gameState}
            onSellBtc={handleSellBtc}
            onBuyBtc={handleBuyBtc}
            onCashAppTransfer={handleCashAppTransfer}
          />
        )}
        {activeTab === 'blockchain' && (
          <BlockchainView gameState={gameState} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsView achievements={gameState.achievements} />
        )}
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-500 font-mono">
        SatoshiRig Decentralized Hash Generator Engine • Secure SHA-256 Protocol
      </footer>
    </div>
  );
}
