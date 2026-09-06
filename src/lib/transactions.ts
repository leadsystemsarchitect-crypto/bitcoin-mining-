import { Transaction } from '../types';

let txCounter = 0;

export const generateTxId = (prefix: string = 'tx'): string => {
  txCounter = (txCounter + 1) % 1000000;
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now()}_${txCounter}_${randomPart}`;
};

export const sanitizeTransactions = (transactions: any[]): Transaction[] => {
  if (!Array.isArray(transactions)) return [];
  const seenIds = new Set<string>();
  const sanitized: Transaction[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (!tx || typeof tx !== 'object') continue;
    let id = tx.id;
    if (!id || typeof id !== 'string' || seenIds.has(id)) {
      id = generateTxId(`tx_dedup_${i}`);
    }
    seenIds.add(id);
    sanitized.push({
      ...tx,
      id,
    });
  }

  return sanitized;
};
