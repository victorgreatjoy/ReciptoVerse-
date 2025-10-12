import React from "react";
import {
  ShoppingCart,
  Receipt,
  Zap,
  ToyBrick,
  Banknote,
  Landmark,
} from "lucide-react";

const Step = ({ icon: Icon, title, description, isLast = false }) => (
  <div className="flex items-start">
    {/* Vertical line and icon */}
    <div className="flex flex-col items-center mr-6">
      <div className="bg-slate-800 border-2 border-cyan-500 rounded-full p-3 text-cyan-400 z-10">
        {/* Render the Icon component */}
        {Icon && <Icon size={24} />}
      </div>
      {!isLast && (
        <div className="w-0.5 h-full min-h-[100px] bg-slate-700"></div>
      )}
    </div>
    {/* Text content */}
    <div className="pt-2">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-400 mt-1">{description}</p>
    </div>
  </div>
);

const VisualInfographic = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "1. Shop & Collect",
      description:
        "Make purchases at participating merchants and automatically collect digital receipts in your app.",
    },
    {
      icon: Receipt,
      title: "2. Mint rNFTs",
      description:
        "Once you collect enough receipts, you can mint them into a unique receipt-NFT (rNFT), an ERC-721 token on the blockchain.",
    },
    {
      icon: ToyBrick,
      title: "3. Play & Earn",
      description:
        "Use your rNFTs in integrated GameFi applications to unlock special abilities, rewards, and experiences.",
    },
    {
      icon: Banknote,
      title: "4. Stake RVT Tokens",
      description:
        "Stake your RVT (ERC-20) tokens to earn yield, unlock platform privileges, and boost your rewards.",
    },
    {
      icon: Landmark,
      title: "5. Govern the DAO",
      description:
        "Your staked tokens and rNFTs grant you voting power in the ReciptoVerse DAO to shape the future of the ecosystem.",
    },
  ];

  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          The ReciptoVerse Lifecycle
        </h2>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-16">
          From a simple real-world purchase to a powerful digital asset, this is
          how value is created and flows through our ecosystem.
        </p>
        <div className="max-w-3xl mx-auto text-left">
          {steps.map((step, index) => (
            <Step
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisualInfographic;
