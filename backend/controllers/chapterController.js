const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const createChapter = async (req, res) => {
  try {
    const { title, courseId } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: 'Title and courseId are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const count = await Chapter.countDocuments({ courseId });
    const chapter = await Chapter.create({ title, courseId, order: count });

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLessonsByChapter = async (req, res) => {
  try {
    const lessons = await Lesson.find({ chapterId: req.params.chapterId }).sort('createdAt');
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createChapter, getLessonsByChapter };
