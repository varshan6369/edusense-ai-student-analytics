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
  BookOpen,
  FlaskConical,
  FileText,
  Brain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StudentDashboardProps {
  student: Student;
  onNavigateTab: (tab: string) => void;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 18) return 'Good Afternoon,';
  return 'Good Evening,';
};

const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
  weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
});

const genSparkline = (base: number, seed: number = 1) =>
  Array.from({ length: 8 }, (_, i) => ({
    v: Math.min(100, Math.max(0, base - 8 + i * 1.2 + ((seed * (i + 1)) % 5) - 2)),
  }));

const computeFocusScore = (student: Student) => {
  const motScore = student.motivation === 'High' ? 90 : student.motivation === 'Medium' ? 70 : 50;
  const sleepScore = Math.max(0, 100 - Math.abs(student.sleepHours - 8) * 8);
  const studyScore = Math.min(100, student.studyHours * 4.5);
  return Math.round((motScore + sleepScore + studyScore) / 3);
};

const buildPerformanceData = (student: Student) => {
  const math = student.examScores['Math'] ?? student.examScores['Maths'] ?? 70;
  const sci = student.examScores['Science'] ?? student.examScores['Physics'] ?? 70;
  const eng = student.examScores['English'] ?? 68;
  return (student.attendanceHistory || []).map((rec, i) => ({
    month: rec.month,
    Maths: Math.min(100, Math.round(math * 0.85 + i * 2.5)),
    Science: Math.min(100, Math.round(sci * 0.82 + i * 2)),
    English: Math.min(100, Math.round(eng * 0.78 + i * 2.8)),
  }));
};

/* Mini sparkline */
const Sparkline: React.FC<{ data: { v: number }[]; color: string }> = ({ data, color }) => (
  <LineChart width={80} height={30} data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} />
  </LineChart>
);

/* Stat Card — exact design: icon left, big number, subtitle, trend badge + sparkline bottom */
const StatCard: React.FC<{
  label: string; value: string; sub: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
  trend: string; trendUp: boolean;
  sparkData: { v: number }[]; sparkColor: string; delay: number;
}> = ({ label, value, sub, icon, iconBg, iconColor, trend, trendUp, sparkData, sparkColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 280, damping: 24 }}
    className="stat-card p-5 flex flex-col gap-3"
  >
    {/* Top: icon + label + value */}
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#9B9BB8] mb-0.5">{label}</p>
        <p className="text-[26px] font-black text-[#1A1A2E] leading-none tracking-tight">{value}</p>
        <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">{sub}</p>
      </div>
    </div>
    {/* Bottom: trend + sparkline */}
    <div className="flex items-center justify-between">
      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
        <ArrowUpRight className={`w-3 h-3 ${!trendUp ? 'rotate-180' : ''}`} />
        {trend}
      </span>
      <Sparkline data={sparkData} color={sparkColor} />
    </div>
  </motion.div>
);

/* Chart tooltip */
const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3.5 py-2.5 text-xs font-semibold !bg-white/95">
      <p className="text-[#9B9BB8] mb-1 font-bold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-black text-[#1A1A2E] ml-0.5">{Math.round(p.value)}%</span>
        </p>
      ))}
    </div>
  );
};

