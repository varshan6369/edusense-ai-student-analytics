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
  <LineChart width={90} height={36} data={data}>
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
    className="clay-card p-5 flex flex-col gap-3"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-[var(--text-primary)] leading-none">
          {value}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">{sub}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
    </div>

    <div className="flex items-end justify-between">
      <span
        className={`text-xs font-bold flex items-center gap-1 ${
          trendUp ? 'text-emerald-500' : 'text-red-400'
        }`}
      >
        <ArrowUpRight
          className={`w-3.5 h-3.5 ${!trendUp ? 'rotate-180' : ''}`}
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
    <div className="clay-card px-3 py-2 text-xs font-semibold">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-extrabold">{Math.round(p.value)}%</span>
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
          className="lg:col-span-3 clay-card p-7 flex items-center justify-between gap-6 overflow-hidden relative min-h-[190px]"
        >
          {/* Gradient glow blob */}
          <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-indigo-400/20 via-purple-400/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-lg font-bold text-indigo-500 dark:text-indigo-400 mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
              {student.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-medium mb-5 max-w-xs">
              Here's what's happening with your learning journey today.
            </p>

            {/* Date + tasks pills */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-xs font-semibold text-[var(--text-secondary)]">
                <CalendarDays className="w-3.5 h-3.5" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-xs font-semibold text-[var(--text-secondary)]">
                <Target className="w-3.5 h-3.5" />
                {student.streak} day streak 🔥
              </div>
            </div>
          </div>

          {/* 3D Clay Arch asset */}
          <div className="relative z-10 shrink-0 hidden sm:block">
            <img
              src="/src/assets/clay_arch.png"
              alt="3D Arch illustration"
              className="w-40 h-40 object-contain drop-shadow-2xl"
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
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] tracking-wide">
                AI Copilot
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Ask me anything about your studies
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 clay-card-sub px-4 py-2.5">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-medium"
            />
            <button
              onClick={() => handleCopilotSend()}
              className="clay-btn p-2 rounded-xl shrink-0 cursor-pointer"
              aria-label="Send to AI Copilot"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick suggestion chips */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {quickSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleCopilotSend(s.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] clay-card-sub hover:border-indigo-300/50 dark:hover:border-indigo-700/50 transition-all text-left cursor-pointer focus-ring"
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
          icon={<CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          trend={`${student.attendance >= 75 ? '+6%' : '-4%'}`}
          trendUp={student.attendance >= 75}
          sparkData={genSparkline(student.attendance, seed)}
          sparkColor="#6366F1"
          delay={0.1}
        />
        <StatCard
          label="Average Score"
          value={`${avgScore}%`}
          sub="All Subjects"
          icon={<Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/40"
          trend="+4.3%"
          trendUp={true}
          sparkData={genSparkline(Number(avgScore), seed + 1)}
          sparkColor="#8B5CF6"
          delay={0.15}
        />
        <StatCard
          label="Study Hours"
          value={`${student.studyHours}h`}
          sub="This Week"
          icon={<Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-100 dark:bg-violet-900/40"
          trend="+12%"
          trendUp={true}
          sparkData={genSparkline(student.studyHours * 4, seed + 2)}
          sparkColor="#22D3EE"
          delay={0.2}
        />
        <StatCard
          label="Focus Score"
          value={`${focusScore}/100`}
          sub="Keep it up!"
          icon={<Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          trend="+8%"
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
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Performance Overview
              </h3>
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)] border border-[var(--border-card)] px-3 py-1 rounded-xl">
              This Month ▾
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="gradMaths" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSci" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.15)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Maths"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#gradMaths)"
                />
                <Area
                  type="monotone"
                  dataKey="Science"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#gradSci)"
                />
                <Area
                  type="monotone"
                  dataKey="English"
                  stroke="#EC4899"
                  strokeWidth={2.5}
                  fill="url(#gradEng)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 pl-2">
            {[
              { label: 'Maths', color: '#6366F1' },
              { label: 'Science', color: '#8B5CF6' },
              { label: 'English', color: '#EC4899' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-0.5 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
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
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Subject Strength
            </h3>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid
                  stroke="rgba(148,163,184,0.2)"
                  strokeDasharray="0"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
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
        <div className="lg:col-span-2 clay-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 border-0 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 opacity-95" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/70">
                Gemini AI Prediction
              </span>
            </div>
            <h3 className="text-lg font-extrabold leading-snug mb-2">
              Predicted final score:{' '}
              <span className="text-yellow-300">{prediction.predictedExamScore}%</span>
            </h3>
            <p className="text-xs text-white/75 leading-relaxed mb-4 max-w-lg">
              {prediction.aiRecommendation}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onNavigateTab('planner')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Generate Study Plan <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('whatif')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Simulate What-If <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats summary */}
        <div className="clay-card p-6 flex flex-col justify-between gap-4">
          <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Pass Probability</h3>
          <div className="text-5xl font-extrabold text-[var(--text-primary)]">
            {prediction.passProbability}
            <span className="text-2xl text-[var(--text-muted)]">%</span>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-[var(--border-card)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${prediction.passProbability}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <span>At Risk</span>
              <span>On Track</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {student.badges.slice(0, 3).map((b) => (
              <span
                key={b.id}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"
              >
                {b.icon} {b.title}
              </span>
            ))}
            {student.badges.length === 0 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Level {student.level} · {student.xp} XP
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
