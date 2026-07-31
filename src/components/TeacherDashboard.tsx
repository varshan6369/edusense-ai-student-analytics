import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { motion } from 'motion/react';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Brain,
  Search,
  Bot,
  Calculator,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
} from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onNavigateTab: (tab: string) => void;
  onResetData: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  onSelectStudent,
  onNavigateTab,
  onResetData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'atRisk' | 'lowAttendance' | 'highAchievers'>('all');

  const totalCount = students.length;
  const atRiskStudents = students.filter((s) => s.atRisk);
  const avgAttendance =
    totalCount > 0
      ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / totalCount)
      : 0;
  const classAvgMath =
    totalCount > 0
      ? Math.round(students.reduce((a, b) => a + (b.examScores.Math || 0), 0) / totalCount)
      : 0;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'atRisk') return s.atRisk;
    if (filterType === 'lowAttendance') return s.attendance < 75;
    if (filterType === 'highAchievers')
      return (
        s.attendance >= 90 &&
        (Object.values(s.examScores) as number[]).reduce((a, b) => a + b, 0) / 5 >= 85
      );
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  const statCards = [
    {
      label: 'Total Students',
      value: String(totalCount),
      sub: 'Grade 11 - Section A',
      icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      accent: 'text-indigo-600',
    },
    {
      label: 'At Risk',
      value: String(atRiskStudents.length),
      sub: 'Require Intervention',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      accent: 'text-red-500',
    },
    {
      label: 'Class Attendance',
      value: `${avgAttendance}%`,
      sub: 'Benchmark: 75% Target',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      accent: 'text-emerald-600',
    },
    {
      label: 'Math Average',
      value: `${classAvgMath}%`,
      sub: 'Key predictor factor',
      icon: <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      accent: 'text-purple-600',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-6"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="clay-card p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-indigo-400/15 via-purple-400/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Grade 11 • STEM Stream
            </span>
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wide">
              Academic Term 2
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
            Class Analytics Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium max-w-lg">
            Real-time Kaggle Educational Factor analysis, AI predictions, and student intervention tools.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 clay-btn-secondary text-xs cursor-pointer focus-ring"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data
          </button>
          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex items-center gap-2 px-5 py-2.5 clay-btn text-xs cursor-pointer focus-ring"
          >
            <Bot className="w-4 h-4" />
            Class AI Copilot
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="clay-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${card.accent}`}>
                  {card.label}
                </p>
                <p className="text-4xl font-extrabold text-[var(--text-primary)]">{card.value}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attendance Heatmap */}
      <motion.div variants={itemVariants} className="clay-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Attendance Consistency Heatmap
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Visualizing daily presence patterns across 20 school days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500" /> Absent
            </span>
          </div>
        </div>

        <div className="space-y-2.5 overflow-x-auto">
          {students.map((st) => (
            <div key={st.studentId} className="flex items-center gap-3 min-w-[560px]">
              <div className="w-32 text-xs font-semibold text-[var(--text-primary)] truncate shrink-0">
                {st.name}
              </div>
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isPresent = (idx * 7 + st.attendance) % 10 > 10 - st.attendance / 10;
                  const isLate = !isPresent && idx % 4 === 0;
                  return (
                    <div
                      key={idx}
                      title={`Day ${idx + 1}: ${isPresent ? 'Present' : isLate ? 'Late' : 'Absent'}`}
                      className={`h-6 flex-1 rounded-md transition-all hover:scale-110 cursor-pointer ${
                        isPresent
                          ? 'bg-emerald-500 dark:bg-emerald-600'
                          : isLate
                          ? 'bg-amber-400 dark:bg-amber-500'
                          : 'bg-red-500 dark:bg-red-600'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="w-12 text-right text-xs font-extrabold text-[var(--text-primary)] shrink-0">
                {st.attendance}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Student Roster Table */}
      <motion.div variants={itemVariants} className="clay-card overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-[var(--border-card)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Student Performance Roster
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              Select any student to inspect, simulate, or generate AI plans
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-52">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="w-full clay-card-sub text-xs pl-9 pr-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border-none focus-ring"
              />
            </div>
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 clay-card-sub rounded-2xl">
              {(['all', 'atRisk', 'lowAttendance'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    filterType === f
                      ? f === 'atRisk'
                        ? 'bg-red-500 text-white'
                        : f === 'lowAttendance'
                        ? 'bg-amber-500 text-white'
                        : 'clay-btn text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'atRisk' ? 'At Risk' : '<75% Att'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] font-extrabold border-b border-[var(--border-card)] uppercase tracking-widest">
              <tr>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Attendance</th>
                <th className="py-3.5 px-5">Study / Sleep</th>
                <th className="py-3.5 px-5">Math Score</th>
                <th className="py-3.5 px-5">Predicted Score</th>
                <th className="py-3.5 px-5">Risk</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-card)]">
              {filteredStudents.map((st) => {
                const pred = calculateStudentPrediction(st);
                return (
                  <tr
                    key={st.studentId}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelectStudent(st.studentId);
                      onNavigateTab('dashboard');
                    }}
                  >
                    {/* Student info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shrink-0">
                          <img
                            src={
                              st.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={st.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{st.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-medium">
                            {st.studentId} • {st.motivation} motivation
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold ${
                            st.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {st.attendance}%
                        </span>
                        <div className="w-14 bg-[var(--border-card)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${st.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Study/Sleep */}
                    <td className="py-4 px-5 font-medium text-[var(--text-secondary)]">
                      <div>{st.studyHours}h/wk study</div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {st.sleepHours}h sleep/night
                      </div>
                    </td>

                    {/* Math Score */}
                    <td className="py-4 px-5 font-extrabold text-[var(--text-primary)]">
                      {st.examScores.Math}%
                    </td>

                    {/* Predicted */}
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {pred.predictedExamScore}%
                      </span>
                      <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                        Pass: {pred.passProbability}%
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-5">
                      {st.atRisk ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          High Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          On Track
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { onSelectStudent(st.studentId); onNavigateTab('whatif'); }}
                          title="What-If Simulator"
                          className="p-2 clay-card-sub hover:text-indigo-500 text-[var(--text-muted)] rounded-xl transition-all cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { onSelectStudent(st.studentId); onNavigateTab('planner'); }}
                          title="Study Planner"
                          className="p-2 clay-card-sub hover:text-blue-500 text-[var(--text-muted)] rounded-xl transition-all cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { onSelectStudent(st.studentId); onNavigateTab('copilot'); }}
                          title="AI Copilot"
                          className="p-2 clay-card-sub hover:text-purple-500 text-[var(--text-muted)] rounded-xl transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
