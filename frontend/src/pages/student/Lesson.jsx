import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Lesson = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonRes, progressRes] = await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get(`/progress/lesson/${lessonId}`)
        ]);
        setLesson(lessonRes.data.data);
        setProgress(progressRes.data.data?.videoProgress || 0);
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId]);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const saveProgress = async (value) => {
    try {
      await api.post('/progress', {
        lessonId,
        videoProgress: value,
        completed: value >= 90
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return <Layout><p className="text-center py-10 text-gray-500">Lesson not found.</p></Layout>;
  }

  const videoId = getYouTubeId(lesson.videoUrl);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-gray-500 mt-1">Topic: {lesson.topic}</p>
          {lesson.description && (
            <p className="text-gray-600 mt-3 bg-white p-4 rounded-xl border border-gray-100">{lesson.description}</p>
          )}
        </div>

        {/* Video Player */}
        {videoId ? (
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl mb-6">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl p-12 text-center mb-6">
            <div className="text-4xl mb-3">🎬</div>
            <p className="text-gray-500">No video available for this lesson.</p>
          </div>
        )}

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Video Progress</h2>

          {/* Progress bar */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full mb-4">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Current progress: <strong>{progress}%</strong></span>
            {progress >= 90 && <span className="text-sm text-green-600 font-medium">✅ Completed</span>}
          </div>

          {/* Manual progress update for prototype */}
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-sm font-medium text-gray-700 w-12">{progress}%</span>
            <button
              onClick={() => saveProgress(progress)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              {saved ? '✓ Saved!' : 'Save'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Drag the slider to update your progress. In a full version, this would track automatically.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Lesson;
