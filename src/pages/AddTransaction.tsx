import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui-base';
import { Calendar, Tag, Banknote, FileLineChart as FileNote } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../constants';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: CATEGORIES.expense[0],
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: CATEGORIES.expense[0],
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: CATEGORIES[type][0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setShowStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }
    if (!formData.category.trim()) {
      setShowStatus({ type: 'error', message: 'Category is required' });
      return;
    }
    if (!formData.date) {
      setShowStatus({ type: 'error', message: 'Date is required' });
      return;
    }

    setLoading(true);
    setShowStatus(null);

    try {
      const cleanAmount = Math.round(parseFloat(formData.amount));
      await transactionService.save({
        ...formData,
        amount: cleanAmount
      });
      
      // Success Feedback
      setShowStatus({ type: 'success', message: 'Transaction saved successfully!' });
      resetForm();
      
      // Optional: Auto navigate back after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error('Failed to save:', error);
      setShowStatus({ type: 'error', message: 'Error saving to database' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-6 pb-20">
      {/* Snackbar / Toast UI */}
      {showStatus && (
        <div 
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300",
            showStatus.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}
        >
          {showStatus.message}
        </div>
      )}

      <header className="mb-10">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Add Transaction</h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">Record your daily financial flow</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
          <button 
            type="button"
            onClick={() => handleTypeChange('income')}
            className={cn(
              "flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all",
              formData.type === 'income' ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600" : "text-zinc-400"
            )}
          >
            Income
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={cn(
              "flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all",
              formData.type === 'expense' ? "bg-white dark:bg-zinc-700 shadow-sm text-rose-600" : "text-zinc-400"
            )}
          >
            Expense
          </button>
        </div>

        <Card className="space-y-6 !p-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Amount (৳)</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Banknote size={24} />
              </div>
              <input 
                type="number" 
                step="1"
                placeholder="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/30 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl py-6 pl-14 pr-6 text-3xl font-black focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Category</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Tag size={20} />
              </div>
              <input 
                list="category-options"
                placeholder="Select or type..."
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/30 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-base font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
              />
              <datalist id="category-options">
                {CATEGORIES[formData.type].map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Date</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                <Calendar size={20} />
              </div>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/30 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-1">Note (Optional)</label>
            <div className="relative group">
              <div className="absolute left-5 top-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <FileNote size={20} />
              </div>
              <textarea 
                placeholder="Details about transaction..."
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/30 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-base font-medium resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full py-5 text-lg font-black uppercase tracking-widest mt-4 hover:scale-[1.01] transition-transform"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </Button>
        </Card>
      </form>
    </div>
  );
}
