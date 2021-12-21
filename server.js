const express = require("express");
const app = express();
const Redis = require("ioredis");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const nodeCron = require("node-cron");
const { fetchTrivia } = require("./src/scraper");
const swaggerDocument = require("./swagger.json");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
console.log(process.env.NODE_ENV)
app.use(express.json());
app.use(cors());
app.disable("x-powered-by");

const PORT = process.env.PORT || 3000;
const redisConfig = {
  port: process.env.DATABASE_PORT,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
};

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "Quiz API",
};
const redis = new Redis(redisConfig);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/scrape", async (req, res) => {
  const { key } = req.query;
  if (!key || key !== process.env.API_KEY) {
    console.log("Submitted invalid API key");
    res.status(404).send({ message: "Invalid API key" });
  }
  const date = new Date();
  console.log("Scheduling job");
  nodeCron.schedule(
    `${date.getMinutes() + 1} ${date.getHours()} ${date.getDate()} ${
      date.getMonth() + 1
    } *`,
    fetchTrivia
  );
  console.log("Job scheduled");
  res.status(200).send({ message: "Scraping successfull" });
});

app.get("/lastupdate", async (req, res) => {
  const date = await redis.get("lastUpdatedOn");
  if (!date) {
    res.status(404).send({ message: "No data found" });
  }
  res.status(200).send({ date });
});

app.get("/categories", async (req, res) => {
  const response = await redis.get("categories");
  if (!response) {
    res.status(404).send({ message: "Resource not found" });
    return;
  }
  res.status(200).send(JSON.parse(response));
});

app.get("/trivia", async (req, res) => {
  let { category, difficulty } = req.query;
  category = category.trim();
  difficulty = difficulty.toLowerCase().trim();
  if (!category || !difficulty) {
    res.status(400).send({ message: "Bad request" });
    return;
  }
  const response = await redis.get(
    `category-${category}-difficulty-${difficulty}`
  );
  if (!response) {
    res.status(404).send({ message: "Resource not found" });
    return;
  }
  res.status(200).send(JSON.parse(response));
});

const enumArray = [];
app.use(
  "/documentation",
  async (req, res, next) => {
    // Swagger calls this middleware 6 times.
    // This ensures data is fetched from DB once.
    if (!enumArray.length) {
      const response = await redis.get("categories");
      if (response) {
        const parsedData = JSON.parse(response);
        let firstId = parsedData[0].id;
        const lastId = parsedData[parsedData.length - 1].id;
        while (firstId <= lastId) {
          enumArray.push(firstId);
          firstId++;
        }
      }
      if (enumArray.length) {
        swaggerDocument.paths["/trivia"].get.parameters[0].schema["enum"] =
          enumArray;
      }
      req.swaggerDoc = swaggerDocument;
    }
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(undefined, swaggerOptions)
);

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
