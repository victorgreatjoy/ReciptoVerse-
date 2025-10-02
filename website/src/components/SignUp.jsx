import React from "react";

const SignUp = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // In the future, you'll add logic here to handle form submission,
    // like calling an authentication service.
    alert("Sign up functionality will be implemented here!");
  };

  return (
    <section id="signup" className="py-20 hero-gradient">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Join the Revolution
        </h3>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          Create your account today and start turning your everyday transactions
          into the beginning of value creation. Your first rNFT is just a
          purchase away.
        </p>
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Your Email Address"
              className="bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Create Password"
              className="bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="cta-button bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              Create My Account
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
