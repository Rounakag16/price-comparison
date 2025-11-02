const axios5 = require("axios");
const cheerio5 = require("cheerio");
require("dotenv").config();

const SCRAPER_API_KEY5 = process.env.SCRAPER_API_KEY;

async function searchMeeshoScraper(query, priceRange) {
  if (!SCRAPER_API_KEY5) {
    console.error("ScraperAPI key not found.");
    return [];
  }

  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.meesho.com/search?q=${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY5}&url=${targetUrl}`;

  console.log("Scraping Meesho via ScraperAPI...");

  try {
    const { data } = await axios5.get(API_URL, { timeout: 60000 }); // Increased to 60s
    const $ = cheerio5.load(data);
    const results = [];

    // Try to parse JSON from __NEXT_DATA__ script tag
    const scriptData = $('script[id="__NEXT_DATA__"]').html();

    if (scriptData) {
      try {
        const jsonData = JSON.parse(scriptData);
        const products = jsonData?.props?.pageProps?.products || [];
        console.log(`Found ${products.length} Meesho products in JSON.`);

        for (const product of products) {
          if (results.length >= 5) break;

          const title = product.name;
          const price = String(product.price);
          const url = "https://www.meesho.com" + product.url;
          const imageUrl = product.image?.url;

          if (title && price) {
            const priceNum = parseFloat(price);

            if (priceRange.minPrice && priceNum < priceRange.minPrice) continue;
            if (priceRange.maxPrice && priceNum > priceRange.maxPrice) continue;
            if (priceNum < 1 || priceNum > 1000000) continue;

            results.push({
              source: "Meesho",
              title: title.substring(0, 100),
              price: price,
              url: url,
              imageUrl:
                imageUrl || "https://via.placeholder.com/150?text=Meesho",
            });
          }
        }
      } catch (parseError) {
        console.error("Error parsing Meesho JSON:", parseError.message);
      }
    } else {
      console.log("Could not find __NEXT_DATA__ in Meesho HTML.");
    }

    console.log(`Found ${results.length} valid results from Meesho.`);
    return results;
  } catch (error) {
    console.error("Meesho Scraping Error:", error.message);
    return [];
  }
}

module.exports = { searchMeeshoScraper };
