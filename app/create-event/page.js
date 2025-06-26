"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreateEvent() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [eventTime, setEventTime] = useState("10:00");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleCreate = async () => {
    const now = new Date();

    if (!eventName.trim()) {
      setError("Please enter the match name.");
      return;
    }
    if (!eventDate) {
      setError("Please select the match date.");
      return;
    }
    if (!eventTime) {
      setError("Please select the starting time.");
      return;
    }

    const [hours, minutes] = eventTime.split(":").map(Number);
    const selectedDateTime = new Date(eventDate);
    selectedDateTime.setHours(hours);
    selectedDateTime.setMinutes(minutes);
    selectedDateTime.setSeconds(0);
    selectedDateTime.setMilliseconds(0);

    if (selectedDateTime < now) {
      setError("Selected time must be in the future.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "matches"), {
        name: eventName.trim(),
        date: eventDate.toISOString(),
        time: eventTime,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("currentMatchId", docRef.id);
      setShowPopup(true);
      setTimeout(() => {
        router.push("/category-selection");
      }, 3000);
    } catch (err) {
      console.error("Error adding document: ", err);
      setError("Failed to create match. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900 to-black relative overflow-hidden px-4 font-russoone tracking-wide text-center">
      <div className="fire-bg"></div>

     {showPopup && (
  <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fade-in">
    <div
      className="glitch-text text-shadow-xl"
      data-text="READY TO BATTLE"
    >
      READY TO BATTLE
    </div>
  </div>
)}


      <div className={`relative max-w-md w-full bg-black bg-opacity-70 rounded-3xl p-8 shadow-2xl fire-glow-border animate-fade-in scale-up ${showPopup ? 'blur-sm' : ''}`}>
        <h2 className="text-4xl mb-6 text-red-500 drop-shadow-lg uppercase tracking-widest text-center">
          <b>Create New Match</b>
        </h2>

        <label className="block mb-2 font-semibold text-red-300 text-center" htmlFor="name">
          Match Name
        </label>
        <input
          id="name"
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Enter match name"
          disabled={loading}
          className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-40 border-2 border-red-600 text-white text-lg font-bold placeholder-red-300 placeholder:font-bold placeholder:text-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <label className="block mb-2 font-semibold text-red-300 text-center" htmlFor="date">
          Match Date
        </label>
        <DatePicker
          id="date"
          selected={eventDate}
          onChange={setEventDate}
          disabled={loading}
          className="w-full p-3 mb-4 rounded-lg bg-black bg-opacity-40 border-2 border-red-600 text-white text-lg font-bold placeholder-red-300 placeholder:font-bold placeholder:text-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholderText="Select match date"
          dateFormat="MMMM d, yyyy"
          minDate={new Date()}
          calendarClassName="bg-black text-white rounded-lg"
        />

        <label className="block mb-2 font-semibold text-red-300 text-center" htmlFor="time">
          Starting Time
        </label>
        <TimePicker
          id="time"
          onChange={setEventTime}
          value={eventTime}
          disableClock={true}
          disabled={loading}
          className="custom-timepicker w-full p-3 mb-6 rounded-lg bg-black bg-opacity-40 border-2 border-red-600 text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
          clearIcon={null}
          clockClassName="bg-black text-red-500"
        />

        {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full text-white font-bold px-6 py-3 rounded-lg bg-red-700 hover:bg-red-600 border border-red-500 shadow-md hover:shadow-xl transition-all duration-300 mb-4"
        >
          {loading ? "Creating..." : "Create Match"}
        </button>

        <button
          onClick={() => router.push("/")}
          disabled={loading}
          className="w-full text-white font-bold px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 shadow-md hover:shadow-xl transition-all duration-300"
        >
          Back to Home
        </button>
      </div>

     <style jsx global>{`
  .react-time-picker__amPm {
    background-color: black;
    color: red;
    border: 2px solid #b91c1c;
    font-weight: bold;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .react-time-picker__amPm option {
    background-color: black;
    color: white;
  }

  .react-time-picker__amPm:focus,
  .react-time-picker__amPm:hover {
    background-color: #1f1f1f;
    color: #ff5c5c;
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .text-shadow-xl {
    text-shadow: 0 0 12px #ff0000, 0 0 24px #ff3333, 0 0 48px #ff6666;
  }

  .glitch-text {
    position: relative;
    color: #ff4d4d;
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    animation: glitchAnim 1.5s infinite;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    width: 100%;
    overflow: hidden;
    background: transparent;
  }

  .glitch-text::before {
    text-shadow: -2px 0 red;
    animation: glitchTop 1s infinite linear;
    color: white;
  }

  .glitch-text::after {
    text-shadow: 2px 0 blue;
    animation: glitchBottom 1s infinite linear;
    color: white;
  }

  @keyframes glitchTop {
    0% { clip: rect(0, 9999px, 0, 0); }
    10% { clip: rect(0, 9999px, 20px, 0); }
    20% { clip: rect(0, 9999px, 0, 0); }
    30% { clip: rect(0, 9999px, 40px, 0); }
    40% { clip: rect(0, 9999px, 0, 0); }
    50% { clip: rect(0, 9999px, 30px, 0); }
    60% { clip: rect(0, 9999px, 0, 0); }
    70% { clip: rect(0, 9999px, 25px, 0); }
    80% { clip: rect(0, 9999px, 0, 0); }
    90% { clip: rect(0, 9999px, 15px, 0); }
    100% { clip: rect(0, 9999px, 0, 0); }
  }

  @keyframes glitchBottom {
    0% { clip: rect(0, 9999px, 0, 0); }
    10% { clip: rect(45px, 9999px, 60px, 0); }
    20% { clip: rect(0, 9999px, 0, 0); }
    30% { clip: rect(35px, 9999px, 50px, 0); }
    40% { clip: rect(0, 9999px, 0, 0); }
    50% { clip: rect(25px, 9999px, 40px, 0); }
    60% { clip: rect(0, 9999px, 0, 0); }
    70% { clip: rect(30px, 9999px, 45px, 0); }
    80% { clip: rect(0, 9999px, 0, 0); }
    90% { clip: rect(10px, 9999px, 25px, 0); }
    100% { clip: rect(0, 9999px, 0, 0); }
  }
`}</style>

    </main>
  );
}
