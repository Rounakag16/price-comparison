const axios2 = require("axios");
const cheerio2 = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY2 = process.env.SCRAPER_API_KEY;

async function searchMyntraScraper(query, priceRange) {
  if (!SCRAPER_API_KEY2) {
    console.error("ScraperAPI key not found.");
    return [];
  }

  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.myntra.com/${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY2}&url=${targetUrl}&render=true`;

  console.log("Scraping Myntra via ScraperAPI...");

  try {
    const { data } = await axios2.get(API_URL, { timeout: 60000 }); // Increased to 60s
    const $ = cheerio2.load(data);
    const results = [];

    // Multiple card selectors
    let productCards = $("li.product-base");
    if (productCards.length === 0) productCards = $("li.product-tile");
    if (productCards.length === 0)
      productCards = $("div.product-productMetaInfo");

    console.log(`Found ${productCards.length} Myntra product cards.`);

    productCards.each((i, el) => {
      if (results.length >= 5) return false;

      const $el = $(el);

      // Title selectors
      const brand = $el.find("h3.product-brand").text().trim();
      const productName = $el.find("h4.product-product").text().trim();
      let title = `${brand} ${productName}`.trim();
      if (!title) title = $el.find(".product-title").text().trim();

      // Price selectors
      let price = $el.find("span.product-discountedPrice").first().text();
      if (!price) price = $el.find("div.product-price").first().text();
      if (!price) price = $el.find(".product-discountedPrice").first().text();

      // URL - Myntra URLs are already absolute
      let url = $el.find("a").first().attr("href");
      if (url && !url.startsWith("http")) {
        url = "https://www.myntra.com" + url;
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
          source: "Myntra",
          title: title.substring(0, 100),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Myntra",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Myntra.`);
    return results;
  } catch (error) {
    console.error("Myntra Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchMyntraScraper };
