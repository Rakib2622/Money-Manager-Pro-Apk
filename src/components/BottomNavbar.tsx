import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, PlusCircle, BarChart3, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNavbar() {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/add', icon: PlusCircle, label: 'Add', primary: true },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 pb-8 safe-area-inset-bottom flex justify-around items-center z-50">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-all duration-200",
            link.primary 
              ? "bg-indigo-600 text-white p-3.5 rounded-2xl -mt-14 shadow-xl shadow-indigo-500/40 active:scale-90"
              : isActive ? "text-indigo-600 scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          )}
        >
          {({ isActive }) => (
            <>
              <link.icon size={link.primary ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
              {!link.primary && <span className="text-[10px] font-bold tracking-tight">{link.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
