// "How It Works" Page Sections
import HowItWorksHero from "../components/howItWorksPage/HowItWorksHero";
import AudienceTabs from "../components/howItWorksPage/AudienceTabs";
import StakingOverview from "../components/howItWorksPage/StakingOverview";
import HowItWorksCTA from "../components/howItWorksPage/HowItWorksCTA";
import VisualInfographic from "../components/howItWorksPage/VisualInfographic";

const HowItWorksPage = () => {
  return (
    <div className="font-inter">
      <main>
        <HowItWorksHero />
        <AudienceTabs />
        <VisualInfographic />
        <StakingOverview />
        <HowItWorksCTA />
      </main>
    </div>
  );
};

export default HowItWorksPage;
