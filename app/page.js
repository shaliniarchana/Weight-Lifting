"use client";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Fire background image behind all content */}
      <div className="fire-bg-image"></div>

      <main className="flex flex-col items-center justify-center min-h-screen p-10 gap-10 text-white tracking-widest font-extrabold text-center relative z-10">
        <div className="relative fade-scale-up max-w-4xl">
          <div className="fire-flicker"></div>
          <h2 className="fire-glow-text text-6xl md:text-8xl leading-tight mb-2">
            Weightlifting Tournaments
          </h2>
          <div className="fire-underline"></div>
        </div>

        <Link href="/create-event" className="btn-glow fade-scale-up text-lg">
        Create New Match
        </Link>

        {/* Removed Men and Women buttons */}

        <p className="fade-scale-up max-w-xl text-lg text-red-200 font-semibold mt-6">
          Manage lifters, attempts, scores, and leaderboards with blazing precision.
        </p>
      </main>
    </>
  );
}
