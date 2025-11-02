import { useState, useEffect } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sortBy, setSortBy] = useState("price-low");
  const [filterStore, setFilterStore] = useState("all");

  // Get query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        `http://localhost:3001/api/search?q=${searchQuery}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

  const handleSpeakSummary = async () => {
    if (results.length === 0) return;

    try {
      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });
      const data = await response.json();

      const utterance = new SpeechSynthesisUtterance(data.summary);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Summary error:", error);
    }
  };

  // Sorting
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "price-low")
      return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-high")
      return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  // Filtering
  const filteredResults =
    filterStore === "all"
      ? sortedResults
      : sortedResults.filter(
          (r) => r.source.toLowerCase() === filterStore.toLowerCase()
        );

  const uniqueStores = [...new Set(results.map((r) => r.source))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden md:block">
                DealFinder
              </span>
            </button>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for products..."
                className="w-full px-4 py-3 pr-24 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🎙️
                </button>
                <button
                  onClick={() => handleSearch()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 text-lg">Searching across stores...</p>
            <p className="text-slate-500 text-sm mt-2">
              This may take up to 60 seconds
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {filteredResults.length} Results
                </h2>
                <button
                  onClick={handleSpeakSummary}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                >
                  🔊 Hear Summary
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {/* Store Filter */}
                <select
                  value={filterStore}
                  onChange={(e) => setFilterStore(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="all">All Stores</option>
                  {uniqueStores.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Store Stats */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
              {uniqueStores.map((store) => {
                const count = results.filter((r) => r.source === store).length;
                return (
                  <div key={store} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {store}:
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {count} products
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300?text=No+Image";
                      }}
                    />
                    {/* Store Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
                      {product.source}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-medium text-slate-900 mb-2 line-clamp-2 flex-1">
                      {product.title}
                    </h3>

                    <div className="mt-auto">
                      <div className="text-2xl font-bold text-slate-900 mb-3">
                        ₹{product.price}
                      </div>

                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        View Deal →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No results found
            </h2>
            <p className="text-slate-600 mb-6">
              Try different keywords or check your spelling
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Initial State */}
        {!loading && results.length === 0 && !query && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Start Your Search
            </h2>
            <p className="text-slate-600">
              Enter a product name above to find the best deals
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;
