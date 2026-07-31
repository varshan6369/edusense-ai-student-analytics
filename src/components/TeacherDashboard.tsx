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
      icon: <Users className="w-4.5 h-4.5 text-indigo-500" />,
      iconBg: 'bg-indigo-50',
      accent: 'text-indigo-600',
    },
    {
      label: 'At Risk',
      value: String(atRiskStudents.length),
      sub: 'Require Intervention',
      icon: <AlertTriangle className="w-4.5 h-4.5 text-red-500" />,
      iconBg: 'bg-red-50',
      accent: 'text-red-500',
    },
    {
      label: 'Class Attendance',
      value: `${avgAttendance}%`,
      sub: 'Benchmark: 75% Target',
      icon: <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />,
      iconBg: 'bg-emerald-50',
      accent: 'text-emerald-600',
    },
    {
      label: 'Math Average',
      value: `${classAvgMath}%`,
      sub: 'Key predictor factor',
      icon: <Brain className="w-4.5 h-4.5 text-purple-500" />,
      iconBg: 'bg-purple-50',
      accent: 'text-purple-650',
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
        className="clay-card p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-indigo-400/15 via-purple-400/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-widest">
              Grade 11 • STEM Stream
            </span>
            <span className="text-[10px] text-[#8A99AD] font-black uppercase tracking-wider">
              Academic Term 2
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0F122A] tracking-tight mb-2 leading-none">
            Class Analytics Overview
          </h1>
          <p className="text-xs text-[#4A5568] font-bold max-w-lg">
            Real-time Kaggle Educational Factor analysis, AI predictions, and student intervention tools.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 clay-btn-secondary text-xs font-bold cursor-pointer focus-ring"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8A99AD]" />
            Reset Data
          </button>
          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex items-center gap-2 px-5 py-2.5 clay-btn text-xs font-bold cursor-pointer focus-ring"
          >
            <Bot className="w-3.5 h-3.5" />
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
            className="clay-card p-5.5 flex flex-col justify-between min-h-[135px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#8A99AD] tracking-widest uppercase mb-0.5">
                    {card.label}
                  </p>
                  <p className="text-2xl font-black text-[#0F122A] leading-none">{card.value}</p>
                  <p className="text-[10px] text-[#8A99AD] font-bold mt-1.5">{card.sub}</p>
                </div>
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
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase">
                Attendance Consistency Heatmap
              </h3>
            </div>
            <p className="text-[10px] text-[#8A99AD] font-bold">
              Visualizing daily presence patterns across 20 school days
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-[#8A99AD] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500" /> Absent
            </span>
          </div>
        </div>

        <div className="space-y-2.5 overflow-x-auto">
          {students.map((st) => (
            <div key={st.studentId} className="flex items-center gap-3 min-w-[560px]">
              <div className="w-32 text-xs font-black text-[#0F122A] truncate shrink-0">
                {st.name}
              </div>
              <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-inner">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isPresent = (idx * 7 + st.attendance) % 10 > 10 - st.attendance / 10;
                  const isLate = !isPresent && idx % 4 === 0;
                  return (
                    <div
                      key={idx}
                      title={`Day ${idx + 1}: ${isPresent ? 'Present' : isLate ? 'Late' : 'Absent'}`}
                      className={`h-5 flex-1 rounded transition-all hover:scale-110 cursor-pointer ${
                        isPresent
                          ? 'bg-emerald-500'
                          : isLate
                          ? 'bg-amber-400'
                          : 'bg-red-500'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="w-12 text-right text-xs font-extrabold text-[#0F122A] shrink-0">
                {st.attendance}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Student Roster Table */}
      <motion.div variants={itemVariants} className="clay-card overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase">
              Student Performance Roster
            </h3>
            <p className="text-[10px] text-[#8A99AD] font-bold mt-0.5">
              Select any student to inspect, simulate, or generate AI plans
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-52">
              <Search className="w-3.5 h-3.5 text-[#8A99AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="w-full bg-slate-50 border border-slate-200/40 rounded-full text-xs pl-9 pr-4 py-2 text-[#0F122A] placeholder-[#8A99AD] outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)] focus-ring"
              />
            </div>
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200/40 rounded-full">
              {(['all', 'atRisk', 'lowAttendance'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                    filterType === f
                      ? f === 'atRisk'
                        ? 'bg-red-500 text-white'
                        : f === 'lowAttendance'
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'text-[#8A99AD] hover:text-[#0F122A]'
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
            <thead className="bg-slate-50/60 text-[#8A99AD] font-black border-b border-slate-200/50 uppercase tracking-widest">
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((st) => {
                const pred = calculateStudentPrediction(st);
                return (
                  <tr
                    key={st.studentId}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
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
                            className="w-full h-full rounded-full object-cover bg-white"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F122A]">{st.name}</div>
                          <div className="text-[9px] text-[#8A99AD] font-black uppercase tracking-wider">
                            {st.studentId} • {st.motivation} motivation
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            st.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {st.attendance}%
                        </span>
                        <div className="w-14 bg-slate-100 border border-slate-200/50 h-1.5 rounded-full overflow-hidden">
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
                    <td className="py-4 px-5 font-bold text-[#4A5568]">
                      <div>{st.studyHours}h/wk study</div>
                      <div className="text-[10px] text-[#8A99AD] font-bold">
                        {st.sleepHours}h sleep/night
                      </div>
                    </td>

                    {/* Math Score */}
                    <td className="py-4 px-5 font-black text-[#0F122A]">
                      {st.examScores.Math}%
                    </td>

                    {/* Predicted */}
                    <td className="py-4 px-5">
                      <span className="font-black text-indigo-600">
                        {pred.predictedExamScore}%
                      </span>
                      <div className="text-[10px] text-[#8A99AD] font-bold mt-0.5">
                        Pass: {pred.passProbability}%
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-5">
                      {st.atRisk ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-500">
                          <AlertTriangle className="w-3 h-3" />
                          At Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
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
                          className="p-2 bg-white border border-slate-200/50 hover:border-indigo-200 text-[#8A99AD] hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { onSelectStudent(st.studentId); onNavigateTab('planner'); }}
                          title="Study Planner"
                          className="p-2 bg-white border border-slate-200/50 hover:border-blue-200 text-[#8A99AD] hover:text-blue-600 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { onSelectStudent(st.studentId); onNavigateTab('copilot'); }}
                          title="AI Copilot"
                          className="p-2 bg-white border border-slate-200/50 hover:border-purple-200 text-[#8A99AD] hover:text-purple-650 rounded-xl transition-all cursor-pointer shadow-sm"
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
