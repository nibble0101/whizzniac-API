const express = require("express");
const server = express();
require("dotenv").config();

server.use(express.json());

const PORT = process.env.PORT || 3000;


server.get("/", async (request, response) => {
    response.send("Hello World...");
});

server.get("/quiz", async (request, response) => {

});

server.listen(PORT, () => {
    console.log(`Your app is listening on port ${PORT}`);
});
