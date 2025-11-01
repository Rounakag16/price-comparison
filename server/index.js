// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import ALL scrapers
const { searchAmazonScraper } = require("./services/amazonScraper.js");
const { searchFlipkartScraper } = require("./services/flipkartScraper.js");
const { searchMyntraScraper } = require("./services/myntraScraper.js");
const { searchAjioScraper } = require("./services/ajioScraper.js");
const { searchNykaaScraper } = require("./services/nykaaScraper.js");
const { searchMeeshoScraper } = require("./services/meeshoScraper.js");
const { searchGoogleShopping } = require("./services/googleShoppingScraper.js");
const { getGeminiSummary } = require("./services/geminiService.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper: Parse price range from query
function parsePriceRange(query) {
  let minPrice = null;
  let maxPrice = null;

  let match = query.match(/(under|below)\s*rs?\.?\s*(\d+)/i);
  if (match) maxPrice = parseFloat(match[2]);

  match = query.match(/(above|over)\s*rs?\.?\s*(\d+)/i);
  if (match) minPrice = parseFloat(match[2]);

  match = query.match(
    /(between|from)\s*rs?\.?\s*(\d+)\s*(and|to)\s*rs?\.?\s*(\d+)/i
  );
  if (match) {
    minPrice = parseFloat(match[2]);
    maxPrice = parseFloat(match[4]);
  }

  return { minPrice, maxPrice };
}

// Helper: Deduplicate results by title similarity
function deduplicateResults(results) {
  const unique = [];
  const seenTitles = new Set();

  for (const result of results) {
    const normalizedTitle = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 50);

    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      unique.push(result);
    }
  }

  return unique;
}

// Main Search Route with improved orchestration
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query "q" is required.' });
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 NEW SEARCH: "${q}"`);
  console.log(`${"=".repeat(60)}\n`);

  const priceRange = parsePriceRange(q);
  if (priceRange.minPrice || priceRange.maxPrice) {
    console.log(
      `💰 Price filter: ₹${priceRange.minPrice || 0} - ₹${
        priceRange.maxPrice || "∞"
      }`
    );
  }

  try {
    const startTime = Date.now();

    // Strategy 1: Try all stores in parallel
    console.log("\n📦 Phase 1: Searching major stores...");
    const storePromises = [
      searchAmazonScraper(q, priceRange).catch((e) => {
        console.error("❌ Amazon failed:", e.message);
        return [];
      }),
      searchFlipkartScraper(q, priceRange).catch((e) => {
        console.error("❌ Flipkart failed:", e.message);
        return [];
      }),
      searchMyntraScraper(q, priceRange).catch((e) => {
        console.error("❌ Myntra failed:", e.message);
        return [];
      }),
      searchAjioScraper(q, priceRange).catch((e) => {
        console.error("❌ Ajio failed:", e.message);
        return [];
      }),
    ];

    const storeResults = await Promise.all(storePromises);
    let allResults = storeResults.flat();

    console.log(`\n📊 Phase 1 Results: ${allResults.length} products found`);
    storeResults.forEach((results, i) => {
      const stores = ["Amazon", "Flipkart", "Myntra", "Ajio"];
      console.log(`   ${stores[i]}: ${results.length} products`);
    });

    // Strategy 2: If few results, try Google Shopping as backup
    if (allResults.length < 3) {
      console.log("\n🔄 Phase 2: Searching Google Shopping (backup)...");
      const googleResults = await searchGoogleShopping(q, priceRange).catch(
        (e) => {
          console.error("❌ Google Shopping failed:", e.message);
          return [];
        }
      );

      if (googleResults.length > 0) {
        console.log(`✅ Google Shopping: ${googleResults.length} products`);
        allResults = [...allResults, ...googleResults];
      }
    }

    if (allResults.length === 0) {
      console.log("\n⚠️  No results found from any source");
      return res.json([]);
    }

    // Deduplicate and sort
    const uniqueResults = deduplicateResults(allResults);
    const sortedResults = uniqueResults.sort(
      (a, b) => parseFloat(a.price) - parseFloat(b.price)
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ SEARCH COMPLETE`);
    console.log(`   Total: ${sortedResults.length} unique products`);
    console.log(`   Time: ${elapsed}s`);
    console.log(
      `   Price range: ₹${sortedResults[0]?.price} - ₹${
        sortedResults[sortedResults.length - 1]?.price
      }`
    );
    console.log(`${"=".repeat(60)}\n`);

    res.json(sortedResults.slice(0, 20)); // Return top 20
  } catch (error) {
    console.error("\n❌ SEARCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch search results." });
  }
});

// AI Summary Route
app.post("/api/summarize", async (req, res) => {
  const { results } = req.body;
  if (!results || results.length === 0) {
    return res.status(400).json({ error: "No results provided to summarize." });
  }

  try {
    const summary = await getGeminiSummary(results);
    res.json({ summary });
  } catch (error) {
    console.error("Error getting Gemini summary:", error);

    // Fallback summary
    const cheapest = results[0];
    const fallback = `The best deal is ${cheapest.title} on ${cheapest.source} for ₹${cheapest.price}. I found ${results.length} products in total.`;
    res.json({ summary: fallback });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Deal Finder Server Started`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`${"=".repeat(60)}\n`);
});
