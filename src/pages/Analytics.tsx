import { useState, useEffect } from 'react';
import { Card } from '../components/ui-base';
import { transactionService, Transaction } from '../services/transactionService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { LayoutGrid, PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      const txs = await transactionService.getAll();
      setData(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Expense by Category (Pie Chart)
  const expenseByCategory = data
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value: value as number }));

  // 2. Income vs Expense (Bar Chart)
  const totals = data.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const barData = [
    { name: 'Income', amount: totals.income, fill: '#10b981' },
    { name: 'Expense', amount: totals.expense, fill: '#f43f5e' }
  ];

  // 3. Monthly Trends
  const monthlyTrends = data.reduce((acc: any, t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') acc[month].income += t.amount;
    else acc[month].expense += t.amount;
    return acc;
  }, {});

  const trendData = Object.values(monthlyTrends).sort((a: any, b: any) => b.month.localeCompare(a.month));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium">Analyzing your data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-500 font-medium">Not enough data for analytics</p>
        <p className="text-zinc-400 text-xs mt-1">Add some transactions first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-zinc-500 font-medium">Visual insights of your spending</p>
      </header>

      {/* Monthly Summary Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <LayoutGrid size={18} className="text-indigo-600" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm italic">Monthly Summary</h3>
        </div>
        <Card className="overflow-hidden border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Month</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 text-right">Income</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 text-right">Expense</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {trendData.map((row: any) => {
                  const balance = row.income - row.expense;
                  return (
                    <tr key={row.month} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">{row.month}</td>
                      <td className="p-4 text-xs font-bold text-emerald-500 text-right">৳{Math.round(row.income).toLocaleString()}</td>
                      <td className="p-4 text-xs font-bold text-rose-500 text-right">৳{Math.round(row.expense).toLocaleString()}</td>
                      <td className={cn(
                        "p-4 text-xs font-black text-right",
                        balance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600"
                      )}>
                        ৳{Math.round(balance).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income vs Expense Pie/Bar */}
        <Card className="col-span-1 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Check</h4>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  formatter={(value: any) => [`৳${Math.round(Number(value)).toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories Distribution */}
        <Card className="col-span-1 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon size={16} className="text-rose-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Expenses</h4>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  formatter={(value: any) => [`৳${Math.round(Number(value)).toLocaleString()}`, 'Spent']}
                />
                <Pie
                  data={pieData}
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category List with percentages */}
      <Card className="p-6">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
           <Calendar size={18} className="text-indigo-600" />
           Top Categories
        </h3>
        <div className="space-y-5">
          {pieData.sort((a,b) => b.value - a.value).slice(0, 4).map((item, i) => {
            const percentage = ((item.value / totals.expense) * 100).toFixed(0);
            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
                  <span className="text-zinc-900 dark:text-white">৳{Math.round(item.value).toLocaleString()} ({percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
