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
    <header className="glass-navbar px-4 py-3 flex items-center justify-between gap-4 shrink-0">
      {/* Search Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2.5 flex-1 max-w-xs text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-ring cursor-text"
        aria-label="Open command palette"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="font-medium">Search anything...</span>
      </button>

      {/* Center pill buttons */}
      <div className="hidden md:flex items-center gap-2">
        {/* Terminal */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-[var(--border-card)] cursor-pointer focus-ring"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="tracking-wide">TERMINAL</span>
          <kbd className="text-[10px] font-black text-[var(--text-muted)] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
            CTRL+K
          </kbd>
        </button>

        {/* Role Toggle */}
        <button
          onClick={() => switchRole(user?.role === 'teacher' ? 'student' : 'teacher')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-[var(--border-card)] cursor-pointer focus-ring"
          title={`Switch to ${user?.role === 'teacher' ? 'Student' : 'Teacher'} view`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="tracking-wide uppercase">
            {user?.role === 'teacher' ? 'TEACHER' : 'STUDENT'}
          </span>
        </button>

        {/* AI Copilot (Contact) */}
        <button
          onClick={onToggleAICopilot}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-[var(--border-card)] cursor-pointer focus-ring"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="tracking-wide">CONTACT</span>
        </button>
      </div>

      {/* Right: Student selector + Theme + Avatar */}
      <div className="flex items-center gap-3">
        {/* Student Selector */}
        {allStudents.length > 0 && (
          <div className="relative hidden lg:block">
            <select
              value={activeStudent?.studentId || ''}
              onChange={(e) => selectStudent(e.target.value)}
              className="appearance-none text-xs font-semibold text-[var(--text-secondary)] bg-transparent pr-6 pl-1 py-1 cursor-pointer focus-ring outline-none"
              aria-label="Select student"
            >
              {allStudents.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark((p) => !p)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer focus-ring"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar gradient pill */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[2px] shadow-lg shadow-purple-500/20 cursor-pointer">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
