import React from "react";

const AboutHero = () => {
  return (
    <section className="relative py-32 text-center bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Redefining the Value of{" "}
          <span className="text-cyan-400">Every Receipt.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
          Our mission is to transform everyday receipts from discarded scraps of
          paper into valuable digital assets. We're building an ecosystem where
          real-world spending meets Web3 rewards, giving power and ownership
          back to consumers and merchants.
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
