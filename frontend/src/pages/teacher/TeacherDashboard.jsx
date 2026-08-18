import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/teacher/performance');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name} 🎓</h1>
        <p className="text-gray-500 mt-1">Teacher Dashboard — manage your courses and track student performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-primary-600">{stats?.totalCourses || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Courses Created</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats?.totalQuizzes || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Quizzes Created</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{stats?.totalStudents || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Active Students</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{stats?.averageScore || 0}%</div>
          <div className="text-sm text-gray-500 mt-1">Avg Quiz Score</div>
        </div>
      </div>

      {/* Weak Topics */}
      {stats?.weakTopics?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Class-wide Weak Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.weakTopics.map((wt, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="font-medium text-red-800">{wt.topic}</span>
                <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                  Avg: {wt.averageScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/teacher/courses" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200">
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold">My Courses</div>
          <div className="text-sm text-primary-100 mt-1">Create & manage courses</div>
        </Link>
        <Link to="/teacher/quizzes" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200">
          <div className="text-2xl mb-2">📝</div>
          <div className="font-semibold">Quizzes</div>
          <div className="text-sm text-purple-100 mt-1">Create & manage quizzes</div>
        </Link>
        <Link to="/teacher/ai-content" className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200">
          <div className="text-2xl mb-2">🤖</div>
          <div className="font-semibold">AI Content</div>
          <div className="text-sm text-amber-100 mt-1">Generate & review content</div>
        </Link>
        <Link to="/teacher/performance" className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold">Performance</div>
          <div className="text-sm text-green-100 mt-1">Track student progress</div>
        </Link>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
