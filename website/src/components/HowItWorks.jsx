import React from "react";

const Step = ({ number, title, children }) => (
  <div className="flex items-center flex-col text-center max-w-xs">
    <div className="relative mb-4">
      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
        {number}
      </div>
    </div>
    <h4 className="text-lg font-semibold mb-1">{title}</h4>
    <p className="text-slate-400">{children}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold">
            Simple Steps to a New Economy
          </h3>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Start building your digital asset portfolio with every purchase.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          <Step number="1" title="Make a Purchase">
            Shop at any participating store, POS, or use a ReciptoVerse
            terminal.
          </Step>
          <Step number="2" title="Mint your rNFT">
            Scan a QR code or tap your device to instantly mint your receipt
            into an NFT.
          </Step>
          <Step number="3" title="Unlock & Engage">
            Use your rNFTs for rewards, education, gaming, and governance in the
            ecosystem.
          </Step>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
