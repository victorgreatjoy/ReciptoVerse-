import React, { useState } from "react";
import { Twitter, Linkedin, MessageSquare, Send } from "lucide-react"; // Using MessageSquare for Telegram/Discord vibe

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    messageType: "General",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Sending...");
    // In a real app, you would integrate with an email service like EmailJS, Formspree, or a custom backend.
    console.log("Form data submitted:", formData);
    setTimeout(() => {
      setStatus("Your message has been sent!");
      setFormData({ name: "", email: "", messageType: "General", message: "" });
    }, 1500);
  };

  return (
    <section className="py-20 bg-slate-800 text-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700">
            <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label
                  htmlFor="messageType"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Message Type
                </label>
                <select
                  id="messageType"
                  name="messageType"
                  value={formData.messageType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 transition"
                >
                  <option>General</option>
                  <option>Partnership</option>
                  <option>Merchant</option>
                  <option>Developer</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 transition"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-cyan-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 w-full inline-flex items-center justify-center"
                >
                  <Send className="mr-2" size={20} />
                  Send Message
                </button>
              </div>
              {status && (
                <p className="text-center text-slate-300 mt-4">{status}</p>
              )}
            </form>
          </div>
          {/* Info & Socials */}
          <div className="pt-8">
            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
            <p className="text-slate-300 mb-6">
              Email us directly or connect with our community on social media.
            </p>
            <div className="mb-8">
              <span className="font-semibold">Email:</span>
              <a
                href="mailto:info@reciptoverse.io"
                className="text-cyan-400 ml-2 hover:underline"
              >
                info@reciptoverse.io
              </a>
            </div>

            <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-3 bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                className="p-3 bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors"
              >
                <MessageSquare size={24} />
              </a>
              <a
                href="#"
                className="p-3 bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors"
              >
                <MessageSquare size={24} />
              </a>
              <a
                href="#"
                className="p-3 bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors"
              >
                <Linkedin size={24} />
              </a>
            </div>
            <div className="mt-12 bg-slate-900/50 p-6 rounded-lg border border-cyan-500/30">
              <h4 className="font-bold text-xl text-cyan-400 mb-2">
                Partnership Inquiry
              </h4>
              <p className="text-slate-300">
                'Join the ecosystem and build the commerce of the future.'
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
