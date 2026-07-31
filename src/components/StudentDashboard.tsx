import React, { useState } from 'react';
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
  Radar,
  LineChart,
  Line,
} from 'recharts';
import {
  Sparkles,
  Send,
  CalendarDays,
  Star,
  Clock,
  Target,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StudentDashboardProps {
  student: Student;
  onNavigateTab: (tab: string) => void;
}

/* ---------- helpers ---------- */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 18) return 'Good Afternoon,';
  return 'Good Evening,';
};

const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

/** Seeded deterministic sparkline from a base value */
const genSparkline = (base: number, seed: number = 1) =>
  Array.from({ length: 8 }, (_, i) => ({
    v: Math.min(
      100,
      Math.max(0, base - 8 + i * 1.2 + ((seed * (i + 1)) % 5) - 2)
    ),
  }));

const computeFocusScore = (student: Student) => {
  const motScore =
    student.motivation === 'High' ? 90 : student.motivation === 'Medium' ? 70 : 50;
  const sleepScore = Math.max(0, 100 - Math.abs(student.sleepHours - 8) * 8);
  const studyScore = Math.min(100, student.studyHours * 4.5);
  return Math.round((motScore + sleepScore + studyScore) / 3);
};

/* Performance trend data (monthly lines for Maths / Science / English) */
const buildPerformanceData = (student: Student) => {
  const math = student.examScores['Math'] ?? student.examScores['Maths'] ?? 70;
  const sci =
    student.examScores['Science'] ??
    student.examScores['Physics'] ??
    student.examScores['Chemistry'] ??
    70;
  const eng = student.examScores['English'] ?? 68;

  return (student.attendanceHistory || []).map((rec, i) => ({
    month: rec.month,
    Maths: Math.min(100, Math.round(math * 0.85 + i * 2.5)),
    Science: Math.min(100, Math.round(sci * 0.82 + i * 2)),
    English: Math.min(100, Math.round(eng * 0.78 + i * 2.8)),
  }));
};

/* ---------- Mini sparkline inside each stat card ---------- */
const Sparkline: React.FC<{ data: { v: number }[]; color: string }> = ({
  data,
  color,
}) => (
  <LineChart width={85} height={32} data={data} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
    <Line
      type="monotone"
      dataKey="v"
      stroke={color}
      strokeWidth={2}
      dot={false}
      isAnimationActive={true}
    />
  </LineChart>
);

/* ---------- Stat Card ---------- */
const StatCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  trend: string;
  trendUp: boolean;
  sparkData: { v: number }[];
  sparkColor: string;
  delay: number;
}> = ({ label, value, sub, icon, iconBg, trend, trendUp, sparkData, sparkColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
    className="clay-card p-5.5 flex flex-col justify-between min-h-[145px]"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-[#8A99AD] tracking-widest uppercase mb-0.5">
            {label}
          </p>
          <p className="text-2xl font-black text-[#0F122A] leading-none">
            {value}
          </p>
          <p className="text-[10px] text-[#8A99AD] font-bold mt-1.5">{sub}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mt-4">
      <span
        className={`text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-lg border ${
          trendUp 
            ? 'bg-emerald-50/70 border-emerald-250 text-emerald-600' 
            : 'bg-red-50/70 border-red-250 text-red-500'
        }`}
      >
        <ArrowUpRight
          className={`w-3 h-3 ${!trendUp ? 'rotate-180' : ''}`}
        />
        {trend}
      </span>
      <Sparkline data={sparkData} color={sparkColor} />
    </div>
  </motion.div>
);

/* ---------- Custom Tooltip for charts ---------- */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="clay-card px-3.5 py-2.5 text-xs font-semibold bg-white/90 backdrop-blur-md border border-white">
      <p className="text-[#8A99AD] mb-1 font-bold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-extrabold text-[#0F122A]">{Math.round(p.value)}%</span>
        </p>
      ))}
    </div>
  );
};

