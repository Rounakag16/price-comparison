import { useState } from "react";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const popularSearches = [
    { text: "Laptop under 50000", icon: "💻" },
    { text: "Running shoes", icon: "👟" },
    { text: "Smartphone", icon: "📱" },
    { text: "Headphones", icon: "🎧" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DealFinder
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Smart Shopping Assistant
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Find the Best{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Deals
            </span>{" "}
            in Seconds
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Compare prices across Amazon, Flipkart, and more. Get voice-powered
            search and AI-driven recommendations.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, or categories..."
                className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none shadow-lg shadow-slate-200/50 transition-all bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <span className="text-sm text-slate-500">Popular:</span>
            {popularSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(search.text)}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all hover:shadow-md"
              >
                <span className="mr-1">{search.icon}</span>
                {search.text}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">7+</div>
              <div className="text-sm text-slate-600">Online Stores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">1M+</div>
              <div className="text-sm text-slate-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">60s</div>
              <div className="text-sm text-slate-600">Average Search</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-6xl mx-auto mt-32">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Why Choose DealFinder?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Smart Comparison
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically compares prices across major e-commerce platforms
                to find you the best deal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎙️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Voice Search
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Search hands-free with voice commands and get spoken summaries
                of the best deals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                AI Recommendations
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get intelligent suggestions powered by Gemini AI to help you
                make smarter purchase decisions.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-4xl mx-auto mt-32">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            How It Works
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Search for Any Product
                </h3>
                <p className="text-slate-600">
                  Type or speak what you're looking for. Support for price
                  filters like "under 5000".
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  We Search Everywhere
                </h3>
                <p className="text-slate-600">
                  Our system scans Amazon, Flipkart, Myntra, Ajio, and more in
                  real-time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Compare & Save
                </h3>
                <p className="text-slate-600">
                  View results sorted by price with AI-powered summaries. Click
                  to buy from your preferred store.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Better Deals?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start comparing prices now and never overpay again.
          </p>
          <button
            onClick={() => document.querySelector("input").focus()}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start Searching
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="font-bold text-slate-900">DealFinder</span>
            </div>
            <p className="text-slate-600 text-sm">
              © 2025 DealFinder. Made with ❤️ for smart shoppers.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
