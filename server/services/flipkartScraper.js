// server/services/flipkartScraper.js
const axios = require("axios"); // <-- 1. ADDED AXIOS IMPORT
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchFlipkartScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query);
  const targetUrl = `https://www.flipkart.com/search?q=${searchQuery}`;

  // 2. MOVED API_URL DEFINITION OUTSIDE THE TRY BLOCK
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Flipkart via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // Selectors from our last working version
    const productCards = $("div.hCKiGj");
    console.log(
      `Found ${productCards.length} potential Flipkart product cards.`
    );

    productCards.each((i, el) => {
      const $el = $(el);
      const title = $el.find("a.WKTcLC").attr("title");
      const price = $el.find("div.Nx9bqj").text();
      const url =
        "https://www.flipkart.com" + $el.find("a.WKTcLC").attr("href");
      const imageUrl = $el.closest("._1sdMkc").find("img._53J4C-").attr("src");
      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      if (title && cleanedPrice && url && imageUrl) {
        // Price filtering logic (this is correct)
        const priceNum = parseFloat(cleanedPrice);
        if (priceRange.minPrice && priceNum < priceRange.minPrice) {
          return;
        }
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) {
          return;
        }

        results.push({
          source: "Flipkart",
          title: title.trim(),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150",
        });
      }

      if (results.length >= 5) {
        return false;
      }
    });
    console.log(`Found ${results.length} valid results from Flipkart.`);
    return results;
  } catch (error) {
    console.error("Flipkart Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchFlipkartScraper };
