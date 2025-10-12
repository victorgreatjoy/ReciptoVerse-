import React from "react";
import { Link } from "react-router-dom";

const TokenomicsSnapshot = () => {
  const stats = [
    { label: "Total Supply", value: "1,000,000,000 $RVT" },
    { label: "Staking APY", value: "Up to 15%" },
    { label: "Network", value: "Hedera" },
  ];

  return (
    <section className="py-20 bg-slate-800/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Mini Tokenomics</h2>
        <p className="text-slate-400 mb-12">
          A quick look at the core metrics of the $RVT token.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 p-6 rounded-xl border border-slate-700"
            >
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
            </div>
          ))}
        </div>
        <Link
          to="/white-receipts"
          className="text-cyan-400 hover:text-cyan-300 font-semibold text-lg transition-colors"
        >
          Explore White Receipts &rarr;
        </Link>
      </div>
    </section>
  );
};

export default TokenomicsSnapshot;
