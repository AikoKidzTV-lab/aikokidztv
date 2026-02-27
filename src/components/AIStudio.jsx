import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import CharacterGallery from './CharacterGallery';
import StoryStudio from './StoryStudio';

const AIStudio = () => {
  return (
    <section id="ai-studio" className="py-24 relative scroll-mt-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-accent" /> AI Creative Studio
          </h2>
          <p className="text-gray-400">Generate stories, ideas, and content instantly.</p>
        </motion.div>

        <CharacterGallery />
        <StoryStudio />
      </div>
    </section>
  );
};

export default AIStudio;
