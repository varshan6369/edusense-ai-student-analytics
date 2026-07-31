import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, Student } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  activeStudent: Student | null;
  allStudents: Student[];
  login: (role: Role, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  selectStudent: (studentId: string) => void;
  refreshStudents: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_TEACHER: UserProfile = {
  uid: 'usr-teacher-1',
  name: 'Dr. Evelyn Vance',
  email: 'evelyn.vance@edusense.edu',
  role: 'teacher',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  schoolName: 'St. Jude Academy of STEM',
  className: 'Grade 11 - Science Stream',
};

const DEFAULT_STUDENT_USER: UserProfile = {
  uid: 'usr-student-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@edusense.edu',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  studentId: 'STU-1001',
  schoolName: 'St. Jude Academy of STEM',
  className: 'Grade 11 - Section A',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_TEACHER);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && data.data) {
        setAllStudents(data.data);
        if (!activeStudent && data.data.length > 0) {
          setActiveStudent(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const selectStudent = (studentId: string) => {
    const found = allStudents.find((s) => s.studentId === studentId);
    if (found) {
      setActiveStudent(found);
      if (user?.role === 'student') {
        setUser({
          ...user,
          name: found.name,
          email: found.email,
          avatar: found.avatar || user.avatar,
          studentId: found.studentId,
        });
      }
    }
  };

  const login = (role: Role, email?: string, name?: string) => {
    if (role === 'teacher') {
      setUser({
        ...DEFAULT_TEACHER,
        email: email || DEFAULT_TEACHER.email,
        name: name || DEFAULT_TEACHER.name,
      });
    } else {
      const targetStudent = activeStudent || allStudents[0];
      setUser({
        ...DEFAULT_STUDENT_USER,
        email: email || targetStudent?.email || DEFAULT_STUDENT_USER.email,
        name: name || targetStudent?.name || DEFAULT_STUDENT_USER.name,
        studentId: targetStudent?.studentId || 'STU-1001',
        avatar: targetStudent?.avatar || DEFAULT_STUDENT_USER.avatar,
      });
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeStudent,
        allStudents,
        login,
        logout,
        switchRole,
        selectStudent,
        refreshStudents: fetchStudents,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
