"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

function PopupMessage({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-overlay">
      <div className="popup-message animate-zoom-glitch">
        <h2 className="glitch-text" data-text="🔥 You're in the Squad! 🔥">
          🔥 You're in the Squad! 🔥
        </h2>
        <div className="confetti-wrapper">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="confetti-dot" style={{ "--i": i }} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .popup-message {
          background: linear-gradient(to right, #7f1d1d, #450a0a, #000);
          padding: 3rem 4rem;
          border-radius: 1.5rem;
          box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
          text-align: center;
          position: relative;
        }

        .animate-zoom-glitch {
          animation: zoom-glitch 2.2s ease-out forwards;
        }

        @keyframes zoom-glitch {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          30% {
            transform: scale(1.5);
            opacity: 1;
          }
          70% {
            transform: scale(2.5);
          }
          100% {
            transform: scale(2.3);
          }
        }

        .glitch-text {
          font-size: 2.5rem;
          font-weight: 900;
          color: #fff;
          position: relative;
          animation: glitch 1.5s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          color: #ff0000;
          overflow: hidden;
          clip: rect(0, 900px, 0, 0);
        }

        .glitch-text::before {
          animation: glitchTop 1.5s infinite;
          color: #f00;
        }

        .glitch-text::after {
          animation: glitchBottom 1.5s infinite;
          color: #0ff;
        }

        @keyframes glitch {
          0% {
            text-shadow: 2px 2px #ff0000;
          }
          20% {
            text-shadow: -2px 0 #ff00ff;
          }
          40% {
            text-shadow: 2px -2px #00ffff;
          }
          60% {
            text-shadow: -1px 2px #ffff00;
          }
          80% {
            text-shadow: 1px -1px #00ff00;
          }
          100% {
            text-shadow: 2px 2px #ff0000;
          }
        }

        @keyframes glitchTop {
          0% {
            clip: rect(0, 9999px, 0, 0);
          }
          10% {
            clip: rect(0, 9999px, 5px, 0);
          }
          20% {
            clip: rect(0, 9999px, 0, 0);
          }
        }

        @keyframes glitchBottom {
          0% {
            clip: rect(0, 9999px, 0, 0);
          }
          10% {
            clip: rect(5px, 9999px, 9999px, 0);
          }
          20% {
            clip: rect(0, 9999px, 0, 0);
          }
        }

        .confetti-wrapper {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 50px;
          pointer-events: none;
        }

        .confetti-dot {
          position: absolute;
          bottom: 0;
          width: 6px;
          height: 6px;
          background: #ff4444;
          border-radius: 50%;
          opacity: 0.9;
          animation: confetti-fall 1.5s infinite ease-out;
          left: calc(var(--i) * 10%);
          animation-delay: calc(var(--i) * 150ms);
          filter: drop-shadow(0 0 4px #ff0000);
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-50px) scale(0.7);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowPopup(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <>
      {showPopup && <PopupMessage onClose={() => setShowPopup(false)} />}

      <main
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-950 to-black px-6 py-16 transition-opacity duration-700 ${
          showPopup ? "opacity-30 blur-sm scale-[0.98]" : "opacity-100"
        }`}
      >
        <div className="w-full max-w-md bg-black/90 rounded-3xl shadow-[0_0_80px_rgba(255,0,0,0.6)] p-10 border-2 border-red-800 backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-center text-red-500 mb-10 tracking-widest animate-pulse">
            🧾 Join the Strength Squad
          </h1>

          <div className="space-y-6">
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-black text-white border border-red-700 rounded-xl placeholder-red-400 shadow-inner shadow-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
            />
            <input
              type="password"
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-black text-white border border-red-700 rounded-xl placeholder-red-400 shadow-inner shadow-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
            />

            <button
              onClick={handleSignUp}
              className="w-full text-xl bg-gradient-to-br from-red-700 to-black text-white font-bold py-3 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.7)] hover:scale-105 hover:shadow-[0_0_60px_rgba(255,20,20,0.9)] transition-all duration-500 ease-in-out tracking-wide"
            >
              🚀 Create My Account
            </button>

            <p className="text-center text-red-400 text-sm mt-4">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="underline text-red-300 hover:text-yellow-300 cursor-pointer transition"
              >
                Login Here
              </span>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
