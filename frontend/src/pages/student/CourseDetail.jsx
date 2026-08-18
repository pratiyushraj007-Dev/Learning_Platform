import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({}); // chapterId -> lessons[]
  const [quizzes, setQuizzes] = useState([]);
  const [openChapter, setOpenChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, chaptersRes, quizzesRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/chapters`),
          api.get(`/quizzes?courseId=${courseId}`)
        ]);
        setCourse(courseRes.data.data);
        setChapters(chaptersRes.data.data);
        setQuizzes(quizzesRes.data.data);
      } catch (err) {
        console.error('Failed to load course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const toggleChapter = async (chapterId) => {
    if (openChapter === chapterId) {
      setOpenChapter(null);
      return;
    }
    setOpenChapter(chapterId);

    // Load lessons for this chapter if not already loaded
    if (!lessonsMap[chapterId]) {
      try {
        const res = await api.get(`/chapters/${chapterId}/lessons`);
        setLessonsMap(prev => ({ ...prev, [chapterId]: res.data.data }));
      } catch (err) {
        console.error('Failed to load lessons:', err);
      }
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

  if (!course) {
    return <Layout><p className="text-center py-10 text-gray-500">Course not found.</p></Layout>;
  }

  return (
    <Layout>
      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-lg">
            {course.subject}
          </span>
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
            Class {course.class}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500 mt-2">{course.description}</p>
        <p className="text-sm text-gray-400 mt-3">Created by {course.createdBy?.name || 'Teacher'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters & Lessons */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 Chapters</h2>
          {chapters.length === 0 ? (
            <p className="text-gray-400 bg-white rounded-xl p-6 border border-gray-100">No chapters yet.</p>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <div key={chapter._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleChapter(chapter._id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{chapter.title}</span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openChapter === chapter._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openChapter === chapter._id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2">
                      {lessonsMap[chapter._id]?.length > 0 ? (
                        lessonsMap[chapter._id].map(lesson => (
                          <Link
                            key={lesson._id}
                            to={`/student/lessons/${lesson._id}`}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            <span className="text-lg">🎬</span>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{lesson.title}</p>
                              <p className="text-xs text-gray-500">{lesson.topic}</p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 py-2">No lessons in this chapter yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Quizzes</h2>
          {quizzes.length === 0 ? (
            <p className="text-gray-400 bg-white rounded-xl p-6 border border-gray-100">No quizzes yet.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <Link
                  key={quiz._id}
                  to={`/student/quizzes/${quiz._id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg">{quiz.topic}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg capitalize">{quiz.difficulty}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{quiz.questions?.length || 0} questions</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
