const axios4 = require("axios");
const cheerio4 = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY4 = process.env.SCRAPER_API_KEY;

async function searchNykaaScraper(query, priceRange) {
  if (!SCRAPER_API_KEY4) {
    console.error("ScraperAPI key not found.");
    return [];
  }

  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.nykaa.com/search/result?q=${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY4}&url=${targetUrl}&render=true`;

  console.log("Scraping Nykaa via ScraperAPI...");

  try {
    const { data } = await axios4.get(API_URL, { timeout: 30000 });
    const $ = cheerio4.load(data);
    const results = [];

    // Multiple selectors
    let productCards = $("div[class*='product']");
    if (productCards.length === 0) productCards = $("div.productCard");
    if (productCards.length === 0) productCards = $(".css-11GgB6i");

    console.log(`Found ${productCards.length} Nykaa product cards.`);

    productCards.each((i, el) => {
      if (results.length >= 5) return false;

      const $el = $(el);

      // Title
      let title = $el.find("div.css-10j9e4h").text().trim();
      if (!title) title = $el.find(".product-title").text().trim();
      if (!title) title = $el.find("h3").text().trim();

      // Price
      let price = $el.find("span.css-11d0vru").first().text();
      if (!price) price = $el.find(".product-price").first().text();
      if (!price) price = $el.find("span[class*='price']").first().text();

      // URL
      let url = $el.find("a.css-qlopj4").first().attr("href");
      if (!url) url = $el.find("a").first().attr("href");
      if (url && !url.startsWith("http")) {
        url = "https://www.nykaa.com" + url;
      }

      // Image
      let imageUrl = $el.find("img.css-1Nq0w4o").first().attr("src");
      if (!imageUrl) imageUrl = $el.find("img").first().attr("src");

      const cleanedPrice = price.replace(/[^0-9.]/g, "");

      if (title && cleanedPrice && url) {
        const priceNum = parseFloat(cleanedPrice);

        if (priceRange.minPrice && priceNum < priceRange.minPrice) return;
        if (priceRange.maxPrice && priceNum > priceRange.maxPrice) return;
        if (priceNum < 1 || priceNum > 1000000) return;

        results.push({
          source: "Nykaa",
          title: title.substring(0, 100),
          price: cleanedPrice,
          url: url,
          imageUrl: imageUrl || "https://via.placeholder.com/150?text=Nykaa",
        });
      }
    });

    console.log(`Found ${results.length} valid results from Nykaa.`);
    return results;
  } catch (error) {
    console.error("Nykaa Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchNykaaScraper };
