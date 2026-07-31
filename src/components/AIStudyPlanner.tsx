import React, { useState } from 'react';
import { Student, WeeklyStudyPlan } from '../types';
import {
  CalendarCheck,
  Sparkles,
  Clock,
  CheckSquare,
  Square,
  BookOpen,
  Share2,
  FileDown,
  Loader2,
  ListTodo,
} from 'lucide-react';

interface AIStudyPlannerProps {
  student: Student;
  onSelectStudent: (id: string) => void;
  allStudents: Student[];
}

export const AIStudyPlanner: React.FC<AIStudyPlannerProps> = ({
  student,
  onSelectStudent,
  allStudents,
}) => {
  const [examHorizon, setExamHorizon] = useState('Mid-Term Exams in 2 Weeks');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WeeklyStudyPlan | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const generatePlanner = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          targetExamDate: examHorizon,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPlan(data.data);
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (err: any) {
      alert(`Error generating plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              Gemini Automated Study Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            AI Weekly Study Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generates a personalized daily study routine tailored to weak subjects and target goals.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={student.studentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700 outline-none w-full sm:w-auto"
          >
            {allStudents.map((st) => (
              <option key={st.studentId} value={st.studentId}>
                {st.name} ({st.attendance}% Att)
              </option>
            ))}
          </select>

          <button
            onClick={generatePlanner}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#145EA0] hover:bg-[#0D2F5B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#145EA0]/30 transition-all disabled:opacity-50 focus-ring cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#B7CEE0]" /> Generate 7-Day Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Results View */}
      {plan ? (
        <div className="space-y-6">
          {/* Plan Info Card */}
          <div className="clay-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#145EA0] dark:text-[#6D96B3] uppercase tracking-wider">
                Weekly Target Goal
              </span>
              <h2 className="text-xl font-extrabold text-[#0D2F5B] dark:text-white mt-0.5">
                {plan.weeklyGoal}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Target Allocation: <span className="font-bold">{plan.totalTargetHours} Hours</span> total across 7 days.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Plan copied to clipboard!')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0D2F5B] dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-[#B7CEE0] dark:border-slate-700 focus-ring cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Save to Keep
              </button>
            </div>
          </div>

          {/* AI Advice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.aiAdvice.map((adv, idx) => (
              <div
                key={idx}
                className="bg-[#F1F5F9] dark:from-slate-800/80 dark:to-slate-900/80 p-4 rounded-2xl border border-[#B7CEE0] dark:border-slate-800 flex items-start gap-3"
              >
                <div className="p-2 bg-[#0D2F5B] text-white rounded-xl text-xs font-black shrink-0">
                  #{idx + 1}
                </div>
                <p className="text-xs text-[#0F172A] dark:text-slate-300 font-medium leading-relaxed">
                  {adv}
                </p>
              </div>
            ))}
          </div>

          {/* 7-Day Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.schedule.map((dayItem, dIdx) => (
              <div
                key={dIdx}
                className="clay-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      {dayItem.day}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block">
                      {dayItem.focusSubject}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      dayItem.priority === 'High'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {dayItem.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Topic: {dayItem.topic} ({dayItem.durationMinutes} mins)</span>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Action Tasks
                  </span>
                  {dayItem.tasks.map((task, tIdx) => {
                    const taskId = `d${dIdx}-t${tIdx}`;
                    const isDone = !!completedTasks[taskId];
                    return (
                      <button
                        key={tIdx}
                        onClick={() => toggleTask(taskId)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 line-through'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span>{task}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty Prompt Banner */
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
            <ListTodo className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              No Weekly Plan Generated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click "Generate 7-Day Plan" above to trigger Gemini RAG analysis based on {student.name}'s attendance and test scores.
            </p>
          </div>
          <button
            onClick={generatePlanner}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Generate Plan Now
          </button>
        </div>
      )}
    </div>
  );
};
