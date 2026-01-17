
import React from 'react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      title: "Boost Your Confidence",
      desc: "Nothing says 'I have arrived' like a Novari timepiece. Feel the surge of confidence when you check the time or shake a business partner's hand.",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Perfect For Every Occasion",
      desc: "Whether you're wearing an Agbada for a traditional wedding or a bespoke suit for a corporate presentation, the Novari fits perfectly with your lifestyle.",
      img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Built For The Long Run",
      desc: "Made with industrial-grade 316L stainless steel. It won't rust, it won't fade, and it won't let you down. A legacy piece for years to come.",
      img: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl mb-4 text-zinc-900 dark:text-white uppercase tracking-widest">More Than Just A Watch</h2>
          <p className="text-zinc-500 uppercase tracking-widest text-sm">It's a statement of ambition.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:border-gold transition-all shadow-sm">
              <div className="h-48 overflow-hidden">
                <img src={benefit.img} alt={benefit.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-serif mb-4 gold-text uppercase tracking-wide">{benefit.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
