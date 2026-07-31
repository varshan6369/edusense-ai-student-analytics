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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
              Gemini Automated Study Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F122A] tracking-tight">
            AI Weekly Study Planner
          </h1>
          <p className="text-xs text-[#8A99AD] font-bold mt-1">
            Generates a personalized daily study routine tailored to weak subjects and target goals.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={student.studentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-slate-50 text-[#0F122A] text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 outline-none w-full sm:w-auto cursor-pointer"
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 clay-btn font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 focus-ring cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white/95" /> Generate 7-Day Plan
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
              <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider">
                Weekly Target Goal
              </span>
              <h2 className="text-xl font-black text-[#0F122A] mt-0.5 leading-none">
                {plan.weeklyGoal}
              </h2>
              <p className="text-xs text-[#8A99AD] font-bold mt-1.5">
                Target Allocation: <span className="font-extrabold text-[#0F122A]">{plan.totalTargetHours} Hours</span> total across 7 days.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Plan copied to clipboard!')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 text-[#0F122A] text-xs font-bold rounded-xl transition-all border border-slate-200/50 focus-ring cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4 text-[#8A99AD]" /> Save to Keep
              </button>
            </div>
          </div>

          {/* AI Advice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.aiAdvice.map((adv, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-start gap-3 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="p-2 bg-indigo-600 text-white rounded-xl text-xs font-black shrink-0 shadow-sm shadow-indigo-600/10">
                  #{idx + 1}
                </div>
                <p className="text-xs text-[#4A5568] font-bold leading-relaxed">
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
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-black text-[#0F122A] text-base leading-none block">
                      {dayItem.day}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider mt-1 block">
                      {dayItem.focusSubject}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      dayItem.priority === 'High'
                        ? 'bg-red-50 border-red-100 text-red-650'
                        : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}
                  >
                    {dayItem.priority}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#8A99AD] font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Topic: <span className="text-[#4A5568]">{dayItem.topic}</span> ({dayItem.durationMinutes} mins)</span>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[9px] font-black text-[#8A99AD] uppercase tracking-wider block">
                    Action Tasks
                  </span>
                  {dayItem.tasks.map((task, tIdx) => {
                    const taskId = `d${dIdx}-t${tIdx}`;
                    const isDone = !!completedTasks[taskId];
                    return (
                      <button
                        key={tIdx}
                        onClick={() => toggleTask(taskId)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-colors border ${
                          isDone
                            ? 'bg-emerald-55/40 border-emerald-100 text-emerald-600 line-through font-bold'
                            : 'bg-slate-50 border-slate-100 text-[#4A5568] hover:bg-slate-100/50 font-bold'
                        }`}
                      >
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-[#8A99AD] shrink-0 mt-0.5" />
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
        <div className="bg-white border border-dashed border-slate-200 p-12 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ListTodo className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-[#0F122A] text-lg leading-none">
              No Weekly Plan Generated Yet
            </h3>
            <p className="text-xs text-[#8A99AD] font-bold max-w-md mx-auto mt-2">
              Click "Generate 7-Day Plan" above to trigger Gemini RAG analysis based on {student.name}'s attendance and test scores.
            </p>
          </div>
          <button
            onClick={generatePlanner}
            disabled={loading}
            className="inline-flex items-center gap-2 clay-btn font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            Generate Plan Now
          </button>
        </div>
      )}
    </div>
  );
};
