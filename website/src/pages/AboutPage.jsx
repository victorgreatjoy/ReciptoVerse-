import React from "react";

// Main Page Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// About Page Sections
import AboutHero from "../components/aboutPage/AboutHero";
import Pillars from "../components/aboutPage/Pillars";
import DaoPhilosophy from "../components/aboutPage/DaoPhilosophy";
import Team from "../components/aboutPage/Team";
import AboutCTA from "../components/aboutPage/AboutCTA";

const AboutPage = () => {
  return (
    <div className="bg-slate-900 font-inter">
      <Header />
      <main>
        <AboutHero />
        <Pillars />
        <DaoPhilosophy />
        <Team />
        <AboutCTA />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
