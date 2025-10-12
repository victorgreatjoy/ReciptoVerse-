// About Page Sections
import AboutHero from "../components/aboutPage/AboutHero";
import Pillars from "../components/aboutPage/Pillars";
import DaoPhilosophy from "../components/aboutPage/DaoPhilosophy";
import Team from "../components/aboutPage/Team";
import AboutCTA from "../components/aboutPage/AboutCTA";

const AboutPage = () => {
  return (
    <div className="font-inter">
      <main>
        <AboutHero />
        <Pillars />
        <DaoPhilosophy />
        <Team />
        <AboutCTA />
      </main>
    </div>
  );
};

export default AboutPage;
