import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm uppercase tracking-[0.2em] text-accent mb-4">The Visionary & The Machine</h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            AikoKidzTV <br/> <span className="text-gray-400 text-3xl md:text-5xl">AI Adventures for Kids</span>
          </h1>
          <p className="text-xl md:text-2xl text-accent/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
            Dedicated to revolutionizing child education. We are bridging the gap between creativity and awareness by introducing Junior Law subjects in our upcoming app. Empowering the next generation with knowledge of their rights, safety, and legal basics in a fun, interactive way.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 mt-12">
            {/* Icons removed as requested, keeping it text-centric and stylish */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
