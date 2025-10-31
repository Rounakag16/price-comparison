// server/services/nykaaScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchNykaaScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");

  // --- FIX: Corrected URL (using Nykaa.com, not fashion) ---
  const targetUrl = `https://www.nykaa.com/search/result?q=${searchQuery}`;
  // This site often works *without* JS rendering, which is faster
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Nykaa via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // --- NEW CARD SELECTOR ---
    const productCards = $("div.css-11GgB6i"); // This is the wrapper for a product
    console.log(`Found ${productCards.length} potential Nykaa product cards.`);

    productCards.each((i, el) => {
      const $el = $(el);

      // --- NEW INNER SELECTORS ---
      const title = $el.find("div.css-10j9e4h").text(); // The product title
      const price = $el.find("span.css-11d0vru").first().text(); // The price
      const url =
        "https://www.nykaa.com" + $el.find("a.css-qlopj4").first().attr("href");
      const imageUrl = $el.find("img.css-1Nq0w4o").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      if (title && cleanedPrice && url && imageUrl) {
        // Price filtering
        const priceNum = parseFloat(cleanedPrice);
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;

        results.push({
          source: "Nykaa",
          title: title.trim(),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150",
        });
      }

      if (results.length >= 5) return false;
    });
    console.log(`Found ${results.length} valid results from Nykaa.`);
    return results;
  } catch (error) {
    console.error("Nykaa Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchNykaaScraper };
