// Save as: server/tools/debugMyntra.js
// Run with: node server/tools/debugMyntra.js "shirt"

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function debugMyntraSearch(query) {
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.myntra.com/${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&render=true`;

  console.log("🔍 Debug Myntra Search");
  console.log(`Query: ${query}`);
  console.log(`Target URL: ${targetUrl}\n`);

  try {
    const { data } = await axios.get(API_URL, { timeout: 60000 });

    // Save raw HTML for inspection
    fs.writeFileSync("myntra-debug.html", data);
    console.log("✅ Saved raw HTML to: myntra-debug.html\n");

    const $ = cheerio.load(data);

    // Try different card selectors
    const cardSelectors = [
      "li.product-base",
      "li.product-tile",
      "div.product-productMetaInfo",
      ".product-list li",
      "[class*='product']",
    ];

    console.log("📦 Testing Card Selectors:");
    cardSelectors.forEach((sel) => {
      const count = $(sel).length;
      console.log(`   ${sel.padEnd(40)} → ${count} cards`);
    });

    // Pick the best selector
    let productCards = $("li.product-base");
    if (productCards.length === 0) productCards = $("li.product-tile");

    console.log(`\n✅ Using selector with ${productCards.length} cards\n`);

    // Debug first 3 cards in detail
    productCards.slice(0, 3).each((i, el) => {
      const $el = $(el);
      console.log(`${"=".repeat(70)}`);
      console.log(`CARD ${i + 1}:`);
      console.log(`${"=".repeat(70)}`);

      // Brand selectors
      const brandSelectors = [
        "h3.product-brand",
        ".product-brand",
        "h3[class*='brand']",
        ".brand",
      ];

      console.log("\n🏢 BRAND ATTEMPTS:");
      brandSelectors.forEach((sel) => {
        const text = $el.find(sel).text().trim();
        const found = text ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${text.substring(0, 50)}`);
      });

      // Product name selectors
      const nameSelectors = [
        "h4.product-product",
        ".product-product",
        "h4[class*='product']",
        ".product-title",
      ];

      console.log("\n📦 PRODUCT NAME ATTEMPTS:");
      nameSelectors.forEach((sel) => {
        const text = $el.find(sel).text().trim();
        const found = text ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${text.substring(0, 50)}`);
      });

      // Price selectors
      const priceSelectors = [
        "span.product-discountedPrice",
        "div.product-price",
        ".product-discountedPrice",
        "[class*='price']",
        ".price",
      ];

      console.log("\n💰 PRICE ATTEMPTS:");
      priceSelectors.forEach((sel) => {
        const text = $el.find(sel).first().text().trim();
        const found = text ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${text}`);
      });

      // URL selectors
      const urlSelectors = ["a", "a.product-link", "[href]"];

      console.log("\n🔗 URL ATTEMPTS:");
      urlSelectors.forEach((sel) => {
        const href = $el.find(sel).first().attr("href");
        const found = href ? "✅" : "❌";
        console.log(
          `   ${found} ${sel.padEnd(35)} → ${href?.substring(0, 50)}`
        );
      });

      // Image selectors
      const imgSelectors = ["img.product-image", "img.img-responsive", "img"];

      console.log("\n🖼️  IMAGE ATTEMPTS:");
      imgSelectors.forEach((sel) => {
        const src = $el.find(sel).first().attr("src");
        const found = src ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${src?.substring(0, 50)}`);
      });

      // Show full HTML of first card
      if (i === 0) {
        console.log("\n📄 FULL HTML (first 1000 chars):");
        console.log($el.html().substring(0, 1000));
      }

      console.log("\n");
    });

    console.log("🎯 RECOMMENDATION:");
    console.log("   1. Check myntra-debug.html to see the actual HTML");
    console.log("   2. Look for the ✅ selectors above");
    console.log("   3. Update myntraScraper.js with working selectors\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the debug
const query = process.argv[2] || "shirt";
debugMyntraSearch(query);
