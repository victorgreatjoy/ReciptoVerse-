import React from "react";

const ProblemSolution = () => {
  return (
    <section className="py-20 bg-slate-800/75 text-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">The Problem</h2>
            <ul className="space-y-3 list-disc list-inside text-slate-300 text-lg">
              <li>Massive paper waste from physical receipts.</li>
              <li>Ineffective and fragmented customer loyalty programs.</li>
              <li>No user ownership or monetization of purchase data.</li>
              <li>
                A disconnect between real-world spending and digital economies.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">
              The Solution
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-300 text-lg">
              <li>
                Blockchain receipts as NFTs, creating a permanent, digital
                asset.
              </li>
              <li>A unified reward system powered by the $RVT token.</li>
              <li>
                DAO governance that gives users control over the ecosystem.
              </li>
              <li>
                A vibrant GameFi platform where receipts become in-game assets.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
