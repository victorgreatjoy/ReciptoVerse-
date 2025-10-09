import React from "react";
import { ShoppingCart, FileText, BarChart } from "lucide-react";

const Explainer = () => {
  const steps = [
    {
      icon: <ShoppingCart size={40} className="mb-4 text-cyan-400" />,
      title: "Shop Anywhere",
      description:
        "Make purchases at your favorite stores, online or in-person, just as you always do.",
    },
    {
      icon: <FileText size={40} className="mb-4 text-cyan-400" />,
      title: "Collect rNFTs",
      description:
        "Receive a digital receipt-NFT (rNFT) for every purchase, turning waste into a digital asset.",
    },
    {
      icon: <BarChart size={40} className="mb-4 text-cyan-400" />,
      title: "Stake & Earn",
      description:
        "Stake your collected rNFTs and $RVT tokens to earn rewards and participate in governance.",
    },
  ];

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12 text-white">
          Your Receipts, Reinvented in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2"
            >
              {step.icon}
              <h3 className="text-2xl font-semibold mb-3 text-white">
                {step.title}
              </h3>
              <p className="text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Explainer;
