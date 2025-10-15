import React from "react";

const DaoPhilosophy = () => {
  return (
    <section className="py-20 bg-slate-800/75">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Our DAO Philosophy
          </h2>
          <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-8">
            <p className="text-xl text-slate-300 leading-relaxed">
              We believe in a future governed by users. In the ReceiptoVerse
              ecosystem, your voice matters. By staking $RVT tokens and holding
              receipt-NFTs, you gain the power to vote on key proposals, guide
              the development of new features, and directly influence the
              economic parameters of the protocol. This isn't just a platform;
              it's a community-driven economy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DaoPhilosophy;
