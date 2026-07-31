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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
              ML & AI Factors Scenario Simulator
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">
            What-if Performance Simulator
          </h1>
          <p className="text-xs text-[#9B9BB8] font-bold mt-1">
            Adjust attendance, study habits, and sleep hours to observe real-time predicted score impact.
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl w-full sm:w-auto min-w-[200px]">
          <label className="block text-[9px] font-black uppercase tracking-wider text-[#9B9BB8] mb-1">Select Student</label>
          <select
            value={student.studentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-white text-[#1A1A2E] text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-200 outline-none w-full"
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-black text-xs text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Adjust Behavioral Factors
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus-ring cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Baseline
            </button>
          </div>

          {/* Attendance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#4A4A6A]">Attendance Rate</span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${attendance >= 75 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-650'}`}>
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
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#9B9BB8] font-bold">
              <span>40% (Critical Absenteeism)</span>
              <span>75% (Target)</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Study Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#4A4A6A]">Self-Study Hours / Week</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
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
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#9B9BB8] font-bold">
              <span>0 hrs</span>
              <span>15 hrs (Recommended)</span>
              <span>35 hrs</span>
            </div>
          </div>

          {/* Sleep Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#4A4A6A]">Sleep Quality / Night</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
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
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#9B9BB8] font-bold">
              <span>3 hrs (Deprived)</span>
              <span>8 hrs (Optimal)</span>
              <span>11 hrs</span>
            </div>
          </div>

          {/* Motivation Level Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#4A4A6A]">
              Student Motivation Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as MotivationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMotivation(lvl)}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border focus-ring cursor-pointer ${
                    motivation === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/10'
                      : 'bg-slate-50 text-[#9B9BB8] border-slate-200/50 hover:bg-slate-100/50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Simulation Output Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-6 sm:p-8 space-y-6 bg-gradient-to-br from-indigo-600 via-purple-650 to-purple-650 border-0 text-white shadow-lg shadow-indigo-650/15">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-white/90" /> Live Outcome Prediction
              </span>
              <span className="text-[9px] font-black uppercase bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                Confidence: {simulatedPrediction.confidenceScore}%
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="flex items-baseline justify-between pt-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/70 block">Simulated Score</span>
                <span className="text-5xl font-black text-yellow-300">
                  {simulatedPrediction.predictedExamScore}%
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/70 block">Baseline</span>
                <span className="text-xl font-bold text-white/90">
                  {currentPrediction.predictedExamScore}%
                </span>
              </div>
            </div>

            {/* Delta Indicator Pill */}
            <div
              className={`p-3 rounded-2xl flex items-center justify-between font-bold text-xs ${
                scoreDelta > 0
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100'
                  : scoreDelta < 0
                  ? 'bg-red-500/20 border border-red-500/30 text-red-100'
                  : 'bg-white/10 border border-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center gap-2">
                {scoreDelta > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-350" />
                ) : scoreDelta < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-350" />
                ) : (
                  <Zap className="w-4 h-4 text-white/70" />
                )}
                <span>
                  {scoreDelta > 0
                    ? `+${scoreDelta} Points Improvement!`
                    : scoreDelta < 0
                    ? `${scoreDelta} Points Drop Risk`
                    : 'No change'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase bg-white/15 px-2 py-0.5 rounded-md">Pass: {simulatedPrediction.passProbability}%</span>
            </div>

            {/* Influencing Factors List */}
            <div className="space-y-2 pt-4 border-t border-white/15">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">Calculated Factors Impact</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {simulatedPrediction.influencingFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-extrabold text-white">{f.factor}</div>
                      <div className="text-[10px] text-white/70 font-medium">{f.description}</div>
                    </div>
                    <span
                      className={`font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                        f.impact === 'positive'
                          ? 'text-emerald-300 bg-emerald-500/20'
                          : f.impact === 'negative'
                          ? 'text-red-300 bg-red-500/20'
                          : 'text-white bg-white/10'
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


