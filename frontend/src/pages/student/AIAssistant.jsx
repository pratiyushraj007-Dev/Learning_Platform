import { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('doubt');

  // Doubt state
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtLanguage, setDoubtLanguage] = useState('English');
  const [doubtStyle, setDoubtStyle] = useState('simple');
  const [doubtResult, setDoubtResult] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);

  // Rural example state
  const [ruralTopic, setRuralTopic] = useState('');
  const [ruralEnv, setRuralEnv] = useState('Farming');
  const [ruralLanguage, setRuralLanguage] = useState('English');
  const [ruralResult, setRuralResult] = useState('');
  const [ruralLoading, setRuralLoading] = useState(false);

  // Mistake state
  const [mistakeQuestion, setMistakeQuestion] = useState('');
  const [mistakeStudentAnswer, setMistakeStudentAnswer] = useState('');
  const [mistakeCorrectAnswer, setMistakeCorrectAnswer] = useState('');
  const [mistakeTopic, setMistakeTopic] = useState('');
  const [mistakeResult, setMistakeResult] = useState('');
  const [mistakeLoading, setMistakeLoading] = useState(false);

  const [error, setError] = useState('');

  const environments = ['Farming', 'Dairy', 'Local Shop', 'Home', 'Water', 'Transport', 'Nature'];

  const handleDoubt = async () => {
    if (!doubtQuestion.trim()) return;
    setDoubtLoading(true);
    setDoubtResult('');
    setError('');
    try {
      const res = await api.post('/ai/doubt', {
        question: doubtQuestion,
        language: doubtLanguage,
        style: doubtStyle
      });
      setDoubtResult(res.data.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get AI response');
    } finally {
      setDoubtLoading(false);
    }
  };

  const handleRural = async () => {
    if (!ruralTopic.trim()) return;
    setRuralLoading(true);
    setRuralResult('');
    setError('');
    try {
      const res = await api.post('/ai/rural-example', {
        topic: ruralTopic,
        environment: ruralEnv,
        language: ruralLanguage
      });
      setRuralResult(res.data.data.example);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get AI response');
    } finally {
      setRuralLoading(false);
    }
  };

  const handleMistake = async () => {
    if (!mistakeQuestion.trim() || !mistakeStudentAnswer.trim() || !mistakeCorrectAnswer.trim()) return;
    setMistakeLoading(true);
    setMistakeResult('');
    setError('');
    try {
      const res = await api.post('/ai/mistake', {
        question: mistakeQuestion,
        studentAnswer: mistakeStudentAnswer,
        correctAnswer: mistakeCorrectAnswer,
        topic: mistakeTopic
      });
      setMistakeResult(res.data.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get AI response');
    } finally {
      setMistakeLoading(false);
    }
  };

  const tabs = [
    { id: 'doubt', label: '❓ Ask Doubt' },
    { id: 'rural', label: '🌾 Rural Example' },
    { id: 'mistake', label: '✏️ Mistake Help' },
  ];

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm";
  const selectClass = "px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-white";
  const btnClass = "px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 shadow-lg shadow-purple-200 text-sm";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI Assistant</h1>
          <p className="text-gray-500 mt-1">Get AI-powered help with your studies</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {/* Ask Doubt Tab */}
        {activeTab === 'doubt' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a Doubt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Question</label>
                <textarea
                  value={doubtQuestion}
                  onChange={(e) => setDoubtQuestion(e.target.value)}
                  className={`${inputClass} min-h-[100px]`}
                  placeholder='e.g., "Why is 20% equal to 20/100?"'
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select value={doubtLanguage} onChange={(e) => setDoubtLanguage(e.target.value)} className={selectClass + ' w-full'}>
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Explanation Style</label>
                  <select value={doubtStyle} onChange={(e) => setDoubtStyle(e.target.value)} className={selectClass + ' w-full'}>
                    <option value="simple">Simple</option>
                    <option value="step-by-step">Step-by-step</option>
                    <option value="explain-like-im-10">Explain like I'm 10</option>
                  </select>
                </div>
              </div>
              <button onClick={handleDoubt} disabled={doubtLoading || !doubtQuestion.trim()} className={btnClass}>
                {doubtLoading ? '⏳ Thinking...' : '🤖 Ask AI'}
              </button>
            </div>

            {doubtResult && (
              <div className="mt-6 p-5 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-semibold text-purple-900 mb-2">AI Response:</h3>
                <div className="text-purple-800 text-sm whitespace-pre-wrap leading-relaxed">{doubtResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Rural Example Tab */}
        {activeTab === 'rural' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rural Context Example</h2>
            <p className="text-sm text-gray-500 mb-4">Learn concepts through real-life examples from your surroundings</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                <input
                  type="text"
                  value={ruralTopic}
                  onChange={(e) => setRuralTopic(e.target.value)}
                  className={inputClass}
                  placeholder='e.g., "Percentage", "Fractions", "Area"'
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Environment</label>
                  <select value={ruralEnv} onChange={(e) => setRuralEnv(e.target.value)} className={selectClass + ' w-full'}>
                    {environments.map(env => <option key={env}>{env}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select value={ruralLanguage} onChange={(e) => setRuralLanguage(e.target.value)} className={selectClass + ' w-full'}>
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
              <button onClick={handleRural} disabled={ruralLoading || !ruralTopic.trim()} className={btnClass}>
                {ruralLoading ? '⏳ Generating...' : '🌾 Generate Example'}
              </button>
            </div>

            {ruralResult && (
              <div className="mt-6 p-5 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2">🌾 Rural Example:</h3>
                <div className="text-green-800 text-sm whitespace-pre-wrap leading-relaxed">{ruralResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Mistake Tab */}
        {activeTab === 'mistake' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Understand Your Mistake</h2>
            <p className="text-sm text-gray-500 mb-4">Enter a question you got wrong and let AI explain what happened</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Question</label>
                <input type="text" value={mistakeQuestion} onChange={(e) => setMistakeQuestion(e.target.value)}
                  className={inputClass} placeholder='e.g., "What is 20% of 500?"' />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
                  <input type="text" value={mistakeStudentAnswer} onChange={(e) => setMistakeStudentAnswer(e.target.value)}
                    className={inputClass} placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Correct Answer</label>
                  <input type="text" value={mistakeCorrectAnswer} onChange={(e) => setMistakeCorrectAnswer(e.target.value)}
                    className={inputClass} placeholder="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic (optional)</label>
                <input type="text" value={mistakeTopic} onChange={(e) => setMistakeTopic(e.target.value)}
                  className={inputClass} placeholder="Percentage" />
              </div>
              <button onClick={handleMistake} disabled={mistakeLoading || !mistakeQuestion.trim()} className={btnClass}>
                {mistakeLoading ? '⏳ Analyzing...' : '🔍 Analyze Mistake'}
              </button>
            </div>

            {mistakeResult && (
              <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="font-semibold text-amber-900 mb-2">✏️ Mistake Analysis:</h3>
                <div className="text-amber-800 text-sm whitespace-pre-wrap leading-relaxed">{mistakeResult}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AIAssistant;
