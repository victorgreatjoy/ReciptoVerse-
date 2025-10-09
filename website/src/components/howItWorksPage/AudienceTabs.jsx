import React, { useState } from "react";
import { User, Store, Code } from "lucide-react";

const AudienceTabs = () => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", title: "For Users", icon: <User /> },
    { id: "merchants", title: "For Merchants", icon: <Store /> },
    { id: "developers", title: "For Developers", icon: <Code /> },
  ];

  const content = {
    users: [
      "Shop at participating stores.",
      "Collect digital receipts instantly.",
      "Mint your receipts into valuable NFTs.",
      "Play & Earn in our GameFi ecosystem.",
      "Stake $RVT tokens to multiply your rewards.",
    ],
    merchants: [
      "Integrate our simple API or use our terminals.",
      "Issue digital receipts, reducing costs and waste.",
      "Access valuable, anonymized purchase analytics.",
      "Join the Eco-Commerce network and attract Web3 users.",
    ],
    developers: [
      "Build innovative GameFi tools on our platform.",
      "Apply for DAO grants to fund your ideas.",
      "Utilize our SDKs to integrate rNFTs into your own apps.",
    ],
  };

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center border-b border-slate-700 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-lg font-semibold transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
          <div className="text-left">
            <ul className="space-y-4">
              {content[activeTab].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center p-4 bg-slate-800 rounded-lg"
                >
                  <span className="bg-cyan-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">
                    {index + 1}
                  </span>
                  <p className="text-lg text-slate-200">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceTabs;
