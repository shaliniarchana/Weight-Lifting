"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

function PopupMessage({ message, type, onClose }) {
 
  const baseStyle =
    "fixed top-5 right-5 z-50 rounded-lg px-6 py-3 shadow-lg text-white font-bold text-lg max-w-xs";
  const bgColor =
    type === "success" ? "bg-green-600" : "bg-red-700";

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${baseStyle} ${bgColor} animate-slide-in`}
      role="alert"
    >
      {message}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(null);
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      setPopup({ message: err.message || "Login failed.", type: "error" });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setPopup({ message: "Please enter your email first.", type: "error" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setPopup({ message: "✅ Reset link sent! Check your inbox.", type: "success" });
    } catch (error) {
      setPopup({ message: "❌ Error sending reset email.", type: "error" });
    }
  };

  return (
    <>
      {popup && (
        <PopupMessage
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-950 to-black px-6 py-16">
        <div className="w-full max-w-md bg-black/90 rounded-3xl shadow-[0_0_80px_rgba(255,0,0,0.6)] p-10 border-2 border-red-800 backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-center text-red-500 mb-10 tracking-widest animate-pulse">
            🔓 Login to the Arena
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
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-black text-white border border-red-700 rounded-xl placeholder-red-400 shadow-inner shadow-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-300"
            />

        
            <button
              onClick={handleLogin}
              className="w-full text-xl bg-gradient-to-br from-red-700 to-black text-white font-bold py-3 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.7)] hover:scale-105 hover:shadow-[0_0_60px_rgba(255,30,30,0.9)] transition-all duration-500 ease-in-out tracking-wide"
            >
              🏋️ Login Now
            </button>

         
            <div
              className="text-sm text-red-400 hover:text-red-300 cursor-pointer text-center mt-2 transition"
              onClick={handlePasswordReset}
            >
              🔑 Forgot Password?
            </div>

     
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-red-800 w-full"></div>
              <span className="px-4 text-red-500 font-semibold tracking-wider">OR</span>
              <div className="border-t border-red-800 w-full"></div>
            </div>

         
            <button
              onClick={() => router.push("/signup")}
              className="w-full text-lg bg-gradient-to-r from-black via-red-700 to-black text-white font-bold py-3 rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,50,50,0.9)] transition-all duration-500 ease-in-out tracking-widest animate-bounce"
            >
              🚨 New Here? Sign Up & Join to the battle
            </button>
          </div>
        </div>
      </main>


      <style jsx>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease forwards;
        }
      `}</style>
    </>
  );
}
