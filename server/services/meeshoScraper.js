// server/services/meeshoScraper.js
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function searchMeeshoScraper(query, priceRange) {
  if (!SCRAPER_API_KEY) {
    console.error("ScraperAPI key not found.");
    return [];
  }
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.meesho.com/search?q=${searchQuery}`;
  // NOTE: We do NOT use &render=true here, because we want the initial HTML
  // that contains the JSON script tag.
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

  console.log("Scraping Meesho via ScraperAPI...");

  try {
    const { data } = await axios.get(API_URL);
    const $ = cheerio.load(data);
    const results = [];

    // --- NEW LOGIC: Parse JSON data from <script> tag ---
    // This is the correct selector based on your HTML
    const scriptData = $('script[id="__NEXT_DATA__"]').html();

    if (scriptData) {
      const jsonData = JSON.parse(scriptData);
      // Navigate the JSON to find the products
      const products = jsonData?.props?.pageProps?.products || [];
      console.log(`Found ${products.length} potential Meesho product cards.`);

      for (const product of products) {
        const title = product.name;
        const price = product.price; // This is already a number
        const url = "https://www.meesho.com" + product.url;
        const imageUrl = product.image.url;
        const cleanedPrice = String(price); // Already clean

        if (title && cleanedPrice && url && imageUrl) {
          // Price filtering
          const priceNum = parseFloat(cleanedPrice);
          if (priceRange.minPrice && priceNum < priceRange.minPrice) continue;
          if (priceRange.maxPrice && priceNum > priceRange.maxPrice) continue;

          results.push({
            source: "Meesho",
            title: title.trim(),
            price: cleanedPrice,
            url: url,
            imageUrl: imageUrl || "https://via.placeholder.com/150",
          });
        }
        if (results.length >= 5) break; // Stop after 5
      }
    } else {
      console.log("Could not find __NEXT_DATA__ script tag in Meesho HTML.");
    }

    console.log(`Found ${results.length} valid results from Meesho.`);
    return results;
  } catch (error) {
    console.error("Meesho Scraping Error (via ScraperAPI):", error.message);
    return [];
  }
}
module.exports = { searchMeeshoScraper };
