import React from "react";
import { Layers, Database, Cpu, ShieldCheck } from "lucide-react";

const techItems = [
  {
    icon: Layers,
    category: "Frontend",
    stack: "Next.js, Tailwind CSS, Hedera Hashgraph JS SDK",
  },
  {
    icon: Cpu,
    category: "Backend",
    stack: "Node.js, NestJS, PostgreSQL, IPFS/Filecoin",
  },
  {
    icon: Database,
    category: "Blockchain",
    stack: "Hedera Hashgraph",
  },
  {
    icon: ShieldCheck,
    category: "Smart Contracts",
    stack: "Hedera Token Service (HTS), Solidity/Vyper for Custom Logic",
  },
];

const TechnologyStack = () => {
  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Our Technology Stack
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Built on a foundation of robust, scalable, and secure technologies
            to power the future of commerce.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techItems.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-cyan-500 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <item.icon className="text-cyan-400 mr-4" size={28} />
                <h3 className="text-xl font-bold text-white">
                  {item.category}
                </h3>
              </div>
              <p className="text-slate-400">{item.stack}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;
