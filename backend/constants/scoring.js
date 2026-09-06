module.exports = {
  STRONG_THRESHOLD: 80,   // >= 80% → strong topic, recommend HARD
  AVERAGE_THRESHOLD: 60,  // >= 60% and < 80% → average, recommend MEDIUM
  WEAK_THRESHOLD: 60,     // < 60% → weak topic, recommend EASY
  ATTENTION_THRESHOLD: 50, // < 50% → student needs teacher attention
  RECENT_ATTEMPTS_COUNT: 3 // Number of recent attempts to consider for recent performance
};
