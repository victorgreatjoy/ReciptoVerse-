import React from "react";

const ExecutiveSummary = () => {
  return (
    <section className="py-20 bg-slate-900/75 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
            Executive Summary
          </h2>
          <div className="bg-slate-800 p-8 rounded-lg space-y-4 border border-slate-700">
            <p className="text-slate-300 text-lg leading-relaxed">
              ReciptoVerse is a decentralized ecosystem that transforms everyday
              purchase receipts into valuable NFT assets (rNFTs). Our vision is
              to create a participatory economy where consumer spending data is
              owned by the user and leveraged for rewards, governance, and new
              GameFi experiences.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              By bridging real-world commerce with Web3, we solve critical
              issues like paper waste, ineffective loyalty programs, and data
              centralization. The ecosystem is powered by the ReciptoVerse token
              ($RVT), which enables staking, DAO participation, and access to
              premium features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
