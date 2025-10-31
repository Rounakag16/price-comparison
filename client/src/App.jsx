// client/src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // We'll create this file

// --- Web Speech API Setup ---
// Check if browser supports SpeechRecognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // --- 1. Handle Search ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResults([]);
    try {
      // Call our backend API
      const response = await axios.get(
        `http://localhost:3001/api/search?q=${query}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Failed to fetch results. Check console.");
    }
    setLoading(false);
  };

  // --- 2. Handle Speech-to-Text (STT) ---
  const handleListen = () => {
    if (!recognition) {
      alert("Sorry, your browser does not support Speech Recognition.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Optional: automatically submit search after speaking
      // handleSearch({ preventDefault: () => {} }); // Needs query to be set first
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  };

  // --- 3. Handle Text-to-Speech (TTS) ---
  const handleSpeakResults = async () => {
    if (results.length === 0) {
      speak("No results to summarize.");
      return;
    }

    // Simple summary: find the cheapest item
    try {
      // Call our new backend endpoint
      const response = await axios.post("http://localhost:3001/api/summarize", {
        results: results, // Send the full results list
      });

      const { summary } = response.data;
      speak(summary); // Speak the AI-generated summary
    } catch (error) {
      console.error("Error fetching summary:", error);
      // Fallback to simple summary if AI fails
      const sortedResults = [...results].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
      const bestDeal = sortedResults[0];
      const summary = `I had trouble summarizing, but the best deal is the ${bestDeal.title} for ${bestDeal.price} rupees.`;
      speak(summary);
    }
  };

  // TODO in Phase 4: Call backend /api/summarize for a Gemini summary

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser does not support Text-to-Speech.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container">
      <h1>Deal Finder 🛍️</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a product..."
        />
        <button
          type="button"
          onClick={handleListen}
          className={`mic-btn ${isListening ? "listening" : ""}`}
        >
          🎙️
        </button>
        <button type="submit">Search</button>
      </form>

      {loading && <div className="loader">Loading...</div>}

      {results.length > 0 && (
        <div className="results-header">
          <h2>Results</h2>
          <button onClick={handleSpeakResults} className="tts-btn">
            🔊 Summarize Best Deal
          </button>
        </div>
      )}

      <div className="results-grid">
        {results.map((item, index) => (
          <div key={index} className="product-card">
            <img src={item.imageUrl} alt={item.title} />
            <h3>{item.title}</h3>
            <p className="price">₹{item.price}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="store-badge"
            >
              View on {item.source}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
