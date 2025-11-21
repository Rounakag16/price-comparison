const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiSummary(results) {
  try {
    const storeGroups = results.reduce((acc, product) => {
      if (!acc[product.source]) {
        acc[product.source] = [];
      }
      acc[product.source].push(product);
      return acc;
    }, {});

    const prices = results.map((r) => parseFloat(r.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (
      prices.reduce((a, b) => a + b, 0) / prices.length
    ).toFixed(2);

    const bestDeal = results.find((r) => parseFloat(r.price) === minPrice);

    const storeCounts = Object.entries(storeGroups)
      .map(([store, products]) => ({ store, count: products.length }))
      .sort((a, b) => b.count - a.count);

    const productDetails = results
      .slice(0, 10)
      .map((r, i) => {
        const priceNum = parseFloat(r.price);
        const percentFromMin = (
          ((priceNum - minPrice) / minPrice) *
          100
        ).toFixed(1);
        return `${i + 1}. ${r.title}
   Store: ${r.source}
   Price: ₹${r.price}
   ${
     priceNum === minPrice
       ? "🏆 BEST DEAL"
       : `${percentFromMin}% more expensive than best deal`
   }`;
      })
      .join("\n\n");

    const storeComparison = Object.entries(storeGroups)
      .map(([store, products]) => {
        const storePrices = products.map((p) => parseFloat(p.price));
        const storeMin = Math.min(...storePrices);
        const storeMax = Math.max(...storePrices);
        const storeAvg = (
          storePrices.reduce((a, b) => a + b, 0) / storePrices.length
        ).toFixed(2);
        return `${store}: ${products.length} products (₹${storeMin} - ₹${storeMax}, avg ₹${storeAvg})`;
      })
      .join("\n");

    const prompt = `You are an expert shopping assistant helping customers make smart purchasing decisions. Analyze these search results and provide a comprehensive, personalized summary.

SEARCH RESULTS OVERVIEW:
- Total Products Found: ${results.length}
- Price Range: ₹${minPrice} to ₹${maxPrice}
- Average Price: ₹${avgPrice}
- Stores Searched: ${Object.keys(storeGroups).join(", ")}

BEST DEAL:
${bestDeal.title} on ${bestDeal.source} for ₹${bestDeal.price}

TOP 10 PRODUCTS:
${productDetails}

STORE COMPARISON:
${storeComparison}

STORE RANKINGS (by product count):
${storeCounts
  .map((s, i) => `${i + 1}. ${s.store} (${s.count} options)`)
  .join("\n")}

Please provide a detailed, conversational summary that includes:

1. **Best Deal Recommendation** (1-2 sentences)
   - Clearly state the cheapest option and why it's the best value
   - Mention the store name and exact price

2. **Price Analysis** (2-3 sentences)
   - Explain the price range and what it means for the customer
   - Mention if there's a significant price difference between options
   - Highlight if prices are clustered or widely spread

3. **Store Comparison** (2-3 sentences)
   - Which store has the most options?
   - Which store generally has better prices for this search?
   - Any notable patterns (e.g., "Flipkart tends to have lower prices for electronics")

4. **Shopping Advice** (1-2 sentences)
   - Practical tip for this specific search
   - What to consider when choosing between top options

5. **Alternative Options** (1-2 sentences)
   - Briefly mention 1-2 other good deals if the best deal is out of stock
   - Provide price context

IMPORTANT INSTRUCTIONS:
- Be conversational and friendly, like talking to a friend
- Use specific numbers and store names
- Keep total response under 250 words
- Make it sound natural for text-to-speech (avoid special characters)
- Focus on actionable insights, not just listing facts
- Use rupees symbol as "rupees" word for better speech synthesis

Example tone: "I found an amazing deal for you! The ${
      bestDeal.title
    } is available on ${bestDeal.source} for just ${
      bestDeal.price
    } rupees, which is the best price across all stores..."`;

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n" + "=".repeat(70));
    console.log("🤖 GEMINI AI SUMMARY");
    console.log("=".repeat(70));
    console.log(text);
    console.log("=".repeat(70) + "\n");

    return text;
  } catch (error) {
    console.error("Error in Gemini Service:", error);

    const prices = results.map((r) => parseFloat(r.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (
      prices.reduce((a, b) => a + b, 0) / prices.length
    ).toFixed(2);
    const cheapest = results.find((r) => parseFloat(r.price) === minPrice);

    const storeCount = [...new Set(results.map((r) => r.source))].length;
    const priceSpread = (((maxPrice - minPrice) / minPrice) * 100).toFixed(1);

    return `I found ${results.length} products across ${storeCount} stores for you. The best deal is the ${cheapest.title} on ${cheapest.source} for ${cheapest.price} rupees. Prices range from ${minPrice} to ${maxPrice} rupees, with an average of ${avgPrice} rupees. There's a ${priceSpread} percent difference between the cheapest and most expensive options, so choosing wisely can save you money. I recommend going with the best deal on ${cheapest.source} for maximum savings.`;
  }
}

module.exports = { getGeminiSummary };
