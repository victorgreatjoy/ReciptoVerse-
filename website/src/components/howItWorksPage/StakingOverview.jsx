import React from "react";

const StakingOverview = () => {
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Token Staking Overview
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto mb-12">
          Staking $RVT is central to the ecosystem. It provides you with passive
          yield and unlocks privileged access and governance rights. We offer
          multiple tiers to match your commitment level.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-cyan-400 mb-3">
              Flexible Staking
            </h3>
            <p className="text-slate-300">
              Perfect for beginners. Stake any amount of $RVT and unstake at any
              time. Earn a base APY and participate in community governance.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-cyan-400 mb-3">
              Tiered Staking
            </h3>
            <p className="text-slate-300">
              Lock your $RVT for a set period to earn boosted APY, unlock
              exclusive NFT rewards, and gain access to premium GameFi features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakingOverview;
