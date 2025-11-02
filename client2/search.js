// Search page functionality

(function () {
  let results = [];
  let sortBy = "price-low";
  let filterStore = "all";
  let recognition = null;

  const API_BASE = "http://localhost:3001";

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    initSearchInput();
    initSearchButton();
    initVoiceSearch();
    initFilters();
    initNavigation();
    initSpeakSummary();

    // Check if there's a query in URL
    checkURLQuery();
  });

  // Check URL for query parameter
  function checkURLQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.value = query;
      }
      handleSearch(query);
    }
  }

  // Global function for router to call
  window.handleSearchFromRouter = function (query) {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = query;
    }
    handleSearch(query);
  };

  // Search input handler
  function initSearchInput() {
    const input = document.getElementById("search-input");
    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performSearch();
        }
      });
    }
  }

  // Search button handler
  function initSearchButton() {
    const btn = document.getElementById("search-btn");
    if (btn) {
      btn.addEventListener("click", performSearch);
    }
  }

  // Perform search
  function performSearch() {
    const input = document.getElementById("search-input");
    const query = input ? input.value.trim() : "";

    if (query) {
      // Update URL
      const url = `/search?q=${encodeURIComponent(query)}`;
      window.history.pushState({}, "", url);

      handleSearch(query);
    }
  }

  // Handle search API call
  async function handleSearch(query) {
    if (!query.trim()) return;

    showLoading();
    results = [];

    try {
      const response = await fetch(
        `${API_BASE}/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        results = data;
        displayResults();
      } else {
        showError("Failed to fetch results");
      }
    } catch (error) {
      console.error("Search error:", error);
      showError("Search failed. Please try again.");
    } finally {
      hideLoading();
    }
  }

  // Voice search
  function initVoiceSearch() {
    const btn = document.getElementById("voice-search-btn");

    if (!btn) return;

    if (!("webkitSpeechRecognition" in window)) {
      btn.disabled = true;
      btn.title = "Voice search not supported in this browser";
      return;
    }

    btn.addEventListener("click", () => {
      if (!recognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          btn.classList.add("bg-red-500", "text-white", "animate-pulse");
          btn.classList.remove("bg-gray-800", "text-gray-300");
          btn.innerHTML = "🎙️";
        };

        recognition.onend = () => {
          btn.classList.remove("bg-red-500", "text-white", "animate-pulse");
          btn.classList.add("bg-gray-800", "text-gray-300");
          btn.innerHTML = "🎙️";
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.value = transcript;
            searchInput.focus();
            // Don't auto-search - user needs to click search button
          }
        };

        recognition.onerror = (event) => {
          console.error("Voice recognition error:", event.error);
          alert("Voice search error. Please try again.");
          btn.classList.remove("bg-red-500", "text-white", "animate-pulse");
          btn.classList.add("bg-gray-800", "text-gray-300");
        };
      }

      recognition.start();
    });
  }

  // Initialize filters
  function initFilters() {
    const sortFilter = document.getElementById("sort-filter");
    const storeFilter = document.getElementById("store-filter");

    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        sortBy = e.target.value;
        displayResults();
      });
    }

    if (storeFilter) {
      storeFilter.addEventListener("change", (e) => {
        filterStore = e.target.value;
        displayResults();
      });
    }
  }

  // Display results
  function displayResults() {
    if (results.length === 0) {
      showEmptyState();
      return;
    }

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === "price-low") {
        return parseFloat(a.price) - parseFloat(b.price);
      }
      if (sortBy === "price-high") {
        return parseFloat(b.price) - parseFloat(a.price);
      }
      return 0;
    });

    // Filter results
    const filteredResults =
      filterStore === "all"
        ? sortedResults
        : sortedResults.filter(
            (r) => r.source.toLowerCase() === filterStore.toLowerCase()
          );

    // Update results count
    const countEl = document.getElementById("results-count");
    if (countEl) {
      countEl.textContent = `${filteredResults.length} Results`;
    }

    // Update store filter options
    updateStoreFilter();

    // Update store stats
    updateStoreStats();

    // Update store comparison
    updateStoreComparison();

    // Render products
    renderProducts(filteredResults);

    // Show results container
    const loadingState = document.getElementById("loading-state");
    const resultsContainer = document.getElementById("results-container");
    const emptyState = document.getElementById("empty-state");
    const initialState = document.getElementById("initial-state");

    if (loadingState) loadingState.classList.add("hidden");
    if (emptyState) emptyState.classList.add("hidden");
    if (initialState) initialState.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.remove("hidden");
  }

  // Update store filter dropdown
  function updateStoreFilter() {
    const storeFilter = document.getElementById("store-filter");
    if (!storeFilter) return;

    const uniqueStores = [...new Set(results.map((r) => r.source))];
    const currentValue = storeFilter.value;

    // Clear existing options except "All Stores"
    storeFilter.innerHTML = '<option value="all">All Stores</option>';

    // Add store options
    uniqueStores.forEach((store) => {
      const option = document.createElement("option");
      option.value = store.toLowerCase();
      option.textContent = store;
      storeFilter.appendChild(option);
    });

    // Restore selection
    storeFilter.value = currentValue;
  }

  // Update store stats
  function updateStoreStats() {
    const statsEl = document.getElementById("store-stats");
    if (!statsEl) return;

    const uniqueStores = [...new Set(results.map((r) => r.source))];
    statsEl.innerHTML = "";

    uniqueStores.forEach((store) => {
      const count = results.filter((r) => r.source === store).length;
      const div = document.createElement("div");
      div.className = "flex items-center gap-2";
      div.innerHTML = `
            <span class="text-sm font-medium text-gray-400">${store}:</span>
        <span class="text-sm font-bold text-blue-500">${count} products</span>
      `;
      statsEl.appendChild(div);
    });
  }

  // Update store comparison with detailed stats
  function updateStoreComparison() {
    const comparisonEl = document.getElementById("store-comparison");
    const comparisonGrid = document.getElementById("store-comparison-grid");

    if (!comparisonEl || !comparisonGrid || results.length === 0) {
      if (comparisonEl) comparisonEl.classList.add("hidden");
      return;
    }

    comparisonEl.classList.remove("hidden");
    comparisonGrid.innerHTML = "";

    const uniqueStores = [...new Set(results.map((r) => r.source))];

    // Calculate stats for each store
    const storeStats = uniqueStores.map((store) => {
      const storeResults = results.filter((r) => r.source === store);
      const prices = storeResults
        .map((r) => parseFloat(r.price))
        .filter((p) => !isNaN(p));

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const avgPrice =
        prices.length > 0
          ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
          : 0;

      return {
        store,
        count: storeResults.length,
        minPrice,
        maxPrice,
        avgPrice,
        prices,
      };
    });

    // Sort by product count (descending)
    storeStats.sort((a, b) => b.count - a.count);

    // Find overall best deal
    const allPrices = results
      .map((r) => parseFloat(r.price))
      .filter((p) => !isNaN(p));
    const overallMinPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const bestDealStore = storeStats.find(
      (s) => s.minPrice === overallMinPrice
    );

    // Render comparison cards
    storeStats.forEach((stat) => {
      const card = document.createElement("div");
      card.className =
        "bg-gray-900 rounded-xl border border-gray-800 p-6 hover:shadow-lg hover:border-gray-700 transition-all";

      const isBestDeal = bestDealStore && stat.store === bestDealStore.store;

      card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold text-slate-900">${escapeHtml(
            stat.store
          )}</h4>
          ${
            isBestDeal
              ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Best Deal</span>'
              : ""
          }
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Products Found:</span>
            <span class="text-sm font-bold text-white">${stat.count}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Lowest Price:</span>
            <span class="text-sm font-bold text-blue-500">₹${stat.minPrice.toLocaleString()}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Highest Price:</span>
            <span class="text-sm font-bold text-white">₹${stat.maxPrice.toLocaleString()}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Average Price:</span>
            <span class="text-sm font-bold text-white">₹${parseFloat(
              stat.avgPrice
            ).toLocaleString()}</span>
          </div>
          ${
            stat.count > 1
              ? `
          <div class="pt-2 mt-2 border-t border-gray-800">
            <span class="text-xs text-gray-500">Price Range:</span>
            <div class="text-xs font-medium text-gray-300 mt-1">
              ₹${stat.minPrice.toLocaleString()} - ₹${stat.maxPrice.toLocaleString()}
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;

      comparisonGrid.appendChild(card);
    });
  }

  // Render products
  function renderProducts(products) {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach((product) => {
      const productCard = createProductCard(product);
      grid.appendChild(productCard);
    });
  }

  // Create product card element
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className =
      "bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:shadow-xl hover:border-gray-700 transition-all hover:-translate-y-1 flex flex-col";

    const imageUrl =
      product.imageUrl || "https://via.placeholder.com/300?text=No+Image";

    card.innerHTML = `
      <div class="relative aspect-square bg-gray-800">
        <img
          src="${imageUrl}"
          alt="${escapeHtml(product.title)}"
          class="w-full h-full object-cover"
          onerror="this.src='https://via.placeholder.com/300?text=No+Image'"
        />
        <div class="absolute top-3 right-3 px-3 py-1 bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-gray-800">
          ${escapeHtml(product.source)}
        </div>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="text-sm font-medium text-white mb-2 line-clamp-2 flex-1">
          ${escapeHtml(product.title)}
        </h3>
        <div class="mt-auto">
          <div class="text-2xl font-bold text-white mb-3">
            ₹${escapeHtml(product.price)}
          </div>
          <a
            href="${escapeHtml(product.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-lg font-medium hover:shadow-lg transition-all"
          >
            View Deal →
          </a>
        </div>
      </div>
    `;

    return card;
  }

  // Show loading state
  function showLoading() {
    const loadingState = document.getElementById("loading-state");
    const resultsContainer = document.getElementById("results-container");
    const emptyState = document.getElementById("empty-state");
    const initialState = document.getElementById("initial-state");

    if (loadingState) loadingState.classList.remove("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");
    if (emptyState) emptyState.classList.add("hidden");
    if (initialState) initialState.classList.add("hidden");
  }

  // Hide loading state
  function hideLoading() {
    const loadingState = document.getElementById("loading-state");
    if (loadingState) loadingState.classList.add("hidden");
  }

  // Show empty state
  function showEmptyState() {
    const loadingState = document.getElementById("loading-state");
    const resultsContainer = document.getElementById("results-container");
    const emptyState = document.getElementById("empty-state");
    const initialState = document.getElementById("initial-state");

    if (loadingState) loadingState.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    if (initialState) initialState.classList.add("hidden");
  }

  // Show error
  function showError(message) {
    showEmptyState();
    const emptyState = document.getElementById("empty-state");
    if (emptyState) {
      const h2 = emptyState.querySelector("h2");
      if (h2) h2.textContent = message;
    }
  }

  // Navigation
  function initNavigation() {
    const homeBtn = document.getElementById("search-home-btn");
    const backBtn = document.getElementById("back-to-home-btn");

    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        if (window.router) {
          window.router.navigateToHome();
        } else {
          window.location.href = "/";
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (window.router) {
          window.router.navigateToHome();
        } else {
          window.location.href = "/";
        }
      });
    }
  }

  // Speak summary
  function initSpeakSummary() {
    const btn = document.getElementById("speak-summary-btn");
    const summaryContainer = document.getElementById("summary-container");
    const summaryText = document.getElementById("summary-text");
    const closeSummaryBtn = document.getElementById("close-summary-btn");

    if (!btn) return;

    // Close summary button
    if (closeSummaryBtn && summaryContainer) {
      closeSummaryBtn.addEventListener("click", () => {
        summaryContainer.classList.add("hidden");
      });
    }

    btn.addEventListener("click", async () => {
      if (results.length === 0) return;

      btn.disabled = true;
      btn.textContent = "Loading summary...";

      try {
        const response = await fetch(`${API_BASE}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results }),
        });

        const data = await response.json();
        const summary = data.summary || "No summary available.";

        // Display summary text
        if (summaryText && summaryContainer) {
          summaryText.textContent = summary;
          summaryContainer.classList.remove("hidden");
        }

        // Speak summary
        const utterance = new SpeechSynthesisUtterance(summary);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);

        btn.textContent = "🔊 Hear Summary";
      } catch (error) {
        console.error("Summary error:", error);
        alert("Failed to generate summary. Please try again.");
        btn.textContent = "🔊 Hear Summary";
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Utility: Escape HTML
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
