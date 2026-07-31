import React, { useState } from 'react';
import { SmartNoteAnalysis } from '../types';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  BookOpen,
} from 'lucide-react';

export const SmartNotes: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState('Physics: Newton Laws & Momentum');
  const [noteText, setNoteText] = useState(
    `Newton's first law states that every object will remain at rest or in uniform motion in a straight line unless compelled to change its state by the action of an external force. This tendency to resist changes in state of motion is inertia.\n\nNewton's second law states that force equals mass times acceleration (F = ma). Momentum (p = mv) is conserved in an isolated system.\n\nNewton's third law states that for every action, there is an equal and opposite reaction.`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartNoteAnalysis | null>(null);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const processNotes = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    setUserAnswers({});
    setShowQuizResults(false);
    setFlippedCards({});

    try {
      const res = await fetch('/api/ai/smart-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText, title: noteTitle }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to process notes');
      }
    } catch (err: any) {
      alert(`Error processing notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (showQuizResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              AI Smart Notes & Assessment Generator
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Smart Notes & Interactive Quiz
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Paste lecture transcripts or notes. Gemini AI extracts key concepts, generates quizzes & flashcards.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="clay-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Topic / Note Title
          </label>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Lecture Content or Textbook Text
          </label>
          <textarea
            rows={5}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Paste raw notes or textbook excerpt here..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={processNotes}
          disabled={loading || !noteText.trim()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Summary, Quiz & Flashcards
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary & Key Concepts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Summary */}
            <div className="clay-card p-6 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Executive Summary
              </h3>
              <ul className="space-y-2">
                {result.summary.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div className="clay-card p-6 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Key Concepts Glossary
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {result.keyConcepts.map((kc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-0.5">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{kc.concept}</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{kc.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Quiz */}
          <div className="clay-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  AI Practice Knowledge Quiz
                </h3>
                <p className="text-xs text-slate-500">Test your comprehension on the generated notes</p>
              </div>

              {!showQuizResults ? (
                <button
                  onClick={() => setShowQuizResults(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm focus-ring cursor-pointer"
                >
                  Check Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowQuizResults(false);
                    setUserAnswers({});
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all focus-ring cursor-pointer"
                >
                  Retry Quiz
                </button>
              )}
            </div>

            <div className="space-y-6">
              {result.quiz.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {qIdx + 1}. {q.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedOpt === oIdx;
                        let optionStyle = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300';

                        if (showQuizResults) {
                          if (oIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-500 font-bold';
                          } else if (isSelected) {
                            optionStyle = 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-500 line-through';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-500 font-bold shadow-xs';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all focus-ring cursor-pointer ${optionStyle}`}
                          >
                            <span className="font-extrabold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900">
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flashcards Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Interactive Revision Flashcards
            </h3>
            <p className="text-xs text-slate-500">Click any card to flip between Question and Answer</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.flashcards.map((fc) => {
                const isFlipped = !!flippedCards[fc.id];
                return (
                  <div
                    key={fc.id}
                    onClick={() => toggleFlip(fc.id)}
                    className={`h-44 clay-card p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                      isFlipped ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>{fc.category}</span>
                      <span className={isFlipped ? 'text-indigo-600 font-extrabold' : ''}>{isFlipped ? 'Answer' : 'Question'}</span>
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 text-center my-auto leading-relaxed">
                      {isFlipped ? fc.back : fc.front}
                    </div>

                    <div className="text-[10px] text-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {isFlipped ? 'Click to view question' : 'Click to flip 🔄'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
