import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 py-10">
      <div className="container mx-auto px-6 text-center text-slate-400">
        <p>&copy; 2025 ReciptoVerse. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a
            href="https://x.com/receiptoverse?t=9OIPmypO8W-7CSfU-US5LA&s=09"
            className="hover:text-white"
          >
            Twitter (X)
          </a>
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
