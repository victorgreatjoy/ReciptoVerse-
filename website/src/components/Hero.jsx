import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero-gradient text-center pt-32 pb-20 md:pt-48 md:pb-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Reimagine Receipts. Unlock Value.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-8">
            ReciptoVerse transforms your everyday purchase receipts into
            powerful receipt-NFTs (rNFTs), unlocking rewards, governance rights,
            and new financial opportunities in Web3.
          </p>
          {/* THIS IS ANOTHER LINK TO THE APP */}
          <Link
            to="/dashboard"
            className="cta-button inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-lg"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-16 relative">
          <img
            src="https://placehold.co/800x450/1e293b/ffffff?text=ReciptoVerse+App+Mockup"
            alt="App Mockup"
            className="rounded-2xl shadow-2xl mx-auto max-w-full h-auto border-4 border-slate-700"
          />
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500 rounded-full opacity-30 animate-pulse delay-75"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
