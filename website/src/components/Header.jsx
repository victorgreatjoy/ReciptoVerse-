import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get app URL from environment variable
  const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          Receipto<span className="text-cyan-400">Verse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/white-receipts"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            White Receipts
          </Link>
          <Link
            to="/contact"
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cyan-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-cyan-600 transition-all duration-300"
          >
            Launch App
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 pb-6 px-6 space-y-4">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-cyan-400 transition-colors text-lg"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-cyan-400 transition-colors text-lg"
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-cyan-400 transition-colors text-lg"
            >
              How It Works
            </Link>
            <Link
              to="/white-receipts"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-cyan-400 transition-colors text-lg"
            >
              White Receipts
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-cyan-400 transition-colors text-lg"
            >
              Contact
            </Link>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="bg-cyan-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 text-center"
            >
              Launch App
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
