import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_KAGGLE_STUDENTS } from './src/data/kaggleDataset';
import { calculateStudentPrediction, simulateWhatIf } from './src/services/predictionEngine';
import { Student } from './src/types';

// In-memory persistent database seeded with Kaggle Dataset
let studentsStore: Student[] = [...INITIAL_KAGGLE_STUDENTS];

const app = express();
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API using server-side process.env.GEMINI_API_KEY
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints

// 1. Get all students
app.get('/api/students', (req, res) => {
  res.json({ success: true, data: studentsStore });
});

// 2. Get student by ID
app.get('/api/students/:id', (req, res) => {
  const student = studentsStore.find((s) => s.studentId === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// 3. Update student metrics / profile
app.put('/api/students/:id', (req, res) => {
  const index = studentsStore.findIndex((s) => s.studentId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  const updatedStudent = { ...studentsStore[index], ...req.body };
  studentsStore[index] = updatedStudent;
  res.json({ success: true, data: updatedStudent });
});

// 4. Add new student
app.post('/api/students', (req, res) => {
  const newStudent: Student = {
    studentId: `STU-${1000 + studentsStore.length + 1}`,
    name: req.body.name || 'New Student',
    email: req.body.email || 'student@edusense.edu',
    class: req.body.class || 'Grade 11 - Section A',
    rollNumber: `11-${String(studentsStore.length + 1).padStart(2, '0')}`,
    attendance: req.body.attendance || 80,
    studyHours: req.body.studyHours || 14,
    sleepHours: req.body.sleepHours || 7,
    motivation: req.body.motivation || 'Medium',
    internetAccess: req.body.internetAccess ?? true,
    parentalInvolvement: req.body.parentalInvolvement || 'Medium',
    extracurricular: req.body.extracurricular ?? true,
    examScores: req.body.examScores || { Math: 75, Physics: 72, Chemistry: 74, English: 80, ComputerScience: 78 },
    subjects: req.body.subjects || [
      { subject: 'Math', score: 75, previousScore: 70, classAverage: 74 },
      { subject: 'Physics', score: 72, previousScore: 70, classAverage: 71 },
      { subject: 'Chemistry', score: 74, previousScore: 72, classAverage: 73 },
      { subject: 'English', score: 80, previousScore: 78, classAverage: 76 },
      { subject: 'Comp Sci', score: 78, previousScore: 75, classAverage: 78 },
    ],
    attendanceHistory: [
      { month: 'Sep', attendanceRate: 85, daysPresent: 17, totalDays: 20 },
      { month: 'Oct', attendanceRate: 82, daysPresent: 16, totalDays: 20 },
      { month: 'Nov', attendanceRate: 80, daysPresent: 16, totalDays: 20 },
      { month: 'Dec', attendanceRate: 81, daysPresent: 16, totalDays: 20 },
      { month: 'Jan', attendanceRate: req.body.attendance || 80, daysPresent: 16, totalDays: 20 },
    ],
    xp: 1000,
    level: 3,
    streak: 1,
    badges: [],
    atRisk: req.body.attendance < 70,
  };
  studentsStore.push(newStudent);
  res.json({ success: true, data: newStudent });
});

// 5. Reset to seed dataset
app.post('/api/students/reset', (req, res) => {
  studentsStore = [...INITIAL_KAGGLE_STUDENTS];
  res.json({ success: true, message: 'Database reset to Kaggle seed records', data: studentsStore });
});

// 6. Prediction Engine endpoint
app.get('/api/predict/:id', (req, res) => {
  const student = studentsStore.find((s) => s.studentId === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  const prediction = calculateStudentPrediction(student);
  res.json({ success: true, data: prediction });
});

// 7. What-if Simulator
app.post('/api/what-if', (req, res) => {
  const { studentId, attendance, studyHours, sleepHours, motivation } = req.body;
  const student = studentsStore.find((s) => s.studentId === studentId);
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  const result = simulateWhatIf(student, attendance, studyHours, sleepHours, motivation);
  res.json({ success: true, data: result });
});

// AI Gemini Endpoints (Server-Side)

// 8. AI Copilot / RAG Chatbot
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, studentId, history, role } = req.body;
    const student = studentId ? studentsStore.find((s) => s.studentId === studentId) : null;

    let ragContext = '';
    if (student) {
      const pred = calculateStudentPrediction(student);
      ragContext = `
[STUDENT DATA - RAG CONTEXT]
Name: ${student.name} (${student.studentId})
Class: ${student.class}
Attendance: ${student.attendance}% (Trend: ${student.attendanceHistory.map(h => h.month + ':' + h.attendanceRate + '%').join(', ')})
Study Hours: ${student.studyHours} hrs/week
Sleep Hours: ${student.sleepHours} hrs/night
Motivation: ${student.motivation}
Parental Involvement: ${student.parentalInvolvement}
Internet Access: ${student.internetAccess ? 'Yes' : 'No'}
Exam Scores: ${JSON.stringify(student.examScores)}
At Risk Status: ${student.atRisk ? 'YES - ' + student.riskReason : 'NO'}
Predicted Exam Score: ${pred.predictedExamScore}/100
Risk Percentage: ${pred.riskPercentage}%
Pass Probability: ${pred.passProbability}%
`;
    } else {
      ragContext = `
[CLASS-WIDE RAG CONTEXT]
Total Students: ${studentsStore.length}
At Risk Students: ${studentsStore.filter(s => s.atRisk).map(s => s.name + ' (' + s.attendance + '% att, Math:' + s.examScores.Math + ')').join('; ')}
Class Average Attendance: ${Math.round(studentsStore.reduce((a, b) => a + b.attendance, 0) / studentsStore.length)}%
`;
    }

    const systemInstruction = `You are EduSense AI Copilot, an expert academic advisor, tutor, and learning analytics system for schools.
User Role: ${role || 'teacher'}
You have direct access to real student performance data from the Kaggle Educational Factors database.
Use the student context provided to answer questions accurately with actionable advice, encouragement, and specific data points. Keep responses structured with clear markdown headings and bullet points where helpful.
${ragContext}`;

    const gemini = getGeminiClient();
    const promptText = `${systemInstruction}\n\nUser Question: ${message}`;
    
    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
    });

    const reply = response.text || 'I analyzed the student profile and dataset. How else can I assist?';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate AI response' });
  }
});

