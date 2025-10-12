import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import AnimatedBackground from "./AnimatedBackground";

const MainLayout = ({ children }) => {
  return (
    <div className="bg-slate-900 font-inter relative">
      <AnimatedBackground />
      <div className="relative z-20">
        <Header />
        <main>
          {children} {/* Page-specific content will be rendered here */}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
