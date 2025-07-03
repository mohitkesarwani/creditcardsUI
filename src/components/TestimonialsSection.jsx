import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah K.',
    rating: 5,
    quote: 'RewardRadar helped me quickly find the best credit card for my lifestyle.',
  },
  {
    name: 'Liam P.',
    rating: 4,
    quote: 'The comparison tools are simple yet powerful. Highly recommend.',
  },
  {
    name: 'Olivia R.',
    rating: 5,
    quote: 'I love how transparent the information is. No hidden agendas!',
  },
];

function StarRating({ count }) {
  return (
    <div className="flex justify-center mb-2">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.386-2.459a1 1 0 00-1.176 0l-3.386 2.46c-.784.57-1.838-.197-1.539-1.119l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow text-center"
          >
            <p className="mb-4 italic">"{testimonials[index].quote}"</p>
            <StarRating count={testimonials[index].rating} />
            <p className="font-semibold">{testimonials[index].name}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default TestimonialsSection;
