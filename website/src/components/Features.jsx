import React from "react";

const FeatureCard = ({ icon, title, children }) => (
  <div className="feature-card p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
    <div className="text-blue-400 mb-4 flex justify-center">{icon}</div>
    <h4 className="text-xl font-bold mb-2">{title}</h4>
    <p className="text-slate-400">{children}</p>
  </div>
);

const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold">
            From Paper Waste to Digital Assets
          </h3>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Your receipts are no longer just scraps of paper. They become the
            foundation for value creation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Receipt-NFTs (rNFTs)"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          >
            Every purchase is transformed into a unique digital asset on the
            blockchain, unlocking a world of possibilities.
          </FeatureCard>
          <FeatureCard
            title="Financial Opportunities"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01V5M12 20v-1m0 1v.01M12 18v-1m0-1v- .01M12 16v-1m0-1V14m0 2.01V15M21 12h-1m1 0h.01M20 12h-1m-1 0h-.01M4 12H3m1 0h.01M5 12H4m1 0h.01M12 21a9 9 0 110-18 9 9 0 010 18z"
                />
              </svg>
            }
          >
            Participate in loyalty programs, lending, and insurance solutions,
            all powered by your real spending data.
          </FeatureCard>
          <FeatureCard
            title="Merchant Friendly"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          >
            Reduce paper waste and gain valuable, privacy-preserving consumer
            insights to build better loyalty programs.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};

export default Features;
