import React from "react";
import { Link } from "react-router-dom";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-5xl font-bold text-blue-400 mb-4">
        Welcome to the ReceiptoVerse App!
      </h1>
      <p className="text-xl text-slate-300 mb-8">
        This is where your user dashboard will be.
      </p>
      <p className="text-slate-400 mb-8">
        Authentication and app logic will be implemented here.
      </p>
      <Link
        to="/"
        className="cta-button bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full"
      >
        Go Back to Home
      </Link>
    </div>
  );
}

export default DashboardPage;
