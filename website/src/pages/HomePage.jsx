import React from "react";

// Main Page Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// Home Page Sections
import Hero from "../components/Hero";
import Explainer from "../components/Explainer";
import Benefits from "../components/Benefits";
import VisualDemo from "../components/VisualDemo";
import TokenomicsSnapshot from "../components/TokenomicsSnapshot";
import CommunityCTA from "../components/CommunityCTA";

const HomePage = () => {
  return (
    <div className="bg-slate-900 font-inter">
      <Header />
      <main>
        <Hero />
        <Explainer />
        <Benefits />
        <VisualDemo />
        <TokenomicsSnapshot />
        <CommunityCTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
