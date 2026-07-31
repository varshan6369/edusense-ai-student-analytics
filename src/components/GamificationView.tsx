import React from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Crown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface GamificationViewProps {
  student: Student;
  allStudents: Student[];
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  student,
  allStudents,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const sortedStudents = [...allStudents].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
              Student Engagement Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F122A] tracking-tight">
            XP, Badges & Class Leaderboard
          </h1>
          <p className="text-xs text-[#8A99AD] font-bold mt-1">
            Earn XP by maintaining 75%+ attendance, completing study plans, and keeping up streaks!
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="flex items-center justify-center gap-2 clay-btn font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer focus-ring"
        >
          <Sparkles className="w-4 h-4 text-white" /> Celebrate Streak! 🎉
        </button>
      </div>

      {/* Student Badge Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* XP & Level */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8A99AD]">Total XP & Level</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-[#0F122A] leading-none">
            {student.xp} <span className="text-sm font-bold text-[#8A99AD]">XP</span>
          </div>
          <p className="text-xs text-[#8A99AD] font-bold">Level {student.level} Scholar</p>
        </div>

        {/* Study Streak */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8A99AD]">Active Study Streak</span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
          </div>
          <div className="text-3xl font-black text-[#0F122A] leading-none">
            {student.streak} <span className="text-sm font-bold text-[#8A99AD]">Days</span>
          </div>
          <p className="text-xs text-[#8A99AD] font-bold">Keep study streak active daily!</p>
        </div>

        {/* Badges Unlocked */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8A99AD]">Badges Earned</span>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-[#0F122A] leading-none">
            {student.badges.length} <span className="text-sm font-bold text-[#8A99AD]">Badges</span>
          </div>
          <p className="text-xs text-[#8A99AD] font-bold">Unlocked across STEM modules</p>
        </div>
      </div>

      {/* Badges Cards Grid */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="font-black text-xs text-[#0F122A] uppercase tracking-wider">
          Unlocked Academic Achievements
        </h3>
        {student.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.badges.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.01)]"
              >
                <div className="text-3xl p-2 bg-white rounded-xl shadow-sm shrink-0 border border-slate-150">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-black text-[#0F122A] text-xs sm:text-sm">{b.title}</h4>
                  <p className="text-[11px] text-[#8A99AD] font-bold leading-tight mt-0.5">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8A99AD] font-bold italic">No badges unlocked yet. Complete daily study tasks to earn badges!</p>
        )}
      </div>

      {/* Class Leaderboard */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Class STEM Leaderboard
        </h3>

        <div className="space-y-2">
          {sortedStudents.map((st, rank) => (
            <div
              key={st.studentId}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                st.studentId === student.studentId
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-slate-50 border-slate-150 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.01)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    rank === 0
                      ? 'bg-amber-400 text-white'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-800'
                      : rank === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-655'
                  }`}
                >
                  #{rank + 1}
                </div>
                <img
                  src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-250 bg-white"
                />
                <div>
                  <div className="font-extrabold text-[#0F122A] text-sm leading-none mb-1">{st.name}</div>
                  <div className="text-[10px] text-[#8A99AD] font-black uppercase tracking-wider">{st.class} • Level {st.level}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider">
                <span className="text-[#8B5CF6]">{st.xp} XP</span>
                <span className="text-indigo-650">{st.attendance}% Att</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
