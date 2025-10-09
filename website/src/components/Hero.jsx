import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 text-center bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
          Your Receipts, <span className="text-cyan-400">Reinvented.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
          Transform every purchase into a receipt-NFT (rNFT), unlocking rewards,
          governance rights, and new financial opportunities in the Web3 world.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-cyan-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105"
          >
            Join Waitlist
          </Link>
          <a
            href="#tokenomics" // Placeholder link
            className="bg-slate-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-slate-600 transition-all duration-300"
          >
            Stake $RVT
          </a>
          <Link
            to="/white-receipts"
            className="text-white border-2 border-slate-600 font-bold px-8 py-3 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            Explore White Receipts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
