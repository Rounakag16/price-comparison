// server/services/googleShoppingScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

/**
 * Scrapes Google Shopping results as a fallback
 * This is more reliable as Google aggregates results from multiple stores
 */
async function searchGoogleShopping(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }

  const searchQuery = encodeURIComponent(query);
  const targetUrl = `https://www.google.com/search?q=${searchQuery}&tbm=shop&gl=in`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Google Shopping...");

  try {
    const { data } = await axios.get(API_URL, { timeout: 30000 });
    const $ = cheerio.load(data);
    const results = [];

    // Google Shopping product cards
    const productCards = $("div.sh-dgr__content");
    console.log(`Found ${productCards.length} Google Shopping results.`);

    productCards.each((i, el) => {
      if (results.length >= 10) return false; // Get more from Google

      const $el = $(el);

      const title =
        $el.find("h3").text().trim() ||
        $el.find("h4").text().trim() ||
        $el.find(".tAxDx").text().trim();

      const price =
        $el.find("span.a8Pemb").text().trim() ||
        $el.find(".kHxwFf span").first().text().trim();

      const url = $el.find("a").first().attr("href");
      const imageUrl = $el.find("img").first().attr("src");

      const store =
        $el.find(".aULzUe").text().trim() ||
        $el.find(".E5ocAb").text().trim() ||
        "Unknown Store";

      if (title && price) {
        const cleanedPrice = price.replace(/[^0-9.]/g, "");
        const priceNum = parseFloat(cleanedPrice);

        // Filter by price range
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;
        if (priceNum < 1 || priceNum > 1000000) return;

        results.push({
          source: store,
          title: title.substring(0, 100),
          price: cleanedPrice,
          url: url || `https://www.google.com/search?q=${searchQuery}&tbm=shop`,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Product",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Google Shopping.`);
    return results;
  } catch (error) {
    console.error("Google Shopping Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchGoogleShopping };
