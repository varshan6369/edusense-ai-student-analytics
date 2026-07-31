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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              Student Engagement Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            XP, Badges & Class Leaderboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Earn XP by maintaining 75%+ attendance, completing study plans, and keeping up streaks!
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="flex items-center justify-center gap-2 bg-[#145EA0] hover:bg-[#0D2F5B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#145EA0]/30 transition-all shrink-0 cursor-pointer focus-ring"
        >
          <Sparkles className="w-4 h-4 text-[#B7CEE0]" /> Celebrate Streak! 🎉
        </button>
      </div>

      {/* Student Badge Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* XP & Level */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total XP & Level</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {student.xp} <span className="text-sm font-bold text-slate-400">XP</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Level {student.level} Scholar</p>
        </div>

        {/* Study Streak */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Study Streak</span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {student.streak} <span className="text-sm font-bold text-slate-400">Days</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Keep study streak active daily!</p>
        </div>

        {/* Badges Unlocked */}
        <div className="clay-card p-6 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Badges Earned</span>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {student.badges.length} <span className="text-sm font-bold text-slate-400">Badges</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Unlocked across STEM modules</p>
        </div>
      </div>

      {/* Badges Cards Grid */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          Unlocked Academic Achievements
        </h3>
        {student.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.badges.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3"
              >
                <div className="text-3xl p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No badges unlocked yet. Complete daily study tasks to earn badges!</p>
        )}
      </div>

      {/* Class Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Class STEM Leaderboard
        </h3>

        <div className="space-y-2">
          {sortedStudents.map((st, rank) => (
            <div
              key={st.studentId}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                st.studentId === student.studentId
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    rank === 0
                      ? 'bg-amber-400 text-slate-900'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-900'
                      : rank === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  #{rank + 1}
                </div>
                <img
                  src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</div>
                  <div className="text-xs text-slate-500">{st.class} • Level {st.level}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400">{st.xp} XP</span>
                <span className="text-emerald-600">{st.attendance}% Att</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
