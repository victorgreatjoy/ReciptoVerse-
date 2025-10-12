import React from "react";
import { Ticket, BarChart2, Zap, Globe, Users } from "lucide-react";

const Benefits = () => {
  const benefitsList = [
    {
      icon: <Ticket className="text-cyan-400" />,
      text: "Turn Digital Receipts into valuable NFTs",
    },
    {
      icon: <BarChart2 className="text-cyan-400" />,
      text: "Earn & Stake $RVT for passive rewards",
    },
    {
      icon: <Zap className="text-cyan-400" />,
      text: "Unlock exclusive GameFi Rewards and perks",
    },
    {
      icon: <Globe className="text-cyan-400" />,
      text: "Prepare for future Metaverse integration",
    },
    {
      icon: <Users className="text-cyan-400" />,
      text: "Shape the future with DAO Governance",
    },
  ];

  return (
    <section className="py-20 bg-slate-800/75">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">
            Core Benefits of the Ecosystem
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            ReciptoVerse transforms everyday spending into a gateway for
            rewards, governance, and new digital experiences.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-4">
            {benefitsList.map((benefit, index) => (
              <li
                key={index}
                className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex items-center space-x-4 transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex-shrink-0 bg-slate-800 p-3 rounded-full">
                  {benefit.icon}
                </div>
                <span className="text-lg text-slate-200">{benefit.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
