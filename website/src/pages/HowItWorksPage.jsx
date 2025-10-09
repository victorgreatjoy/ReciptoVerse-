import React from "react";

// Main Page Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// "How It Works" Page Sections
import HowItWorksHero from "../components/howItWorksPage/HowItWorksHero";
import AudienceTabs from "../components/howItWorksPage/AudienceTabs";
import StakingOverview from "../components/howItWorksPage/StakingOverview";
import HowItWorksCTA from "../components/howItWorksPage/HowItWorksCTA";

const HowItWorksPage = () => {
  return (
    <div className="bg-slate-900 font-inter">
      <Header />
      <main>
        <HowItWorksHero />
        <AudienceTabs />
        <StakingOverview />
        {/* Visual Infographic would go here */}
        <HowItWorksCTA />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
