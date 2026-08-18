const Course = require('../models/Course');
const Chapter = require('../models/Chapter');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'name').sort('-createdAt');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, subject, class: classLevel } = req.body;

    if (!title || !description || !subject || !classLevel) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      class: String(classLevel),
      createdBy: req.user._id
    });

    const populated = await Course.findById(course._id).populate('createdBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChaptersByCourse = async (req, res) => {
  try {
    const chapters = await Chapter.find({ courseId: req.params.courseId }).sort('order createdAt');
    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, getChaptersByCourse };
