import React from "react";

const HowItWorksHero = () => {
  return (
    <section className="relative py-32 text-center bg-slate-900/75 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          From Receipts to <span className="text-cyan-400">Rewards.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
          ReciptoVerse is designed to be a seamless experience for everyone in
          the ecosystem—users, merchants, and developers. Discover your role in
          the new economy.
        </p>
      </div>
    </section>
  );
};

export default HowItWorksHero;
