# Member B API Documentation — Quizzes, Scoring & Student Progress

## Overview

Member B provides complete REST APIs for Quiz Management (CRUD), Secure Quiz Delivery, Quiz Submission & Automated Scoring, Weak Topic Identification, Rule-Based Adaptive Difficulty & Topic Recommendations, and Teacher Class Performance Reporting.

All endpoints require JWT Authentication (`Authorization: Bearer <token>`).

---

## 1. Quiz Management APIs

### `POST /api/quizzes`
- **Description:** Create a new quiz.
- **Auth Required:** Yes
- **Allowed Roles:** Teacher, Admin
- **Request Body:**
  ```json
  {
    "title": "Percentage and Fractions Quiz",
    "courseId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "chapterId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "topic": "Percentage",
    "difficulty": "medium",
    "isPublished": true,
    "questions": [
      {
        "question": "What is 20% of 500?",
        "options": ["50", "100", "150", "200"],
        "correctAnswer": 1,
        "topic": "Percentage",
        "difficulty": "easy"
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "title": "Percentage and Fractions Quiz",
      "courseId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "chapterId": "64f1a2b3c4d5e6f7a8b9c0d2",
      "topic": "Percentage",
      "difficulty": "medium",
      "isPublished": true,
      "questions": [ ... ]
    }
  }
  ```

---

### `GET /api/quizzes`
- **Description:** Get all quizzes (filterable by `courseId`, `chapterId`, `topic`).
- **Auth Required:** Yes
- **Allowed Roles:** Student, Teacher, Admin
- **Query Parameters:**
  - `courseId` (optional)
  - `chapterId` (optional)
  - `topic` (optional)
- **Note:** For students, correct answers are stripped and only published quizzes are returned.

---

### `GET /api/quizzes/:id`
- **Description:** Get a single quiz by ID.
- **Auth Required:** Yes
- **Allowed Roles:** Student, Teacher, Admin
- **Security Requirement:** If requested by a student, `correctAnswer` is strictly stripped from all questions.

---

### `PUT /api/quizzes/:id`
- **Description:** Update an existing quiz.
- **Auth Required:** Yes
- **Allowed Roles:** Creator Teacher, Admin

---

### `DELETE /api/quizzes/:id`
- **Description:** Delete a quiz.
- **Auth Required:** Yes
- **Allowed Roles:** Creator Teacher, Admin

---

## 2. Quiz Submission & Scoring APIs

### `POST /api/quizzes/:id/submit`
- **Description:** Submit quiz answers for server-side evaluation.
- **Auth Required:** Yes
- **Allowed Roles:** Student
- **Request Body:**
  ```json
  {
    "submissionKey": "optional-uuid-for-idempotency",
    "answers": [
      {
        "questionId": "64f1a2b3c4d5e6f7a8b9c0d4",
        "selectedOption": 1
      }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "attemptId": "64f1a2b3c4d5e6f7a8b9c0d5",
      "attemptNumber": 1,
      "score": 100,
      "percentage": 100,
      "totalQuestions": 1,
      "correctAnswers": 1,
      "wrongAnswers": 0,
      "weakTopics": [],
      "recommendedDifficulty": "hard",
      "topic": "Percentage",
      "topicPerformance": [
        {
          "topic": "Percentage",
          "total": 1,
          "correct": 1,
          "percentage": 100
        }
      ],
      "questions": [
        {
          "questionId": "64f1a2b3c4d5e6f7a8b9c0d4",
          "question": "What is 20% of 500?",
          "options": ["50", "100", "150", "200"],
          "correctAnswer": "100",
          "studentAnswer": "100",
          "isCorrect": true,
          "topic": "Percentage"
        }
      ]
    }
  }
  ```

---

## 3. Student Progress & Recommendation APIs

### `GET /api/progress/dashboard`
- **Description:** Returns full dashboard stats including lesson progress, quiz average, recent attempts, weak topics, and next topic recommendation.
- **Auth Required:** Yes
- **Allowed Roles:** Student

---

### `GET /api/progress/quiz-stats`
- **Description:** Returns detailed quiz statistics (average score across attempts, recent average score, topic breakdown, strong/weak topics, adaptive difficulty recommendation).
- **Auth Required:** Yes
- **Allowed Roles:** Student

---

### `GET /api/results/me`
- **Description:** Returns history of all quiz attempts taken by the current student.
- **Auth Required:** Yes
- **Allowed Roles:** Student

---

### `GET /api/results/:attemptId`
- **Description:** Returns full breakdown of a specific quiz attempt.
- **Auth Required:** Yes
- **Allowed Roles:** Student (own attempt), Teacher, Admin

---

### `GET /api/students/:studentId/progress`
- **Description:** Get overall progress and topic performance for a specific student.
- **Auth Required:** Yes
- **Allowed Roles:** Student (own ID), Teacher, Admin

---

### `GET /api/students/:studentId/recommendations`
- **Description:** Get rule-based next topic and difficulty recommendation for a student.
- **Auth Required:** Yes
- **Allowed Roles:** Student (own ID), Teacher, Admin
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "recommendedTopic": "Ratio",
      "reason": "Your recent performance in Ratio is 42%, below your target score.",
      "difficulty": "easy",
      "metrics": {
        "historicalPercentage": 50,
        "recentPercentage": 42,
        "weightedScore": 45
      }
    }
  }
  ```

---

## 4. Teacher Reports APIs

### `GET /api/teacher/performance`
- **Description:** Get class performance report across teacher's courses (class average, weak topics, students needing attention, attempt table).
- **Auth Required:** Yes
- **Allowed Roles:** Teacher, Admin
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalCourses": 3,
      "totalQuizzes": 12,
      "totalStudents": 30,
      "studentCount": 30,
      "averageScore": 68,
      "classAverage": 68,
      "weakTopics": [
        {
          "topic": "Ratio",
          "averagePercentage": 45,
          "averageScore": 45
        }
      ],
      "studentsNeedingAttention": [
        {
          "studentId": "64f1a2b3c4d5e6f7a8b9c0d6",
          "name": "John Doe",
          "email": "john@example.com",
          "averageScore": 38,
          "attemptsCount": 3
        }
      ],
      "performanceTable": [ ... ]
    }
  }
  ```

---

### `GET /api/teacher/students/:studentId`
- **Description:** Get detailed attempt breakdown for a specific student scoped to teacher's courses.
- **Auth Required:** Yes
- **Allowed Roles:** Teacher, Admin

---

## 5. Threshold Configuration Constants

```javascript
STRONG_THRESHOLD = 80   // >= 80% -> Strong Topic, Recommend HARD difficulty
AVERAGE_THRESHOLD = 60  // >= 60% and < 80% -> Average Topic, Recommend MEDIUM difficulty
WEAK_THRESHOLD = 60     // < 60% -> Weak Topic, Recommend EASY difficulty
ATTENTION_THRESHOLD = 50 // < 50% -> Student needs teacher attention
RECENT_ATTEMPTS_COUNT = 3 // Number of recent attempts evaluated for recent performance
```
