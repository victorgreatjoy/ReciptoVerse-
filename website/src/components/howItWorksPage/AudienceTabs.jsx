import React, { useState } from "react";
import { User, Store, Code } from "lucide-react";

const AudienceTabs = () => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = {
    users: {
      icon: User,
      title: "For Users",
      content: [
        {
          title: "Connect Your Wallet",
          description:
            "Securely log in using your Web3 wallet to create your ReceiptoVerse identity and dashboard.",
        },
        {
          title: "Collect Digital Receipts",
          description:
            "Link participating merchants or scan QR codes to automatically gather encrypted, end-to-end digital receipts.",
        },
        {
          title: "Mint Valuable rNFTs",
          description:
            "Aggregate your receipts to mint unique ERC-721 receipt-NFTs, turning your purchase history into a verifiable digital asset.",
        },
        {
          title: "Engage in GameFi",
          description:
            "Integrate your rNFTs into our partner games and metaverse experiences to unlock rewards and exclusive content.",
        },
        {
          title: "Stake RVT & Earn",
          description:
            "Stake your RVT tokens to earn passive rewards, increase your platform tier, and gain voting rights in the DAO.",
        },
      ],
    },
    merchants: {
      icon: Store,
      title: "For Merchants",
      content: [
        {
          title: "Seamless Integration",
          description:
            "Integrate our REST/GraphQL API with your existing POS systems for effortless digital receipt issuance.",
        },
        {
          title: "Enhance Customer Loyalty",
          description:
            "Offer your customers a next-generation, Web3-native loyalty program that turns every purchase into an asset.",
        },
        {
          title: "Access Actionable Analytics",
          description:
            "Gain insights into consumer behavior and trends through an anonymized, GDPR-compliant analytics dashboard.",
        },
        {
          title: "Join the Eco-Commerce Movement",
          description:
            "Reduce paper waste, appeal to eco-conscious consumers, and benefit from a modern, sustainable receipt solution.",
        },
        {
          title: "KYC & Security",
          description:
            "Our platform ensures merchant verification (KYC) and end-to-end encryption for all transaction data, building trust and security.",
        },
      ],
    },
    developers: {
      icon: Code,
      title: "For Developers",
      content: [
        {
          title: "Utilize our SDK & APIs",
          description:
            "Access our comprehensive SDKs and APIs to build novel GameFi applications and tools on top of the ReceiptoVerse protocol.",
        },
        {
          title: "Apply for DAO Grants",
          description:
            "Propose innovative projects to the ReceiptoVerse DAO and get funding to build the future of the ecosystem.",
        },
        {
          title: "Sandbox Environment",
          description:
            "Test your integrations and applications in a secure sandbox environment before deploying to our mainnet.",
        },
        {
          title: "Smart Contract Interaction",
          description:
            "Build services that directly interact with our audited ERC-721 (rNFT) and ERC-20 (RVT) smart contracts.",
        },
        {
          title: "Cross-Chain Opportunities",
          description:
            "Explore future possibilities with cross-chain NFT bridging and expanding the utility of rNFTs to other networks.",
        },
      ],
    },
  };

  const currentTab = tabs[activeTab];

  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-12 border-b border-slate-800">
          {Object.keys(tabs).map((key) => {
            const Icon = tabs[key].icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-6 py-4 font-bold text-lg transition-colors duration-300 ${
                  activeTab === key
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="mr-3" size={24} />
                {tabs[key].title}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentTab.content.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 transform hover:-translate-y-1 transition-transform duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceTabs;
