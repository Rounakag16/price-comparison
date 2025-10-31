// server/services/amazonScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchAmazonScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.amazon.in/s?k=${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&country_code=in`;

  console.log("Scraping Amazon via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // This card selector is correct
    const productCards = $("div[data-asin]");
    console.log(`Found ${productCards.length} potential Amazon product cards.`);

    productCards.each((i, el) => {
      const $el = $(el);

      // --- NEW SELECTORS based on your HTML ---
      // This is a more specific and reliable title selector
      const title = $el
        .find("h2 a.a-link-normal span.a-text-normal")
        .first()
        .text();
      const price = $el.find("span.a-price-whole").first().text();
      const url =
        "https://www.amazon.in" +
        $el.find("h2 a.a-link-normal").first().attr("href");
      const imageUrl = $el.find("img.s-image").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      if (title && cleanedPrice && url && imageUrl) {
        // Price filtering
        const priceNum = parseFloat(cleanedPrice);
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;

        results.push({
          source: "Amazon",
          title: title.trim(),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150",
        });
      }

      if (results.length >= 5) return false;
    });

    console.log(`Found ${results.length} valid results from Amazon.`);
    return results;
  } catch (error) {
    console.error("Amazon Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchAmazonScraper };
