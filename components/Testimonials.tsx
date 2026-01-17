
import React from 'react';

interface TestimonialsProps {
  reviews: Array<{name: string, location: string, text: string, stars: number}>;
}

const Testimonials: React.FC<TestimonialsProps> = ({ reviews }) => {
  return (
    <section className="py-24 bg-white dark:bg-black px-4 overflow-hidden transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-5xl mb-4 text-zinc-900 dark:text-white">Trusted By 4,500+</h2>
            <p className="text-zinc-500">Ambitious Nigerians who value style and punctuality.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative shadow-sm">
              <i className="fa-solid fa-quote-left absolute top-4 right-6 text-zinc-200 dark:text-zinc-800 text-4xl"></i>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star gold-text text-[10px]"></i>)}
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 mb-6 relative z-10 font-light italic">"{review.text}"</p>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{review.name}</p>
                <p className="text-xs text-zinc-500">{review.location}, Nigeria</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
