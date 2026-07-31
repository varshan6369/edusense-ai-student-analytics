import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Terminal,
  Globe,
  MessageCircle,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onToggleAICopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onToggleAICopilot,
}) => {
  const { user, activeStudent, allStudents, selectStudent, switchRole } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="glass-navbar px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-sm">
      {/* Search Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/40 border border-white/60 text-xs font-bold text-[#8A99AD] hover:text-[#0F122A] transition-all focus-ring cursor-text flex-1 max-w-[240px]"
        aria-label="Open command palette"
      >
        <Search className="w-3.5 h-3.5 shrink-0 text-[#8A99AD]" />
        <span className="tracking-wide">Search anything...</span>
      </button>

      {/* Right controls: Terminal, Language, Contact, Profile */}
      <div className="flex items-center gap-3">
        {/* Terminal */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold text-[#4A5568] hover:text-[#0F122A] bg-white/40 hover:bg-white/70 transition-all border border-white/60 cursor-pointer focus-ring"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="tracking-wide">Terminal</span>
          <kbd className="text-[9px] font-black text-[#8A99AD] bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200/50">
            CTRL + K
          </kbd>
        </button>

        {/* Language Selector */}
        <button
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold text-[#4A5568] hover:text-[#0F122A] bg-white/40 hover:bg-white/70 transition-all border border-white/60 cursor-pointer focus-ring"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="tracking-wide">Language</span>
        </button>

        {/* Contact (triggers AI Copilot) */}
        <button
          onClick={onToggleAICopilot}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold text-[#4A5568] hover:text-[#0F122A] bg-white/40 hover:bg-white/70 transition-all border border-white/60 cursor-pointer focus-ring"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="tracking-wide">Contact</span>
        </button>

        {/* Avatar gradient circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] shadow-sm cursor-pointer ml-1">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name || 'User'}
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>
      </div>
    </header>
  );
};
