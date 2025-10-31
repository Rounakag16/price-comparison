// server/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai"); // <-- FIX 1
require("dotenv").config();

// FIX 2: Initialize with the API key string directly
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiSummary(results) {
  try {
    const productList = results
      .map((r) => `${r.title} from ${r.source} for Rs. ${r.price}`)
      .join("\n");

    const prompt = `
 You are a helpful shopping assistant.
 Here is a list of products I found:
 ${productList}

 Please provide a summary for me to read out loud.
 First, tell me what the best deal is (the cheapest item).
 Then, briefly mention the other items found.

 Example:
 "The best deal I found is the Adidas Runner Shoe on Flipkart for 1899 rupees. I also found a Men's Classic Sneaker and a Black Sport Shoe."
 
 Keep the entire response to two or three sentences.
`;

    // This part from my last message is now correct
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Summary:", text);
    return text;
  } catch (error) {
    console.error("Error in Gemini Service:", error);
    console.error(error); // Good for detailed debugging
    return "I had trouble summarizing the results, but the cheapest item is listed first.";
  }
}

module.exports = { getGeminiSummary };
