import React from "react";
import { Link } from "react-router-dom";

const CommunityCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-cyan-500 to-blue-600">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Join the movement where every purchase counts.
        </h2>
        <p className="text-slate-200 text-lg mb-8 max-w-2xl mx-auto">
          Become part of a community that's building the future of commerce,
          rewards, and governance.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityCTA;
