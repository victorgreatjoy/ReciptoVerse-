import React from "react";
import { CheckCircle } from "lucide-react";

const TokenomicsRoadmap = () => {
  const roadmapItems = [
    {
      period: "Q4 2025",
      goal: "Platform Launch & Initial Merchant Onboarding",
    },
    { period: "Q1 2026", goal: "DAO Governance Portal Launch" },
    {
      period: "Q2 2026",
      goal: "First Official GameFi Partnership Integration",
    },
    { period: "Q4 2026", goal: "Metaverse Launchpad and Virtual Store Beta" },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Tokenomics */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Tokenomics</h2>
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-4">
                <span className="font-semibold text-slate-300">
                  Total Supply:
                </span>
                <span className="text-cyan-400 font-bold text-xl">
                  1,000,000,000 $RVT
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Detailed distribution for ecosystem growth, community rewards,
                team, and liquidity is outlined in the full White Receipts
                document.
              </p>
            </div>
            <h3 className="text-2xl font-bold text-center mt-12 mb-6">
              Utility Breakdown
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center">
                <CheckCircle className="text-cyan-400 mr-2" size={20} />
                Staking for passive yield and platform privileges.
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-cyan-400 mr-2" size={20} />
                Governance rights in the ReciptoVerse DAO.
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-cyan-400 mr-2" size={20} />
                Primary currency for GameFi and Metaverse transactions.
              </li>
            </ul>
          </div>
          {/* Roadmap */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Roadmap</h2>
            <div className="space-y-6">
              {roadmapItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="bg-cyan-500 text-white font-bold rounded-lg p-3 mr-4">
                    {item.period}
                  </div>
                  <p className="text-slate-200">{item.goal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsRoadmap;
