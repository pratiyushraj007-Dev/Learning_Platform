import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/progress/dashboard');
        setDashboard(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-primary-600">{dashboard?.totalCompleted || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Lessons Completed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{dashboard?.totalInProgress || 0}</div>
          <div className="text-sm text-gray-500 mt-1">In Progress</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{dashboard?.recentAttempts?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Quizzes Taken</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-red-500">{dashboard?.weakTopics?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Weak Topics</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Weak Topics</h2>
          {dashboard?.weakTopics?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.weakTopics.map((wt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <span className="font-medium text-red-800">{wt.topic}</span>
                  <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                    Avg: {wt.averageScore}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No weak topics! Keep up the great work 🎉</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h2>
          {dashboard?.recommendations?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recommendations.map((rec, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  rec.type === 'practice' ? 'bg-amber-50' :
                  rec.type === 'continue' ? 'bg-blue-50' : 'bg-green-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    rec.type === 'practice' ? 'text-amber-800' :
                    rec.type === 'continue' ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {rec.type === 'practice' ? '📝' : rec.type === 'continue' ? '▶️' : '🚀'} {rec.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Start learning to get personalized recommendations!</p>
          )}
        </div>

        {/* Recent Quiz Scores */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Recent Quiz Scores</h2>
          {dashboard?.recentAttempts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Quiz</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Topic</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Score</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentAttempts.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3 px-2 font-medium">{a.quizId?.title || 'Quiz'}</td>
                      <td className="py-3 px-2 text-gray-600">{a.quizId?.topic || '-'}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          a.score >= 80 ? 'bg-green-100 text-green-700' :
                          a.score >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {a.score}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No quizzes taken yet. Start learning!</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/student/courses" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200">
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold">Browse Courses</div>
          <div className="text-sm text-primary-100 mt-1">Explore available courses</div>
        </Link>
        <Link to="/student/ai-assistant" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200">
          <div className="text-2xl mb-2">🤖</div>
          <div className="font-semibold">AI Assistant</div>
          <div className="text-sm text-purple-100 mt-1">Get help with doubts</div>
        </Link>
        <Link to="/student/progress" className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200">
          <div className="text-2xl mb-2">📈</div>
          <div className="font-semibold">My Progress</div>
          <div className="text-sm text-green-100 mt-1">Track your learning</div>
        </Link>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
