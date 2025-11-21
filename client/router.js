class Router {
  constructor() {
    this.currentPage = "landing";
    this.init();
  }

  init() {
    this.handleRoute();

    window.addEventListener("popstate", () => this.handleRoute());

    window.addEventListener("hashchange", () => {
      const hash = window.location.hash;
      if (!hash || hash === "#features" || hash === "#how-it-works") {
        return;
      }
      this.handleRoute();
    });
  }

  handleRoute() {
    const path = window.location.pathname;
    const search = window.location.search;

    if (path === "/search" || search.includes("q=")) {
      this.showSearchPage();
    } else {
      this.showLandingPage();
    }
  }

  showLandingPage() {
    const landingPage = document.getElementById("landing-page");
    const searchPage = document.getElementById("search-page");

    landingPage.classList.remove("hidden");
    searchPage.classList.add("hidden");

    this.currentPage = "landing";

    window.scrollTo(0, 0);

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }

  showSearchPage() {
    const landingPage = document.getElementById("landing-page");
    const searchPage = document.getElementById("search-page");

    landingPage.classList.add("hidden");
    searchPage.classList.remove("hidden");

    this.currentPage = "search";

    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && typeof window.handleSearchFromRouter === "function") {
      window.handleSearchFromRouter(query);
    }
  }

  navigateToSearch(query) {
    const url = `/search?q=${encodeURIComponent(query)}`;
    window.history.pushState({}, "", url);
    this.showSearchPage();

    if (typeof window.handleSearchFromRouter === "function") {
      window.handleSearchFromRouter(query);
    }
  }

  navigateToHome() {
    window.history.pushState({}, "", "/");
    this.showLandingPage();
  }
}

const router = new Router();
window.router = router;
