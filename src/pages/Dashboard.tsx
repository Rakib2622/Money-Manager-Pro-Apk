import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, ShoppingBag, Coffee, Car, Home, Briefcase, Film, Pizza, Sun, Moon, Receipt, HeartPulse, MoreHorizontal, Banknote, Laptop, Sparkles } from 'lucide-react';
import { Card } from '../components/ui-base';
import { transactionService, Transaction } from '../services/transactionService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../components/ThemeProvider';

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

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await fetchData();
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const stats = [
    { label: 'Current Balance', amount: `৳${Math.round(balance).toLocaleString()}`, icon: Wallet, color: 'text-white', full: true },
    { label: 'Income', amount: `৳${Math.round(totalIncome).toLocaleString()}`, icon: ArrowUpCircle, color: 'text-emerald-500' },
    { label: 'Spending', amount: `৳${Math.round(totalExpense).toLocaleString()}`, icon: ArrowDownCircle, color: 'text-rose-500' },
  ];

  // Latest 5 transactions, sorted by date descending
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const expenseRatio = balance > 0 ? (totalExpense / totalIncome) * 100 : 100;

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-28 pt-2">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">Your financial overview</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 px-1">
        {/* Main Balance Card */}
        <Card className="col-span-2 relative overflow-hidden bg-zinc-900 dark:bg-white border-none p-8 flex flex-col justify-between h-48 shadow-2xl shadow-zinc-200 dark:shadow-none">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Available Balance
            </p>
            <h2 className="text-4xl font-black tracking-tight text-white dark:text-zinc-900 mt-2">
              {loading ? '---' : `৳${Math.round(balance).toLocaleString()}`}
            </h2>
          </div>
          
          <div className="relative z-10 flex justify-between items-end">
            <div className="flex gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Income</p>
                <p className="text-xs font-bold text-emerald-400 dark:text-emerald-600">
                  +৳{Math.round(totalIncome).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Spending</p>
                <p className="text-xs font-bold text-rose-400 dark:text-rose-600">
                  -৳{Math.round(totalExpense).toLocaleString()}
                </p>
              </div>
            </div>
            <Wallet className="text-zinc-800 dark:text-zinc-100 opacity-20" size={48} />
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -ml-12 -mb-12" />
        </Card>

        {/* Small Stat Cards for quick reference */}
        <Card className="p-5 flex flex-col gap-3 group border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/20 transition-colors bg-white dark:bg-zinc-900">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Monthly Income</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1 uppercase tracking-tight">
              {loading ? '...' : `৳${Math.round(totalIncome).toLocaleString()}`}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 group border-zinc-100 dark:border-zinc-800 hover:border-rose-500/20 transition-colors bg-white dark:bg-zinc-900">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-600">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Monthly Spending</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1 uppercase tracking-tight">
              {loading ? '...' : `৳${Math.round(totalExpense).toLocaleString()}`}
            </p>
          </div>
        </Card>
      </div>

      {!loading && transactions.length > 0 && expenseRatio > 0 && (
        <section className="px-1">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Financial Health</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                You've utilized <span className="text-zinc-900 dark:text-white font-bold">{expenseRatio.toFixed(0)}%</span> of your total earnings this month.
              </p>
            </div>
            <div className="relative w-full sm:w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 transition-all duration-1000",
                  expenseRatio > 80 ? "bg-rose-500" : "bg-indigo-600"
                )} 
                style={{ width: `${Math.min(100, expenseRatio)}%` }} 
              />
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Transactions</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Your latest financial activity</p>
          </div>
          <Link 
            to="/history" 
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-indigo-600 transition-colors py-2 px-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          >
            View All
          </Link>
        </div>

        <div className="space-y-2 px-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Updating Ledger...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <Wallet className="text-zinc-200 dark:text-zinc-700 mx-auto mb-4" size={40} />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No activities recorded</p>
              <Link 
                to="/add" 
                className="inline-block mt-6 text-[10px] font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 px-6 rounded-2xl"
              >
                + NEW TRANSACTION
              </Link>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const Icon = categoryIcons[tx.category] || categoryIcons.default;
              const isIncome = tx.type === 'income';
              return (
                <Card key={tx.id} className="p-4 flex items-center justify-between border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                      isIncome ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10" : "bg-rose-50 text-rose-600 dark:bg-rose-900/10"
                    )}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">{tx.note || tx.category}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-sm tabular-nums tracking-tight", 
                      isIncome ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {isIncome ? '+' : '-'}৳{Math.round(tx.amount).toLocaleString()}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
