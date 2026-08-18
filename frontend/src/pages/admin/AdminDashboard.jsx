import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
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

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'primary', icon: '👥' },
    { label: 'Students', value: stats?.totalStudents || 0, color: 'green', icon: '📚' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, color: 'purple', icon: '🎓' },
    { label: 'Courses', value: stats?.totalCourses || 0, color: 'amber', icon: '📖' },
    { label: 'Quizzes', value: stats?.totalQuizzes || 0, color: 'red', icon: '📝' },
  ];

  const colorMap = {
    primary: 'text-primary-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-500',
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard 🛡️</h1>
        <p className="text-gray-500 mt-1">Platform-wide statistics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className={`text-3xl font-bold ${colorMap[card.color]}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-8 shadow-lg shadow-primary-200">
          <div className="text-2xl mb-3">📊</div>
          <h2 className="text-xl font-bold mb-2">Platform Overview</h2>
          <p className="text-primary-100 text-sm leading-relaxed">
            Your learning platform has <strong>{stats?.totalUsers || 0}</strong> registered users,
            with <strong>{stats?.totalStudents || 0}</strong> students actively learning across
            <strong> {stats?.totalCourses || 0}</strong> courses.
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg shadow-purple-200">
          <div className="text-2xl mb-3">🤖</div>
          <h2 className="text-xl font-bold mb-2">AI-Powered Learning</h2>
          <p className="text-purple-100 text-sm leading-relaxed">
            Teachers can use Gemini AI to generate quizzes, examples, summaries, and practice questions.
            Students can ask AI for doubt resolution and mistake explanations.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
