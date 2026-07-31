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
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
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
  const avgAttendance = totalCount > 0 ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / totalCount) : 0;
  const classAvgMath = totalCount > 0 ? Math.round(students.reduce((a, b) => a + (b.examScores.Math || 0), 0) / totalCount) : 0;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'atRisk') return s.atRisk;
    if (filterType === 'lowAttendance') return s.attendance < 75;
    if (filterType === 'highAchievers') return s.attendance >= 90 && (Object.values(s.examScores) as number[]).reduce((a, b) => a + b, 0) / 5 >= 85;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Teacher Header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 clay-card p-6 border-none">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="accent-pill">
              Grade 11 • STEM Stream
            </span>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Academic Term 2</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Class Success & Risk Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Real-time Kaggle Educational Factor analysis, RAG prediction, and intervention tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            title="Reset Database to Kaggle Seed Records"
            className="flex items-center gap-1.5 px-4 py-2.5 clay-btn-secondary text-xs"
          >
            <RotateCcw className="w-4 h-4" /> Reset Data
          </button>
          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex items-center gap-2 px-5 py-2.5 clay-btn text-xs"
          >
            <Bot className="w-4 h-4" /> Class AI Copilot
          </button>
        </div>
      </motion.div>

      {/* Overview Stat Cards (Clay Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Enrolled */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Total Students</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white">
            {totalCount}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Section A (6 Seed Records)</p>
        </motion.div>

        {/* At Risk */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between bg-red-50/50">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">At Risk Students</span>
            <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-red-600">
            {atRiskStudents.length}
          </div>
          <p className="text-xs text-red-500 mt-2 font-bold">Require Support</p>
        </motion.div>

        {/* Avg Attendance */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Class Attendance</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white">
            {avgAttendance}%
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Benchmark: 75% Target</p>
        </motion.div>

        {/* Class Math Average */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Math Average</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white">
            {classAvgMath}%
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Key Predictor Factor</p>
        </motion.div>
      </div>

      {/* Attendance Heatmap Section */}
      <div className="clay-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Class Attendance Consistency Heatmap
            </h3>
            <p className="text-xs text-slate-500">Visualizing daily presence across 20 school days</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-3 rounded bg-amber-400" /> Late
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-3 rounded bg-red-500" /> Absent
            </span>
          </div>
        </div>

        <div className="space-y-2.5 overflow-x-auto">
          {students.map((st) => (
            <div key={st.studentId} className="flex items-center gap-3 min-w-[600px]">
              <div className="w-36 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {st.name}
              </div>
              <div className="flex-1 grid grid-cols-20 gap-1">
                {Array.from({ length: 20 }).map((_, idx) => {
                  // Synthetic heatmap based on student attendance rate
                  const isPresent = (idx * 7 + st.attendance) % 10 > (10 - (st.attendance / 10));
                  const isLate = !isPresent && (idx % 4 === 0);
                  return (
                    <div
                      key={idx}
                      title={`Day ${idx + 1}: ${isPresent ? 'Present' : isLate ? 'Late' : 'Absent'}`}
                      className={`h-6 rounded-md transition-all hover:scale-110 ${
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
              <div className="w-12 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                {st.attendance}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster & At-Risk Identification Table */}
      <div className="clay-card overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Student Performance & Risk Roster
            </h3>
            <p className="text-xs text-slate-500">Select any student to inspect, simulate or generate AI plans</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('atRisk')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'atRisk'
                    ? 'bg-red-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-red-500'
                }`}
              >
                At Risk
              </button>
              <button
                onClick={() => setFilterType('lowAttendance')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'lowAttendance'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-amber-500'
                }`}
              >
                &lt;75% Att
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Study / Sleep</th>
                <th className="py-3.5 px-4">Math Score</th>
                <th className="py-3.5 px-4">Predicted Score</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredStudents.map((st) => {
                const pred = calculateStudentPrediction(st);
                return (
                  <tr
                    key={st.studentId}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectStudent(st.studentId);
                      onNavigateTab('dashboard');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</div>
                          <div className="text-[11px] text-slate-500">{st.studentId} • Motivation: {st.motivation}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${st.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {st.attendance}%
                        </span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${st.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <div className="text-slate-900 dark:text-slate-200">{st.studyHours}h study/wk</div>
                      <div className="text-[11px] text-slate-500">{st.sleepHours}h sleep/night</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {st.examScores.Math}%
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                        {pred.predictedExamScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Pass Prob: {pred.passProbability}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {st.atRisk ? (
                        <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> High Risk
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectStudent(st.studentId);
                            onNavigateTab('whatif');
                          }}
                          title="Simulate What-if Factors"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onSelectStudent(st.studentId);
                            onNavigateTab('planner');
                          }}
                          title="Generate Study Schedule"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onSelectStudent(st.studentId);
                            onNavigateTab('copilot');
                          }}
                          title="Ask AI Copilot about this student"
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg transition-colors"
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
      </div>
    </motion.div>
  );
};
