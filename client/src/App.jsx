// client/src/App.jsx
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import SearchPage from "./pages/SearchPage";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  // Simple routing based on URL
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;

    if (path === "/search" || search.includes("q=")) {
      setCurrentPage("search");
    } else {
      setCurrentPage("landing");
    }

    // Listen for URL changes
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const newSearch = window.location.search;

      if (newPath === "/search" || newSearch.includes("q=")) {
        setCurrentPage("search");
      } else {
        setCurrentPage("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <>
      {currentPage === "landing" && <LandingPage />}
      {currentPage === "search" && <SearchPage />}
    </>
  );
}

export default App;
