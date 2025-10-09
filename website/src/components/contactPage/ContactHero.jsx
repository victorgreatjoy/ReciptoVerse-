import React from "react";

const ContactHero = () => {
  return (
    <section className="relative py-32 text-center bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Get in <span className="text-cyan-400">Touch.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
          Have a question, partnership proposal, or just want to say hello? We’d
          love to hear from you.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
