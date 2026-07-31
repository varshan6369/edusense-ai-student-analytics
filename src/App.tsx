import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AICopilotView } from './components/AICopilotDrawer';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AIStudyPlanner } from './components/AIStudyPlanner';
import { SmartNotes } from './components/SmartNotes';
import { ReportGenerator } from './components/ReportGenerator';
import { GamificationView } from './components/GamificationView';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { user, activeStudent, allStudents, selectStudent, refreshStudents } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAICopilotDrawerOpen, setIsAICopilotDrawerOpen] = useState<boolean>(false);

  const handleResetData = async () => {
    if (confirm('Reset database to original Kaggle Seed records?')) {
      await fetch('/api/students/reset', { method: 'POST' });
      await refreshStudents();
    }
  };

  const role = user?.role || 'teacher';

  return (
    <div className="min-h-screen bg-[#EEEEF8] text-[#1A1A2E] flex flex-col md:flex-row relative overflow-hidden font-sans selection:bg-indigo-600 selection:text-white p-4 gap-5 md:p-6 md:gap-6 w-full max-w-[1600px] mx-auto">
      {/* Subtle ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-radial from-indigo-200/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-radial from-purple-200/25 to-transparent blur-3xl" />
      </div>

      {/* Left Sidebar Menu */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role={role} />

      {/* Right Column: Navbar + Main Content */}
      <div className="flex-1 flex flex-col gap-5 md:gap-5 min-w-0 z-10">
        {/* Top Navbar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleAICopilot={() => setIsAICopilotDrawerOpen((prev) => !prev)}
        />

        {/* Central View Content Container */}
        <main className="flex-1 min-w-0 overflow-y-auto pr-1">
          {activeTab === 'dashboard' && (
            role === 'teacher' ? (
              <TeacherDashboard
                students={allStudents}
                onSelectStudent={selectStudent}
                onNavigateTab={setActiveTab}
                onResetData={handleResetData}
              />
            ) : activeStudent ? (
              <StudentDashboard
                student={activeStudent}
                onNavigateTab={setActiveTab}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 clay-card">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading student profile...</p>
              </div>
            )
          )}

          {activeTab === 'analytics' && (
            role === 'teacher' ? (
              <TeacherDashboard
                students={allStudents}
                onSelectStudent={selectStudent}
                onNavigateTab={setActiveTab}
                onResetData={handleResetData}
              />
            ) : activeStudent ? (
              <StudentDashboard
                student={activeStudent}
                onNavigateTab={setActiveTab}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 clay-card">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading learning analytics...</p>
              </div>
            )
          )}

          {activeTab === 'copilot' && <AICopilotView isDrawer={false} />}

          {activeTab === 'whatif' && (
            activeStudent ? (
              <WhatIfSimulator
                student={activeStudent}
                onSelectStudent={selectStudent}
                allStudents={allStudents}
              />
            ) : (
              <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to simulate what-if scenarios.</div>
            )
          )}

          {activeTab === 'planner' && (
            activeStudent ? (
              <AIStudyPlanner
                student={activeStudent}
                onSelectStudent={selectStudent}
                allStudents={allStudents}
              />
            ) : (
              <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to generate study plans.</div>
            )
          )}

          {activeTab === 'notes' && <SmartNotes />}

          {activeTab === 'reports' && (
            activeStudent ? (
              <ReportGenerator
                student={activeStudent}
                onSelectStudent={selectStudent}
                allStudents={allStudents}
              />
            ) : (
              <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to generate reports.</div>
            )
          )}

          {activeTab === 'gamification' && (
            activeStudent ? (
              <GamificationView student={activeStudent} allStudents={allStudents} />
            ) : (
              <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to view gamification standings.</div>
            )
          )}
        </main>
      </div>

      {/* Modals and Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onSelectStudent={selectStudent}
      />

      <AuthModal />

      <AICopilotView
        isDrawer={true}
        isOpen={isAICopilotDrawerOpen}
        onClose={() => setIsAICopilotDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

