import React from "react";

const CheckListItem = ({ children }) => (
  <li className="flex items-start">
    <svg
      className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
    <span>{children}</span>
  </li>
);

const TokenSection = () => {
  return (
    <section id="token" className="py-20 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://placehold.co/500x500/1e293b/ffffff?text=%24RECV+Token"
              alt="Token illustration"
              className="rounded-full shadow-2xl mx-auto"
            />
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              The <span className="text-blue-400">$RECV</span> Token & DAO
            </h3>
            <p className="text-slate-300 mb-6 text-lg">
              The $RECV token is the heart of the ReciptoVerse ecosystem.
              Holding $RECV grants you governance rights in our DAO, allowing
              you to shape the future of the platform.
            </p>
            <ul className="space-y-4 text-slate-300">
              <CheckListItem>
                <strong className="font-semibold text-white">
                  Shape the Future:
                </strong>{" "}
                Vote on proposals for loyalty programs, new financial products,
                and platform development.
              </CheckListItem>
              <CheckListItem>
                <strong className="font-semibold text-white">
                  Community-Owned:
                </strong>{" "}
                Be part of a participatory economy where value is created and
                shared by the community.
              </CheckListItem>
              <CheckListItem>
                <strong className="font-semibold text-white">
                  Fuel the Ecosystem:
                </strong>{" "}
                The token underpins all transactions and rewards within
                ReciptoVerse.
              </CheckListItem>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenSection;
