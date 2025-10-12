// Home Page Sections
import Hero from "../components/homePage/Hero";
import Explainer from "../components/homePage/Explainer";
import Benefits from "../components/homePage/Benefits";
import VisualDemo from "../components/homePage/VisualDemo";
import TokenomicsSnapshot from "../components/homePage/TokenomicsSnapshot";
import CommunityCTA from "../components/homePage/CommunityCTA";
import WaitlistModal from "../components/homePage/WaitlistModal";

import { useState } from "react";

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-inter relative">
      {/* New Animated Background is placed here */}

      {/* The content is placed on top of the background */}
      <div className="relative z-20">
        <main>
          <Hero onJoinWaitlist={() => setIsModalOpen(true)} />
          <Explainer />
          <Benefits />
          <VisualDemo />
          <TokenomicsSnapshot />
          <CommunityCTA onJoinWaitlist={() => setIsModalOpen(true)} />
        </main>
      </div>

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
