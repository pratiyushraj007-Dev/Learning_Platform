const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
let genAI = null;
let model = null;

const initializeAI = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('WARNING: GEMINI_API_KEY not set. AI features will not work.');
    return false;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  return true;
};

// Generic helper to call Gemini with error handling
const callGemini = async (prompt) => {
  if (!model) {
    if (!initializeAI()) {
      throw new Error('AI service not configured. Please set GEMINI_API_KEY.');
    }
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw new Error('AI service is temporarily unavailable. Please try again.');
  }
};

// AI Feature 1: Doubt Explanation
const generateDoubtExplanation = async (question, language = 'English', style = 'simple') => {
  const styleGuide = {
    'simple': 'Give a simple, easy-to-understand explanation.',
    'step-by-step': 'Explain step by step with numbered steps.',
    'explain-like-im-10': 'Explain this as if you are talking to a 10-year-old child. Use very simple words and fun examples.'
  };

  const prompt = `You are a friendly teacher helping rural school students in India.
A student has asked the following doubt:
"${question}"

Language: ${language}
Style: ${styleGuide[style] || styleGuide['simple']}

Please provide a clear, student-friendly explanation. Keep it concise and easy to understand.
${language === 'Hindi' ? 'Please respond in Hindi (Devanagari script).' : 'Please respond in English.'}`;

  return await callGemini(prompt);
};

// AI Feature 2: Rural Context Example
const generateRuralExample = async (topic, environment, language = 'English') => {
  const prompt = `You are a teacher creating learning examples for rural school students in India.

Topic: ${topic}
Context/Environment: ${environment}
Language: ${language}

Create a simple, relatable example that explains "${topic}" using the context of "${environment}".
The example should:
1. Use a real-life scenario from ${environment} that rural students can relate to
2. Include a simple word problem
3. Show the step-by-step solution
4. Be suitable for school students (class 5-10)

${language === 'Hindi' ? 'Please respond in Hindi (Devanagari script).' : 'Please respond in English.'}
Keep the explanation simple and engaging.`;

  return await callGemini(prompt);
};

// AI Feature 3: Mistake Explanation
const generateMistakeExplanation = async (question, studentAnswer, correctAnswer, topic) => {
  const prompt = `You are a kind and patient teacher helping a rural school student understand their mistake.

Topic: ${topic}
Question: ${question}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Please provide:
1. **What the student likely did wrong** — explain the common mistake in a friendly way
2. **Simple explanation** — explain the concept simply
3. **Correct solution** — show the step-by-step correct solution
4. **Practice question** — give ONE similar practice question for the student to try

Keep everything simple and encouraging. Do not make the student feel bad about the mistake.`;

  return await callGemini(prompt);
};

// AI Feature 4: Quiz Generation
const generateQuizQuestions = async (classLevel, subject, topic, difficulty, count) => {
  const prompt = `Generate exactly ${count} multiple-choice quiz questions for school students.

Class: ${classLevel}
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

IMPORTANT: Return ONLY a valid JSON array with no extra text, no markdown formatting, no code blocks.
Each object in the array must have exactly these fields:
- "question": the question text (string)
- "options": array of exactly 4 option strings
- "correctAnswer": the correct option text that exactly matches one of the options (string)
- "difficulty": "${difficulty}" (string)
- "topic": "${topic}" (string)

Example format:
[{"question":"What is 2+2?","options":["2","3","4","5"],"correctAnswer":"4","difficulty":"easy","topic":"Addition"}]

Make questions appropriate for class ${classLevel} students. Make them clear and unambiguous.`;

  const text = await callGemini(prompt);

  // Try to parse the JSON from Gemini's response
  try {
    // Remove any markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(questions)) throw new Error('Response is not an array');

    return questions.map(q => ({
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || '',
      difficulty: q.difficulty || difficulty,
      topic: q.topic || topic
    }));
  } catch (parseError) {
    console.error('Failed to parse AI quiz response:', parseError.message);
    throw new Error('AI generated invalid quiz format. Please try again.');
  }
};

// AI Feature 5: Content Generation (examples, summaries, practice questions)
const generateContent = async (type, topic) => {
  const typePrompts = {
    'example': `Create 3 simple examples explaining "${topic}" for rural school students in India. Use real-life scenarios.`,
    'summary': `Write a short, simple summary of "${topic}" suitable for school students (class 5-10). Keep it concise and easy to understand.`,
    'practice': `Create 5 practice questions (with answers) on "${topic}" for school students. Include a mix of difficulty levels.`
  };

  const prompt = `You are a teacher creating learning content for rural school students in India.

${typePrompts[type] || typePrompts['example']}

Keep the language simple and engaging.`;

  return await callGemini(prompt);
};

module.exports = {
  generateDoubtExplanation,
  generateRuralExample,
  generateMistakeExplanation,
  generateQuizQuestions,
  generateContent
};
