import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  Calendar,
  FileText,
  Edit3,
  Calculator,
  Trophy,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'student' | 'teacher';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role }) => {
  const { user, activeStudent, logout, setIsAuthModalOpen } = useAuth();

  const menuItems = [
    { id: 'dashboard',     label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'students',      label: 'Students',           icon: Users },
    { id: 'analytics',     label: 'Analytics',          icon: BarChart3 },
    { id: 'copilot',       label: 'AI Copilot',         icon: Brain },
    { id: 'planner',       label: 'Study Planner',      icon: Calendar },
    { id: 'reports',       label: 'Reports',            icon: FileText },
    { id: 'notes',         label: 'Smart Notes',        icon: Edit3 },
    { id: 'whatif',        label: 'What If Simulator',  icon: Calculator },
    { id: 'gamification',  label: 'Gamification',       icon: Trophy },
    { id: 'settings',      label: 'Settings',           icon: Settings },
  ];

  const displayName = role === 'student'
    ? (activeStudent?.name || 'Varshan V')
    : (user?.name || 'Dr. Evelyn Vance');
  const displayRole = role === 'student' ? 'Student' : 'Teacher';
  const avatarSrc = role === 'student' && activeStudent?.avatar
    ? activeStudent.avatar
    : (user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  return (
    <aside className="w-full md:w-[220px] sidebar-card p-5 flex flex-col shrink-0 h-auto md:h-[calc(100vh-3rem)] sticky top-6">
      {/* Brand */}
      <div className="mb-7 px-1">
        <div className="flex items-center gap-1">
          <span className="font-black text-xl tracking-[0.18em] text-[#1A1A2E]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            EDUSENSE
          </span>
          <span className="w-2 h-2 rounded-full bg-[#6366F1] mt-0.5 shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id === 'students' ? 'dashboard' : item.id)}
              whileHover={{ scale: 1.02, x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-semibold transition-all duration-200 cursor-pointer text-left focus-ring relative ${
                isActive
                  ? 'nav-active'
                  : 'text-[#9B9BB8] hover:text-[#1A1A2E] hover:bg-white/60 hover:shadow-[2px_3px_10px_rgba(130,130,190,0.12)]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-[#9B9BB8]'
                }`}
              />
              <span className={`truncate ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
        {/* Profile Widget */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[14px] hover:bg-slate-50 transition-all cursor-pointer text-left focus-ring group"
        >
          <div className="flex items-center gap-3">
            {/* Gradient avatar ring */}
            <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] shrink-0">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1A1A2E] truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-[#9B9BB8] font-medium leading-tight mt-0.5">{displayRole}</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#9B9BB8] group-hover:text-[#6366F1] transition-colors shrink-0" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-semibold text-[#9B9BB8] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer text-left focus-ring"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};


