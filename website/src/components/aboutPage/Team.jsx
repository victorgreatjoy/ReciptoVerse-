import React from "react";

const Team = () => {
  const teamMembers = [
    { name: "Alex Chen", title: "Founder & CEO" },
    { name: "Brenda Smith", title: "Lead Blockchain Dev" },
    { name: "Carlos Diaz", title: "Head of Product" },
  ];

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">
            Meet the Team & Partners
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            The dedicated individuals and partners building the future of
            commerce.
          </p>
        </div>
        <div className="flex justify-center flex-wrap gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 w-64 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-cyan-400">{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
