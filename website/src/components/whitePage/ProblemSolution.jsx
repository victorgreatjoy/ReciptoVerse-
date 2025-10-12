import React from "react";

const ProblemSolution = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900/75 via-slate-800/75 to-slate-900/75">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Problem Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:shadow-red-500/10 transition-all duration-500 group h-full flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
              <h2 className="text-4xl font-bold text-white group-hover:text-red-100 transition-colors duration-300">
                The Problem
              </h2>
            </div>
            <div className="space-y-4 flex-grow">
              {[
                "Massive paper waste from physical receipts.",
                "Ineffective and fragmented customer loyalty programs.",
                "No user ownership or monetization of purchase data.",
                "A disconnect between real-world spending and digital economies.",
              ].map((item, index) => (
                <div key={index} className="flex items-start group/item">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-3 mr-4 flex-shrink-0 group-hover/item:bg-red-300 transition-colors duration-300"></div>
                  <p className="text-slate-300 text-lg leading-relaxed group-hover/item:text-slate-200 transition-colors duration-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Section */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group h-full flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-xl flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
              </div>
              <h2 className="text-4xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                The Solution
              </h2>
            </div>
            <div className="space-y-4 flex-grow">
              {[
                "Blockchain receipts as NFTs, creating a permanent, digital asset.",
                "A unified reward system powered by the $RVT token.",
                "DAO governance that gives users control over the ecosystem.",
                "A vibrant GameFi platform where receipts become in-game assets.",
              ].map((item, index) => (
                <div key={index} className="flex items-start group/item">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 mr-4 flex-shrink-0 group-hover/item:bg-cyan-300 transition-colors duration-300"></div>
                  <p className="text-slate-300 text-lg leading-relaxed group-hover/item:text-slate-200 transition-colors duration-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
