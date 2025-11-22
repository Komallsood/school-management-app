'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  setCurrentUser,
  getMarksByStudent,
  getAttendanceByStudent,
  getCoursesByStudent,
  getQueriesByStudent,
  getUsers,
  createQuery,
  getCourseById,
} from '@/lib/storage';
import type { Marks, Attendance, Course, Query, User } from '@/lib/storage';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [marks, setMarks] = useState<Marks[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [queryForm, setQueryForm] = useState({ question: '', teacherId: '', courseId: '' });
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const studentMarks = getMarksByStudent(currentUser.id);
    const studentAttendance = getAttendanceByStudent(currentUser.id);
    const studentCourses = getCoursesByStudent(currentUser.id);
    const studentQueries = getQueriesByStudent(currentUser.id);
    const allTeachers = getUsers().filter(u => u.role === 'teacher');

    setMarks(studentMarks);
    setAttendance(studentAttendance);
    setCourses(studentCourses);
    setQueries(studentQueries);
    setTeachers(allTeachers);

    // Calculate progress
    const totalMarks = studentMarks.reduce((sum, m) => sum + m.marks, 0);
    const maxTotalMarks = studentMarks.reduce((sum, m) => sum + m.maxMarks, 0);
    const averageMarks = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;

    const presentDays = studentAttendance.filter(a => a.status === 'present').length;
    const totalDays = studentAttendance.length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    setProgress({
      averageMarks: averageMarks.toFixed(2),
      attendancePercentage: attendancePercentage.toFixed(2),
      totalCourses: studentCourses.length,
      totalMarks: studentMarks.length,
      totalAttendance: totalDays,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const selectedTeacher = teachers.find(t => t.id === queryForm.teacherId);
    if (!selectedTeacher) return;

    const course = queryForm.courseId ? getCourseById(queryForm.courseId) : null;

    createQuery({
      studentId: currentUser.id,
      studentName: currentUser.name,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      courseId: queryForm.courseId || undefined,
      courseName: course?.courseName,
      question: queryForm.question,
    });

    setQueryForm({ question: '', teacherId: '', courseId: '' });
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
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard - {user.name}</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Average Marks</h3>
              <p className="text-2xl font-bold">{progress?.averageMarks || 0}%</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Attendance</h3>
              <p className="text-2xl font-bold">{progress?.attendancePercentage || 0}%</p>
            </div>
            <div className="bg-purple-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Total Courses</h3>
              <p className="text-2xl font-bold">{progress?.totalCourses || 0}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded">
              <h3 className="text-sm text-gray-600">Total Marks</h3>
              <p className="text-2xl font-bold">{progress?.totalMarks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex space-x-4 p-4 overflow-x-auto">
              {['overview', 'marks', 'attendance', 'courses', 'queries'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-green-600 text-white'
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
                  <h2 className="text-xl font-bold mb-4">Recent Marks</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2">Course</th>
                          <th className="border p-2">Marks</th>
                          <th className="border p-2">Exam Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.slice(0, 5).map((mark) => (
                          <tr key={mark.id}>
                            <td className="border p-2">{mark.courseName}</td>
                            <td className="border p-2">
                              {mark.marks}/{mark.maxMarks}
                            </td>
                            <td className="border p-2">{mark.examType}</td>
                          </tr>
                        ))}
                        {marks.length === 0 && (
                          <tr>
                            <td colSpan={3} className="border p-2 text-center text-gray-500">
                              No marks available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">Recent Attendance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2">Course</th>
                          <th className="border p-2">Date</th>
                          <th className="border p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.slice(0, 5).map((att) => (
                          <tr key={att.id}>
                            <td className="border p-2">{att.courseName}</td>
                            <td className="border p-2">
                              {new Date(att.date).toLocaleDateString()}
                            </td>
                            <td className="border p-2">
                              <span
                                className={`px-2 py-1 rounded ${
                                  att.status === 'present'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {attendance.length === 0 && (
                          <tr>
                            <td colSpan={3} className="border p-2 text-center text-gray-500">
                              No attendance records
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <div>
                <h2 className="text-xl font-bold mb-4">All Marks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Course</th>
                        <th className="border p-2">Marks</th>
                        <th className="border p-2">Percentage</th>
                        <th className="border p-2">Exam Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((mark) => (
                        <tr key={mark.id}>
                          <td className="border p-2">{mark.courseName}</td>
                          <td className="border p-2">
                            {mark.marks}/{mark.maxMarks}
                          </td>
                          <td className="border p-2">
                            {((mark.marks / mark.maxMarks) * 100).toFixed(2)}%
                          </td>
                          <td className="border p-2">{mark.examType}</td>
                        </tr>
                      ))}
                      {marks.length === 0 && (
                        <tr>
                          <td colSpan={4} className="border p-2 text-center text-gray-500">
                            No marks available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Attendance Record</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Course</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((att) => (
                        <tr key={att.id}>
                          <td className="border p-2">{att.courseName}</td>
                          <td className="border p-2">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="border p-2">
                            <span
                              className={`px-2 py-1 rounded ${
                                att.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendance.length === 0 && (
                        <tr>
                          <td colSpan={3} className="border p-2 text-center text-gray-500">
                            No attendance records
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h2 className="text-xl font-bold mb-4">My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border p-4 rounded-lg">
                      <h3 className="font-bold text-lg">{course.courseName}</h3>
                      <p className="text-gray-600">{course.courseCode}</p>
                      <p className="text-sm text-gray-500">Teacher: {course.teacherName}</p>
                      {course.description && (
                        <p className="text-sm text-gray-500 mt-2">{course.description}</p>
                      )}
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No courses enrolled
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'queries' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
                  <form onSubmit={handleSubmitQuery} className="space-y-4">
                    <div>
                      <label className="block mb-2">Select Teacher</label>
                      <select
                        value={queryForm.teacherId}
                        onChange={(e) => setQueryForm({ ...queryForm, teacherId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Select Course (Optional)</label>
                      <select
                        value={queryForm.courseId}
                        onChange={(e) => setQueryForm({ ...queryForm, courseId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select a course (optional)</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Question</label>
                      <textarea
                        value={queryForm.question}
                        onChange={(e) => setQueryForm({ ...queryForm, question: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Submit Query
                    </button>
                  </form>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">My Queries</h2>
                  <div className="space-y-4">
                    {queries.map((query) => (
                      <div key={query.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">To: {query.teacherName}</h3>
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
                        {query.courseName && (
                          <p className="text-sm text-gray-600 mb-2">Course: {query.courseName}</p>
                        )}
                        <p className="text-gray-700 mb-2">Q: {query.question}</p>
                        {query.answer && (
                          <p className="text-green-700 bg-green-50 p-2 rounded">
                            A: {query.answer}
                          </p>
                        )}
                      </div>
                    ))}
                    {queries.length === 0 && (
                      <div className="text-center text-gray-500 py-8">No queries yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

