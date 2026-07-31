import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import jsPDF from 'jspdf';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ReportGeneratorProps {
  student: Student;
  onSelectStudent: (id: string) => void;
  allStudents: Student[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  student,
  onSelectStudent,
  allStudents,
}) => {
  const [reportType, setReportType] = useState<'weekly' | 'parent' | 'teacher'>('parent');

  const prediction = calculateStudentPrediction(student);

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(13, 47, 91); // #0D2F5B (Deep Blue)
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EduSense Learning Analytics Report', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, 18);

    // Student Info Block
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${student.name}`, 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${student.studentId}  |  Class: ${student.class}  |  Roll #: ${student.rollNumber}`, 14, 52);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 57, 196, 57);

    // Metrics Overview
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Metrics Summary', 14, 68);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Attendance Rate: ${student.attendance}% (${student.attendance >= 75 ? 'Satisfactory' : 'Attention Required'})`, 14, 76);
    doc.text(`• Study Hours: ${student.studyHours} hrs/week  |  Sleep Hours: ${student.sleepHours} hrs/night`, 14, 83);
    doc.text(`• Motivation Level: ${student.motivation}  |  Parental Support: ${student.parentalInvolvement}`, 14, 90);

    // Exam Scores
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject Examination Scores', 14, 103);

    let yPos = 112;
    student.subjects.forEach((sub) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sub.subject}: ${sub.score}% (Class Avg: ${sub.classAverage}%)`, 18, yPos);
      yPos += 7;
    });

    // AI Prediction & Recommendations
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Predictive Analytics & Recommendations', 14, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Predicted Final Exam Score: ${prediction.predictedExamScore}%`, 14, yPos + 16);
    doc.text(`Pass Probability: ${prediction.passProbability}%`, 14, yPos + 23);

    const splitText = doc.splitTextToSize(`AI Advice: ${prediction.aiRecommendation}`, 180);
    doc.text(splitText, 14, yPos + 31);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('EduSense AI Analytics System • St. Jude Academy of STEM', 14, 285);

    doc.save(`${student.name.replace(/\s+/g, '_')}_EduSense_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              Automated Document Export
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Academic Reports & PDF Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate formal PDF reports for parents, teachers, and weekly progress reviews.
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl w-full sm:w-auto shrink-0 min-w-[200px]">
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

      {/* Report Controls & Type Tabs */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-slate-800 p-1.5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700">
          <button
            onClick={() => setReportType('parent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus-ring cursor-pointer ${
              reportType === 'parent'
                ? 'bg-[#145EA0] text-white shadow-sm'
                : 'text-[#6D96B3] dark:text-slate-400'
            }`}
          >
            Parent Progress Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus-ring cursor-pointer ${
              reportType === 'weekly'
                ? 'bg-[#145EA0] text-white shadow-sm'
                : 'text-[#6D96B3] dark:text-slate-400'
            }`}
          >
            Weekly Student Summary
          </button>
          <button
            onClick={() => setReportType('teacher')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus-ring cursor-pointer ${
              reportType === 'teacher'
                ? 'bg-[#145EA0] text-white shadow-sm'
                : 'text-[#6D96B3] dark:text-slate-400'
            }`}
          >
            Teacher Executive Report
          </button>
        </div>

        <button
          onClick={exportPDF}
          className="flex items-center justify-center gap-2 bg-[#145EA0] hover:bg-[#0D2F5B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#145EA0]/30 transition-all shrink-0 focus-ring cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      </div>

      {/* Styled Document Sheet Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl max-w-4xl mx-auto space-y-8 font-sans">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                EduSense Learning Analytics
              </h2>
              <p className="text-xs text-slate-500">St. Jude Academy of STEM • Academic Term 2</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="font-bold text-slate-900 dark:text-white block">
              {reportType === 'parent'
                ? 'Parent Progress Report'
                : reportType === 'weekly'
                ? 'Weekly Progress Review'
                : 'Teacher Intervention Report'}
            </span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Student Profile Block */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Student Name</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Student ID</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{student.studentId}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Class & Stream</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{student.class}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Risk Status</span>
            <span
              className={`font-bold text-sm ${
                student.atRisk ? 'text-red-500' : 'text-emerald-500'
              }`}
            >
              {student.atRisk ? 'High Risk' : 'Satisfactory'}
            </span>
          </div>
        </div>

        {/* Performance Metrics Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-slate-400">
            Current Factor Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900">
              <span className="text-xs text-slate-500 block">Attendance Rate</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">{student.attendance}%</span>
            </div>
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900">
              <span className="text-xs text-slate-500 block">Weekly Study Hours</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">{student.studyHours} hrs/wk</span>
            </div>
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900">
              <span className="text-xs text-slate-500 block">Sleep Quality</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{student.sleepHours} hrs/night</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> AI Predictive Synthesis
          </div>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            {prediction.aiRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
