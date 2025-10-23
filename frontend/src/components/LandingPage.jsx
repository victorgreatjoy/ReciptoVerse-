import React from "react";
import { motion } from "framer-motion";
import { ShoppingBagIcon, UserIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const LandingPage = ({ onRoleSelect }) => {
  const navigate = useNavigate();
  const handleSelect = (role) => {
    if (onRoleSelect) return onRoleSelect(role);
    navigate(role === "merchant" ? "/auth/merchant" : "/auth/user");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            ReceiptoVerse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-purple-200"
          >
            Digital Receipts on Hedera Blockchain
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* User Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("user")}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 cursor-pointer border-2 border-white/20 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-purple-500/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">I'm a User</h2>
              <p className="text-purple-200 text-lg mb-6">
                View and manage your digital receipts, track your purchases, and
                export data for taxes.
              </p>
              <ul className="text-left text-purple-100 space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> View all your receipts
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Organize by merchant
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Export for accounting
                </li>
              </ul>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Continue as User
              </button>
            </div>
          </motion.div>

          {/* Merchant Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("merchant")}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 cursor-pointer border-2 border-white/20 hover:border-indigo-400 transition-all duration-300 shadow-xl hover:shadow-indigo-500/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <ShoppingBagIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                I'm a Merchant
              </h2>
              <p className="text-purple-200 text-lg mb-6">
                Issue digital receipts to your customers, manage your POS
                system, and go paperless.
              </p>
              <ul className="text-left text-purple-100 space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Issue digital receipts
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Manage POS system
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Track sales analytics
                </li>
              </ul>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Continue as Merchant
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-12 text-purple-200"
        >
          <p className="text-sm">
            Powered by Hedera Hashgraph • Secure • Fast • Eco-Friendly
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
