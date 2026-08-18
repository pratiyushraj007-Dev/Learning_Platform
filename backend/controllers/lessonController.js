const Lesson = require('../models/Lesson');
const Chapter = require('../models/Chapter');

const createLesson = async (req, res) => {
  try {
    const { title, description, topic, videoUrl, chapterId } = req.body;

    if (!title || !topic || !chapterId) {
      return res.status(400).json({ success: false, message: 'Title, topic, and chapterId are required' });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const lesson = await Lesson.create({
      title,
      description: description || '',
      topic,
      videoUrl: videoUrl || '',
      chapterId
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLesson, getLessonById };
