import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui-base';
import { Search, Filter, ShoppingBag, Coffee, Car, Home, Briefcase, Pizza, Film, Wallet, Pencil, HeartPulse, Receipt, MoreHorizontal, Banknote, Laptop, Sparkles, X } from 'lucide-react';
import { transactionService, Transaction } from '../services/transactionService';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../constants';

const categoryIcons: Record<string, any> = {
  // Expense
  'Food': Pizza,
  'Shopping': ShoppingBag,
  'Travel': Car,
  'Bills': Receipt,
  'Medical': HeartPulse,
  'Entertainment': Film,
  'Others': MoreHorizontal,
  // Income
  'Salary': Briefcase,
  'Business': Banknote,
  'Freelancing': Laptop,
  'Bonus': Sparkles,
  'default': Coffee
};

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await fetchTransactions();
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getAll();
      setAllTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setMonthFilter('all');
    setSearch('');
  };

  const filtered = allTransactions.filter(t => {
    // Search match
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase()) || 
      (t.note && t.note.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Type match
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    // Category match
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Month match
    if (monthFilter !== 'all') {
      const txMonth = t.date.substring(0, 7); // "YYYY-MM"
      if (txMonth !== monthFilter) return false;
    }

    return true;
  });

  // Calculate Summary for filtered transactions
  const totalIncome = filtered.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : 0), 0);
  const totalExpense = filtered.reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : 0), 0);
  const balance = totalIncome - totalExpense;

  // Get unique months for filter
  const availableMonths = Array.from(new Set(allTransactions.map(t => t.date.substring(0, 7)))).sort().reverse();

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(allTransactions.map(t => t.category))).sort();

  // Group transactions by Date for better UI
  const groupedTransactions: Record<string, Transaction[]> = filtered.reduce((groups: any, tx) => {
    const date = new Date(tx.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Transaction History</h1>
          <p className="text-sm text-zinc-500">Track all your logs</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-2xl border transition-all font-medium",
            showFilters 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
              : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-indigo-600"
          )}
        >
          <Filter size={20} />
        </button>
      </header>
      
      {/* Quick Summary Card */}
      <Card className="p-6 bg-zinc-900 dark:bg-white border-none shadow-xl shadow-zinc-200 dark:shadow-none overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total Income</p>
            <p className="text-sm font-black text-emerald-400 dark:text-emerald-600">
              ৳{Math.round(totalIncome).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Spent</p>
            <p className="text-sm font-black text-rose-400 dark:text-rose-600">
              ৳{Math.round(totalExpense).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Balance</p>
            <p className={cn(
              "text-lg font-black tracking-tight",
              balance >= 0 ? "text-white dark:text-zinc-900" : "text-rose-500"
            )}>
              ৳{Math.round(balance).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
      </Card>

      {showFilters && (
        <Card className="p-5 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quick Filters</h4>
            <button onClick={clearFilters} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
              <X size={12} /> Clear All
            </button>
          </div>

          <div className="space-y-4">
            {/* Type Filter */}
            <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              {(['all', 'income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                    typeFilter === type ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600" : "text-zinc-400"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 px-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Month</label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 px-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                >
                  <option value="all">All Time</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category or note..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none"
        />
      </div>

      <div className="space-y-8 overflow-y-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm font-medium">Fetching transactions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-zinc-300" size={32} />
            </div>
            <p className="text-zinc-500 font-medium">No transactions found</p>
            <p className="text-zinc-400 text-xs mt-1">Try adjusting your search</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">{date}</h3>
              <div className="space-y-3">
                {txs.map((tx) => {
                  const Icon = categoryIcons[tx.category] || categoryIcons.default;
                  const isIncome = tx.type === 'income';
                  
                  return (
                    <Card key={tx.id} className="p-4 flex items-center justify-between group hover:border-indigo-500/20 transition-all cursor-default bg-white dark:bg-zinc-900/50">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                          isIncome ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10" : "bg-rose-50 text-rose-600 dark:bg-rose-900/10"
                        )}>
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">{tx.note || tx.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className={cn(
                            "font-black text-sm tabular-nums tracking-tight",
                            isIncome ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {isIncome ? '+' : '-'}৳{Math.round(tx.amount).toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => navigate(`/edit/${tx.id}`)}
                          className="p-2 text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
