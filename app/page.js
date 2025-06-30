"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
   query,       
  where        
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";


export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [finishedMatches, setFinishedMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [confirmCloseId, setConfirmCloseId] = useState(null);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (u) => {
    setUser(u);
    if (u) {
      try {
        setLoading(true);

        // ✅ Use Firestore query to fetch only current user's matches
        const q = query(collection(db, "matches"), where("userId", "==", u.uid));
        const snapshot = await getDocs(q);

        const ongoing = [];
        const finished = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const id = docSnap.id;

          if (data.status === "ongoing") {
            ongoing.push({ id, ...data });
          } else if (data.status === "finished") {
            finished.push({ id, ...data });
          }
        }

        ongoing.sort((a, b) => new Date(b.date) - new Date(a.date));
        finished.sort((a, b) => new Date(b.date) - new Date(a.date));

        setOngoingMatches(ongoing);
        setFinishedMatches(finished);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    }
  });

  return () => unsubscribe();
}, []);


  const handleStart = (match) => {
    localStorage.setItem(`currentMatch_${match.id}`, JSON.stringify(match));
    localStorage.setItem("currentMatchId", match.id);
    router.push("/category-selection"); 
  };

  const confirmClose = (id) => setConfirmCloseId(id);
  const cancelClose = () => setConfirmCloseId(null);

  const handleClose = async (id) => {
  try {
    // Update Firestore
    await updateDoc(doc(db, "matches", id), { status: "finished" });

    // Find the match being closed
    const closedMatch = ongoingMatches.find((m) => m.id === id);

    // Remove from ongoing, add to finished
    setOngoingMatches((prev) => prev.filter((m) => m.id !== id));
    setFinishedMatches((prev) => [
      { ...closedMatch, status: "finished" },
      ...prev,
    ]);

    setConfirmCloseId(null);
  } catch (error) {
    console.error("Error closing match:", error);
    setConfirmCloseId(null);
  }
};


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login"); // redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="fire-bg-image"></div>

      
      {user && (
        <div className="fixed top-5 left-5 z-50">
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="bg-gradient-to-br from-red-900 via-black to-red-800 hover:from-red-700 hover:via-black hover:to-red-700
                       text-white font-extrabold py-2 px-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.8)]
                       transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600"
          >
            Logout
          </button>
        </div>
      )}

    
      {user && (
        <div className="fixed top-5 right-5 z-50">
         <button
  onClick={() => setShowMatches((prev) => !prev)}
  aria-pressed={showMatches}
  aria-label={showMatches ? "Hide Matches" : "Show Matches"}
  className={`relative inline-block py-3 px-8 rounded-lg font-extrabold text-white
              bg-gradient-to-r from-black via-red-900 to-black
              shadow-[0_0_15px_rgba(255,0,0,0.9),0_0_40px_rgba(255,0,0,0.7)]
              ring-4 ring-red-600 ring-opacity-75
              transition-transform duration-300 ease-in-out
              hover:scale-110 hover:shadow-[0_0_25px_rgba(255,40,40,1),0_0_60px_rgba(255,0,0,0.9)]
              focus:outline-none focus:ring-6 focus:ring-red-700 focus:ring-opacity-90
              before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-red-500 before:opacity-50 before:animate-pulse
              after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-red-700 after:opacity-75 after:blur-xl
              ${showMatches ? "scale-110" : ""}`}
>
  {showMatches ? "Hide Matches" : "Show Matches"}
</button>

        </div>
      )}

      <main className="flex flex-col items-center justify-center min-h-screen px-6 py-10 gap-10 text-white tracking-widest font-extrabold text-center relative z-10 max-w-screen-md mx-auto">
        <div className="relative fade-scale-up w-full">
          <h2
            className="text-5xl sm:text-6xl md:text-7xl mb-16 font-extrabold uppercase 
                       text-transparent bg-clip-text bg-gradient-to-br from-red-800 via-red-600 to-black 
                       drop-shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse tracking-widest leading-tight"
          >
            Weightlifting Tournaments
          </h2>

          {user ? (
            <Link
              href="/create-event"
              className="text-xl sm:text-2xl inline-block bg-gradient-to-r from-black via-red-900 to-black text-white font-extrabold px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.7)] 
                         hover:scale-105 hover:shadow-[0_0_45px_rgba(255,20,20,0.9)] transition-all duration-500 ease-in-out tracking-wide focus:outline-none focus:ring-4 focus:ring-red-600"
              aria-label="Create New Match"
            >
              🏋️‍♂️ Create New Match
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block text-xl sm:text-2xl bg-gradient-to-br from-red-700 via-black to-red-900 text-white font-black px-10 py-5 rounded-3xl shadow-[0_0_35px_rgba(255,0,0,0.9)] animate-bounce 
                         hover:scale-105 hover:shadow-[0_0_55px_rgba(255,30,30,1)] transition-all duration-500 ease-in-out tracking-wide focus:outline-none focus:ring-4 focus:ring-red-700"
              aria-label="Login to begin"
            >
              🚀 Let’s Begin — Login Now!
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <button
            disabled
            className="mx-auto mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-red-900 via-black to-red-800
                       text-white font-extrabold text-xl tracking-wide
                       shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse cursor-wait focus:outline-none"
            aria-busy="true"
          >
            Loading Matches...
          </button>
        )}

      
        {user && showMatches && !loading && (
          <div className="w-full space-y-12">
            <section
              className="bg-black bg-opacity-80 p-6 rounded-xl shadow-lg border-4 border-yellow-400 ring-yellow-300 ring-4 ring-opacity-50 animate-pulse"
              aria-label="Ongoing Matches"
            >
              <h3 className="text-yellow-400 text-3xl mb-6 font-extrabold drop-shadow-lg">
                🔥 Ongoing Matches
              </h3>
              {ongoingMatches.length > 0 ? (
                <MatchTable
                  matches={ongoingMatches}
                  onStart={handleStart}
                  onClose={confirmClose}
                  glowing="gold"
                />
              ) : (
                <p className="text-yellow-300 font-medium italic">No ongoing matches.</p>
              )}
            </section>

            <section
              className="bg-black bg-opacity-80 p-6 rounded-xl shadow-lg border-4 border-red-600 ring-red-400 ring-4 ring-opacity-40"
              aria-label="Finished Matches"
            >
              <h3 className="text-red-500 text-3xl mb-6 font-extrabold drop-shadow-lg">
                ✔️ Finished Matches
              </h3>
              {finishedMatches.length > 0 ? (
                <MatchTable matches={finishedMatches} finished glowing="red" />
              ) : (
                <p className="text-red-400 font-medium italic">No finished matches yet.</p>
              )}
            </section>
          </div>
        )}

      
        {confirmCloseId && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <div className="bg-gray-900 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl border-2 border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600">
              <h2
                id="modal-title"
                className="text-xl font-extrabold mb-4 text-red-500"
              >
                Confirm Close Match
              </h2>
              <p
                id="modal-description"
                className="mb-6 text-white tracking-wide"
              >
                Are you sure you want to close this match? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => handleClose(confirmCloseId)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-red-700"
                  aria-label="Confirm Close Match"
                >
                  Yes, Close
                </button>
                <button
                  onClick={cancelClose}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-600"
                  aria-label="Cancel Close Match"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function MatchTable({ matches, onStart, onClose, finished, glowing }) {
  const borderGlowClass =
    glowing === "gold"
      ? "border-yellow-400 ring-yellow-300 ring-4 ring-opacity-60"
      : glowing === "red"
      ? "border-red-600 ring-red-400 ring-4 ring-opacity-40"
      : "";

  return (
    <table
      className={`w-full table-auto border-collapse text-white font-semibold text-center rounded-lg overflow-hidden
      ${borderGlowClass} shadow-lg`}
      role="grid"
      aria-label={finished ? "Finished Matches Table" : "Ongoing Matches Table"}
    >
      <thead>
        <tr className="bg-gradient-to-r from-red-800 to-red-700 text-white text-lg tracking-wider">
          <th scope="col" className="p-3 border border-red-500 font-bold uppercase">Match Name</th>
          <th scope="col" className="p-3 border border-red-500 font-bold uppercase">Date</th>
          <th scope="col" className="p-3 border border-red-500 font-bold uppercase">Time</th>
          {!finished && (
            <th scope="col" className="p-3 border border-red-500 font-bold uppercase">Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {matches.map((match, i) => (
          <tr
            key={match.id}
            className={`bg-black bg-opacity-50 hover:bg-opacity-90 hover:bg-red-900 transition duration-300
              ${i % 2 === 0 ? "bg-opacity-30" : "bg-opacity-60"}`}
          >
            <td className="p-3 border border-red-500" role="gridcell">{match.name}</td>
            <td className="p-3 border border-red-500" role="gridcell">
              {new Date(match.date).toLocaleDateString()}
            </td>
            <td className="p-3 border border-red-500" role="gridcell">{match.time}</td>
            {!finished && (
              <td className="p-3 border border-red-500 space-x-3" role="gridcell">
                <button
                  onClick={() => onStart(match)}
                  aria-label={`Start match ${match.name}`}
                  className="bg-green-600 hover:bg-green-500 focus:ring-4 focus:ring-green-300 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-300 focus:outline-none"
                >
                  Start
                </button>
                <button
                  onClick={() => onClose(match.id)}
                  aria-label={`Close match ${match.name}`}
                  className="bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:ring-gray-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-300 focus:outline-none"
                >
                  Close
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
