// server/services/ajioScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchAjioScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.ajio.com/search/?text=${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Ajio via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // --- NEW CARD SELECTOR based on your HTML ---
    const productCards = $("div.item.product-card-container");
    console.log(`Found ${productCards.length} potential Ajio product cards.`);

    productCards.each((i, el) => {
      const $el = $(el);
      // Inner selectors are correct
      const brand = $el.find("div.brand").text();
      const title = $el.find("div.nameCls").text();
      const price = $el.find("span.price").first().text();
      const url =
        "https://www.ajio.com" +
        $el.find("a.product-link").first().attr("href");
      const imageUrl = $el.find("img.product-image").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");
      const fullTitle = `${brand} ${title}`;

      if (fullTitle && cleanedPrice && url && imageUrl) {
        // Price filtering
        const priceNum = parseFloat(cleanedPrice);
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;

        results.push({
          source: "Ajio",
          title: fullTitle.trim(),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150",
        });
      }

      if (results.length >= 5) return false;
    });
    console.log(`Found ${results.length} valid results from Ajio.`);
    return results;
  } catch (error) {
    console.error("Ajio Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchAjioScraper };
