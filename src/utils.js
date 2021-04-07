function getDifficultyLevel(categoryObject, listOfQuestions) {
  const { id, name } = categoryObject;
  const finalQuizObject = {
    id,
    name,
    difficulty: { mixed: listOfQuestions, easy: [], medium: [], hard: [] },
  };
  listOfQuestions.forEach((quizObject) => {
    finalQuizObject.difficulty[quizObject.difficulty].push(quizObject);
  });
  return finalQuizObject;
}

function getDate() {
  return new Date().toISOString();
}

module.exports = { getDifficultyLevel, getDate };
