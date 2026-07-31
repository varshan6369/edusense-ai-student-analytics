import React from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Moon,
  Flame,
  Brain,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onNavigateTab,
}) => {
  const prediction = calculateStudentPrediction(student);

  const scoresList = Object.values(student.examScores) as number[];
  const avgScore = Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length);

  // Radar chart data comparing Student Score vs Class Average
  const radarData = student.subjects.map((sub) => ({
    subject: sub.subject,
    StudentScore: sub.score,
    ClassAvg: sub.classAverage,
  }));

  const xpNextLevel = student.level * 500;
  const xpPercentage = Math.min(100, Math.round((student.xp / xpNextLevel) * 100));

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Student Dashboard <span className="text-slate-400 font-medium">/ {student.name}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Roll #{student.rollNumber} • {student.class} • Motivation: <span className="font-bold text-indigo-500 dark:text-indigo-400">{student.motivation}</span>
          </p>
        </div>

        {/* Gamification Streak Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 px-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-black text-slate-800 dark:text-white">Lvl {student.level}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 font-bold">|</span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-amber-500 dark:text-amber-400">{student.streak} Days</span>
          </div>
        </div>
      </motion.div>

      {/* Sleek Metric Cards Row (Clay Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between h-40">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Attendance Rate
            </p>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mt-1">
              {student.attendance}%
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${student.attendance >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
              {student.attendance >= 75 ? '+2.1% Good Standing' : 'Below 75% Target'}
            </span>
            <span className="text-slate-400 text-[10px] font-medium">from last month</span>
          </div>
        </motion.div>

        {/* Average Exam Score */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between h-40">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Average Exam Grade
            </p>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mt-1">
              {avgScore}%
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="accent-pill">Class Avg 74%</span>
            <span className="text-slate-400 text-[10px] font-medium">Across 5 Subjects</span>
          </div>
        </motion.div>

        {/* Pass Probability / Focus Score */}
        <motion.div variants={itemVariants} className="clay-card p-6 flex flex-col justify-between h-40">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Pass Probability
            </p>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mt-1">
              {prediction.passProbability}%
            </h2>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${prediction.passProbability}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right font-bold tracking-wider uppercase">Predicted Success</p>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Chart + Gemini AI Analysis Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Evolution Chart Card */}
        <div className="clay-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-[#0D2F5B] dark:text-white text-base">Attendance Trend</h3>
              <p className="text-xs text-[#6D96B3]">Monthly percentage evolution</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#145EA0]"></span>
              <span className="text-xs text-[#6D96B3] font-semibold">Current Term</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={student.attendanceHistory}>
                <defs>
                  <linearGradient id="indigoAttendanceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145EA0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#145EA0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#6D96B3" fontSize={12} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#6D96B3" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D2F5B', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke="#145EA0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#indigoAttendanceColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gemini AI Analysis Card (Matching Sleek Reference) */}
        <div className="clay-card-dark p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#145EA0] rounded-full flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#B7CEE0]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B7CEE0]">
                Gemini AI Analysis
              </span>
            </div>

            <h3 className="text-xl font-bold leading-tight text-white">
              "{student.name} is predicted to score <span className="text-[#B7CEE0] font-extrabold">{prediction.predictedExamScore}%</span> in finals."
            </h3>

            <p className="text-xs text-[#B7CEE0] leading-relaxed">
              {prediction.aiRecommendation}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onNavigateTab('planner')}
                className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 flex justify-between items-center text-xs font-semibold text-white transition-all cursor-pointer focus-ring"
              >
                <span>Generate Personal AI Study Plan</span>
                <ArrowUpRight className="w-4 h-4 text-[#B7CEE0]" />
              </button>
              <button
                onClick={() => onNavigateTab('whatif')}
                className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 flex justify-between items-center text-xs font-semibold text-white transition-all cursor-pointer focus-ring"
              >
                <span>Simulate What-if Scenarios</span>
                <ArrowUpRight className="w-4 h-4 text-[#B7CEE0]" />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#145EA0] rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
        </div>
      </div>

      {/* Radar & Bar Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Strengths Radar Chart */}
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#0D2F5B] dark:text-white text-base">
                Subject Skill Radar
              </h3>
              <p className="text-xs text-[#6D96B3]">Comparing Student Score vs Class Average</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#0D2F5B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#145EA0]" /> Student
              </span>
              <span className="flex items-center gap-1 text-[#6D96B3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6D96B3]" /> Class Avg
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" stroke="#6D96B3" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6D96B3" fontSize={10} />
                <Radar name="Student" dataKey="StudentScore" stroke="#145EA0" fill="#145EA0" fillOpacity={0.4} />
                <Radar name="Class Average" dataKey="ClassAvg" stroke="#6D96B3" fill="#6D96B3" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance Breakdown Bar Chart */}
        <div className="clay-card p-6">
          <h3 className="font-bold text-[#0D2F5B] dark:text-white text-base mb-1">
            Exam Score Comparison across Subjects
          </h3>
          <p className="text-xs text-[#6D96B3] mb-4">Current score vs previous term score</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={student.subjects}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject" stroke="#6D96B3" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#6D96B3" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D2F5B', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="score" name="Current Score" fill="#145EA0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="previousScore" name="Previous Score" fill="#B7CEE0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
