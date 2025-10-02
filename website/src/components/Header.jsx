import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  // Simple scroll-to-section logic
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          <Link to="/">
            <span className="text-blue-400">Recipto</span>Verse
          </Link>
        </h1>
        <nav className="hidden md:flex space-x-8 items-center">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-blue-400 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-blue-400 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("ecosystem")}
            className="hover:text-blue-400 transition-colors"
          >
            Ecosystem
          </button>
          <button
            onClick={() => scrollToSection("token")}
            className="hover:text-blue-400 transition-colors"
          >
            Token
          </button>
        </nav>
        {/* THIS IS THE LINK TO THE APP */}
        <Link
          to="/dashboard"
          className="cta-button bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full"
        >
          Launch App
        </Link>
      </div>
    </header>
  );
};

export default Header;
