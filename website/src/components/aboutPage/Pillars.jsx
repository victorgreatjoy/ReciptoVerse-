import React from "react";
import { ShoppingCart, Award, Lock, Gamepad2, Globe, Vote } from "lucide-react";

const Pillars = () => {
  const pillarList = [
    {
      icon: <ShoppingCart size={32} />,
      title: "Eco Commerce",
      description:
        "A sustainable marketplace powered by digital receipts, reducing paper waste.",
    },
    {
      icon: <Award size={32} />,
      title: "Reward Economy",
      description:
        "Earn $RVT tokens and unlock perks with every receipt you collect.",
    },
    {
      icon: <Lock size={32} />,
      title: "Staking",
      description:
        "Stake your $RVT to earn yield and gain increased governance rights.",
    },
    {
      icon: <Gamepad2 size={32} />,
      title: "GameFi",
      description:
        "Use your receipt-NFTs in our gaming ecosystem for fun and profit.",
    },
    {
      icon: <Globe size={32} />,
      title: "Metaverse",
      description:
        "Preparing for a future where rNFTs are your key to virtual brand experiences.",
    },
    {
      icon: <Vote size={32} />,
      title: "DAO Governance",
      description:
        "You, the community, shape the future of the ReciptoVerse protocol.",
    },
  ];

  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">
            Our Core Ecosystem Pillars
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            These six pillars form the foundation of our mission to create a
            participatory economy.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillarList.map((pillar, index) => (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center flex flex-col items-center"
            >
              <div className="mb-6 bg-slate-900 text-cyan-400 p-4 rounded-full">
                {pillar.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {pillar.title}
              </h3>
              <p className="text-slate-400">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;
