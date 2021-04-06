const axios = require("axios");
const Redis = require("ioredis");
const { getDifficultyLevel, getDate } = require("./utils");
require("dotenv").config();

const redisConfig = {
  port: process.env.DATABASE_PORT,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD
}

const redis = new Redis(redisConfig);


const fetchTrivia = async () => {
  try {
    const response = await redis.flushall();
    if(response === "OK"){
      console.log(`${getDate()}: Successfully flushed database`);
    }
    const { overall } = (await axios.get(
      process.env.URL_GLOBAL_TRIVIA_COUNT
    )).data;
    console.log(`${getDate()}: Successfully fetched  overall trivia count`);
    const { token } = (await axios.get(process.env.URL_SESSION_TOKEN)).data;
    console.log(`${getDate()}: Successfully fetched  session token`);
    const { trivia_categories } = (await axios.get(process.env.URL_QUIZ_CATEGORY_ID)).data;
    console.log(`${getDate()}: Successfully fetched  trivia categories`);
    const trivia = [];

    let totalQuizCount = overall.total_num_of_verified_questions;
    let count = 1;

    while (totalQuizCount > 50) {
      const url = `${process.env.URL_ALL_QUIZ_CATEGORIES}?amount=50&token=${token}`;
      const response = (await axios.get(url)).data;
      

      if (response.response_code === 0) {
        trivia.push(...response.results);
        console.log(`${getDate()}: Successfully fetched trivia ${count}`);
      } else {
        console.log(`${getDate()}: Failed to fetch trivia ${count}`);
      }
      totalQuizCount -= 50;
      count++
    }

    if (totalQuizCount) {
      const url = `${process.env.URL_ALL_QUIZ_CATEGORIES}?amount=${totalQuizCount}&token=${token}`;
      const response = (await axios.get(url)).data;
      if (response.response_code === 0) {
        trivia.push(...response.results);
        console.log(`${getDate()} Successfully fetched trivia ${count + 1}`);
      } else {
        console.log(`${getDate()} Failed to fetch trivia data ${count + 1}`);
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
          console.log(`${getDate()}: Successfully saved ${name} of difficulty ${difficultyLevel} `);
        }catch(err){
          console.log(`${getDate()}: Failed to save ${name} of difficulty ${difficultyLevel} ${err}`);
        }
      }

      if(categoryIndex === categories.length - 1){
        redis.disconnect();
        console.log(`${getDate()}: Successfully disconnected from database`);
      }

    }
  } catch (err) {
    console.log(`${getDate()}: An error has occurred`, err);
  }
};

fetchTrivia();





