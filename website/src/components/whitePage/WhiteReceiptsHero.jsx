import React from "react";

const WhiteReceiptsHero = () => {
  return (
    <section className="relative py-32 text-center bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          White <span className="text-cyan-400">Receipts.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
          Delve into the technical and economic foundations of the ReciptoVerse.
          Here is the blueprint for the future of commerce and value creation.
        </p>
      </div>
    </section>
  );
};

export default WhiteReceiptsHero;
