
import React from 'react';

interface ProductShowcaseProps {
  specs: Array<{icon: string, label: string, value: string}>;
  media: {
    mainImage: string;
    sideImage1: string;
    sideImage2: string;
    productVideo?: string;
  };
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ specs, media }) => {
  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.startsWith('data:video') || 
           url.startsWith('blob:video') ||
           url.toLowerCase().includes('.mp4') || 
           url.toLowerCase().includes('.mov') || 
           url.toLowerCase().includes('.webm') ||
           url.toLowerCase().includes('.ogg');
  };

  const MediaElement: React.FC<{ url: string, className: string, isMain?: boolean }> = ({ url, className, isMain }) => {
    if (!url) return null;
    
    if (isVideo(url)) {
      return (
        <video 
          key={url}
          src={url} 
          className={className} 
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
          {...(isMain ? { controls: true } : {})}
        />
      );
    }
    return <img src={url} alt="Product view" className={className} loading="lazy" />;
  };

  // Determine what shows in the primary slot (Large)
  const primaryMedia = media.productVideo || media.mainImage;

  return (
    <section className="py-24 bg-white dark:bg-black px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl mb-4 text-zinc-900 dark:text-white uppercase tracking-widest">Masterpiece Engineering</h2>
          <div className="h-1 w-24 gold-bg mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center min-h-[320px] shadow-lg">
              <MediaElement url={primaryMedia} className="w-full h-[400px] object-cover" isMain={true} />
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
              <MediaElement url={media.sideImage1} className="w-full h-44 object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
              <MediaElement url={media.sideImage2} className="w-full h-44 object-cover" />
            </div>
          </div>

          <div className="animate-reveal-up stagger-3">
            <h3 className="text-2xl font-serif mb-6 gold-text uppercase tracking-[0.2em]">The Novari Elite Gen 3</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed font-light">
              Crafted for those who value every second and the prestige that comes with it. Every element is designed to command attention and endure for generations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <i className={`fa-solid ${spec.icon} gold-text text-sm`}></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">{spec.label}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-0.5">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
