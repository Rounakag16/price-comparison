import { useState, useEffect } from "react";
import {
  Search,
  Zap,
  TrendingUp,
  Mic,
  ShoppingBag,
  ArrowRight,
  Star,
  DollarSign,
  Clock,
  Menu,
  X,
} from "lucide-react";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-slate-900/95 backdrop-blur-lg border-b border-slate-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                DealFinder
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#how-it-works"
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors relative group"
              >
                How it works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
              <a
                href="#features"
                className="block text-slate-300 hover:text-white py-2"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-300 hover:text-white py-2"
              >
                How it works
              </a>
              <button className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all">
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8 animate-fade-in backdrop-blur-sm">
            <Star className="w-4 h-4 animate-pulse" />
            Smart Shopping Assistant
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Find the Best{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Deals
            </span>{" "}
            in Seconds
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Compare prices across Amazon, Flipkart, and more. Get voice-powered
            search and AI-driven recommendations instantly.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative flex items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                <Search className="w-5 h-5 text-slate-400 ml-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, or categories..."
                  className="flex-1 px-4 py-5 text-lg bg-transparent text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="m-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Popular Searches */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-sm text-slate-500">Popular:</span>
            {popularSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(search.text)}
                className="px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-sm text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all hover:shadow-md hover:shadow-blue-500/20 transform hover:scale-105"
              >
                {search.text}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-20 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            {[
              { value: "7+", label: "Online Stores" },
              { value: "1M+", label: "Products" },
              { value: "60s", label: "Avg. Search" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all transform hover:scale-105"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto mt-32">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              DealFinder?
            </span>
          </h2>
          <p className="text-slate-400 text-center mb-16 text-lg">
            Powerful features to save you time and money
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Smart Comparison",
                description:
                  "Automatically compares prices across major e-commerce platforms to find you the best deal.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Voice Search",
                description:
                  "Search hands-free with voice commands and get spoken summaries of the best deals.",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "AI Recommendations",
                description:
                  "Get intelligent suggestions powered by Gemini AI to help you make smarter purchase decisions.",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div
                  className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="relative text-2xl font-bold mb-4">
                  {feature.title}
                </h3>
                <p className="relative text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-5xl mx-auto mt-32">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-slate-400 text-center mb-16 text-lg">
            Three simple steps to better deals
          </p>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Search for Any Product",
                description:
                  "Type or speak what you're looking for. Support for price filters like 'under 5000'.",
                icon: <Search className="w-6 h-6" />,
              },
              {
                step: "2",
                title: "We Search Everywhere",
                description:
                  "Our system scans Amazon, Flipkart, Myntra, Ajio, and more in real-time.",
                icon: <Clock className="w-6 h-6" />,
              },
              {
                step: "3",
                title: "Compare & Save",
                description:
                  "View results sorted by price with AI-powered summaries. Click to buy from your preferred store.",
                icon: <DollarSign className="w-6 h-6" />,
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-6 p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mt-32">
          <div className="relative p-12 text-center rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Find Better Deals?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Start comparing prices now and never overpay again.
              </p>
              <button
                onClick={() => document.querySelector("input").focus()}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center gap-3 group"
              >
                Start Searching
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">DealFinder</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 DealFinder. Made with ❤️ for smart shoppers.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out backwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
