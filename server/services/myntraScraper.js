// server/services/myntraScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchMyntraScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.myntra.com/search?q=${searchQuery}`;
  // Added &render=true because Myntra is JS-heavy
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

  console.log("Scraping Myntra via ScraperAPI (JS Enabled)...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // This card selector is correct
    const productCards = $("li.product-base");
    console.log(`Found ${productCards.length} potential Myntra product cards.`);

    productCards.each((i, el) => {
      const $el = $(el);
      const brand = $el.find("h3.product-brand").text();
      const title = $el.find("h4.product-product").text();
      const price =
        $el.find("span.product-discountedPrice").first().text() ||
        $el.find("div.product-price").first().text();

      // --- FIX: The URL in the HTML is already absolute ---
      const url = $el.find("a").first().attr("href");
      const imageUrl = $el.find("img.product-image").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");
      const fullTitle = `${brand} ${title}`;

      // --- FIX: More robust check ---
      if (brand && title && cleanedPrice && url && imageUrl) {
        // Price filtering
        const priceNum = parseFloat(cleanedPrice);
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;

        results.push({
          source: "Myntra",
          title: fullTitle.trim(),
          price: cleanedPrice,
          url: url, // Use the direct URL
          imageUrl: imageUrl || "https://via.placeholder.com/150",
        });
      }

      if (results.length >= 5) return false;
    });
    console.log(`Found ${results.length} valid results from Myntra.`);
    return results;
  } catch (error) {
    console.error("Myntra Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchMyntraScraper };
