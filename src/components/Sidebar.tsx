import React from 'react';
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  role,
}) => {
  const { user, activeStudent, logout, setIsAuthModalOpen } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      roleRequired: 'teacher' // only show to teacher, or show placeholder
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Brain,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Calendar,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'notes',
      label: 'Smart Notes',
      icon: Edit3,
    },
    {
      id: 'whatif',
      label: 'What If Simulator',
      icon: Calculator,
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: Trophy,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  // If user is a student, we filter out or show all items as in mockup.
  // The mockup shows all items for Student (Varshan is a student in the mockup and has all these tabs visible!).
  // So we show all items.

  const displayName = role === 'student' ? (activeStudent?.name || 'Varshan V') : (user?.name || 'Dr. Evelyn Vance');
  const displayRole = role === 'student' ? 'Student' : 'Teacher';

  return (
    <aside className="w-full md:w-72 clay-card p-6 flex flex-col justify-between shrink-0 h-auto md:h-[calc(100vh-3rem)] sticky top-6">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          <span className="font-display font-black text-2xl tracking-[0.25em] text-[#0F122A]">
            LUCIFER
          </span>
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-2.5" />
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'students') {
                  onTabChange('dashboard'); // teachers dashboard is class overview which lists students
                } else {
                  onTabChange(item.id);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-[inset_1px_1px_3px_rgba(255,255,255,1),_4px_4px_12px_rgba(99,102,241,0.12)] border border-slate-100'
                  : 'text-[#8A99AD] hover:text-[#0F122A] hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-250 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-transparent text-[#8A99AD]'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="tracking-wide">{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Profile & Logout Footer */}
      <div className="pt-5 mt-4 border-t border-slate-200/50 space-y-4">
        {/* Profile Info Widget */}
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-all cursor-pointer text-left focus-ring"
        >
          <div className="flex items-center gap-2.5">
            {/* Gradient Avatar bubble */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2.5px] shadow-sm">
              <img
                src={role === 'student' && activeStudent?.avatar ? activeStudent.avatar : (user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")}
                alt={displayName}
                className="w-full h-full rounded-full object-cover bg-slate-900"
              />
            </div>
            <div>
              <p className="text-xs font-black text-[#0F122A] tracking-wide line-clamp-1">
                {displayName}
              </p>
              <p className="text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider">
                {displayRole}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A99AD]" />
        </button>

        {/* Logout Trigger */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-2xl text-xs font-bold text-[#8A99AD] hover:text-red-500 transition-colors cursor-pointer text-left focus-ring"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
};
