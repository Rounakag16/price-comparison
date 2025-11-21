const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function debugAmazonSearch(query) {
  const searchQuery = encodeURIComponent(query).replace(/%20/g, "+");
  const targetUrl = `https://www.amazon.in/s?k=${searchQuery}`;
  const API_URL = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}&country_code=in&render=true`;

  console.log("🔍 Debug Amazon Search");
  console.log(`Query: ${query}`);
  console.log(`Target URL: ${targetUrl}\n`);

  try {
    const { data } = await axios.get(API_URL, { timeout: 60000 });

    fs.writeFileSync("amazon-debug.html", data);
    console.log("✅ Saved raw HTML to: amazon-debug.html\n");

    const $ = cheerio.load(data);

    const selectors = [
      "div[data-component-type='s-search-result']",
      "div[data-asin]:not([data-asin=''])",
      ".s-result-item[data-asin]",
      "div.s-result-item",
      "[data-component-type='s-search-result']",
    ];

    console.log("📦 Testing Card Selectors:");
    selectors.forEach((sel) => {
      const count = $(sel).length;
      console.log(`   ${sel.padEnd(50)} → ${count} cards`);
    });

    let productCards = $("div[data-component-type='s-search-result']");
    if (productCards.length === 0) {
      productCards = $("div[data-asin]:not([data-asin=''])");
    }

    console.log(`\n✅ Using selector with ${productCards.length} cards\n`);

    productCards.slice(0, 3).each((i, el) => {
      const $el = $(el);
      console.log(`${"=".repeat(70)}`);
      console.log(`CARD ${i + 1}:`);
      console.log(`${"=".repeat(70)}`);

      const titleSelectors = [
        "h2 a span",
        "h2.a-size-mini a span",
        ".a-text-normal",
        "h2 span.a-text-normal",
        "h2 span",
        "[data-cy='title-recipe'] span",
        ".s-line-clamp-2",
      ];

      console.log("\n🏷️  TITLE ATTEMPTS:");
      titleSelectors.forEach((sel) => {
        const text = $el.find(sel).first().text().trim();
        const found = text ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${text.substring(0, 50)}`);
      });

      const priceSelectors = [
        "span.a-price-whole",
        ".a-price .a-offscreen",
        "span.a-price span.a-offscreen",
        ".a-price-whole",
        "span.a-price",
        "[data-cy='price-recipe'] span",
      ];

      console.log("\n💰 PRICE ATTEMPTS:");
      priceSelectors.forEach((sel) => {
        const text = $el.find(sel).first().text().trim();
        const found = text ? "✅" : "❌";
        console.log(`   ${found} ${sel.padEnd(35)} → ${text}`);
      });

      const urlSelectors = ["h2 a", "a.a-link-normal", "a[href*='/dp/']", "a"];

      console.log("\n🔗 URL ATTEMPTS:");
      urlSelectors.forEach((sel) => {
        const href = $el.find(sel).first().attr("href");
        const found = href ? "✅" : "❌";
        console.log(
          `   ${found} ${sel.padEnd(35)} → ${href?.substring(0, 50)}`
        );
      });

      const imgSelectors = ["img.s-image", "img[data-image-latency]", "img"];

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
    console.log("   1. Check amazon-debug.html to see the actual HTML");
    console.log("   2. Look for the ✅ selectors above");
    console.log("   3. Update amazonScraper.js with working selectors\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

const query = process.argv[2] || "laptop";
debugAmazonSearch(query);
