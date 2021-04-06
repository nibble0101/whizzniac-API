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

    const categories = Object.keys(filteredTriviaObject);
    for(let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++){
      const category = categories[categoryIndex];
      const categoryTrivia = filteredTriviaObject[category];
      const retrievedCategoryObject = trivia_categories.find(categoryObject => categoryObject.name === category);
      const { id, name, difficulty } = getDifficultyLevel(retrievedCategoryObject, categoryTrivia);
      
      const difficultyQuizPairsArray = Object.entries(difficulty);

      for(let pairIndex = 0; pairIndex < difficultyQuizPairsArray.length; pairIndex++){
        const [difficultyLevel, listOfQuestions] = difficultyQuizPairsArray[pairIndex];
        try{
          await redis.set(`category-${id}-difficulty-${difficultyLevel}`, JSON.stringify(listOfQuestions));
          const date = new Date().toISOString();
          console.log(`${date}: Successfully saved ${name} of difficulty ${difficultyLevel} `);
        }catch(err){
          const date = new Date().toISOString();
          console.log(`${date}: Failed to save ${name} of difficulty ${difficultyLevel} ${err}`);
        }
      }

    }
  } catch (err) {
    console.log("An error has occurred", err);
  }
};

fetchTrivia();





