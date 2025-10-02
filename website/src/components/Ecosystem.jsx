import React from "react";

const Ecosystem = () => {
  return (
    <section id="ecosystem" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold">
            More Than Just Finance
          </h3>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Our rNFTs power novel learning experiences and entertainment,
            bridging consumption with education and play.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h4 className="text-2xl font-bold mb-3 text-blue-400">
                ReciptoVerse Academy
              </h4>
              <p className="text-slate-300">
                Engage in unique micro-learning modules unlocked by the data on
                your rNFTs. Learn about finance, supply chains, and consumer
                behavior through interactive lessons tied to your real-world
                purchases.
              </p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h4 className="text-2xl font-bold mb-3 text-blue-400">
                Gaming & Entertainment
              </h4>
              <p className="text-slate-300">
                Integrate your rNFTs into board and strategy games. Hire your
                NFTs as characters, use them as tools, or unlock knowledge cards
                to gain a competitive edge. Your shopping literally becomes part
                of the game.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://placehold.co/600x500/1e293b/ffffff?text=Education+&+Gaming"
              alt="Ecosystem illustration"
              className="rounded-2xl shadow-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
