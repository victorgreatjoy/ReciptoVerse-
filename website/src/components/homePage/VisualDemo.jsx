import React from "react";

const VisualDemo = () => {
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          From Paper to Power
        </h2>
        <p className="text-slate-400 mb-12 max-w-3xl mx-auto">
          Watch as an everyday receipt transforms into a dynamic NFT, unlocking
          a universe of tokens and rewards.
        </p>
        <div className="relative max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
          {/* This is a placeholder for a future animation or interactive demo */}
          <div className="flex flex-col md:flex-row items-center justify-around space-y-8 md:space-y-0">
            {/* Step 1: Receipt */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-48 bg-white p-2 rounded transform -rotate-6 shadow-lg">
                <p className="text-xs text-black font-mono">
                  Store: Coffee Spot
                </p>
                <p className="text-xs text-black font-mono">
                  Item: Latte.....$4.50
                </p>
                <p className="text-xs text-black font-mono">Total:.....$4.50</p>
                <div className="border-t border-dashed border-black my-2"></div>
              </div>
              <p className="mt-4 text-white font-semibold">1. Your Receipt</p>
            </div>

            <div className="text-cyan-400 text-4xl font-bold animate-pulse">
              &rarr;
            </div>

            {/* Step 2: NFT */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-48 bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-2xl shadow-cyan-500/30 flex flex-col justify-between">
                <div className="text-left">
                  <p className="text-white font-bold text-sm">rNFT</p>
                  <p className="text-white/80 text-xs">ID: #12345</p>
                </div>
                <p className="text-white text-center font-bold text-lg">
                  Coffee Spot
                </p>
                <div></div>
              </div>
              <p className="mt-4 text-white font-semibold">
                2. Transformed to NFT
              </p>
            </div>

            <div className="text-cyan-400 text-4xl font-bold animate-pulse">
              &rarr;
            </div>

            {/* Step 3: Tokens */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-48 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl shadow-lg absolute top-0 left-0 animate-bounce">
                    RVT
                  </div>
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-green-900 font-bold text-sm shadow-lg absolute top-10 left-10 animate-ping">
                    DAO
                  </div>
                </div>
              </div>
              <p className="mt-4 text-white font-semibold">
                3. Unlocking Tokens
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualDemo;
