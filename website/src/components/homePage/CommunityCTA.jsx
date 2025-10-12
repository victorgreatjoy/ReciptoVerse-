import React from "react";
import { ArrowRight } from "lucide-react";

const CommunityCTA = ({ onJoinWaitlist }) => {
  // Accept onJoinWaitlist as a prop
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Join the movement where every purchase counts.
        </h2>
        <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
          Be part of a community-driven ecosystem that redefines the value of
          everyday transactions. Get early access, exclusive rewards, and a say
          in our future.
        </p>
        <div className="mt-8">
          <button
            onClick={onJoinWaitlist} // Use the passed-in function here
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            Join Waitlist <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunityCTA;
