"use client";

import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function CategorySelection() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCategorySelect(category) {
    setError(null);
    setLoading(true);

    const matchId = localStorage.getItem("currentMatchId");

    if (!matchId) {
      setError("No match found to update.");
      setLoading(false);
      return;
    }

    try {
      const matchRef = doc(db, "matches", matchId);
      await updateDoc(matchRef, { category });
      setLoading(false);

      // Navigate based on category
      if (category === "men") {
        router.push("/men");
      } else if (category === "women") {
        router.push("/women");
      } else {
        router.push(`/${category}`);
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update match category. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden font-bold tracking-widest">

      {/* Home Button Top Right */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-800 bg-opacity-75 text-white rounded-md shadow-md hover:bg-gray-700 transition"
        disabled={loading}
      >
        Home
      </button>

      {/* Left half background image */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-weightlifting-women.jpg')" }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-black bg-opacity-70" />
      </div>

      {/* Right half background image */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/right-background.jpg')" }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-black bg-opacity-70" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full px-8 py-20 flex flex-col items-center text-white">
        <h1 className="text-6xl md:text-7xl uppercase mb-14 text-center font-orbitron tracking-[0.3em] drop-shadow-lg">
          Select Category
        </h1>

        {error && (
          <p className="mb-6 text-red-500 text-lg font-semibold animate-pulse">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-12 w-full max-w-lg justify-center">
          {/* Men Button */}
          <button
            disabled={loading}
            onClick={() => handleCategorySelect("men")}
            className={`relative group bg-gradient-to-br from-red-900 via-red-700 to-red-900
              rounded-3xl px-16 py-8 text-4xl shadow-lg
              text-white font-extrabold tracking-wide
              transition
              disabled:opacity-50
              hover:from-red-600 hover:via-red-500 hover:to-red-600
              focus:outline-none focus:ring-4 focus:ring-red-500
              active:scale-95`}
          >
            Men
            <span
              className="absolute bottom-4 left-0 w-full h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </button>

          {/* Women Button */}
          <button
            disabled={loading}
            onClick={() => handleCategorySelect("women")}
            className={`relative group bg-gradient-to-br from-black via-blue-900 to-black
              rounded-3xl px-16 py-8 text-4xl shadow-lg
              text-white font-extrabold tracking-wide
              transition
              disabled:opacity-50
              hover:from-blue-700 hover:via-blue-600 hover:to-blue-700
              focus:outline-none focus:ring-4 focus:ring-blue-600
              active:scale-95`}
          >
            Women
            <span
              className="absolute bottom-4 left-0 w-full h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Import Orbitron font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap");

        .font-orbitron {
          font-family: "Orbitron", sans-serif;
        }
      `}</style>
    </main>
  );
}
