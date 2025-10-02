import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Ecosystem from "../components/Ecosystem";
import TokenSection from "../components/TokenSection";
import SignUp from "../components/SignUp";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="bg-slate-900 text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Ecosystem />
        <TokenSection />
        <SignUp />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
