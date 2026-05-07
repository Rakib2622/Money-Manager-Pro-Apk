import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button } from '../components/ui-base';
import { Calendar, Tag, Banknote, FileLineChart as FileNote, ArrowLeft } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../constants';

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStatus, setShowStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    date: '',
    note: ''
  });

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: CATEGORIES[type][0]
    }));
  };

  useEffect(() => {
    if (id) {
      fetchTransaction(parseInt(id));
    }
  }, [id]);

  const fetchTransaction = async (txId: number) => {
    try {
      const tx = await transactionService.getById(txId);
      setFormData({
        type: tx.type,
        amount: tx.amount.toString(),
        category: tx.category,
        date: tx.date,
        note: tx.note || ''
      });
    } catch (error) {
      console.error('Failed to fetch:', error);
      setShowStatus({ type: 'error', message: 'Failed to load transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setShowStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }
    if (!formData.category.trim()) {
      setShowStatus({ type: 'error', message: 'Category is required' });
      return;
    }

    setSaving(true);
    setShowStatus(null);

    try {
      const cleanAmount = Math.round(parseFloat(formData.amount));
      await transactionService.update(parseInt(id!), {
        ...formData,
        amount: cleanAmount
      });
      
      setShowStatus({ type: 'success', message: 'Transaction updated successfully!' });
      
      setTimeout(() => {
        navigate('/history');
      }, 1500);

    } catch (error) {
      console.error('Failed to update:', error);
      setShowStatus({ type: 'error', message: 'Error updating database' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium">Loading transaction details...</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-20">
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

      <header className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Transaction</h1>
          <p className="text-sm text-zinc-500">Update your records</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button 
            type="button"
            onClick={() => handleTypeChange('income')}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
              formData.type === 'income' ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600" : "text-zinc-500"
            )}
          >
            Income
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
              formData.type === 'expense' ? "bg-white dark:bg-zinc-700 shadow-sm text-rose-600" : "text-zinc-500"
            )}
          >
            Expense
          </button>
        </div>

        <Card className="space-y-5">
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

          <div className="flex gap-3 mt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 py-5 text-lg font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="flex-[2] py-5 text-lg font-bold shadow-lg shadow-indigo-500/20"
            >
              {saving ? 'Updating...' : 'Update Record'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
