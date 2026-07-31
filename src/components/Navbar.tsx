import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Sparkles,
  Bot,
  UserCheck,
  Shield,
  LogIn,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onToggleAICopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onToggleAICopilot,
}) => {
  const { user, activeStudent, allStudents, selectStudent, switchRole, logout, setIsAuthModalOpen } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F3F6FB]/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/80 px-4 sm:px-6 md:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">
                StudyPath <span className="text-indigo-500">AI</span>
              </span>
              <span className="accent-pill">
                EduSense Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Middle Search & Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Open command palette"
          className="hidden md:flex items-center justify-between w-80 clay-card px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 focus-ring cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Search students, reports, AI...</span>
          </div>
          <kbd className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Active Student Selector Dropdown */}
          <div className="relative hidden lg:block">
            <label htmlFor="student-selector-nav" className="sr-only">Select Student</label>
            <select
              id="student-selector-nav"
              value={activeStudent?.studentId || ''}
              onChange={(e) => selectStudent(e.target.value)}
              className="clay-card border-none text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 pr-8 focus-ring outline-none appearance-none cursor-pointer"
            >
              {allStudents.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  Student: {st.name} ({st.attendance}% Att)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Toggle Switch */}
          <div className="flex items-center bg-white/50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80" role="group" aria-label="Switch User Role">
            <button
              onClick={() => switchRole('teacher')}
              aria-label="Switch to Teacher view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus-ring cursor-pointer ${
                user?.role === 'teacher'
                  ? 'clay-btn-secondary'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Teacher</span>
            </button>
            <button
              onClick={() => switchRole('student')}
              aria-label="Switch to Student view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus-ring cursor-pointer ${
                user?.role === 'student'
                  ? 'clay-btn-secondary'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 bg-white hover:bg-slate-50 shadow-sm rounded-xl transition-all focus-ring cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="View notifications"
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 bg-white hover:bg-slate-50 shadow-sm rounded-xl transition-all relative focus-ring cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 clay-card p-4 z-50">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Alerts & Insights</span>
                  <span className="accent-pill">2 New</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Exam Score Prediction Ready</p>
                    <p className="text-xs text-slate-500 mt-1">Gemini AI calculated updated final score probabilities.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">At-Risk Student Alert</p>
                    <p className="text-xs text-slate-500 mt-1">2 students currently have attendance below 75% target.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot Side Drawer Trigger */}
          <button
            onClick={onToggleAICopilot}
            aria-label="Open AI Copilot assistant"
            className="flex items-center gap-2 clay-btn px-4 py-2.5 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Ask AI</span>
            <Sparkles className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-4 ring-white shadow-sm"
              />
              <button
                onClick={logout}
                title="Sign Out"
                aria-label="Sign out"
                className="p-2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 shadow-sm rounded-xl transition-all focus-ring cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              aria-label="Sign in"
              className="flex items-center gap-1.5 clay-btn-secondary px-4 py-2.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

