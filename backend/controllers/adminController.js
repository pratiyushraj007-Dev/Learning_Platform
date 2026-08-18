const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalCourses, totalQuizzes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments(),
      Quiz.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats };
