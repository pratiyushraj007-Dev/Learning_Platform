import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeacherPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/teacher/performance');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load performance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Performance</h1>
        <p className="text-gray-500 mt-1">Track how your students are performing across courses and quizzes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-primary-600">{data?.totalCourses || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Courses</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{data?.totalQuizzes || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Quizzes</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{data?.totalStudents || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Students</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{data?.averageScore || 0}%</div>
          <div className="text-sm text-gray-500 mt-1">Avg Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weak Topics */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Class-wide Weak Topics</h2>
          {data?.weakTopics?.length > 0 ? (
            <div className="space-y-3">
              {data.weakTopics.map((wt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <span className="font-medium text-red-800">{wt.topic}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-red-200 rounded-full">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${wt.averageScore}%` }}></div>
                    </div>
                    <span className="text-sm text-red-600 font-medium w-10 text-right">{wt.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No weak topics found! Students are doing well 🎉</p>
          )}
        </div>

        {/* Low Scoring Students */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📉 Students Needing Help</h2>
          {data?.lowScoreStudents?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {data.lowScoreStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.studentName}</p>
                    <p className="text-xs text-gray-500">{s.quizTitle} — {s.topic}</p>
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                    s.score < 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {s.score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No students below 50%. Great job teaching! 🎓</p>
          )}
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 All Quiz Attempts</h2>
        {data?.performanceTable?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Student</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Quiz</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Topic</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Score</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.performanceTable.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-900">{row.studentName}</td>
                    <td className="py-3 px-3 text-gray-600">{row.quizTitle}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg">{row.topic}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        row.score >= 80 ? 'bg-green-100 text-green-700' :
                        row.score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No quiz attempts yet. Students need to take quizzes first.</p>
        )}
      </div>
    </Layout>
  );
};

export default TeacherPerformance;
