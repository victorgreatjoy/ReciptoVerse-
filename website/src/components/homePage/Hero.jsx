import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart, FileText } from "lucide-react";

const Hero = ({ onJoinWaitlist }) => {
  // Accept onJoinWaitlist as a prop
  // The local state for the modal has been removed from this component.

  return (
    <section className="relative text-white py-28 sm:py-32 md:py-40">
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          Your Receipts, <span className="text-cyan-400">Reinvented.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
          Transform every purchase into a digital asset. Collect receipt-NFTs
          (rNFTs) to unlock rewards, governance rights, and new financial
          opportunities in the Web3 ecosystem.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onJoinWaitlist} // Use the passed-in function here
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Join Waitlist <ArrowRight size={20} />
          </button>

          <div className="relative group w-full sm:w-auto">
            <button
              disabled
              className="w-full bg-slate-800 text-slate-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              Stake RVT <BarChart size={20} />
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Coming Soon
            </div>
          </div>

          <Link
            to="/white-receipts"
            className="w-full sm:w-auto border-2 border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            Explore Docs <FileText size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
