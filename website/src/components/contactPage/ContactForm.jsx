import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  User,
  Mail,
  MessageSquare,
  Briefcase,
  Phone,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const ContactForm = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', or null

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    // Replace with your actual EmailJS Service ID, Template ID, and Public Key
    const serviceID = "service_shsdg7w";
    const templateID = "template_g5zxqax";
    const publicKey = "N98qGTzaV3AEu4Jf0";

    emailjs
      .sendForm(serviceID, templateID, form.current, publicKey)
      .then(
        (result) => {
          console.log(result.text);
          setSubmissionStatus("success");
          form.current.reset();
        },
        (error) => {
          console.log(error.text);
          setSubmissionStatus("error");
        }
      )
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Send a Message</h2>
      <p className="text-slate-400 mb-6">
        Fill out the form below and we'll get back to you.
      </p>

      {submissionStatus === "success" && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg flex items-center">
          <CheckCircle className="mr-3" />
          <span>Your message has been sent successfully!</span>
        </div>
      )}
      {submissionStatus === "error" && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg flex items-center">
          <AlertTriangle className="mr-3" />
          <span>Something went wrong. Please try again.</span>
        </div>
      )}

      <form ref={form} onSubmit={sendEmail} className="space-y-4">
        {/* Name Input */}
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            name="user_name"
            placeholder="Full Name"
            required
            className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        {/* Email Input */}
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="email"
            name="user_email"
            placeholder="Email Address"
            required
            className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        {/* Message Type Select */}
        <div className="relative">
          <Briefcase
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <select
            name="message_type"
            required
            className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          >
            <option value="" disabled selected>
              Select Inquiry Type
            </option>
            <option value="General">General</option>
            <option value="Partnership">Partnership</option>
            <option value="Merchant">Merchant</option>
            <option value="Developer">Developer</option>
          </select>
        </div>

        {/* Message Textarea */}
        <div className="relative">
          <MessageSquare
            className="absolute left-3 top-4 text-slate-400"
            size={20}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows="5"
            className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
