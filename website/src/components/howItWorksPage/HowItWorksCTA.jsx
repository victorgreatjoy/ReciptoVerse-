import React from "react";
import { Link } from "react-router-dom";

const HowItWorksCTA = () => {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Join the Economy</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/dashboard" // Placeholder for staking portal
            className="bg-cyan-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105"
          >
            Start Staking
          </Link>
          <button
            onClick={() => alert("Minting functionality coming soon!")}
            className="text-white border-2 border-slate-600 font-bold px-8 py-3 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            Mint a Receipt NFT
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksCTA;
