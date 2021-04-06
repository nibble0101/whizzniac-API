const express = require("express");
const server = express();
const Redis = require("ioredis");
require("dotenv").config();

server.use(express.json());

const PORT = process.env.PORT || 3000;
const redis = new Redis();


server.get("/", (request, response) => {
    redis.get("data", (err, result) => {
       if(err){
           console.err(err);
           return;
       }
       if(result === null){
           response.status(404).json({message: "No data found"});
           return;
       }
       response.json(JSON.parse(result));
    })
});

server.get("/trivia/:category/:difficulty", async (req, res) => {
     const { category, difficulty } = req.params;
     if(!category || !difficulty){
         res.send({"message": "Bad request"});
     }
     res.send({category, difficulty});
})

server.listen(PORT, () => {
    console.log(`Your app is listening on port ${PORT}`);
});
