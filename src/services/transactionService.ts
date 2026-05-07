export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
  date: string;
}

export const transactionService = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    const response = await fetch('/api/transactions');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  // Get single transaction
  getById: async (id: number): Promise<Transaction> => {
    const response = await fetch(`/api/transactions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  // Save a new transaction
  save: async (transaction: Transaction): Promise<Transaction> => {
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
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  }
};