/* Main Dashboard */
export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onNavigateTab }) => {
  const { activeStudent } = useAuth();
  const [aiQuery, setAiQuery] = useState('');
  const pred = calculateStudentPrediction(student);

  const avgScore = student.subjects?.length
    ? Math.round(student.subjects.reduce((s, x) => s + x.score, 0) / student.subjects.length)
    : Math.round(Object.values(student.examScores).reduce((s: number, v: number) => s + v, 0) / Math.max(1, Object.values(student.examScores).length));

  const focusScore = computeFocusScore(student);
  const perfData = buildPerformanceData(student);
  const displayName = (activeStudent?.name || student.name).split(' ')[0];

  // Radar data from subjects
  const radarData = [
    { subject: 'Maths',    value: student.examScores['Math'] ?? student.examScores['Maths'] ?? 72 },
    { subject: 'Science',  value: student.examScores['Science'] ?? student.examScores['Physics'] ?? 68 },
    { subject: 'English',  value: student.examScores['English'] ?? 65 },
    { subject: 'Computer', value: student.examScores['Computer'] ?? student.examScores['ICT'] ?? 75 },
    { subject: 'Social',   value: student.examScores['Social'] ?? student.examScores['History'] ?? 70 },
  ];

  const quickSuggestions = [
    { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Explain Photosynthesis' },
    { icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'Study Plan for Exams' },
    { icon: <FlaskConical className="w-3.5 h-3.5" />, label: 'Quiz me on Physics' },
    { icon: <FileText className="w-3.5 h-3.5" />, label: 'Summarize this chapter' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Row 1: Welcome + AI Copilot ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="glass-card p-7 flex items-center justify-between overflow-hidden relative min-h-[200px]"
        >
          <div className="z-10">
            <p className="text-[#6366F1] font-bold text-base mb-1">{getGreeting()}</p>
            <h1 className="text-[40px] font-black text-[#1A1A2E] leading-none tracking-tight mb-3">
              {displayName} 👋
            </h1>
            <p className="text-sm text-[#9B9BB8] font-medium leading-relaxed max-w-[260px]">
              Here's what's happening with your learning journey today.
            </p>
            <div className="flex items-center gap-2 mt-5 text-[11px] text-[#9B9BB8] font-semibold">
              <CalendarDays className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>{formattedDate}</span>
              <span className="ml-2 px-2.5 py-1 bg-[#EEF2FF] text-[#6366F1] font-bold rounded-full text-[10px]">
                {student.studyHours > 0 ? `${student.studyHours * 2} tasks today` : '12 tasks today'}
              </span>
            </div>
          </div>

          {/* 3D Portal Visual */}
          <div className="absolute right-0 bottom-0 w-48 h-48 pointer-events-none select-none">
            <img
              src="https://cdn.dribbble.com/userupload/12302729/file/original-b048ef84b8b54b4f5e94e62e2dbbb0db.png"
              alt="3D Portal"
              className="w-full h-full object-contain object-right-bottom opacity-90"
              onError={(e) => {
                // fallback: decorative gradient orb
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Fallback decorative orb */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-300/40 via-purple-300/40 to-pink-200/30 blur-2xl" />
              <div className="absolute w-24 h-24 rounded-full border-4 border-indigo-200/50 border-dashed animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
        </motion.div>

        {/* AI Copilot Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 24 }}
          className="glass-card p-6 flex flex-col gap-4"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="font-black text-[#1A1A2E] text-base">AI Copilot</span>
            </div>
            <p className="text-sm text-[#9B9BB8] font-medium">Ask me anything about your studies</p>
          </div>

          {/* Input */}
          <div className="ai-input flex items-center gap-3 px-4 py-3">
            <input
              type="text"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9B9BB8] outline-none font-medium"
              onKeyDown={e => {
                if (e.key === 'Enter' && aiQuery.trim()) {
                  onNavigateTab('copilot');
                }
              }}
            />
            <button
              onClick={() => onNavigateTab('copilot')}
              className="btn-primary w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Suggestions 2×2 grid */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {quickSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onNavigateTab('copilot')}
                className="suggestion-chip flex items-center gap-2 px-3 py-2.5 text-[11px] font-semibold text-[#4A4A6A]"
              >
                <span className="text-[#6366F1] shrink-0">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: 4 Stat Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Attendance" value={`${student.attendance}%`} sub="This Month"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBg="bg-indigo-50" iconColor="text-indigo-500"
          trend={`↑ ${Math.max(2, Math.round(student.attendance - 86))}%`} trendUp={student.attendance >= 75}
          sparkData={genSparkline(student.attendance, 1)} sparkColor="#6366F1" delay={0.12}
        />
        <StatCard
          label="Average Score" value={`${avgScore}.4%`} sub="All Subjects"
          icon={<Star className="w-5 h-5" />}
          iconBg="bg-violet-50" iconColor="text-violet-500"
          trend={`↑ 4.3%`} trendUp={true}
          sparkData={genSparkline(avgScore, 2)} sparkColor="#8B5CF6" delay={0.18}
        />
        <StatCard
          label="Study Hours" value={`${student.studyHours}.6h`} sub="This Week"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-cyan-50" iconColor="text-cyan-500"
          trend={`↑ 12%`} trendUp={true}
          sparkData={genSparkline(student.studyHours * 5, 3)} sparkColor="#22D3EE" delay={0.24}
        />
        <StatCard
          label="Focus Score" value={`${focusScore}`} sub="Keep it up!"
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-orange-50" iconColor="text-orange-500"
          trend={`↑ 8%`} trendUp={true}
          sparkData={genSparkline(focusScore, 4)} sparkColor="#F97316" delay={0.3}
        />
      </div>

      {/* ── Row 3: Performance Chart + Radar ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, type: 'spring', stiffness: 280, damping: 24 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6366F1]" />
              <h3 className="font-black text-[#1A1A2E] text-base">Performance Overview</h3>
            </div>
            <button className="text-xs font-semibold text-[#9B9BB8] hover:text-[#6366F1] transition-colors flex items-center gap-1">
              This Month ▾
            </button>
          </div>

          {perfData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={perfData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradMaths" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradScience" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradEnglish" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9B9BB8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9B9BB8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Maths"   stroke="#6366F1" strokeWidth={2} fill="url(#gradMaths)"   dot={false} />
                <Area type="monotone" dataKey="Science" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradScience)" dot={false} />
                <Area type="monotone" dataKey="English" stroke="#EC4899" strokeWidth={2} fill="url(#gradEnglish)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[#9B9BB8] text-sm font-medium">
              No performance data available
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 justify-center">
            {[{ label: 'Maths', color: '#6366F1' }, { label: 'Science', color: '#8B5CF6' }, { label: 'English', color: '#EC4899' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px] text-[#9B9BB8] font-semibold">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subject Strength Radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 280, damping: 24 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#6366F1]" />
            <h3 className="font-black text-[#1A1A2E] text-base">Subject Strength</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(99,102,241,0.12)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#9B9BB8', fontWeight: 600 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#radarFill)"
                dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
};


