import { Capacitor } from '@capacitor/core';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
  date: string;
}

const isNative = Capacitor.isNativePlatform();

// Helper to handle local storage fallback
const getLocalTransactions = (): Transaction[] => {
  const data = localStorage.getItem('transactions');
  return data ? JSON.parse(data) : [];
};

const saveLocalTransactions = (transactions: Transaction[]) => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
};

export const transactionService = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    if (isNative) {
      return getLocalTransactions().sort((a, b) => b.date.localeCompare(a.date));
    }
    const response = await fetch('/api/transactions');
    if (!response.ok) return getLocalTransactions(); // Fallback
    return response.json();
  },

  // Get single transaction
  getById: async (id: number): Promise<Transaction> => {
    if (isNative) {
      const tx = getLocalTransactions().find(t => t.id === id);
      if (!tx) throw new Error('Not found');
      return tx;
    }
    const response = await fetch(`/api/transactions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  // Save a new transaction
  save: async (transaction: Transaction): Promise<Transaction> => {
    if (isNative) {
      const transactions = getLocalTransactions();
      const newTx = { ...transaction, id: Date.now() };
      transactions.push(newTx);
      saveLocalTransactions(transactions);
      return newTx;
    }
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to save transaction');
    return response.json();
  },

  // Update a transaction
  update: async (id: number, transaction: Transaction): Promise<{ updated: number }> => {
    if (isNative) {
      const transactions = getLocalTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Not found');
      transactions[index] = { ...transaction, id };
      saveLocalTransactions(transactions);
      return { updated: 1 };
    }
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  // Delete a transaction
  delete: async (id: number): Promise<{ deleted: number }> => {
    if (isNative) {
      const transactions = getLocalTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      saveLocalTransactions(filtered);
      return { deleted: 1 };
    }
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  }
};
