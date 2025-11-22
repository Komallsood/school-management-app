// Types
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  name: string;
  studentId?: string;
  teacherId?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  description?: string;
  students: string[];
  createdAt: string;
}

export interface Marks {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  marks: number;
  maxMarks: number;
  examType: string;
  teacherId: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent';
  teacherId: string;
  createdAt: string;
}

export interface Query {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId?: string;
  courseName?: string;
  question: string;
  answer?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  answeredAt?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'college_users',
  COURSES: 'college_courses',
  MARKS: 'college_marks',
  ATTENDANCE: 'college_attendance',
  QUERIES: 'college_queries',
  CURRENT_USER: 'college_current_user',
};

// Helper function to get data from localStorage
function getStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Helper function to save data to localStorage
function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// User functions
export function getUsers(): User[] {
  return getStorageData<User>(STORAGE_KEYS.USERS);
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): string {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setStorageData(STORAGE_KEYS.USERS, users);
  return newUser.id;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) return null;
  return getUserById(userId);
}

export function setCurrentUser(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Course functions
export function getCourses(): Course[] {
  return getStorageData<Course>(STORAGE_KEYS.COURSES);
}

export function getCourseById(id: string): Course | null {
  const courses = getCourses();
  return courses.find(c => c.id === id) || null;
}

export function getCoursesByTeacher(teacherId: string): Course[] {
  const courses = getCourses();
  return courses.filter(c => c.teacherId === teacherId);
}

export function getCoursesByStudent(studentId: string): Course[] {
  const courses = getCourses();
  return courses.filter(c => c.students.includes(studentId));
}

export function createCourse(courseData: Omit<Course, 'id' | 'createdAt'>): string {
  const courses = getCourses();
  const newCourse: Course = {
    ...courseData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  courses.push(newCourse);
  setStorageData(STORAGE_KEYS.COURSES, courses);
  return newCourse.id;
}

// Marks functions
export function getMarks(): Marks[] {
  return getStorageData<Marks>(STORAGE_KEYS.MARKS);
}

export function getMarksByStudent(studentId: string): Marks[] {
  const marks = getMarks();
  return marks.filter(m => m.studentId === studentId);
}

export function getMarksByCourse(courseId: string): Marks[] {
  const marks = getMarks();
  return marks.filter(m => m.courseId === courseId);
}

export function createMarks(marksData: Omit<Marks, 'id' | 'createdAt'>): string {
  const marks = getMarks();
  const newMarks: Marks = {
    ...marksData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  marks.push(newMarks);
  setStorageData(STORAGE_KEYS.MARKS, marks);
  return newMarks.id;
}

// Attendance functions
export function getAttendance(): Attendance[] {
  return getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE);
}

export function getAttendanceByStudent(studentId: string, courseId?: string): Attendance[] {
  const attendance = getAttendance();
  let filtered = attendance.filter(a => a.studentId === studentId);
  if (courseId) {
    filtered = filtered.filter(a => a.courseId === courseId);
  }
  return filtered;
}

export function getAttendanceByCourse(courseId: string): Attendance[] {
  const attendance = getAttendance();
  return attendance.filter(a => a.courseId === courseId);
}

export function createAttendance(attendanceData: Omit<Attendance, 'id' | 'createdAt'>): string {
  const attendance = getAttendance();
  const newAttendance: Attendance = {
    ...attendanceData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  attendance.push(newAttendance);
  setStorageData(STORAGE_KEYS.ATTENDANCE, attendance);
  return newAttendance.id;
}

// Query functions
export function getQueries(): Query[] {
  return getStorageData<Query>(STORAGE_KEYS.QUERIES);
}

export function getQueriesByStudent(studentId: string): Query[] {
  const queries = getQueries();
  return queries.filter(q => q.studentId === studentId);
}

export function getQueriesByTeacher(teacherId: string): Query[] {
  const queries = getQueries();
  return queries.filter(q => q.teacherId === teacherId);
}

export function createQuery(queryData: Omit<Query, 'id' | 'createdAt' | 'status'>): string {
  const queries = getQueries();
  const newQuery: Query = {
    ...queryData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  queries.push(newQuery);
  setStorageData(STORAGE_KEYS.QUERIES, queries);
  return newQuery.id;
}

export function answerQuery(queryId: string, answer: string): void {
  const queries = getQueries();
  const queryIndex = queries.findIndex(q => q.id === queryId);
  if (queryIndex !== -1) {
    queries[queryIndex].answer = answer;
    queries[queryIndex].status = 'resolved';
    queries[queryIndex].answeredAt = new Date().toISOString();
    setStorageData(STORAGE_KEYS.QUERIES, queries);
  }
}

