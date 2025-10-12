// "White Receipts" Page Sections
import WhiteReceiptsHero from "../components/whitePage/WhiteReceiptsHero";
import ExecutiveSummary from "../components/whitePage/ExecutiveSummary";
import ProblemSolution from "../components/whitePage/ProblemSolution";
import TokenomicsRoadmap from "../components/whitePage/TokenomicsRoadmap";
import WhiteReceiptsCTA from "../components/whitePage/WhiteReceiptsCTA";
import TechnologyStack from "../components/whitePage/TechnologyStack";
import SecurityEco from "../components/whitePage/SecurityEco";

const WhiteReceiptsPage = () => {
  return (
    <div className="font-inter">
      <main>
        <WhiteReceiptsHero />
        <ExecutiveSummary />
        <ProblemSolution />
        <TechnologyStack />
        <TokenomicsRoadmap />
        <SecurityEco />
        <WhiteReceiptsCTA />
      </main>
    </div>
  );
};

export default WhiteReceiptsPage;
