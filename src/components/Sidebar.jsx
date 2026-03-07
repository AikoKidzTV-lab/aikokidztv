import React from 'react';
import { Gem, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../utils/admin';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);

  const navItems = [
    { label: 'Home', target: 'top', icon: Home },
    { label: 'AI Studio', target: 'ai-studio', icon: Sparkles },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Dashboard', target: 'admin-dashboard', icon: ShieldCheck });
  }

  const handleNav = (target) => {
    if (target === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:flex fixed left-6 top-28 z-40 w-52 flex-col gap-3">
      <div className="bg-secondary/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
          <Gem size={14} className="text-purple-500" />
          <span>Sidebar</span>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map(({ label, target, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleNav(target)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-200 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-left"
            >
              <Icon size={16} className="text-accent" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
