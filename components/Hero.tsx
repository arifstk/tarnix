// components/Hero.tsx
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const banners = [
  {
    id: 1,
    title: "Fresh Groceries Delivered Fast",
    description:
      "Get farm-fresh vegetables, fruits, and daily essentials delivered to your doorstep in minutes.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2070&auto=format&fit=crop",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "Healthy Food, Better Living",
    description:
      "Discover premium organic products and enjoy a healthier lifestyle with every order.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop",
    buttonText: "Explore",
  },
  {
    id: 3,
    title: "Daily Essentials at Best Price",
    description:
      "Save more every day with exclusive grocery deals and lightning-fast delivery.",
    image:
      "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=2070&auto=format&fit=crop",
    buttonText: "Get Started",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden rounded-lg">
      <div className="relative h-105 w-full md:h-130">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[current].id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <Image
              src={banners[current].image}
              alt={banners[current].title}
              fill
              priority
              className="object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Glow */}
            <div className="absolute left-0 top-0 h-full w-full bg-linear-to-r from-emerald-500/20 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex h-full items-center px-6 md:px-14">
              <div className="max-w-2xl">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-extrabold leading-tight text-white md:text-6xl"
                >
                  {banners[current].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-5 max-w-xl text-sm leading-7 text-gray-200 md:text-lg"
                >
                  {banners[current].description}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-emerald-400"
                >
                  {banners[current].buttonText}
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-10 bg-white"
                  : "w-3 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}