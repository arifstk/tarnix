import React from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
}

const team: TeamMember[] = [
  {
    name: 'Sarah Jenkins',
    role: 'Founder & Creative Director',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Logistics',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Styling & Curation',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-zinc-900 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-15 pb-16 text-center">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Our Story</span>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mt-3 mb-6">
          Redefining how fashion <br className="hidden md:inline" /> meets your doorstep.
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed">
          We believe that looking your best shouldn't require compromises. We bridge the gap between high-end curation and instant gratification.
        </p>
      </section>

      {/* Narrative Section with Image */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative h-112 w-full bg-zinc-100 overflow-hidden rounded-sm">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt="Curated fashion pieces"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
            sizes="(max-w-768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-light tracking-tight">The Wardrobe, Accelerated.</h2>
          <p className="text-zinc-600 leading-relaxed">
            Founded in 2026, our platform was born out of a simple frustration: the agonizing wait for standard retail shipping. We envisioned a world where style is on-demand, handled with the precision of premium courier services.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            We partner with independent designers and premium global labels to bring a handpicked aesthetic straight to you, meticulously packed and delivered within hours, not days.
          </p>
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-zinc-100">
            <div>
              <p className="text-2xl font-light">60m</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Avg. Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-light">50+</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Curated Brands</p>
            </div>
            <div>
              <p className="text-2xl font-light">100%</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Eco Packaging</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-zinc-100 my-16" />

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-2xl font-light tracking-tight">The Minds Behind the Movement</h2>
          <p className="text-zinc-400 text-sm mt-1">Obsessed with aesthetics, driven by efficiency.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="group">
              <div className="relative h-80 w-full bg-zinc-100 overflow-hidden rounded-sm mb-4">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-w-768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-base font-normal tracking-tight">{member.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}