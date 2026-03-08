import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube } from 'lucide-react';

const projects = [
  {
    title: 'AikoKidzTV',
    category: 'Media & Edutainment',
    description: 'The flagship channel for AI-driven edutainment.',
    color: 'from-pink-500 to-purple-500',
    badges: ['App Coming Soon to Play Store'],
    links: [
      { label: 'YouTube', icon: Youtube, url: '#' },
      { label: 'Instagram', icon: Instagram, url: '#' },
    ],
  },
];

const Projects = () => {
  return (
    <section
      id="projects"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#e0f2fe_24%,_#fce7f3_58%,_#fef3c7_100%)] px-4 py-12 text-slate-900"
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/80 bg-white/68 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-2xl sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="inline-flex rounded-full border border-white/80 bg-white/72 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-xl">
              Featured Work
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-4xl">Featured Projects</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-700">
              A showcase of what happens when creativity meets computational power.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/75 bg-white/72 shadow-[0_14px_36px_rgba(15,23,42,0.1)] backdrop-blur-xl transition-colors duration-300"
              >
                <div className={`h-2 bg-gradient-to-r ${project.color}`} />
                <div className="flex flex-col p-8">
                  <div className="mb-4 flex justify-between gap-3">
                    <span className="block text-xs uppercase tracking-wider text-slate-600">{project.category}</span>
                  </div>

                  <h3 className="mb-2 text-2xl font-black text-slate-900">{project.title}</h3>

                  {project.badges.map((badge) => (
                    <span
                      key={badge}
                      className="mb-4 inline-block w-fit rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur-xl"
                    >
                      {badge}
                    </span>
                  ))}

                  <p className="mb-6 text-slate-700">{project.description}</p>

                  <div className="mt-auto flex flex-wrap gap-3">
                    {project.links && project.links.length > 0 ? (
                      project.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-xl transition hover:bg-white"
                        >
                          <link.icon size={14} /> {link.label}
                        </a>
                      ))
                    ) : (
                      <button className="cursor-not-allowed text-sm text-slate-600">Coming Soon</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
