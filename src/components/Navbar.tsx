import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Terminal, Globe, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onToggleAICopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onToggleAICopilot,
}) => {
  const { user, activeStudent } = useAuth();

  const avatarSrc = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <header className="navbar-glass px-5 py-3 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Search */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2.5 flex-1 max-w-xs cursor-text focus-ring"
        aria-label="Search"
      >
        <Search className="w-4 h-4 text-[#9B9BB8] shrink-0" />
        <span className="text-sm text-[#9B9BB8] font-medium">Search anything...</span>
        <kbd className="ml-auto text-[10px] font-bold text-[#9B9BB8] bg-white/70 px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0">
          ⌘ K
        </kbd>
      </button>

      {/* Right: Nav Pills + Avatar */}
      <div className="flex items-center gap-2">
        {/* Terminal */}
        <button
          onClick={onOpenCommandPalette}
          className="navbar-pill hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#4A4A6A] uppercase tracking-wider"
        >
          <Terminal className="w-3.5 h-3.5 shrink-0" />
          <span>Terminal</span>
          <kbd className="text-[9px] font-black text-[#9B9BB8] bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/50">
            Ctrl+K
          </kbd>
        </button>

        {/* Language */}
        <button className="navbar-pill hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#4A4A6A] uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>Language</span>
        </button>

        {/* Contact */}
        <button
          onClick={onToggleAICopilot}
          className="navbar-pill hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#4A4A6A] uppercase tracking-wider"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Contact</span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#22D3EE] shadow-sm cursor-pointer ml-1 shrink-0">
          <img
            src={avatarSrc}
            alt={user?.name || 'User'}
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>
      </div>
    </header>
  );
};


