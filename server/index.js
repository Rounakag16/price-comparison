// server/index.js - With Google Shopping Always Enabled
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import ALL scrapers + Google Shopping
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

// Main Search Route
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query "q" is required.' });
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`🔍 NEW SEARCH: "${q}"`);
  console.log(`${"=".repeat(70)}\n`);

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

    // Phase 1: Search direct stores + Google Shopping in parallel
    console.log("\n📦 Phase 1: Searching all sources in parallel...");
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
      searchNykaaScraper(q, priceRange).catch((e) => {
        console.error("❌ Nykaa failed:", e.message);
        return [];
      }),
      searchMeeshoScraper(q, priceRange).catch((e) => {
        console.error("❌ Meesho failed:", e.message);
        return [];
      }),
      // ✨ ALWAYS search Google Shopping (runs in parallel)
      searchGoogleShopping(q, priceRange).catch((e) => {
        console.error("❌ Google Shopping failed:", e.message);
        return [];
      }),
    ];

    const storeResults = await Promise.all(storePromises);
    let allResults = storeResults.flat();

    // Enhanced comparison table with Google Shopping
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 STORE COMPARISON RESULTS`);
    console.log(`${"=".repeat(70)}`);
    console.log(
      `${"Store".padEnd(15)} | ${"Status".padEnd(10)} | ${"Found".padEnd(
        8
      )} | ${"Price Range"}`
    );
    console.log(`${"-".repeat(70)}`);

    const stores = [
      "Amazon",
      "Flipkart",
      "Myntra",
      "Ajio",
      "Nykaa",
      "Meesho",
      "Google Shop", // Added Google Shopping to the list
    ];

    storeResults.forEach((results, i) => {
      const status = results.length > 0 ? "✅ Success" : "❌ No Data";
      const count = results.length.toString().padEnd(8);

      let priceRangeStr = "-";
      if (results.length > 0) {
        const prices = results.map((r) => parseFloat(r.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        priceRangeStr = `₹${min} - ₹${max}`;
      }

      console.log(
        `${stores[i].padEnd(15)} | ${status.padEnd(
          10
        )} | ${count} | ${priceRangeStr}`
      );
    });
    console.log(`${"=".repeat(70)}\n`);

    // Calculate statistics
    const totalProducts = allResults.length;
    const successfulStores = storeResults.filter((r) => r.length > 0).length;
    const failedStores = stores.length - successfulStores;

    console.log(`📈 Statistics:`);
    console.log(`   Total Products Found: ${totalProducts}`);
    console.log(`   Successful Stores: ${successfulStores}/${stores.length}`);
    console.log(`   Failed Stores: ${failedStores}`);

    if (totalProducts > 0) {
      const allPrices = allResults.map((r) => parseFloat(r.price));
      const avgPrice = (
        allPrices.reduce((a, b) => a + b, 0) / allPrices.length
      ).toFixed(2);
      console.log(`   Average Price: ₹${avgPrice}`);
      console.log(`   Lowest Price: ₹${Math.min(...allPrices)}`);
      console.log(`   Highest Price: ₹${Math.max(...allPrices)}`);

      // Show which stores contributed
      const contributing = stores.filter((_, i) => storeResults[i].length > 0);
      console.log(`   Sources: ${contributing.join(", ")}`);
    }
    console.log();

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
    console.log(
      `   Duplicates removed: ${allResults.length - sortedResults.length}`
    );
    console.log(`   Time: ${elapsed}s`);
    console.log(
      `   Price range: ₹${sortedResults[0]?.price} - ₹${
        sortedResults[sortedResults.length - 1]?.price
      }`
    );
    console.log(`${"=".repeat(70)}\n`);

    res.json(sortedResults.slice(0, 30)); // Return top 30 (increased from 20)
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
  console.log(`💡 Tip: Google Shopping now runs on every search!`);
  console.log(`${"=".repeat(70)}\n`);
});
