"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const menCategories = [
  { label: "60 kg", value: "60kg" },
  { label: "65 kg", value: "65kg" },
  { label: "71 kg", value: "71kg" },
  { label: "79 kg", value: "79kg" },
  { label: "88 kg", value: "88kg" },
  { label: "94 kg", value: "94kg" },
  { label: "110 kg", value: "110kg" },
  { label: "+110 kg", value: "110plus" },
];

export default function MenCategoriesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black">
      {/* 🔙 Top right button */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href="/category-selection"
          className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300"
        >
          Back to Categories
        </Link>
      </div>

      {/* 🌄 Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-weightlifting.jpg"
          alt="Weightlifting Men Background"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* 🔲 Overlay Container */}
      <div className="relative z-10 bg-black bg-opacity-80 rounded-xl p-8 max-w-6xl w-full mx-4 text-center shadow-2xl custom-glow-border">
        <h1 className="text-5xl mb-10 text-white drop-shadow-xl animate-fade-in-up">
          🏋️ Men’s Weight Categories
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {menCategories.map((cat, idx) => (
            <Link
              key={cat.value}
              href={`/men/${cat.value}`}
              className={`text-white text-2xl font-semibold py-8 rounded-xl 
                bg-black bg-opacity-60
                border-2 border-transparent
                shadow-lg
                relative
                transition-all duration-500 ease-out transform
                hover:scale-110 hover:brightness-125 hover:shadow-2xl hover:-translate-y-1
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
