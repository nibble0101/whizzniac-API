const axios = require("axios");
const Redis = require("ioredis");
const redis = new Redis();
const { getDifficultyLevel } = require("./utils");
require("dotenv").config();



const fetchTrivia = async () => {
  try {
    const { overall } = (await axios.get(
      process.env.URL_GLOBAL_TRIVIA_COUNT
    )).data;
    const { token } = (await axios.get(process.env.URL_SESSION_TOKEN)).data;
    const { trivia_categories } = (await axios.get(process.env.URL_QUIZ_CATEGORY_ID)).data;
    console.log(trivia_categories);
    const trivia = [];

    let totalQuizCount = overall.total_num_of_verified_questions;

    while (totalQuizCount > 50) {
      const url = `${process.env.URL_ALL_QUIZ_CATEGORIES}?amount=50&token=${token}`;
      const response = (await axios.get(url)).data;
      const date = new Date().toISOString();

      if (response.response_code === 0) {
        trivia.push(...response.results);
        console.log(`${date} Successfully fetched trivia`);
      } else {
        console.log(`${date} Failed to fetch trivia data`);
      }
      totalQuizCount -= 50;
    }

    if (totalQuizCount) {
      const url = `${process.env.URL_ALL_QUIZ_CATEGORIES}?amount=${totalQuizCount}&token=${token}`;
      const response = (await axios.get(url)).data;
      const date = new Date().toISOString();
      if (response.response_code === 0) {
        trivia.push(...response.results);
        console.log(`${date} Successfully fetched trivia`);
      } else {
        console.log(`${date} Failed to fetch trivia data`);
      }


    }

    const filteredTriviaObject = {};

    trivia.forEach(triviaObject => {
      if (filteredTriviaObject[triviaObject.category] === undefined) {
        filteredTriviaObject[triviaObject.category] = [triviaObject];
      } else {
        filteredTriviaObject[triviaObject.category].push(triviaObject);
      }
    });

    Object.entries(filteredTriviaObject).forEach(([category, categoryTrivia]) => {
      const retrievedCategoryObject = trivia_categories.find(categoryObject => categoryObject.name === category);
      const { id, name, difficulty } = getDifficultyLevel(retrievedCategoryObject, categoryTrivia);
      Object.entries(difficulty).forEach(([difficultyLevel, listOfQuestions]) => {
        redis.set(`category-${id}-difficulty-${difficultyLevel}`, JSON.stringify(listOfQuestions))
          .then(() => {
            const date = new Date().toISOString();
            console.log(`${date}: Successfully saved ${name} of difficulty ${difficultyLevel} `)
          })
          .catch(err => {
            const date = new Date().toISOString();
            console.log(`${date}: Failed to save ${name} of difficulty ${difficultyLevel} ${err}`)

          })
      })
    })
  } catch (err) {
    console.log("An error has occurred", err);
  }
};

fetchTrivia();

// const data = {
//   name: "Joseph Mawa",
//   age: 100,
//   gender: "Male"
// }

// redis.set("data", JSON.stringify(data)).then(status => {
//   console.log(status)
//   redis.disconnect();
// }).catch(err => {
//   console.error(err);
// })



