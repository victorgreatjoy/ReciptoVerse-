import ContactForm from "../components/contactPage/ContactForm";
import ContactInfo from "../components/contactPage/ContactInfo";

const ContactPage = () => {
  return (
    <div className="font-inter">
      <main className="relative overflow-hidden">
        {/* Cool Background Effects */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900/60 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900/60 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.3),rgba(255,255,255,0))]"></div>

        <div className="container mx-auto px-6 py-20 sm:py-24 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              We’re pioneering the future of digital transactions through a
              smart receipt Web3 infrastructure, designed to power a
              transparent, connected, and intelligent ecosystem. Whether you’re
              a user, developer, or strategic partner, join us in shaping the
              next generation of digital receipts and redefining how the world
              experiences transaction data.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Contact Details */}
            <div className="lg:pr-8">
              <ContactInfo />
            </div>

            {/* Right Column: Contact Form */}
            <div className="w-full h-full p-8 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
