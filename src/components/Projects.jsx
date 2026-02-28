import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, Youtube, Smartphone } from 'lucide-react';

const projects = [
  {
    title: "AikoKidzTV",
    category: "Media & Edutainment",
    description: "The flagship channel for AI-driven edutainment.",
    color: "from-pink-500 to-purple-500",
    badges: ["App Coming Soon to Play Store"],
    links: [
      { label: "YouTube", icon: Youtube, url: "#" },
      { label: "Instagram", icon: Instagram, url: "#" }
    ]
  },
  {
    title: "AikoKidz",
    category: "Coming Soon",
    description: "A holistic learning ecosystem designed to nurture creativity and curiosity in children.",
    color: "from-blue-500 to-cyan-500",
    badges: []
  },
  {
    title: "AikoTeenz",
    category: "Coming Soon",
    description: "Future-ready innovation hub for teenagers, focusing on tech, law, and life skills.",
    color: "from-emerald-500 to-green-500",
    badges: []
  }
];

const Projects = () => {
  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A showcase of what happens when creativity meets computational power.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors duration-300 flex flex-col h-full"
            >
              <div className={`h-2 bg-gradient-to-r ${project.color}`} />
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500 block">{project.category}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                
                {project.badges.map((badge, idx) => (
                    <span key={idx} className="inline-block bg-accent/10 text-accent text-[10px] px-2 py-1 rounded mb-4 w-fit border border-accent/20">
                      {badge}
                    </span>
                ))}

                <p className="text-gray-400 mb-6 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex gap-3 flex-wrap mt-auto">
                  {project.links && project.links.map((link, idx) => (
                    <button key={idx} className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-white">
                      <link.icon size={14} /> {link.label}
                    </button>
                  ))}
                  {(!project.links || project.links.length === 0) && (
                     <button className="flex items-center gap-2 text-sm text-gray-500 cursor-not-allowed">
                       Coming Soon
                     </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold">Upcoming Adventures</h3>
            <p className="mt-2 text-gray-400">
              A quick look at the next chapter of the Aiko universe.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-white/20 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-fuchsia-500/20 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-200">Future Roadmap</p>
              <h4 className="mt-2 text-2xl font-bold">AikoKidz</h4>
              <p className="mt-3 text-gray-200">
                The ultimate upcoming ecosystem for children&apos;s learning, premium toys, and interactive growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl border border-white/20 bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-cyan-500/20 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Future Roadmap</p>
              <h4 className="mt-2 text-2xl font-bold">AikoTeenz</h4>
              <p className="mt-3 text-gray-200">
                Coming Soon! A safe, engaging, and creative digital space designed specifically for teenagers to explore, learn, and express themselves.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5 text-sm leading-relaxed text-amber-100 shadow-md"
          >
            © Official Notice: AikoKidz, AikoKidzTV, and AikoTeenz are exclusive trademarks and fully copyrighted properties. All original brand concepts, names, and ecosystem designs belong entirely to our brand. All rights reserved.
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
