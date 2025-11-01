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

  // Use render=true for better results with JS-heavy content
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&country_code=in&render=true`;

  console.log("Scraping Amazon via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL, { timeout: 60000 }); // Increased to 60s
    const $ = cheerio.load(data);
    const results = [];

    // Multiple selector strategies for robustness
    const productCards = $("div[data-component-type='s-search-result']");
    console.log(`Found ${productCards.length} Amazon product cards.`);

    if (productCards.length === 0) {
      console.log(
        "⚠️  No product cards found. Amazon may have blocked the request."
      );
      return [];
    }

    productCards.each((i, el) => {
      if (results.length >= 5) return false;

      const $el = $(el);

      // Try multiple title selectors with better logging
      let title = $el.find("h2 a span").text().trim();
      if (!title) title = $el.find("h2.a-size-mini a span").text().trim();
      if (!title) title = $el.find(".a-text-normal").first().text().trim();
      if (!title) title = $el.find("h2 span").text().trim();

      // Try multiple price selectors
      let price = $el.find("span.a-price-whole").first().text();
      if (!price) price = $el.find(".a-price .a-offscreen").first().text();
      if (!price) price = $el.find("span.a-price").first().text();

      // Get URL - handle both relative and absolute
      let url = $el.find("h2 a").first().attr("href");
      if (!url) url = $el.find("a.a-link-normal").first().attr("href");

      if (url && !url.startsWith("http")) {
        url = "https://www.amazon.in" + url;
      }

      // Get image
      let imageUrl = $el.find("img.s-image").first().attr("src");
      if (!imageUrl) imageUrl = $el.find("img").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      // Debug logging for first few cards
      if (i < 3) {
        console.log(`\n  Card ${i + 1} Debug:`);
        console.log(
          `    Title: ${title ? "✓" : "✗"} ${title?.substring(0, 50)}`
        );
        console.log(`    Price: ${price ? "✓" : "✗"} ${price}`);
        console.log(`    Cleaned: ${cleanedPrice}`);
        console.log(`    URL: ${url ? "✓" : "✗"}`);
      }

      if (title && cleanedPrice && url) {
        const priceNum = parseFloat(cleanedPrice);

        // Skip if outside price range
        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;

        // Skip invalid prices
        if (priceNum < 1 || priceNum > 1000000) {
          console.log(`  ⚠️  Skipping invalid price: ${priceNum}`);
          return;
        }

        results.push({
          source: "Amazon",
          title: title.substring(0, 100), // Limit title length
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Amazon",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Amazon.`);

    if (results.length === 0 && productCards.length > 0) {
      console.log("⚠️  Amazon: Found cards but couldn't extract product data.");
      console.log("   This usually means Amazon changed their HTML structure.");
    }

    return results;
  } catch (error) {
    console.error("Amazon Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchAmazonScraper };
