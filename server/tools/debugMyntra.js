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

    fs.writeFileSync("myntra-debug.html", data);
    console.log("✅ Saved raw HTML to: myntra-debug.html\n");

    const $ = cheerio.load(data);

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

    let productCards = $("li.product-base");
    if (productCards.length === 0) productCards = $("li.product-tile");

    console.log(`\n✅ Using selector with ${productCards.length} cards\n`);

    productCards.slice(0, 3).each((i, el) => {
      const $el = $(el);
      console.log(`${"=".repeat(70)}`);
      console.log(`CARD ${i + 1}:`);
      console.log(`${"=".repeat(70)}`);

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

      const urlSelectors = ["a", "a.product-link", "[href]"];

      console.log("\n🔗 URL ATTEMPTS:");
      urlSelectors.forEach((sel) => {
        const href = $el.find(sel).first().attr("href");
        const found = href ? "✅" : "❌";
        console.log(
          `   ${found} ${sel.padEnd(35)} → ${href?.substring(0, 50)}`
        );
      });

      const imgSelectors = ["img.product-image", "img.img-responsive", "img"];

      console.log("\n🖼️  IMAGE ATTEMPTS:");
      imgSelectors.forEach((sel) => {
        const src = $el.find(sel).first().attr("src");
        const found = src ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${src?.substring(0, 50)}`);
      });

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

const query = process.argv[2] || "shirt";
debugMyntraSearch(query);