// 9. AI Weekly Study Planner Generator
app.post('/api/ai/planner', async (req, res) => {
  try {
    const { studentId, targetExamDate } = req.body;
    const student = studentsStore.find((s) => s.studentId === studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const prompt = `Generate a personalized 7-day Weekly Study Plan for student ${student.name}.
Student Data:
- Attendance: ${student.attendance}%
- Study Hours: ${student.studyHours} hrs/wk
- Sleep Hours: ${student.sleepHours} hrs/night
- Exam Scores: ${JSON.stringify(student.examScores)}
- Target Exam Date: ${targetExamDate || 'Next Month'}

Output ONLY valid raw JSON with this exact schema (no markdown tags, no trailing text):
{
  "studentId": "${student.studentId}",
  "studentName": "${student.name}",
  "weeklyGoal": "Target goal string",
  "totalTargetHours": 18,
  "schedule": [
    {
      "day": "Monday",
      "focusSubject": "Math",
      "topic": "Quadratic Equations & Functions",
      "durationMinutes": 90,
      "tasks": ["Review textbook Chapter 4", "Solve 10 practice problems", "Take 15m review quiz"],
      "priority": "High"
    }
  ],
  "aiAdvice": ["Advice tip 1", "Advice tip 2", "Advice tip 3"]
}`;

    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    } else {
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const plan = JSON.parse(rawText);

    res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error('Planner error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate plan' });
  }
});

// 10. Smart Notes & Quiz Generator
app.post('/api/ai/smart-notes', async (req, res) => {
  try {
    const { noteText, title } = req.body;
    if (!noteText) {
      return res.status(400).json({ success: false, error: 'Note content is required' });
    }

    const prompt = `You are an educational AI assistant. Analyze the following study notes/lecture content and extract key insights, generate a summary, key concepts, 4 multiple-choice quiz questions with explanations, and 4 flashcards.

Note Title: ${title || 'Lecture Notes'}
Note Content:
${noteText}

Output ONLY valid JSON matching this structure (no markdown wrappers):
{
  "title": "${title || 'Lecture Notes'}",
  "summary": ["Key summary point 1", "Key summary point 2", "Key summary point 3"],
  "keyConcepts": [
    { "concept": "Term 1", "definition": "Definition 1" }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this option is correct."
    }
  ],
  "flashcards": [
    { "id": "fc1", "front": "Front question/concept", "back": "Back explanation/answer", "category": "General" }
  ]
}`;

    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    } else {
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const result = JSON.parse(rawText);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Smart notes error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process notes' });
  }
});

// Vite Middleware Integration for local dev & production build
async function setupServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduSense Server running on port ${PORT}`);
  });
}

setupServer().catch(console.error);