/* ---------- Main Dashboard Component ---------- */
export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onNavigateTab,
}) => {
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const { user } = useAuth();

  const prediction = calculateStudentPrediction(student);
  const scoresList = Object.values(student.examScores) as number[];
  const avgScore =
    scoresList.length > 0
      ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(1)
      : '0';

  const focusScore = computeFocusScore(student);
  const seed = student.studentId.charCodeAt(student.studentId.length - 1);

  const performanceData = buildPerformanceData(student);

  /* Radar: use subjects array */
  const radarData = student.subjects.map((s) => ({
    subject: s.subject,
    score: s.score,
  }));

  /* Quick send to copilot drawer */
  const handleCopilotSend = async (prompt?: string) => {
    const text = prompt || copilotInput;
    if (!text.trim()) return;
    setIsCopilotLoading(true);
    setCopilotInput('');
    // Navigate to full copilot view
    onNavigateTab('copilot');
    setIsCopilotLoading(false);
  };

  const quickSuggestions = [
    { icon: '🌿', label: 'Explain Photosynthesis' },
    { icon: '📅', label: 'Study Plan for Exams' },
    { icon: '⚛️', label: 'Quiz me on Physics' },
    { icon: '📄', label: 'Summarize this chapter' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-6"
    >
      {/* ── ROW 1: Welcome + AI Copilot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 clay-card p-8 flex items-center justify-between gap-6 overflow-hidden relative min-h-[190px]"
        >
          {/* Gradient glow blob */}
          <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-indigo-400/20 via-purple-400/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest mb-1.5">
                {getGreeting()}
              </p>
              <h1 className="text-4xl font-black text-[#0F122A] mb-3 leading-none">
                {student.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-[#4A5568] font-bold mb-6 max-w-xs">
                Here's what's happening with your learning journey today.
              </p>
            </div>

            {/* Date + tasks pills */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-white/60 text-[10px] font-extrabold text-[#4A5568] shadow-sm">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-white/60 text-[10px] font-extrabold text-[#4A5568] shadow-sm">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                {student.streak} day streak 🔥
              </div>
            </div>
          </div>

          {/* 3D Clay Arch asset */}
          <div className="relative z-10 shrink-0 hidden sm:block">
            <img
              src="/src/assets/clay_arch.png"
              alt="3D Arch illustration"
              className="w-40 h-40 object-contain drop-shadow-xl"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* AI Copilot Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 clay-card p-6 flex flex-col gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase">
                AI Copilot
              </h3>
            </div>
            <p className="text-[10px] text-[#8A99AD] font-bold">
              Ask me anything about your studies
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-2.5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent text-xs text-[#0F122A] placeholder-[#8A99AD] focus:outline-none font-bold"
            />
            <button
              onClick={() => handleCopilotSend()}
              className="clay-btn p-2 rounded-xl shrink-0 cursor-pointer"
              aria-label="Send to AI Copilot"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>

          {/* Quick suggestion chips */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {quickSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleCopilotSend(s.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold text-[#4A5568] hover:text-[#0F122A] clay-card-sub hover:border-indigo-300 transition-all text-left cursor-pointer focus-ring"
              >
                <span>{s.icon}</span>
                <span className="leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── ROW 2: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Attendance"
          value={`${student.attendance}%`}
          sub="This Month"
          icon={<CalendarDays className="w-4.5 h-4.5 text-indigo-500" />}
          iconBg="bg-indigo-50"
          trend={`${student.attendance >= 75 ? '↑ 6%' : '↓ 4%'}`}
          trendUp={student.attendance >= 75}
          sparkData={genSparkline(student.attendance, seed)}
          sparkColor="#6366F1"
          delay={0.1}
        />
        <StatCard
          label="Average Score"
          value={`${avgScore}%`}
          sub="All Subjects"
          icon={<Star className="w-4.5 h-4.5 text-purple-500" />}
          iconBg="bg-purple-50"
          trend="↑ 4.3%"
          trendUp={true}
          sparkData={genSparkline(Number(avgScore), seed + 1)}
          sparkColor="#8B5CF6"
          delay={0.15}
        />
        <StatCard
          label="Study Hours"
          value={`${student.studyHours}h`}
          sub="This Week"
          icon={<Clock className="w-4.5 h-4.5 text-cyan-500" />}
          iconBg="bg-cyan-50"
          trend="↑ 12%"
          trendUp={true}
          sparkData={genSparkline(student.studyHours * 4, seed + 2)}
          sparkColor="#22D3EE"
          delay={0.2}
        />
        <StatCard
          label="Focus Score"
          value={`${focusScore}/100`}
          sub="Keep it up!"
          icon={<Target className="w-4.5 h-4.5 text-emerald-500" />}
          iconBg="bg-emerald-50"
          trend="↑ 8%"
          trendUp={focusScore >= 70}
          sparkData={genSparkline(focusScore, seed + 3)}
          sparkColor="#10B981"
          delay={0.25}
        />
      </div>

      {/* ── ROW 3: Performance Chart + Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Performance Overview */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 clay-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase">
                Performance Overview
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#8A99AD] border border-slate-200 bg-slate-50 px-3 py-1 rounded-full">
              This Month ▾
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.12)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#8A99AD', fontWeight: 705 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#8A99AD', fontWeight: 705 }}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Maths"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#FFFFFF' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Science"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#FFFFFF' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="English"
                  stroke="#EC4899"
                  strokeWidth={3}
                  dot={{ r: 3.5, strokeWidth: 1.5, fill: '#FFFFFF' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-4 pl-1">
            {[
              { label: 'Maths', color: '#6366F1' },
              { label: 'Science', color: '#8B5CF6' },
              { label: 'English', color: '#EC4899' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-[10px] font-bold text-[#8A99AD] uppercase tracking-wider">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subject Strength Radar */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 clay-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <h3 className="font-black text-xs text-[#0F122A] tracking-wider uppercase">
              Subject Strength
            </h3>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <PolarGrid
                  stroke="rgba(148,163,184,0.15)"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: '#8A99AD', fontWeight: 700 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#radarGrad)"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── ROW 4: AI Prediction + Quick Nav ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Prediction banner */}
        <div className="lg:col-span-2 clay-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-650 to-violet-600 border-0 text-white shadow-lg shadow-indigo-650/15">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-650 to-violet-600 opacity-95" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">
                Gemini AI Prediction
              </span>
            </div>
            <h3 className="text-lg font-black leading-snug mb-2">
              Predicted final score:{' '}
              <span className="text-yellow-300">{prediction.predictedExamScore}%</span>
            </h3>
            <p className="text-xs text-white/85 leading-relaxed mb-4 max-w-lg font-medium">
              {prediction.aiRecommendation}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onNavigateTab('planner')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Generate Study Plan <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('whatif')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Simulate What-If <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats summary */}
        <div className="clay-card p-6 flex flex-col justify-between gap-4">
          <h3 className="font-black text-xs text-[#0F122A] uppercase tracking-wider">Pass Probability</h3>
          <div className="text-5xl font-black text-[#0F122A]">
            {prediction.passProbability}
            <span className="text-2xl text-[#8A99AD] font-bold">%</span>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${prediction.passProbability}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-black text-[#8A99AD] uppercase tracking-wider">
              <span>At Risk</span>
              <span>On Track</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {student.badges.slice(0, 3).map((b) => (
              <span
                key={b.id}
                className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100"
              >
                {b.icon} {b.title}
              </span>
            ))}
            {student.badges.length === 0 && (
              <span className="text-xs text-[#8A99AD] font-bold">
                Level {student.level} · {student.xp} XP
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
