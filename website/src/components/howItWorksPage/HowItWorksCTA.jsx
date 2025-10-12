import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HowItWorksCTA = () => {
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Receipts?
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-8">
          The next generation of commerce is here. Mint your first receipt-NFT
          or prepare to stake your claim in the ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Mint NFT Receipt Button */}
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors duration-300"
          >
            Mint NFT Receipt
            <ArrowRight size={20} className="ml-2" />
          </Link>

          {/* Stake RVT Button - Disabled with Tooltip */}
          <div className="relative group w-full sm:w-auto">
            <button
              disabled
              className="w-full sm:w-auto px-8 py-3 font-semibold text-slate-300 bg-slate-700 rounded-lg cursor-not-allowed opacity-50"
            >
              Start Staking
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksCTA;
