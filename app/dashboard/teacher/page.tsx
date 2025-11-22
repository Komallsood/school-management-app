'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  getCoursesByTeacher,
  createCourse,
  createMarks,
  createAttendance,
  getQueriesByTeacher,
  answerQuery,
  getMarksByCourse,
  getAttendanceByCourse,
} from '@/lib/storage';
import type { User, Course, Query, Marks, Attendance } from '@/lib/storage';

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [queryAnswer, setQueryAnswer] = useState<{ [key: string]: string }>({});

  // Forms
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseName: '',
    description: '',
  });
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    courseId: '',
    marks: '',
    maxMarks: '100',
    examType: '',
  });
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present' as 'present' | 'absent',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const teacherCourses = getCoursesByTeacher(currentUser.id);
    const allStudents = getUsers().filter(u => u.role === 'student');
    const teacherQueries = getQueriesByTeacher(currentUser.id);

    setCourses(teacherCourses);
    setStudents(allStudents);
    setQueries(teacherQueries);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    createCourse({
      courseCode: courseForm.courseCode,
      courseName: courseForm.courseName,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      description: courseForm.description,
      students: [],
    });

    setCourseForm({ courseCode: '', courseName: '', description: '' });
    loadData();
  };

  const handleAddMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const student = students.find(s => s.id === marksForm.studentId);
    const course = courses.find(c => c.id === marksForm.courseId);
    
    if (!student || !course) {
      alert('Please select valid student and course');
      return;
    }

    createMarks({
      studentId: student.id,
      studentName: student.name,
      courseId: course.id,
      courseName: course.courseName,
      marks: Number(marksForm.marks),
      maxMarks: Number(marksForm.maxMarks),
      examType: marksForm.examType,
      teacherId: currentUser.id,
    });

    setMarksForm({
      studentId: '',
      courseId: '',
      marks: '',
      maxMarks: '100',
      examType: '',
    });
    alert('Marks added successfully!');
  };

  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const student = students.find(s => s.id === attendanceForm.studentId);
    const course = courses.find(c => c.id === attendanceForm.courseId);
    
    if (!student || !course) {
      alert('Please select valid student and course');
      return;
    }

    createAttendance({
      studentId: student.id,
      studentName: student.name,
      courseId: course.id,
      courseName: course.courseName,
      date: attendanceForm.date,
      status: attendanceForm.status,
      teacherId: currentUser.id,
    });

    setAttendanceForm({
      studentId: '',
      courseId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
    });
    alert('Attendance marked successfully!');
  };

  const handleAnswerQuery = (queryId: string) => {
    const answer = queryAnswer[queryId];
    if (!answer) return;

    answerQuery(queryId, answer);
    setQueryAnswer({ ...queryAnswer, [queryId]: '' });
    loadData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <nav className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard - {user.name}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Total Courses</h3>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Pending Queries</h3>
              <p className="text-2xl font-bold">
                {queries.filter((q) => q.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex space-x-4 p-4 overflow-x-auto">
              {['overview', 'courses', 'marks', 'attendance', 'queries', 'progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">My Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border p-4 rounded-lg">
                        <h3 className="font-bold text-lg">{course.courseName}</h3>
                        <p className="text-gray-600">{course.courseCode}</p>
                        {course.description && (
                          <p className="text-sm text-gray-500 mt-2">{course.description}</p>
                        )}
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        No courses created yet
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">Pending Queries</h2>
                  <div className="space-y-4">
                    {queries
                      .filter((q) => q.status === 'pending')
                      .slice(0, 5)
                      .map((query) => (
                        <div key={query.id} className="border p-4 rounded-lg">
                          <h3 className="font-bold">From: {query.studentName}</h3>
                          <p className="text-gray-700 mt-2">Q: {query.question}</p>
                        </div>
                      ))}
                    {queries.filter((q) => q.status === 'pending').length === 0 && (
                      <div className="text-center text-gray-500 py-8">No pending queries</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Add New Course</h2>
                  <form onSubmit={handleCreateCourse} className="space-y-4 max-w-md">
                    <div>
                      <label className="block mb-2">Course Code</label>
                      <input
                        type="text"
                        value={courseForm.courseCode}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, courseCode: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Course Name</label>
                      <input
                        type="text"
                        value={courseForm.courseName}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, courseName: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Description</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Create Course
                    </button>
                  </form>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">My Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border p-4 rounded-lg">
                        <h3 className="font-bold text-lg">{course.courseName}</h3>
                        <p className="text-gray-600">{course.courseCode}</p>
                        {course.description && (
                          <p className="text-sm text-gray-500 mt-2">{course.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Add Marks</h2>
                <form onSubmit={handleAddMarks} className="space-y-4 max-w-md">
                  <div>
                    <label className="block mb-2">Select Course</label>
                    <select
                      value={marksForm.courseId}
                      onChange={(e) =>
                        setMarksForm({ ...marksForm, courseId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Select Student</label>
                    <select
                      value={marksForm.studentId}
                      onChange={(e) =>
                        setMarksForm({ ...marksForm, studentId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Marks</label>
                    <input
                      type="number"
                      value={marksForm.marks}
                      onChange={(e) =>
                        setMarksForm({ ...marksForm, marks: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Max Marks</label>
                    <input
                      type="number"
                      value={marksForm.maxMarks}
                      onChange={(e) =>
                        setMarksForm({ ...marksForm, maxMarks: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Exam Type</label>
                    <input
                      type="text"
                      value={marksForm.examType}
                      onChange={(e) =>
                        setMarksForm({ ...marksForm, examType: e.target.value })
                      }
                      required
                      placeholder="e.g., Midterm, Final, Quiz"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Add Marks
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
                <form onSubmit={handleMarkAttendance} className="space-y-4 max-w-md">
                  <div>
                    <label className="block mb-2">Select Course</label>
                    <select
                      value={attendanceForm.courseId}
                      onChange={(e) =>
                        setAttendanceForm({ ...attendanceForm, courseId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Select Student</label>
                    <select
                      value={attendanceForm.studentId}
                      onChange={(e) =>
                        setAttendanceForm({ ...attendanceForm, studentId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.studentId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Date</label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) =>
                        setAttendanceForm({ ...attendanceForm, date: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Status</label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          status: e.target.value as 'present' | 'absent',
                        })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Mark Attendance
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'queries' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Student Queries</h2>
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div key={query.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">From: {query.studentName}</h3>
                          {query.courseName && (
                            <p className="text-sm text-gray-600">Course: {query.courseName}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            query.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {query.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">Q: {query.question}</p>
                      {query.answer ? (
                        <p className="text-green-700 bg-green-50 p-2 rounded">
                          A: {query.answer}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <textarea
                            value={queryAnswer[query.id] || ''}
                            onChange={(e) =>
                              setQueryAnswer({ ...queryAnswer, [query.id]: e.target.value })
                            }
                            placeholder="Type your answer here..."
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                          <button
                            onClick={() => handleAnswerQuery(query.id)}
                            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                          >
                            Submit Answer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {queries.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No queries yet</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Student Progress</h2>
                <div className="space-y-6">
                  {courses.map((course) => {
                    const courseMarks = getMarksByCourse(course.id);
                    const courseAttendance = getAttendanceByCourse(course.id);
                    const courseStudents = students.filter(s => 
                      courseMarks.some(m => m.studentId === s.id) || 
                      courseAttendance.some(a => a.studentId === s.id)
                    );

                    return (
                      <div key={course.id} className="border p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">{course.courseName}</h3>
                        <div className="space-y-4">
                          {courseStudents.map((student) => {
                            const studentMarks = courseMarks.filter(m => m.studentId === student.id);
                            const studentAttendance = courseAttendance.filter(a => a.studentId === student.id);
                            const totalMarks = studentMarks.reduce((sum, m) => sum + m.marks, 0);
                            const maxMarks = studentMarks.reduce((sum, m) => sum + m.maxMarks, 0);
                            const avgMarks = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
                            const presentDays = studentAttendance.filter(a => a.status === 'present').length;
                            const attendancePct = studentAttendance.length > 0 
                              ? (presentDays / studentAttendance.length) * 100 
                              : 0;

                            return (
                              <div key={student.id} className="bg-gray-50 p-4 rounded">
                                <h4 className="font-semibold">{student.name} ({student.studentId})</h4>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <p className="text-sm text-gray-600">Average Marks</p>
                                    <p className="text-lg font-bold">{avgMarks.toFixed(2)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Attendance</p>
                                    <p className="text-lg font-bold">{attendancePct.toFixed(2)}%</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {courseStudents.length === 0 && (
                            <p className="text-gray-500">No student data for this course</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {courses.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No courses to show progress</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

