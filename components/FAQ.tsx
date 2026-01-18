
import React, { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl text-center mb-12 text-zinc-900 dark:text-white">Common Questions</h2>
        <div className="space-y-4">
          {items.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{faq.q}</span>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform text-zinc-400 ${openIndex === i ? 'rotate-180' : ''}`}></i>
              </button>
              {openIndex === i && (
                <div className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-sm border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
