import React from 'react';
import Image from 'next/image';

export default function OurStoryPage() {
  return (
    <main className="w-[96%] md:-w-[80%] mx-auto bg-white text-zinc-900 min-h-screen">
      {/* Editorial Header */}
      <section className="px-2 pt-15 pb-16 text-center">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Manifesto</span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight mt-4 mb-6">
          The fine line between <br /> curation and immediacy.
        </h1>
        <p className="text-zinc-400 font-serif italic text-lg max-w-xl mx-auto">
          "Why should exceptional style require days of anticipation?"
        </p>
      </section>

      {/* Large Statement Image */}
      <section className="max-w-6xl mx-auto px-2 mb-20">
        <div className="relative h-[60vh] w-full bg-zinc-100 overflow-hidden rounded-sm">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
            alt="Tarnix design house curation process"
            fill
            className="object-cover brightness-95"
            sizes="100vw"
            priority
          />
        </div>
      </section>

      {/* Two Column Narrative Grid */}
      <section className="max-w-5xl mx-auto px-2 grid grid-cols-1 md:grid-cols-12 gap-12 pb-24">
        {/* Left Column: Sticky Timeline Markers or Year */}
        <div className="md:col-span-4 md:sticky md:top-24 h-fit space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Established 2026</p>
          <h2 className="text-2xl font-light tracking-tight">A response to traditional retail latency.</h2>
        </div>

        {/* Right Column: The actual copy */}
        <div className="md:col-span-8 space-y-8 text-zinc-600 text-sm leading-relaxed font-light">
          <p>
            Tarnix was conceived not in a boardroom, but in front of a mirror. It started with a fundamental realization: our digital lives move at lightning speed, our modern schedules demand hyper-flexibility, yet high-end retail distribution models remain stuck in the previous decade.
          </p>

          <p className="text-zinc-900 font-medium">
            We didn’t just want to build another e-commerce storefront. We wanted to build an infrastructure for immediate self-expression.
          </p>

          <p>
            Traditional premium shipping means waiting two business days. Instant delivery options usually mean settling for fast-food models or unvetted, generic supply chains. Tarnix cuts right through the middle. We treat curation with the sanctity of a luxury boutique and courier logistics with the rigorous speed of an elite on-demand courier service.
          </p>

          <blockquote className="border-l-2 border-zinc-900 pl-6 my-8 text-zinc-900 italic font-serif text-base">
            "We believe that a beautifully tailored jacket loses its magic when it arrives forty-eight hours after the event you needed it for."
          </blockquote>

          <p>
            By establishing localized dark boutiques and securing premium partnerships with independent international designers, we hold our inventory closer to you. Everything listed on our application is housed locally, packaged sustainably, and ready to move via our zero-emission fleet the second you click checkout.
          </p>

          <p>
            Today, Tarnix serves as the invisible extension of your wardrobe. Whether it’s a sudden corporate pivot, an evening gala, or simply the desire for instant retail fulfillment, we bridge the gap between human inspiration and physical reality. In 90 minutes or less.
          </p>
        </div>
      </section>

      {/* Brand Pillars / Values */}
      <section className="bg-zinc-50 border-t border-zinc-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400">01 / Intentionality</span>
              <h3 className="text-base font-normal tracking-tight">Strictly Curated</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We don’t believe in endless scrolling. Every piece on Tarnix is hand-selected by our team for timeless quality and contemporary aesthetic value.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400">02 / Precision</span>
              <h3 className="text-base font-normal tracking-tight">The 90-Minute Standard</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Our logistics mesh networks are continuously optimized to make sure your package leaves our fulfillment hubs and reaches your door flawlessly inside an hour and a half.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400">03 / Responsibility</span>
              <h3 className="text-base font-normal tracking-tight">Conscious Transit</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Speed shouldn't sacrifice the climate. Every piece travels inside protective recycled garment covers using fully micro-electric vehicles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


