const express = require("express");
const server = express();
const Redis = require("ioredis");
require("dotenv").config();

server.use(express.json());

const PORT = process.env.PORT || 3000;
const redisConfig = {
  port: process.env.DATABASE_PORT,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
};
const redis = new Redis(redisConfig);

server.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

server.get("/trivia/:category/:difficulty", async (req, res) => {
  const { category, difficulty } = req.params;
  if (!category.trim() || !difficulty.trim()) {
    res.status(400).send({ message: "Bad request" });
    return;
  }
  const response = await redis.get(
    `category-${category.trim()}-difficulty-${difficulty.trim()}`
  );
  if (!response) {
    res.status(404).send({ message: "Resource not found" });
    return;
  }
  res.status(200).send({ data: JSON.parse(response) });
});

server.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
