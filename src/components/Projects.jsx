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

        <div className="mx-auto max-w-3xl grid grid-cols-1 gap-8">
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
                  <span className="text-xs uppercase tracking-wider text-slate-700 block">{project.category}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 text-slate-900 group-hover:text-accent transition-colors">{project.title}</h3>
                
                {project.badges.map((badge, idx) => (
                    <span key={idx} className="inline-block bg-accent/10 text-accent text-[10px] px-2 py-1 rounded mb-4 w-fit border border-accent/20">
                      {badge}
                    </span>
                ))}

                <p className="text-slate-800 mb-6 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex gap-3 flex-wrap mt-auto">
                  {project.links && project.links.map((link, idx) => (
                    <button key={idx} className="flex items-center gap-2 text-xs bg-white/70 hover:bg-white px-3 py-2 rounded-lg transition-colors text-slate-800 border border-slate-200">
                      <link.icon size={14} /> {link.label}
                    </button>
                  ))}
                  {(!project.links || project.links.length === 0) && (
                     <button className="flex items-center gap-2 text-sm text-slate-700 cursor-not-allowed">
                       Coming Soon
                     </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
