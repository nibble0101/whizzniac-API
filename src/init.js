const axios = require("axios");

const url = "https://whizzniac-api.herokuapp.com";

async function pingServer() {
  try {
    const [apiKey] = process.argv.slice(2);
    if (!apiKey) {
      console.log("Invalid key");
      return;
    }
    const { data, status } = await axios.get(`${url}/scrape?key=${apiKey}`);
    if (status === 200) {
      console.log(data);
      console.log("Scraped data successfully");
      return;
    }
  } catch (err) {
    console.log("Scraping data failed");
    console.error(err);
  }
}

pingServer();
