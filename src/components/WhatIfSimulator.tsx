import React, { useState, useEffect } from 'react';
import { Student, MotivationLevel } from '../types';
import { simulateWhatIf, calculateStudentPrediction } from '../services/predictionEngine';
import {
  Calculator,
  Sliders,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  student: Student;
  onSelectStudent: (id: string) => void;
  allStudents: Student[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  student,
  onSelectStudent,
  allStudents,
}) => {
  const [attendance, setAttendance] = useState(student.attendance);
  const [studyHours, setStudyHours] = useState(student.studyHours);
  const [sleepHours, setSleepHours] = useState(student.sleepHours);
  const [motivation, setMotivation] = useState<MotivationLevel>(student.motivation);

  useEffect(() => {
    setAttendance(student.attendance);
    setStudyHours(student.studyHours);
    setSleepHours(student.sleepHours);
    setMotivation(student.motivation);
  }, [student]);

  const currentPrediction = calculateStudentPrediction(student);
  const simulatedPrediction = simulateWhatIf(student, attendance, studyHours, sleepHours, motivation);

  const scoreDelta = simulatedPrediction.predictedExamScore - currentPrediction.predictedExamScore;

  const handleReset = () => {
    setAttendance(student.attendance);
    setStudyHours(student.studyHours);
    setSleepHours(student.sleepHours);
    setMotivation(student.motivation);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              ML & AI Factors Scenario Simulator
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            What-if Performance Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Adjust attendance, study habits, and sleep hours to observe real-time predicted score impact.
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl w-full sm:w-auto min-w-[200px]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Select Student</label>
          <select
            value={student.studentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 outline-none w-full"
          >
            {allStudents.map((st) => (
              <option key={st.studentId} value={st.studentId}>
                {st.name} ({st.attendance}% Att)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-7 clay-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <h3 className="font-bold text-[#0D2F5B] dark:text-white text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#145EA0] dark:text-[#6D96B3]" />
              Adjust Behavioral Factors
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-semibold text-[#6D96B3] hover:text-[#0D2F5B] p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors focus-ring cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Baseline
            </button>
          </div>

          {/* Attendance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#0D2F5B] dark:text-slate-300">Attendance Rate</span>
              <span className={`text-sm px-2.5 py-0.5 rounded-lg ${attendance >= 75 ? 'bg-[#F1F5F9] text-[#0D2F5B] border border-[#B7CEE0]' : 'bg-red-100 text-red-700'}`}>
                {attendance}%
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
              className="w-full accent-[#145EA0] cursor-pointer h-2 bg-[#E2E8F0] rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#6D96B3] font-medium">
              <span>40% (Critical Absenteeism)</span>
              <span>75% (Target)</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Study Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#0D2F5B] dark:text-slate-300">Self-Study Hours / Week</span>
              <span className="text-sm px-2.5 py-0.5 rounded-lg bg-[#F1F5F9] text-[#0D2F5B] border border-[#B7CEE0]">
                {studyHours} hrs/wk
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={1}
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full accent-[#145EA0] cursor-pointer h-2 bg-[#E2E8F0] rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#6D96B3] font-medium">
              <span>0 hrs</span>
              <span>15 hrs (Recommended)</span>
              <span>35 hrs</span>
            </div>
          </div>

          {/* Sleep Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#0D2F5B] dark:text-slate-300">Sleep Quality / Night</span>
              <span className="text-sm px-2.5 py-0.5 rounded-lg bg-[#F1F5F9] text-[#0D2F5B] border border-[#B7CEE0]">
                {sleepHours} hrs/night
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={11}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-[#145EA0] cursor-pointer h-2 bg-[#E2E8F0] rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#6D96B3] font-medium">
              <span>3 hrs (Deprived)</span>
              <span>8 hrs (Optimal)</span>
              <span>11 hrs</span>
            </div>
          </div>

          {/* Motivation Level Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0D2F5B] dark:text-slate-300">
              Student Motivation Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as MotivationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMotivation(lvl)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border focus-ring cursor-pointer ${
                    motivation === lvl
                      ? 'bg-[#145EA0] text-white border-[#145EA0] shadow-sm'
                      : 'bg-[#F1F5F9] dark:bg-slate-800 text-[#6D96B3] dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700'
                  }`}
                >
                  {lvl} Motivation
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Simulation Output Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="clay-card-dark p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Live Outcome Prediction
              </span>
              <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                Confidence: {simulatedPrediction.confidenceScore}%
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="flex items-baseline justify-between pt-2">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Simulated Predicted Score</span>
                <span className="text-4xl font-black text-emerald-400">
                  {simulatedPrediction.predictedExamScore}%
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Baseline Score</span>
                <span className="text-lg font-bold text-slate-300">
                  {currentPrediction.predictedExamScore}%
                </span>
              </div>
            </div>

            {/* Delta Indicator Pill */}
            <div
              className={`p-3 rounded-2xl flex items-center justify-between font-bold text-xs ${
                scoreDelta > 0
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                  : scoreDelta < 0
                  ? 'bg-red-950/70 border border-red-800 text-red-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {scoreDelta > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : scoreDelta < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Zap className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {scoreDelta > 0
                    ? `+${scoreDelta} Points Score Improvement!`
                    : scoreDelta < 0
                    ? `${scoreDelta} Points Drop Risk`
                    : 'No change from baseline'}
                </span>
              </div>
              <span>Pass Prob: {simulatedPrediction.passProbability}%</span>
            </div>

            {/* Influencing Factors List */}
            <div className="space-y-2 pt-2 border-t border-indigo-900/60">
              <span className="text-xs font-bold text-slate-300 block">Calculated Factors Impact</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {simulatedPrediction.influencingFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-white">{f.factor}</div>
                      <div className="text-[10px] text-slate-400">{f.description}</div>
                    </div>
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                        f.impact === 'positive'
                          ? 'text-emerald-400 bg-emerald-950/50'
                          : f.impact === 'negative'
                          ? 'text-red-400 bg-red-950/50'
                          : 'text-slate-300 bg-slate-800'
                      }`}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
