import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create course form
  const [showCreate, setShowCreate] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', subject: '', class: '' });
  const [creating, setCreating] = useState(false);

  // Add chapter form
  const [addingChapter, setAddingChapter] = useState(null); // courseId
  const [chapterTitle, setChapterTitle] = useState('');

  // Chapters map
  const [chaptersMap, setChaptersMap] = useState({});
  const [openCourse, setOpenCourse] = useState(null);

  // Add lesson form
  const [addingLesson, setAddingLesson] = useState(null); // chapterId
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', topic: '', videoUrl: '' });

  // Lessons map
  const [lessonsMap, setLessonsMap] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/courses', courseForm);
      setCourses([res.data.data, ...courses]);
      setCourseForm({ title: '', description: '', subject: '', class: '' });
      setShowCreate(false);
      setSuccess('Course created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const toggleCourse = async (courseId) => {
    if (openCourse === courseId) {
      setOpenCourse(null);
      return;
    }
    setOpenCourse(courseId);
    if (!chaptersMap[courseId]) {
      try {
        const res = await api.get(`/courses/${courseId}/chapters`);
        setChaptersMap(prev => ({ ...prev, [courseId]: res.data.data }));

        // Load lessons for each chapter
        for (const chapter of res.data.data) {
          if (!lessonsMap[chapter._id]) {
            const lessonsRes = await api.get(`/chapters/${chapter._id}/lessons`);
            setLessonsMap(prev => ({ ...prev, [chapter._id]: lessonsRes.data.data }));
          }
        }
      } catch (err) {
        console.error('Failed to load chapters:', err);
      }
    }
  };

  const handleAddChapter = async (courseId) => {
    if (!chapterTitle.trim()) return;
    try {
      const res = await api.post('/chapters', { title: chapterTitle, courseId });
      setChaptersMap(prev => ({
        ...prev,
        [courseId]: [...(prev[courseId] || []), res.data.data]
      }));
      setChapterTitle('');
      setAddingChapter(null);
      setSuccess('Chapter added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add chapter');
    }
  };

  const handleAddLesson = async (chapterId) => {
    if (!lessonForm.title.trim() || !lessonForm.topic.trim()) return;
    try {
      const res = await api.post('/lessons', { ...lessonForm, chapterId });
      setLessonsMap(prev => ({
        ...prev,
        [chapterId]: [...(prev[chapterId] || []), res.data.data]
      }));
      setLessonForm({ title: '', description: '', topic: '', videoUrl: '' });
      setAddingLesson(null);
      setSuccess('Lesson added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm";

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Create and manage courses, chapters, and lessons</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-200 text-sm"
        >
          + New Course
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Create Course Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input type="text" value={courseForm.title}
                  onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                  className={inputClass} placeholder="e.g., Mathematics Class 8" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" value={courseForm.subject}
                  onChange={e => setCourseForm({ ...courseForm, subject: e.target.value })}
                  className={inputClass} placeholder="e.g., Mathematics" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                className={`${inputClass} min-h-[80px]`} placeholder="Course description..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Level</label>
              <select value={courseForm.class}
                onChange={e => setCourseForm({ ...courseForm, class: e.target.value })}
                className={`${inputClass} bg-white`} required>
                <option value="">Select class</option>
                {[5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Course'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900">No courses yet</h2>
          <p className="text-gray-500 mt-2">Click "New Course" to create your first course</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course._id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-lg">{course.subject}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">Class {course.class}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ml-4 ${openCourse === course._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded: Chapters & Lessons */}
              {openCourse === course._id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">📖 Chapters</h4>
                    <button
                      onClick={() => { setAddingChapter(addingChapter === course._id ? null : course._id); setChapterTitle(''); }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {/* Add Chapter Form */}
                  {addingChapter === course._id && (
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={chapterTitle}
                        onChange={e => setChapterTitle(e.target.value)}
                        className={`${inputClass} flex-1`}
                        placeholder="Chapter title..." />
                      <button onClick={() => handleAddChapter(course._id)}
                        className="px-4 py-2.5 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 transition-colors">
                        Add
                      </button>
                    </div>
                  )}

                  {/* Chapters */}
                  {chaptersMap[course._id]?.length > 0 ? (
                    <div className="space-y-3">
                      {chaptersMap[course._id].map((chapter, idx) => (
                        <div key={chapter._id} className="bg-white rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs font-semibold">{idx + 1}</span>
                              <span className="font-medium text-gray-900">{chapter.title}</span>
                            </div>
                            <button
                              onClick={() => { setAddingLesson(addingLesson === chapter._id ? null : chapter._id); setLessonForm({ title: '', description: '', topic: '', videoUrl: '' }); }}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              + Add Lesson
                            </button>
                          </div>

                          {/* Add Lesson Form */}
                          {addingLesson === chapter._id && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                              <input type="text" value={lessonForm.title}
                                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                className={inputClass} placeholder="Lesson title" />
                              <input type="text" value={lessonForm.topic}
                                onChange={e => setLessonForm({ ...lessonForm, topic: e.target.value })}
                                className={inputClass} placeholder="Topic (e.g., Algebra)" />
                              <input type="text" value={lessonForm.description}
                                onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                className={inputClass} placeholder="Description (optional)" />
                              <input type="text" value={lessonForm.videoUrl}
                                onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                className={inputClass} placeholder="YouTube URL (optional)" />
                              <button onClick={() => handleAddLesson(chapter._id)}
                                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 transition-colors">
                                Add Lesson
                              </button>
                            </div>
                          )}

                          {/* Lessons */}
                          {lessonsMap[chapter._id]?.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {lessonsMap[chapter._id].map(lesson => (
                                <div key={lesson._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                                  <span>🎬</span>
                                  <span className="text-gray-800 font-medium">{lesson.title}</span>
                                  <span className="text-gray-400">—</span>
                                  <span className="text-gray-500">{lesson.topic}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {lessonsMap[chapter._id]?.length === 0 && (
                            <p className="text-xs text-gray-400 mt-2">No lessons yet</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No chapters yet. Add one above.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TeacherCourses;
