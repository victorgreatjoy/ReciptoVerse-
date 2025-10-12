import React from "react";
import { Lock, Zap, Award } from "lucide-react";

const StakingOverview = () => {
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Token Staking: Powering the Ecosystem
          </h2>
          <p className="text-lg text-slate-400 mb-12">
            Staking RVT is more than just earning rewards; it's an investment in
            the ReciptoVerse ecosystem, granting you influence and unlocking
            exclusive platform privileges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Flexible Staking */}
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <div className="flex items-center text-cyan-400 mb-4">
              <Lock size={28} className="mr-3" />
              <h3 className="text-2xl font-bold text-white">
                Flexible & Tiered Staking
              </h3>
            </div>
            <p className="text-slate-400">
              Choose from various staking pools with different lock-up periods
              and APYs. The more you stake, the higher your tier and the greater
              your benefits.
            </p>
          </div>

          {/* Privilege Unlocks */}
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <div className="flex items-center text-cyan-400 mb-4">
              <Zap size={28} className="mr-3" />
              <h3 className="text-2xl font-bold text-white">
                Privilege Unlocks
              </h3>
            </div>
            <p className="text-slate-400">
              Higher staking tiers can grant you access to reduced minting fees,
              boosted GameFi rewards, priority access to new features, and
              exclusive NFT drops.
            </p>
          </div>

          {/* DAO Governance */}
          <div className="bg-slate-800/75 p-8 rounded-2xl border border-slate-700">
            <div className="flex items-center text-cyan-400 mb-4">
              <Award size={28} className="mr-3" />
              <h3 className="text-2xl font-bold text-white">
                DAO Governance Rights
              </h3>
            </div>
            <p className="text-slate-400">
              Your staked RVT tokens represent your voting power in the DAO.
              Participate in key decisions, from funding new projects to shaping
              the platform's economic policies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakingOverview;
