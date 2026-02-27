import React from 'react';
import { motion } from 'framer-motion';

const techs = ["React", "Tailwind CSS", "Framer Motion", "Vite", "Node.js", "AI Integration"];

const TechStack = () => {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl text-gray-500 mb-8 uppercase tracking-widest">Powered By</h3>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {techs.map((tech, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 font-mono text-sm hover:border-accent/30 hover:bg-accent/5 transition-all cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
