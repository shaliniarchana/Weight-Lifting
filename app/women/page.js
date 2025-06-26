"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const womenCategories = [
  { label: "48 kg", value: "48kg" },
  { label: "53 kg", value: "53kg" },
  { label: "58 kg", value: "58kg" },
  { label: "63 kg", value: "63kg" },
  { label: "69 kg", value: "69kg" },
  { label: "77 kg", value: "77kg" },
  { label: "86 kg", value: "86kg" },
  { label: "+86 kg", value: "86plus" },
];

export default function WomenCategoriesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Top right button */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href="/category-selection"
          className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300"
        >
          Back to Categories
        </Link>
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-weightlifting-women.jpg"
          alt="Weightlifting Background"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Overlay */}
      <div className="relative z-10 bg-black bg-opacity-80 rounded-xl p-8 max-w-6xl w-full mx-4 text-center shadow-2xl custom-glow-border">
        <h1 className="text-5xl mb-10 text-white drop-shadow-xl animate-fade-in-up font-anton">
          🏋️‍♀️ Women Weight Categories
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {womenCategories.map((cat, idx) => (
            <Link
              key={cat.value}
              href={`/women/${cat.value}`}
              className={`relative text-white text-3xl font-semibold py-10 rounded-xl
                bg-black bg-opacity-50
                border-4 border-red-600 border-double
                shadow-lg shadow-red-700/50
                transition-all duration-500 ease-out transform
                hover:scale-110 hover:brightness-125 hover:shadow-[0_0_15px_rgb(220,38,38)] hover:-translate-y-1
                custom-glow-btn
                ${mounted ? `animate-fade-in delay-${idx * 100}` : "opacity-0"}
              `}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
