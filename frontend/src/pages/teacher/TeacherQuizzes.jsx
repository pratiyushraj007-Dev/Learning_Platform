import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create quiz form
  const [showCreate, setShowCreate] = useState(false);
  const [mode, setMode] = useState('manual'); // 'manual' | 'ai'
  const [quizForm, setQuizForm] = useState({
    title: '', courseId: '', topic: '', difficulty: 'medium', questions: []
  });

  // Manual question form
  const [questionForm, setQuestionForm] = useState({
    question: '', options: ['', '', '', ''], correctAnswer: ''
  });

  // AI generation form
  const [aiForm, setAiForm] = useState({
    classLevel: '', subject: '', topic: '', difficulty: 'medium', count: 5
  });
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, coursesRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/courses')
        ]);
        setQuizzes(quizzesRes.data.data);
        setCourses(coursesRes.data.data);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addQuestion = () => {
    if (!questionForm.question.trim() || questionForm.options.some(o => !o.trim()) || !questionForm.correctAnswer) {
      setError('Fill all question fields and select correct answer');
      return;
    }
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { ...questionForm }]
    });
    setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    setError('');
  };

  const removeQuestion = (index) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index)
    });
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim() || !quizForm.courseId || !quizForm.topic.trim()) {
      setError('Title, course, and topic are required');
      return;
    }

    const questions = mode === 'ai' ? aiQuestions : quizForm.questions;
    if (questions.length === 0) {
      setError('Add at least one question');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const res = await api.post('/quizzes', {
        title: quizForm.title,
        courseId: quizForm.courseId,
        topic: quizForm.topic,
        difficulty: quizForm.difficulty,
        questions
      });
      setQuizzes([res.data.data, ...quizzes]);
      setQuizForm({ title: '', courseId: '', topic: '', difficulty: 'medium', questions: [] });
      setAiQuestions([]);
      setShowCreate(false);
      setSuccess('Quiz created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiForm.classLevel || !aiForm.subject || !aiForm.topic || !aiForm.difficulty) {
      setError('Fill all AI generation fields');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/generate-quiz', aiForm);
      setAiQuestions(res.data.data.questions);
      // Auto-fill quiz form
      setQuizForm(prev => ({
        ...prev,
        topic: aiForm.topic,
        difficulty: aiForm.difficulty
      }));
      setSuccess('AI generated quiz questions! Review and create.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed. Try again.');
    } finally {
      setAiLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-500 mt-1">Create quizzes manually or with AI assistance</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-200 text-sm"
        >
          + New Quiz
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Create Quiz Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Quiz</h2>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              ✍️ Manual
            </button>
            <button onClick={() => setMode('ai')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'ai' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              🤖 AI Generated
            </button>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quiz Title</label>
              <input type="text" value={quizForm.title}
                onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                className={inputClass} placeholder="e.g., Fractions Quiz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
              <select value={quizForm.courseId}
                onChange={e => setQuizForm({ ...quizForm, courseId: e.target.value })}
                className={`${inputClass} bg-white`}>
                <option value="">Select course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          {mode === 'manual' ? (
            <>
              {/* Manual: topic + difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                  <input type="text" value={quizForm.topic}
                    onChange={e => setQuizForm({ ...quizForm, topic: e.target.value })}
                    className={inputClass} placeholder="e.g., Fractions" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                  <select value={quizForm.difficulty}
                    onChange={e => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    className={`${inputClass} bg-white`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Add Question Form */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-medium text-gray-800 mb-3">Add Question</h3>
                <div className="space-y-3">
                  <input type="text" value={questionForm.question}
                    onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className={inputClass} placeholder="Question text" />
                  <div className="grid grid-cols-2 gap-2">
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" name="correct"
                          checked={questionForm.correctAnswer === opt && opt !== ''}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: opt })}
                          className="accent-primary-600" />
                        <input type="text" value={opt}
                          onChange={e => {
                            const newOpts = [...questionForm.options];
                            newOpts[i] = e.target.value;
                            setQuestionForm({
                              ...questionForm,
                              options: newOpts,
                              correctAnswer: questionForm.correctAnswer === opt ? e.target.value : questionForm.correctAnswer
                            });
                          }}
                          className={inputClass} placeholder={`Option ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
                  <button onClick={addQuestion}
                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 transition-colors">
                    + Add Question
                  </button>
                </div>
              </div>

              {/* Added Questions */}
              {quizForm.questions.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-medium text-gray-800">Questions ({quizForm.questions.length})</h3>
                  {quizForm.questions.map((q, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-white border border-gray-100 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Q{i + 1}. {q.question}</p>
                        <p className="text-xs text-green-600 mt-1">✓ {q.correctAnswer}</p>
                      </div>
                      <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* AI Generation Form */}
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <h3 className="font-medium text-purple-800 mb-3">🤖 AI Quiz Generator</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={aiForm.classLevel}
                    onChange={e => setAiForm({ ...aiForm, classLevel: e.target.value })}
                    className={inputClass} placeholder="Class level (e.g., 8)" />
                  <input type="text" value={aiForm.subject}
                    onChange={e => setAiForm({ ...aiForm, subject: e.target.value })}
                    className={inputClass} placeholder="Subject (e.g., Math)" />
                  <input type="text" value={aiForm.topic}
                    onChange={e => setAiForm({ ...aiForm, topic: e.target.value })}
                    className={inputClass} placeholder="Topic (e.g., Fractions)" />
                  <select value={aiForm.difficulty}
                    onChange={e => setAiForm({ ...aiForm, difficulty: e.target.value })}
                    className={`${inputClass} bg-white`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Count</label>
                    <input type="number" min="1" max="20" value={aiForm.count}
                      onChange={e => setAiForm({ ...aiForm, count: parseInt(e.target.value) || 5 })}
                      className={`${inputClass} w-20`} />
                  </div>
                  <button onClick={handleAIGenerate} disabled={aiLoading}
                    className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 mt-4">
                    {aiLoading ? '⏳ Generating...' : '🤖 Generate'}
                  </button>
                </div>
              </div>

              {/* AI Generated Questions Preview */}
              {aiQuestions.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-medium text-gray-800">AI Generated Questions ({aiQuestions.length})</h3>
                  {aiQuestions.map((q, i) => (
                    <div key={i} className="p-3 bg-white border border-gray-100 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Q{i + 1}. {q.question}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {q.options?.map((opt, j) => (
                          <span key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {opt} {opt === q.correctAnswer && '✓'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Button */}
          <div className="flex gap-3">
            <button onClick={handleCreateQuiz} disabled={creating}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Quiz'}
            </button>
            <button onClick={() => { setShowCreate(false); setAiQuestions([]); }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-900">No quizzes yet</h2>
          <p className="text-gray-500 mt-2">Click "New Quiz" to create your first quiz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg">{quiz.topic}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg capitalize">{quiz.difficulty}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{quiz.questions?.length || 0} questions</p>
              <p className="text-xs text-gray-400">
                Course: {quiz.courseId?.title || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TeacherQuizzes;
