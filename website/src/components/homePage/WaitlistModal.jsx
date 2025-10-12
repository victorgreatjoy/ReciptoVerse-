import React, { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  X,
  Mail,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  Phone,
} from "lucide-react";

const WaitlistModal = ({ isOpen, onClose }) => {
  const form = useRef();
  const [status, setStatus] = useState("idle"); // 'idle', 'sending', 'success', 'error'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");

    // --- REPLACE WITH YOUR EMAILJS KEYS ---
    const serviceID = "service_shsdg7w";
    const templateID = "template_wdfkhyk";
    const publicKey = "N98qGTzaV3AEu4Jf0";
    // ------------------------------------

    emailjs.sendForm(serviceID, templateID, form.current, publicKey).then(
      (result) => {
        console.log(result.text);
        setStatus("success");
      },
      (error) => {
        console.log(error.text);
        setStatus("error");
      }
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={status === "sending" ? undefined : onClose} // Prevent closing while sending
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 ease-in-out scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={status === "sending"}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="inline-block p-3 bg-slate-800 rounded-full mb-4">
            {status === "success" ? (
              <CheckCircle className="text-green-400" size={32} />
            ) : (
              <Mail className="text-cyan-400" size={32} />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {status === "success" ? "You're on the list!" : "Join the Waitlist"}
          </h2>
          <p className="text-slate-400 mb-6">
            {status === "success"
              ? "Thank you for signing up! We'll notify you as soon as we launch."
              : "Be the first to know when ReciptoVerse launches. Get exclusive updates, early access, and more."}
          </p>
        </div>

        {status !== "success" && (
          <form ref={form} onSubmit={handleSubmit} className="space-y-4">
            {/* --- Name Input --- */}
            <div className="relative">
              <input
                type="text"
                name="user_name" // Matches {{user_name}} in template
                placeholder="Enter your name"
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 pl-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
            </div>

            {/* --- Email Input --- */}
            <div className="relative">
              <input
                type="email"
                name="user_email" // Matches {{user_email}} in template
                placeholder="Enter your email address"
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 pl-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
            </div>

            {/* --- Phone Input --- */}
            <div className="relative">
              <input
                type="tel"
                name="user_phone" // Matches {{user_phone}} in template
                placeholder="Enter your phone number"
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 pl-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-cyan-500 text-white font-bold px-6 py-4 rounded-lg hover:bg-cyan-600 transition-all duration-300 text-lg flex items-center justify-center disabled:bg-cyan-800"
            >
              {status === "sending" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Get Notified"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="mt-4 text-center p-3 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle size={20} className="mr-2" />
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistModal;
