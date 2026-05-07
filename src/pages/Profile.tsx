
import { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui-base';
import { profileService, UserProfile, MonthlySummary } from '../services/profileService';
import { User, Phone, MapPin, FileText, Pencil, Save, X, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

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
      const [profileData, summaryData] = await Promise.all([
        profileService.getProfile(),
        profileService.getSummaryReport()
      ]);
      setProfile(profileData);
      setSummary(summaryData);
      setFormData(profileData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(formData);
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profile</h1>
          <p className="text-sm text-zinc-500 font-medium">Your personal account details</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-indigo-600 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <Pencil size={20} />
          </button>
        )}
      </header>

      {/* Profile Card */}
      <Card className="relative overflow-hidden p-0 border-none shadow-xl">
        <div className="h-24 bg-indigo-600 w-full relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl" />
        </div>
        
        <div className="px-6 pb-6 pt-12 relative">
          <div className="absolute -top-10 left-6 w-20 h-20 rounded-3xl bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-black shadow-lg flex items-center justify-center text-indigo-600">
            <User size={40} strokeWidth={1.5} />
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {profile?.name || 'Set your name'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Local Identity</p>
                </div>

                <div className="grid gap-4 pt-2">
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <Phone size={16} />
                    </div>
                    <span className="text-sm font-medium">{profile?.phone || 'No phone set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-medium">{profile?.address || 'No address set'}</span>
                  </div>
                  <div className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl h-fit">
                      <FileText size={16} />
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic pr-4">
                      "{profile?.notes || 'Add personal financial goals or notes here...'}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Address</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Personal Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                      placeholder="Notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1 bg-zinc-100 dark:bg-zinc-800">
                    <X size={18} className="mr-2 inline" /> Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-[2]">
                    <Save size={18} className="mr-2 inline" /> {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* 3-Month Summary Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Last 3 Months</h3>
          </div>
        </div>

        <div className="space-y-4">
          {summary.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-400 text-xs font-medium">No report data available yet</p>
            </div>
          ) : (
            summary.map((item) => (
              <Card key={item.month} className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                    {new Date(item.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                    item.income - item.expense >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    Balance: ৳{Math.round(item.income - item.expense).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <ArrowUpCircle size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Income</p>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">৳{Math.round(item.income).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                      <ArrowDownCircle size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Spending</p>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">৳{Math.round(item.expense).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
