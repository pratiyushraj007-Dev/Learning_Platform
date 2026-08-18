import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeacherAIContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Generate form
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ type: 'example', topic: '' });
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContent();
  }, [statusFilter]);

  const fetchContent = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/ai-content${query}`);
      setContents(res.data.data);
    } catch (err) {
      console.error('Failed to load AI content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genForm.topic.trim()) return;
    setGenerating(true);
    setGenResult('');
    setError('');
    try {
      const res = await api.post('/ai/generate-content', genForm);
      setGenResult(res.data.data.content);
      setSuccess('Content generated! It will appear in the list below as "Pending".');
      setTimeout(() => setSuccess(''), 4000);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/ai-content/${id}/approve`);
      setContents(contents.map(c => c._id === id ? { ...c, status: 'approved' } : c));
      setSuccess('Content approved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/ai-content/${id}/reject`);
      setContents(contents.map(c => c._id === id ? { ...c, status: 'rejected' } : c));
      setSuccess('Content rejected.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
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
          <h1 className="text-3xl font-bold text-gray-900">AI Content</h1>
          <p className="text-gray-500 mt-1">Generate, review, and manage AI-created learning content</p>
        </div>
        <button
          onClick={() => setShowGenerate(!showGenerate)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 text-sm"
        >
          🤖 Generate Content
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Generate Form */}
      {showGenerate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 Generate AI Content</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Type</label>
                <select value={genForm.type}
                  onChange={e => setGenForm({ ...genForm, type: e.target.value })}
                  className={`${inputClass} bg-white`}>
                  <option value="example">Examples</option>
                  <option value="summary">Summary</option>
                  <option value="practice">Practice Questions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                <input type="text" value={genForm.topic}
                  onChange={e => setGenForm({ ...genForm, topic: e.target.value })}
                  className={inputClass} placeholder="e.g., Photosynthesis, Fractions" />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating || !genForm.topic.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 text-sm">
              {generating ? '⏳ Generating...' : '🤖 Generate'}
            </button>
          </div>

          {genResult && (
            <div className="mt-6 p-5 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-2">Generated Content:</h3>
              <div className="text-purple-800 text-sm whitespace-pre-wrap leading-relaxed">{genResult}</div>
            </div>
          )}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'pending', 'approved', 'rejected'].map(status => (
          <button key={status}
            onClick={() => { setStatusFilter(status); setLoading(true); }}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Content List */}
      {contents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold text-gray-900">No AI content yet</h2>
          <p className="text-gray-500 mt-2">Generate some content using the button above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map(content => (
            <div key={content._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-lg capitalize">{content.type}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${statusColors[content.status]}`}>
                      {content.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{content.topic}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    By {content.createdBy?.name || 'Unknown'} • {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {content.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleApprove(content._id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors">
                      ✓ Approve
                    </button>
                    <button onClick={() => handleReject(content._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {typeof content.content === 'string'
                  ? content.content
                  : JSON.stringify(content.content, null, 2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TeacherAIContent;
