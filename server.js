const express = require("express");
const app = express();
const Redis = require("ioredis");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();

app.use(express.json());


const PORT = process.env.PORT || 3000;
const redisConfig = {
  port: process.env.DATABASE_PORT,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
};
const redis = new Redis(redisConfig);


app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/categories", async(req, res) => {
  const response = await redis.get("categories");
  if (!response) {
    res.status(404).send({ message: "Resource not found" });
    return;
  }
  res.status(200).send(JSON.parse(response));
})

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

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
