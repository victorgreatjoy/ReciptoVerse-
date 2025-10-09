import React from "react";

// Main Page Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// "White Receipts" Page Sections
import WhiteReceiptsHero from "../components/whitePage/WhiteReceiptsHero";
import ExecutiveSummary from "../components/whitePage/ExecutiveSummary";
import ProblemSolution from "../components/whitePage/ProblemSolution";
import TokenomicsRoadmap from "../components/whitePage/TokenomicsRoadmap";
import WhiteReceiptsCTA from "../components/whitePage/WhiteReceiptsCTA";

const WhiteReceiptsPage = () => {
  return (
    <div className="bg-slate-900 font-inter">
      <Header />
      <main>
        <WhiteReceiptsHero />
        <ExecutiveSummary />
        <ProblemSolution />
        <TokenomicsRoadmap />
        {/* Eco Impact Ledger could be added here */}
        <WhiteReceiptsCTA />
      </main>
      <Footer />
    </div>
  );
};

export default WhiteReceiptsPage;
