// Landing page functionality

(function () {
  let scrollY = 0;
  let isMenuOpen = false;

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    initScrollEffect();
    initMobileMenu();
    initSearchForm();
    initPopularSearches();
    initCTA();
    initSmoothScroll();
    initLandingVoiceSearch();
  });

  // Scroll effect for navigation
  function initScrollEffect() {
    const nav = document.getElementById("landing-nav");

    const handleScroll = () => {
      scrollY = window.scrollY;
      if (scrollY > 50) {
        nav.classList.add(
          "bg-black/95",
          "backdrop-blur-lg",
          "border-b",
          "border-gray-900"
        );
        nav.classList.remove("bg-black/80");
      } else {
        nav.classList.remove(
          "bg-black/95",
          "backdrop-blur-lg",
          "border-b",
          "border-gray-900"
        );
        nav.classList.add("bg-black/80");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
  }

  // Mobile menu toggle
  function initMobileMenu() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");

    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
          mobileMenu.classList.remove("hidden");
          menuIcon.classList.add("hidden");
          closeIcon.classList.remove("hidden");
        } else {
          mobileMenu.classList.add("hidden");
          menuIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
        }
      });
    }

    // Close menu when clicking on links
    const menuLinks = mobileMenu.querySelectorAll("a, button");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        isMenuOpen = false;
        mobileMenu.classList.add("hidden");
        menuIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
      });
    });
  }

  // Search form handler
  function initSearchForm() {
    const form = document.getElementById("landing-search-form");
    const input = document.getElementById("landing-search-input");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          // Navigate to search page with query
          if (window.router) {
            window.router.navigateToSearch(query);
          } else {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }

  // Popular searches
  function initPopularSearches() {
    const popularBtns = document.querySelectorAll(".popular-search-btn");
    const searchInput = document.getElementById("landing-search-input");

    popularBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const query = btn.getAttribute("data-query");
        if (searchInput) {
          searchInput.value = query;
          searchInput.focus();

          // Auto-submit after a brief moment
          setTimeout(() => {
            if (window.router) {
              window.router.navigateToSearch(query);
            } else {
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
          }, 300);
        }
      });
    });
  }

  // CTA button
  function initCTA() {
    const ctaBtn = document.getElementById("cta-search-btn");
    const searchInput = document.getElementById("landing-search-input");

    if (ctaBtn) {
      ctaBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.focus();
          // Scroll to search input
          searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#features" || href === "#how-it-works") {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }

  // Landing page voice search
  function initLandingVoiceSearch() {
    const btn = document.getElementById("landing-voice-search-btn");
    let recognition = null;

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
        };

        recognition.onend = () => {
          btn.classList.remove("bg-red-500", "text-white", "animate-pulse");
          btn.classList.add("bg-gray-800", "text-gray-300");
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const searchInput = document.getElementById("landing-search-input");
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
})();
