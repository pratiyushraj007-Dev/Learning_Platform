import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${quizId}`);
        setQuiz(res.data.data);
        setAnswers(new Array(res.data.data.questions.length).fill(''));
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (questionIndex, option) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a === '').length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);

    // Format answers with questionId for robust matching
    const formattedAnswers = quiz.questions.map((q, index) => ({
      questionId: q._id,
      selectedOption: answers[index] !== '' ? answers[index] : null
    }));

    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: formattedAnswers });
      setResult(res.data.data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
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

  if (!quiz) {
    return (
      <Layout>
        <p className="text-center py-10 text-gray-500">Quiz not found.</p>
      </Layout>
    );
  }

  // Show results after submission
  if (submitted && result) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                result.score >= 80 ? 'bg-green-100' : result.score >= 50 ? 'bg-amber-100' : 'bg-red-100'
              }`}
            >
              <span
                className={`text-3xl font-bold ${
                  result.score >= 80 ? 'text-green-700' : result.score >= 50 ? 'text-amber-700' : 'text-red-700'
                }`}
              >
                {result.score}%
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {result.score >= 80 ? '🎉 Excellent!' : result.score >= 50 ? '👍 Good effort!' : '💪 Keep trying!'}
            </h1>
            <p className="text-gray-500">
              {result.correctAnswers} correct, {result.wrongAnswers} wrong out of {result.totalQuestions} questions
            </p>
            {result.attemptNumber && (
              <p className="text-xs text-gray-400 mt-1">Attempt #{result.attemptNumber}</p>
            )}

            {result.weakTopics && result.weakTopics.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl">
                <p className="text-red-700 font-medium">⚠️ Weak Topic(s): {result.weakTopics.join(', ')}</p>
                <p className="text-red-600 text-sm mt-1">Consider practicing more on these topics</p>
              </div>
            )}
          </div>

          {/* Question Review */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h2>
          <div className="space-y-4 mb-8">
            {result.questions.map((q, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl border-2 p-5 ${
                  q.isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                      q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {q.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`text-sm px-3 py-1.5 rounded-lg ${
                            opt === q.correctAnswer
                              ? 'bg-green-50 text-green-800 font-medium'
                              : opt === q.studentAnswer && !q.isCorrect
                              ? 'bg-red-50 text-red-800'
                              : 'text-gray-600'
                          }`}
                        >
                          {opt}
                          {opt === q.correctAnswer && ' ✓'}
                          {opt === q.studentAnswer && !q.isCorrect && ' (your answer)'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              ← Back to Course
            </button>
            <button
              onClick={() => navigate('/student/ai-assistant')}
              className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            >
              🤖 Get AI Help
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz taking view
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg">{quiz.topic}</span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg capitalize">
              {quiz.difficulty}
            </span>
            <span className="text-xs text-gray-500">{quiz.questions.length} questions</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {quiz.questions.map((q, i) => (
            <div key={q._id || i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <p className="font-medium text-gray-900 mb-4">
                <span className="text-primary-600 font-semibold">Q{i + 1}.</span> {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, j) => (
                  <label
                    key={j}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      answers[i] === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={option}
                      checked={answers[i] === option}
                      onChange={() => handleAnswer(i, option)}
                      className="w-4 h-4 text-primary-600 accent-primary-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>
              {answers.filter((a) => a !== '').length} of {quiz.questions.length} answered
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{
                width: `${(answers.filter((a) => a !== '').length / quiz.questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 shadow-lg shadow-primary-200"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </Layout>
  );
};

export default Quiz;
