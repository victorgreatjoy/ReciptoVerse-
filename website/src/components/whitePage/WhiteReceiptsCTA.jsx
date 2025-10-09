import React from "react";
import { Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WhiteReceiptsCTA = () => {
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          Ready to Dive Deeper?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/ReciptoVerse_White_Receipts.pdf" // Placeholder link
            download
            className="bg-cyan-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
          >
            <Download className="mr-2" />
            Download Full PDF
          </a>
          <Link
            to="/dashboard" // Placeholder for staking portal
            className="text-white border-2 border-slate-600 font-bold px-8 py-3 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 inline-flex items-center"
          >
            Go to Staking Portal
            <ArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhiteReceiptsCTA;
