import React from "react";

// Main Page Components
import Header from "../components/Header";
import Footer from "../components/Footer";

// "Contact" Page Sections
import ContactHero from "../components/contactPage/ContactHero";
import ContactForm from "../components/contactPage/ContactForm";

const ContactPage = () => {
  return (
    <div className="bg-slate-900 font-inter">
      <Header />
      <main>
        <ContactHero />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
