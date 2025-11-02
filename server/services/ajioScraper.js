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
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

  console.log("Scraping Ajio via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL, { timeout: 60000 }); // Fixed: 30s → 60s
    const $ = cheerio.load(data);
    const results = [];

    // Multiple card selectors
    let productCards = $("div.item.product-card-container");
    if (productCards.length === 0) productCards = $("div.item");
    if (productCards.length === 0)
      productCards = $(".rilrtl-products-list__item");

    console.log(`Found ${productCards.length} Ajio product cards.`);

    productCards.each((i, el) => {
      if (results.length >= 5) return false;

      const $el = $(el);

      // Title
      const brand = $el.find("div.brand").text().trim();
      const name = $el.find("div.nameCls").text().trim();
      let title = `${brand} ${name}`.trim();
      if (!title) title = $el.find(".name").text().trim();

      // Price
      let price = $el.find("span.price").first().text();
      if (!price) price = $el.find(".price-value").first().text();

      // URL
      let url = $el.find("a.product-link").first().attr("href");
      if (!url) url = $el.find("a").first().attr("href");
      if (url && !url.startsWith("http")) {
        url = "https://www.ajio.com" + url;
      }

      // Image
      let imageUrl = $el.find("img.product-image").first().attr("src");
      if (!imageUrl) imageUrl = $el.find("img").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      if (title && cleanedPrice && url) {
        const priceNum = parseFloat(cleanedPrice);

        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;
        if (priceNum < 1 || priceNum > 1000000) return;

        results.push({
          source: "Ajio",
          title: title.substring(0, 100),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Ajio",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Ajio.`);
    return results;
  } catch (error) {
    console.error("Ajio Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchAjioScraper };
