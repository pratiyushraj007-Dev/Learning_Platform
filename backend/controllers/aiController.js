const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIContent = require('../models/AIContent');

const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'your_gemini_api_key_here';
};

const getModel = () => {
  if (!isGeminiConfigured()) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

const generateText = async (prompt) => {
  const model = getModel();
  if (!model) {
    return `[Demo Mode - Add GEMINI_API_KEY to .env for real AI responses]\n\n${prompt.slice(0, 200)}...\n\nThis is a sample response. Configure your Gemini API key in backend/.env to enable AI features.`;
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
};

const generateJSON = async (prompt) => {
  const text = await generateText(`${prompt}\n\nRespond with valid JSON only, no markdown fences.`);
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const mockQuizQuestions = (topic, count) =>
  Array.from({ length: count }, (_, i) => ({
    question: `Sample question ${i + 1} about ${topic}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A'
  }));

const handleDoubt = async (req, res) => {
  try {
    const { question, language = 'English', style = 'simple' } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const prompt = `You are a helpful tutor for rural school students in India.
Answer this student doubt in ${language} using a ${style} explanation style.
Keep it clear, encouraging, and easy to understand.

Question: ${question}`;

    const explanation = await generateText(prompt);
    res.json({ success: true, data: { explanation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleRuralExample = async (req, res) => {
  try {
    const { topic, environment = 'Farming', language = 'English' } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const prompt = `Create a real-life example to teach "${topic}" to a rural Indian school student.
Use a ${environment} setting. Write in ${language}.
Make it relatable, simple, and practical.`;

    const example = await generateText(prompt);
    res.json({ success: true, data: { example } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleMistake = async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer, topic = '' } = req.body;
    if (!question?.trim() || studentAnswer == null || correctAnswer == null) {
      return res.status(400).json({ success: false, message: 'Question, student answer, and correct answer are required' });
    }

    const prompt = `A student got this question wrong. Explain the mistake kindly and teach the correct approach.
Topic: ${topic || 'General'}
Question: ${question}
Student's answer: ${studentAnswer}
Correct answer: ${correctAnswer}

Explain what went wrong and how to solve it correctly. Be encouraging.`;

    const explanation = await generateText(prompt);
    res.json({ success: true, data: { explanation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { classLevel, subject, topic, difficulty = 'medium', count = 5 } = req.body;
    if (!classLevel || !subject || !topic || !difficulty) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);

    const prompt = `Generate ${numQuestions} multiple choice quiz questions for Class ${classLevel} ${subject} on topic "${topic}" with ${difficulty} difficulty.
Return JSON: { "questions": [{ "question": "...", "options": ["A","B","C","D"], "correctAnswer": "exact option text" }] }`;

    let parsed = await generateJSON(prompt);
    if (!parsed?.questions?.length) {
      parsed = { questions: mockQuizQuestions(topic, numQuestions) };
    }

    res.json({ success: true, data: { questions: parsed.questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateContent = async (req, res) => {
  try {
    const { type = 'example', topic } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const typePrompts = {
      example: `Create 3 educational examples for the topic "${topic}" suitable for rural school students.`,
      summary: `Write a clear, concise summary of "${topic}" for school students.`,
      practice: `Create 5 practice questions with answers for the topic "${topic}".`
    };

    const content = await generateText(typePrompts[type] || typePrompts.example);

    const saved = await AIContent.create({
      type,
      topic,
      content,
      status: 'pending',
      createdBy: req.user._id
    });

    res.json({ success: true, data: { content, id: saved._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleDoubt,
  handleRuralExample,
  handleMistake,
  generateQuiz,
  generateContent
};
