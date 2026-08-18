/**
 * Seed demo data for the Learning Platform.
 * Run: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: { $in: ['teacher@demo.com', 'student@demo.com', 'admin@demo.com'] } }),
  ]);

  const teacher = await User.create({
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    password: 'password123',
    role: 'teacher'
  });

  const student = await User.create({
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student'
  });

  const admin = await User.create({
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin'
  });

  const course = await Course.create({
    title: 'Mathematics Class 8',
    description: 'Learn fractions, percentages, and algebra with practical examples.',
    subject: 'Mathematics',
    class: '8',
    createdBy: teacher._id
  });

  const chapter1 = await Chapter.create({ title: 'Fractions', courseId: course._id, order: 0 });
  const chapter2 = await Chapter.create({ title: 'Percentages', courseId: course._id, order: 1 });

  await Lesson.create([
    {
      title: 'Introduction to Fractions',
      description: 'What are fractions and how do we use them?',
      topic: 'Fractions',
      videoUrl: 'https://www.youtube.com/watch?v=4lkq99HlW0w',
      chapterId: chapter1._id
    },
    {
      title: 'Adding and Subtracting Fractions',
      description: 'Learn to add and subtract fractions step by step.',
      topic: 'Fractions',
      videoUrl: 'https://www.youtube.com/watch?v=5juto2ze8Lg',
      chapterId: chapter1._id
    },
    {
      title: 'Understanding Percentages',
      description: 'What is a percentage and how is it calculated?',
      topic: 'Percentages',
      videoUrl: 'https://www.youtube.com/watch?v=Lvr2YsxG10o',
      chapterId: chapter2._id
    }
  ]);

  await Quiz.create({
    title: 'Fractions Quiz',
    courseId: course._id,
    topic: 'Fractions',
    difficulty: 'easy',
    questions: [
      {
        question: 'What is 1/2 + 1/4?',
        options: ['1/6', '2/4', '3/4', '1/8'],
        correctAnswer: '3/4'
      },
      {
        question: 'Which fraction is equal to 0.5?',
        options: ['1/3', '1/2', '2/3', '3/4'],
        correctAnswer: '1/2'
      },
      {
        question: 'What is 2/5 of 100?',
        options: ['20', '40', '50', '25'],
        correctAnswer: '40'
      }
    ]
  });

  await Quiz.create({
    title: 'Percentages Quiz',
    courseId: course._id,
    topic: 'Percentages',
    difficulty: 'medium',
    questions: [
      {
        question: 'What is 20% of 500?',
        options: ['50', '100', '150', '200'],
        correctAnswer: '100'
      },
      {
        question: 'Convert 0.75 to a percentage.',
        options: ['7.5%', '75%', '0.75%', '750%'],
        correctAnswer: '75%'
      }
    ]
  });

  console.log('\n✅ Demo data seeded successfully!\n');
  console.log('Login credentials (password: password123):');
  console.log('  Teacher: teacher@demo.com');
  console.log('  Student: student@demo.com');
  console.log('  Admin:   admin@demo.com\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
