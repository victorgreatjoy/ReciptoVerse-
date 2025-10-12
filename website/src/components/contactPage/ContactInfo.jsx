import React from "react";
import { Mail, Send } from "lucide-react";

// A simple SVG for the X logo
const XLogo = () => (
  <svg
    viewBox="0 0 1200 1227"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-white"
  >
    <path
      d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6904H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"
      fill="currentColor"
    />
  </svg>
);

const ContactInfo = () => {
  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-4">Get in Touch Directly</h2>
      <p className="text-slate-400 mb-8 max-w-lg">
        Have a question, a partnership proposal, or want to join our ecosystem?
        We'd love to hear from you. Reach out through our official channels.
      </p>

      <div className="space-y-6">
        <div className="flex items-start p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <Mail size={24} className="text-cyan-400 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">General & Partner Inquiries</h3>
            <a
              href="mailto:receiptoverse@gmail.com"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              receiptoverse@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-start p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <Send size={24} className="text-cyan-400 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Join the Conversation</h3>
            <a
              href="https://twitter.com/receiptoverse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <XLogo />
              @receiptoverse
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
        <h3 className="text-xl font-bold text-white mb-2">
          Build the Future of Commerce
        </h3>
        <p className="text-slate-300">
          We are actively seeking innovative partners. If you're building in the
          Web3 space and see a potential for synergy, let's connect and explore
          the possibilities.
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
