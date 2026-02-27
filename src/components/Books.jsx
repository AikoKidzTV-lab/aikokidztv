import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart } from 'lucide-react';

const books = [
  {
    title: "7 Ways to Know Human Nature",
    description: "A deep dive into understanding the complexities of human behavior.",
    imageColor: "from-amber-700 to-orange-900" 
  },
  {
    title: "Luna and The Lost Starlight",
    description: "An enchanting tale woven with imagination and heart.",
    imageColor: "from-indigo-900 to-blue-900"
  },
  {
    title: "Kinu's Big Birthday Surprise",
    description: "A fun-filled adventure about friendship and surprises.",
    imageColor: "from-pink-600 to-rose-800"
  },
  {
    title: "Happy Family of Kinu and Mimi",
    description: "Heartwarming stories about family bonds and love.",
    imageColor: "from-green-600 to-teal-800"
  },
  {
    title: "The Glow Bubble Journey",
    description: "A magical journey through a world of glowing bubbles.",
    imageColor: "from-purple-600 to-violet-800"
  }
];

const Books = () => {
  return (
    <section id="books" className="py-24 relative overflow-hidden" style={{ color: 'var(--text-primary)' }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-pink-200/60 to-transparent dark:via-slate-700" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Published Books</h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Words that inspire, stories that connect.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {books.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:border-pink-300/70 transition-all duration-300 group h-full shadow-lg"
            >
              <div className={`h-40 w-full bg-gradient-to-br ${book.imageColor} flex items-center justify-center relative overflow-hidden`}>
                <BookOpen className="text-white/30 w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-500 transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                <p className="text-sm mb-6 flex-grow" style={{ color: 'var(--text-secondary)' }}>{book.description}</p>
                <button className="w-full mt-auto py-2 px-4 bg-white/15 dark:bg-black/25 border border-white/25 text-[var(--text-primary)] hover:bg-white/25 dark:hover:bg-black/35 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(249,168,212,0.35)]">
                  <ShoppingCart size={16} /> Buy on Amazon
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Books;
