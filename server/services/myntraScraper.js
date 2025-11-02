// server/services/myntraScraper.js
// Simplified version - Remove render=true as it might be causing issues
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchMyntraScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }

  const searchQuery = encodeURIComponent(query).replace(/%20/g, "-");
  const targetUrl = `https://www.myntra.com/${searchQuery}`;

  // Try WITHOUT render=true first (faster, sometimes more reliable)
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Myntra via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL, { timeout: 60000 });
    const $ = cheerio.load(data);
    const results = [];

    // Try multiple card selectors
    let productCards = $("li.product-base");
    if (productCards.length === 0) productCards = $("li.product-tile");
    if (productCards.length === 0) productCards = $("li[class*='product']");

    console.log(`Found ${productCards.length} Myntra product cards.`);

    if (productCards.length === 0) {
      console.log(
        "⚠️  No Myntra cards found. Site may require render=true or be blocking."
      );
      return [];
    }

    productCards.each((i, el) => {
      if (results.length >= 5) return false;

      const $el = $(el);

      // Try multiple ways to get title
      let title = "";
      const brand =
        $el.find("h3.product-brand").text().trim() ||
        $el.find("h3[class*='brand']").text().trim() ||
        $el.find(".brand").first().text().trim();

      const productName =
        $el.find("h4.product-product").text().trim() ||
        $el.find("h4[class*='product']").text().trim() ||
        $el.find(".product-product").text().trim();

      if (brand && productName) {
        title = `${brand} ${productName}`.trim();
      } else if (brand) {
        title = brand;
      } else if (productName) {
        title = productName;
      }

      // Try multiple ways to get price
      let price = $el
        .find("span.product-discountedPrice")
        .first()
        .text()
        .trim();
      if (!price) price = $el.find("div.product-price").first().text().trim();
      if (!price)
        price = $el.find("span[class*='price']").first().text().trim();
      if (!price) price = $el.find(".price").first().text().trim();

      // URL
      let url = $el.find("a").first().attr("href");
      if (url && !url.startsWith("http")) {
        url = "https://www.myntra.com" + url;
      }

      // Image
      let imageUrl =
        $el.find("img").first().attr("src") ||
        $el.find("img").first().attr("data-src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      // Debug first card only
      if (i === 0) {
        console.log(`\n  Myntra Card 1 Debug:`);
        console.log(`    Brand: ${brand ? "✓" : "✗"} ${brand}`);
        console.log(`    Product: ${productName ? "✓" : "✗"} ${productName}`);
        console.log(`    Title: ${title ? "✓" : "✗"} ${title}`);
        console.log(`    Price: ${price ? "✓" : "✗"} ${price}`);
        console.log(`    Cleaned: ${cleanedPrice}`);
        console.log(`    URL: ${url ? "✓" : "✗"}\n`);
      }

      if (title && cleanedPrice && url) {
        const priceNum = parseFloat(cleanedPrice);

        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;
        if (priceNum < 1 || priceNum > 1000000) return;

        results.push({
          source: "Myntra",
          title: title.substring(0, 100),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Myntra",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Myntra.`);

    if (results.length === 0 && productCards.length > 0) {
      console.log("⚠️  Myntra: Found cards but couldn't extract data.");
      console.log("   Run: node server/tools/debugMyntra.js to diagnose");
    }

    return results;
  } catch (error) {
    console.error("Myntra Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchMyntraScraper };
