import React from "react";
import { Download, Database } from "lucide-react";

const WhiteReceiptsCTA = () => {
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Dive Deeper into the Ecosystem
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-8">
          Explore the full technical breakdown, tokenomics, and roadmap. The
          staking portal will be your gateway to participating in the DAO.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Download PDF Button */}
          <div className="relative group w-full sm:w-auto">
            <button
              disabled
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-slate-300 bg-slate-700 rounded-lg cursor-not-allowed opacity-50"
            >
              <Download size={20} className="mr-2" />
              Download Full PDF
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Coming Soon
            </div>
          </div>

          {/* Staking Portal Button */}
          <div className="relative group w-full sm:w-auto">
            <button
              disabled
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-slate-300 bg-slate-700 rounded-lg cursor-not-allowed opacity-50"
            >
              <Database size={20} className="mr-2" />
              Staking Portal
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

export default WhiteReceiptsCTA;
