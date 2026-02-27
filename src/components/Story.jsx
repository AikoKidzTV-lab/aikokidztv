import React from 'react';
import { motion } from 'framer-motion';

const timelineEvents = [
  {
    year: "The Beginning",
    title: "Spark of AikoKidzTV",
    description: "When the idea of making AI-powered stories safe and playful for kids first lit up."
  },
  {
    year: "First Project",
    title: "The First Animated Story",
    description: "We built a tiny AI puppet show, and kids loved the colors, voices, and giggles."
  }
];

const Story = () => {
  return (
    <section id="story" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {timelineEvents.map((event, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col md:flex-row gap-8 mb-12 items-center"
            >
              <div className={`flex-1 text-center md:text-right ${index % 2 !== 0 ? 'md:order-last md:text-left' : ''}`}>
                <h3 className="text-accent font-bold text-xl mb-1">{event.year}</h3>
                <h4 className="text-2xl font-semibold mb-2">{event.title}</h4>
              </div>
              
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 bg-accent rounded-full z-10 shadow-[0_0_10px_rgba(0,255,204,0.5)]" />
                <div className="absolute w-px h-full bg-white/10 top-0 bottom-0" />
              </div>

              <div className={`flex-1 text-center md:text-left ${index % 2 !== 0 ? 'md:order-first md:text-right' : ''}`}>
                <p className="text-gray-400">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Story;
