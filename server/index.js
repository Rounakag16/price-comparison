// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// --- Import API Handlers (for Amazon/Flipkart) ---
const { searchAmazonApi } = require("./services/amazonApi.js");
const { searchFlipkartApi } = require("./services/flipkartApi.js");

// --- Import all 6 Scraper Handlers ---
const { searchAmazonScraper } = require("./services/amazonScraper.js");
const { searchFlipkartScraper } = require("./services/flipkartScraper.js");
const { searchMyntraScraper } = require("./services/myntraScraper.js");
const { searchAjioScraper } = require("./services/ajioScraper.js");
const { searchNykaaScraper } = require("./services/nykaaScraper.js");
const { searchMeeshoScraper } = require("./services/meeshoScraper.js");

// --- Import AI Service ---
const { getGeminiSummary } = require("./services/geminiService.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Helper: Sort results by price (Unchanged) ---
function sortResultsByPrice(results) {
  return results.sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
    return priceA - priceB;
  });
}

// --- Helper: Parse price range from query (This one is correct) ---
function parsePriceRange(query) {
  let minPrice = null;
  let maxPrice = null;

  let match = query.match(/(under|below)\s*rs?\.?\s*(\d+)/i);
  if (match) {
    maxPrice = parseFloat(match[2]);
  }

  match = query.match(/(above|over)\s*rs?\.?\s*(\d+)/i);
  if (match) {
    minPrice = parseFloat(match[2]);
  }

  match = query.match(
    /(between|from)\s*rs?\.?\s*(\d+)\s*(and|to)\s*rs?\.?\s*(\d+)/i
  );
  if (match) {
    minPrice = parseFloat(match[2]);
    maxPrice = parseFloat(match[4]);
  }

  console.log(`Price range parsed: min=${minPrice}, max=${maxPrice}`);
  return { minPrice, maxPrice };
}

// --- Helper: API-first fallback logic (FIXED) ---
// I've added priceRange as an argument here
async function searchStoreWithApi(
  query,
  priceRange,
  storeName,
  apiSearchFn,
  scraperSearchFn
) {
  try {
    const apiResults = await apiSearchFn(query);
    if (apiResults.length > 0) {
      console.log(`Success: Found ${storeName} results via official API.`);
      return apiResults;
    }

    console.log(`Fallback: ${storeName} API failed or empty, trying scraper.`);
    // And I've passed priceRange to the scraper function call
    return await scraperSearchFn(query, priceRange);
  } catch (error) {
    console.error(`Error in ${storeName} search logic:`, error.message);
    return [];
  }
}

// --- Main Search Route (FIXED) ---
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query "q" is required.' });
  }
  console.log(`Search query received: ${q}`);

  // Price range is correctly parsed here
  const priceRange = parsePriceRange(q);

  try {
    console.log("Calling orchestrator for all 6 sites...");

    const searchPromises = [
      // --- FIX: Pass priceRange to searchStoreWithApi ---
      searchStoreWithApi(
        q,
        priceRange,
        "Amazon",
        searchAmazonApi,
        searchAmazonScraper
      ).catch((e) => {
        console.error("Amazon main search failed:", e.message);
        return [];
      }),

      searchStoreWithApi(
        q,
        priceRange,
        "Flipkart",
        searchFlipkartApi,
        searchFlipkartScraper
      ).catch((e) => {
        console.error("Flipkart main search failed:", e.message);
        return [];
      }),

      // --- FIX: Pass priceRange to all direct scraper calls ---
      searchMyntraScraper(q, priceRange).catch((e) => {
        console.error("Myntra search failed:", e.message);
        return [];
      }),

      searchAjioScraper(q, priceRange).catch((e) => {
        console.error("Ajio search failed:", e.message);
        return [];
      }),

      searchNykaaScraper(q, priceRange).catch((e) => {
        console.error("Nykaa search failed:", e.message);
        return [];
      }),

      searchMeeshoScraper(q, priceRange).catch((e) => {
        console.error("Meesho search failed:", e.message);
        return [];
      }),
    ];

    const resultsArray = await Promise.all(searchPromises);
    const allScrapeResults = resultsArray.flat();

    if (allScrapeResults.length === 0) {
      console.log("Scraping found no results from any source.");
      return res.json([]);
    }

    console.log(`Success: Found ${allScrapeResults.length} total results.`);
    const sortedResults = sortResultsByPrice(allScrapeResults);
    res.json(sortedResults);
  } catch (error) {
    console.error("Error in main search route:", error);
    res.status(500).json({ error: "Failed to fetch search results." });
  }
});

// --- AI Summary Route (Unchanged) ---
app.post("/api/summarize", async (req, res) => {
  const { results } = req.body;
  if (!results || results.length === 0) {
    return res.status(400).json({ error: "No results provided to summarize." });
  }
  try {
    const summary = await getGeminiSummary(results);
    res.json({ summary: summary });
  } catch (error) {
    console.error("Error getting Gemini summary:", error);
    res.status(500).json({ error: "Failed to get summary." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
