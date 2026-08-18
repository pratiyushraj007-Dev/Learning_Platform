import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Progress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/progress');
        setProgress(res.data.data);
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
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

  const completed = progress.filter(p => p.completed);
  const inProgress = progress.filter(p => !p.completed);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 mt-1">Track your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{completed.length}</div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{inProgress.length}</div>
          <div className="text-sm text-gray-500 mt-1">In Progress</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-bold text-primary-600">{progress.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Lessons</div>
        </div>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">▶️ In Progress</h2>
          <div className="space-y-3">
            {inProgress.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{p.lessonId?.title || 'Lesson'}</span>
                  <span className="text-sm text-gray-500">{p.videoProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${p.videoProgress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✅ Completed</h2>
          <div className="space-y-3">
            {completed.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm">✓</span>
                <div>
                  <p className="font-medium text-gray-900">{p.lessonId?.title || 'Lesson'}</p>
                  <p className="text-xs text-gray-500">{p.lessonId?.topic || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-xl font-semibold text-gray-900">No progress yet</h2>
          <p className="text-gray-500 mt-2">Start watching lessons to track your progress!</p>
        </div>
      )}
    </Layout>
  );
};

export default Progress;
