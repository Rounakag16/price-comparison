// server/tools/quickTest.js
// Run with: node server/tools/quickTest.js

require("dotenv").config();

const { searchAmazonScraper } = require("../services/amazonScraper.js");
const { searchFlipkartScraper } = require("../services/flipkartScraper.js");
const { searchMyntraScraper } = require("../services/myntraScraper.js");
const { searchNykaaScraper } = require("../services/nykaaScraper.js");
const { searchMeeshoScraper } = require("../services/meeshoScraper.js");

async function quickTest() {
  const query = "shirt";
  const priceRange = { minPrice: null, maxPrice: 2000 };

  console.log("🧪 Quick Test - Testing each scraper individually\n");
  console.log(`Query: ${query}`);
  console.log(`Price Range: under ₹2000\n`);
  console.log("=".repeat(70));

  // Test each scraper one by one
  const tests = [
    { name: "Amazon", fn: searchAmazonScraper },
    { name: "Flipkart", fn: searchFlipkartScraper },
    { name: "Myntra", fn: searchMyntraScraper },
    { name: "Nykaa", fn: searchNykaaScraper },
    { name: "Meesho", fn: searchMeeshoScraper },
  ];

  for (const test of tests) {
    console.log(`\n📦 Testing ${test.name}...`);
    console.log("-".repeat(70));

    try {
      const results = await test.fn(query, priceRange);

      if (results.length > 0) {
        console.log(`✅ ${test.name}: ${results.length} products found`);
        console.log(`   Sample: ${results[0].title.substring(0, 50)}`);
        console.log(`   Price: ₹${results[0].price}`);
      } else {
        console.log(`❌ ${test.name}: 0 products found`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Test Complete\n");
}

quickTest();
