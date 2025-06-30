"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function getMatchId() {
  return localStorage.getItem("currentMatchId");
}

function getGenderDocId() {
  const gender = "men"; // Since you're in the women component
  return localStorage.getItem(`currentGenderDocId_${gender}`);
}

function getCategoryDocId(category) {
  const matchId = getMatchId();
  const gender = "men";
  const catMap = JSON.parse(localStorage.getItem(`categoryDocIds_${matchId}_${gender}`) || "{}");
  return catMap[category];
}


const CATEGORY = "94kg";

export default function CategoryPage() {
    const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [playerTeam, setPlayerTeam] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);
 const [snatch, setSnatch] = useState(["", "", ""]);
const [cleanJerk, setCleanJerk] = useState(["", "", ""]);
const [leaderboardVisible, setLeaderboardVisible] = useState(false);
const [topFour, setTopFour] = useState([]);
const [showRanks, setShowRanks] = useState(false);
const [snatchLockState, setSnatchLockState] = useState([false, false, false]);
const [cleanJerkLockState, setCleanJerkLockState] = useState([false, false, false]);


 useEffect(() => {
    const root = document?.getElementById("__next") || document?.body;
    if (root) Modal.setAppElement(root);
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const playersRef = collection(
  db,
  "matches",
  getMatchId(),
  "men",
  getGenderDocId(),
  "categories",
  getCategoryDocId(CATEGORY),
  "players"
);

      const q = query(playersRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const loadedPlayers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(loadedPlayers);
    } catch (err) {
      console.error("Failed to load players:", err);
    }
  }

  async function addPlayer() {
    if (!playerName.trim() || !playerTeam.trim()) {
      alert("Enter both name and Team");
      return;
    }

    try {
      const playersRef = collection(
  db,
  "matches",
  getMatchId(),
  "men",
  getGenderDocId(),
  "categories",
  getCategoryDocId(CATEGORY),
  "players"
);

      const newPlayer = {
        name: playerName.trim(),
        team: playerTeam.trim(),
       snatch: [null, null, null],     // initialize with nulls
      cleanJerk: [null, null, null],
      snatchLockState: [false, false, false],
cleanJerkLockState: [false, false, false],

        total: 0,
          completed: false,
        createdAt: Date.now(),
      };
        const docRef = await addDoc(playersRef, newPlayer);
      setPlayers([...players, { ...newPlayer, id: docRef.id }]);
      setPlayerName("");
      setPlayerTeam("");
    } catch (err) {
      console.error("Failed to add player:", err);
      alert("Failed to add player, try again.");
    }
  }

  
function openModal(player) {
  if (player.completed) return;
  setActivePlayer(player);
  setSnatch((player.snatch || [null, null, null]).map((x) => x !== null ? String(x) : ""));
  setCleanJerk((player.cleanJerk || [null, null, null]).map((x) => x !== null ? String(x) : ""));
  setSnatchLockState(player.snatchLockState || [false, false, false]);
  setCleanJerkLockState(player.cleanJerkLockState || [false, false, false]);
  setModalOpen(true);
}


 function finishCompetition() {
  // Only include players with 6 valid scores (non-zero)
  const eligiblePlayers = players.filter(p => {
    const snatchValid = Array.isArray(p.snatch) && p.snatch.length === 3 && p.snatch.every(val => Number(val) > 0);
    const cjValid = Array.isArray(p.cleanJerk) && p.cleanJerk.length === 3 && p.cleanJerk.every(val => Number(val) > 0);
    return snatchValid && cjValid;
  });

  const ranked = [...eligiblePlayers]
    .sort((a, b) => b.total - a.total)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  setTopFour(ranked.slice(0, 4));
  setShowRanks(true);

  setTimeout(() => {
    setLeaderboardVisible(true);
  }, 1500);
}




  async function saveScores() {
  if (!activePlayer) return;

  const cleanedSnatch = snatch.map((val) => {
    const num = val.trim() === "" ? null : Number(val);
    return isNaN(num) ? null : num;
  });

  const cleanedCleanJerk = cleanJerk.map((val) => {
    const num = val.trim() === "" ? null : Number(val);
    return isNaN(num) ? null : num;
  });

  const maxSnatch = Math.max(...cleanedSnatch.filter((n) => typeof n === "number"));
  const maxCJ = Math.max(...cleanedCleanJerk.filter((n) => typeof n === "number"));
  const total = (maxSnatch || 0) + (maxCJ || 0);

  const completed =
    cleanedSnatch.every((n) => n !== null) && cleanedCleanJerk.every((n) => n !== null);

  try {
await updateDoc(doc( db,
  "matches",
  getMatchId(),
  "men",
  getGenderDocId(),
  "categories",
  getCategoryDocId(CATEGORY),
  "players", activePlayer.id), {
  snatch: cleanedSnatch,
  cleanJerk: cleanedCleanJerk,
  total,
  completed,
  snatchLocked: snatchLockState,
  cleanJerkLocked: cleanJerkLockState,
});


    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activePlayer.id
  ? {
      ...p,
      snatch: cleanedSnatch,
      cleanJerk: cleanedCleanJerk,
      total,
      completed,
      snatchLockState,
      cleanJerkLockState,
    }
  : p

      )
    );

    setModalOpen(false);
  } catch (err) {
    console.error("Failed to save scores:", err);
    alert("Failed to save scores, try again.");
  }
}


  const rankedPlayers = [...players]
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  function getRank(playerId) {
    return rankedPlayers.find((p) => p.id === playerId)?.rank || "-";
  }

  return (
    <main
      className={`
        p-10 max-w-7xl mx-auto bg-black rounded-3xl shadow-lg
        font-poppins text-red-500 min-h-screen flex flex-col
        animate-fade-in
      `}
    >
     <style jsx global>{`
  @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap");

  .font-poppins {
    font-family: "Poppins", sans-serif;
  }

  .font-orbitron {
    font-family: "Orbitron", sans-serif;
  }

  .glow-border {
    border: 2px solid #ff1a1a;
    box-shadow:
      0 0 6px #ff1a1a,
      0 0 12px #ff1a1a;
  }

  .glow-button {
    border: 2px solid #ff1a1a;
    background-color: transparent;
    color: #ff1a1a;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    letter-spacing: 1.2px;
  }

  .glow-button:hover {
    background-color: #ff1a1a;
    color: black;
    transform: scale(1.05);
    box-shadow:
      0 0 10px #ff1a1a,
      0 0 20px #ff1a1a;
  }

  .cancel-button {
    color: #ccc;
    letter-spacing: 1px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .cancel-button:hover {
    color: #ff1a1a;
    transform: scale(1.05);
    text-shadow: 0 0 6px #ff1a1a;
  }

  .ReactModal__Content {
    background: rgba(0, 0, 0, 0.95) !important;
    backdrop-filter: blur(12px);
    border: 2px solid #ff1a1a;
    box-shadow:
      0 0 20px #ff1a1a,
      0 0 40px #ff1a1a;
    border-radius: 2rem;
    animation: popInModal 0.6s ease;
    width: 90% !important;
    max-width: 1000px !important;
    padding: 3rem !important;
    font-family: "Orbitron", sans-serif;
    letter-spacing: 1.2px;
  }

  .ReactModal__Overlay {
    background-color: rgba(0, 0, 0, 0.85) !important;
    backdrop-filter: blur(6px);
  }

  @keyframes popInModal {
    from {
      opacity: 0;
      transform: scale(0.85);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  h2,
  h3 {
    font-size: 1.4rem;
    font-weight: 700;
    position: relative;
    background: linear-gradient(90deg, #ff1a1a, #ffffff, #ff1a1a);
    background-size: 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shineText 4s linear infinite;
  }

  @keyframes shineText {
    0% {
      background-position: 0%;
    }
    100% {
      background-position: 300%;
    }
  }

  .input-label {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  input[type="number"] {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border: 2px solid #ff1a1a;
    box-shadow: 0 0 8px #ff1a1a33;
    font-size: 1.1rem;
    letter-spacing: 1px;
    text-align: center;
    padding: 0.6rem 0.8rem;
    transition: all 0.2s ease;
  }

  input[type="number"]:focus {
    outline: none;
    background: rgba(255, 0, 0, 0.1);
    box-shadow: 0 0 12px #ff1a1a;
  }

  input.bg-green-500 {
    background-color: #00ffad !important;
    color: black;
  }

  input.bg-red-300 {
    background-color: #ff4a4a !important;
    color: white;
  }

  .score-value {
    font-size: 2rem;
    color: #00ffcc;
    font-weight: bold;
    text-shadow: 0 0 8px #00ffe5;
  }

  .highlight-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow:
      0 0 8px #ff1a1a,
      0 0 20px #ff1a1a;
    margin-bottom: 1rem;
  }

  .glow-text {
  text-shadow: 0 0 10px #ffecb3, 0 0 20px #ffecb3, 0 0 30px #ffd700;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-down {
  animation: slideInDown 0.7s ease forwards;
}

@keyframes pop {
  0% {
    transform: scale(0.9);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-pop {
  animation: pop 0.6s ease-in-out;
}

@keyframes zoomOutPopup {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-zoom-out {
  animation: zoomOutPopup 0.8s ease-out forwards;
}

input.bg-green-500 {
  background-color: #00ff5e !important; /* more vibrant green */
  color: black !important; /* black text for better contrast */
  opacity: 1 !important;
}

input.bg-red-300 {
  background-color: #ff1a1a !important; /* strong red */
  color: white !important;
  opacity: 1 !important;
}


`}</style>



      <h1 className="text-5xl mb-12 font-anton text-white text-center">
        🏋️ Men - {CATEGORY} Category
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Player Name"
          className="p-3 rounded-lg glow-border bg-black text-white w-full sm:w-1/2"
        />
        <input
  type="text"
  value={playerTeam}
  onChange={(e) => setPlayerTeam(e.target.value)}
  placeholder="Team"
  className="p-3 rounded-lg glow-border bg-black text-white w-full sm:w-1/2"
/>

        <button
          onClick={addPlayer}
          className="glow-button px-5 py-3 rounded-lg text-lg font-bold"
        >
          Add Player
        </button>
      </div>

      <table className="w-full table-auto border-collapse text-center bg-black text-white glow-border rounded-xl">
        <thead>
          <tr className="bg-red-800 text-white">
            <th className="p-3">Name</th>
            <th className="p-3">Team</th>
            <th className="p-3">Snatch</th>
            <th className="p-3">Clean & Jerk</th>
            <th className="p-3">Total</th>
            <th className="p-3">Rank</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const maxSnatch = Math.max(...(p.snatch || [0, 0, 0]));
            const maxCJ = Math.max(...(p.cleanJerk || [0, 0, 0]));
            const total = maxSnatch + maxCJ;
            const rank = getRank(p.id);

            return (
              <tr
  key={p.id}
  className={`bg-black border-b border-red-800 transition-all duration-700 ease-out ${
    showRanks && getRank(p.id) <= 4 ? "animate-slide-in-down" : ""
  }`}
>

                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.team}</td>
               <td className="p-3">
  {(p.snatch || []).map((val) => (val === null ? "-" : val)).join(", ")}
</td>

<td className="p-3">
  {(p.cleanJerk || []).map((val) => (val === null ? "-" : val)).join(", ")}
</td>



                <td className="p-3">{total > 0 ? total : "-"}</td>
               <td className="p-3 font-bold text-yellow-400">
  {showRanks && rank <= 4 ? `${rank}ᵗʰ` : rank}
</td>

                <td className="p-3">
                  {p.completed ? (
  <span className="text-green-400 font-semibold">✅ Done</span>
) : (
                 <button
  onClick={() => openModal(p)}
  className={`glow-button px-4 py-2 rounded ${
    p.completed ? "opacity-50 cursor-not-allowed" : ""
  }`}
  disabled={p.completed} 
>
  {p.completed ? "Started" : "Start"}
</button>
)}

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal
 isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  shouldCloseOnOverlayClick={false}
  shouldCloseOnEsc={false}
  className="bg-black text-white p-6 rounded-xl glow-border max-w-lg mx-auto mt-20 shadow-xl"
  overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
>
  <h2 className="highlight-name">
    Update Scores: {activePlayer?.name}
  </h2>

  <div className="mb-6">
    <h3 className="font-semibold mb-2 flex items-center justify-between">
  Snatch Attempts
 <button
  onClick={() => {
    const updatedLocks = snatch.map((val, i) =>
      (val !== "" && val !== null && val !== undefined) ? true : snatchLockState[i]
    );
    setSnatchLockState(updatedLocks);
  }}
  className="ml-4 text-sm px-3 py-1 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
>
  Lock
</button>


</h3>
    <div className="flex justify-center">
  {snatch.map((val, idx) => {
  const numVal = val === null || val === "" ? null : Number(val);

  // Filter out null or empty for max calculation
  const positiveValuesForMax = snatch
    .filter(v => v !== null && v !== "")
    .map(Number)
    .filter(n => n > 0);

  // For min, consider zeros as valid (don't exclude zero)
  const valuesForMin = snatch
    .filter(v => v !== null && v !== "")
    .map(Number);

  const maxVal = positiveValuesForMax.length > 0 ? Math.max(...positiveValuesForMax) : null;
  const minVal = valuesForMin.length > 0 ? Math.min(...valuesForMin) : null;

  const isMax = numVal === maxVal && numVal > 0;
  const isMin = numVal === minVal && numVal !== null;

  const locked = snatchLockState[idx];

  const baseClass = `border p-2 m-1 w-20 rounded text-center ${
    numVal === null ? "" : isMin ? "bg-red-300" : isMax ? "bg-green-500 text-black" : "bg-white text-black"
  }`;

  if (locked && val !== "" && val !== null) {
    return (
      <span
        key={idx}
        className={`${baseClass} opacity-90 cursor-not-allowed`}
        title="Locked"
      >
        {val}
      </span>
    );
  }

  return (
    <input
      key={idx}
      type="number"
      value={val === null ? "" : val}
      min={0}
      onChange={(e) => {
        const rawValue = e.target.value;
        const value = rawValue.replace(/^0+(?!$)/, "");
        setSnatch(snatch.map((s, i) => (i === idx ? value : s)));
      }}
      className={baseClass}
      disabled={locked}
    />
  );
})}


</div>
  </div>

  <div className="mb-6">
   <h3 className="font-semibold mb-2 flex items-center justify-between">
  Clean & Jerk Attempts
<button
  onClick={() => {
    const updatedLocks = cleanJerk.map((val, i) =>
      (val !== "" && val !== null && val !== undefined) ? true : cleanJerkLockState[i]
    );
    setCleanJerkLockState(updatedLocks); 
  }}
  className="ml-4 text-sm px-3 py-1 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
>
  Lock
</button>


</h3>
    <div className="flex justify-center">
  {cleanJerk.map((val, idx) => {
  const numVal = val === null || val === "" ? null : Number(val);

  const positiveValuesForMax = cleanJerk
    .filter(v => v !== null && v !== "")
    .map(Number)
    .filter(n => n > 0);

  const valuesForMin = cleanJerk
    .filter(v => v !== null && v !== "")
    .map(Number);

  const maxVal = positiveValuesForMax.length > 0 ? Math.max(...positiveValuesForMax) : null;
  const minVal = valuesForMin.length > 0 ? Math.min(...valuesForMin) : null;

  const isMax = numVal === maxVal && numVal > 0;
  const isMin = numVal === minVal && numVal !== null;

  const locked = cleanJerkLockState[idx];

  const baseClass = `border p-2 m-1 w-20 rounded text-center ${
    numVal === null ? "" : isMin ? "bg-red-300" : isMax ? "bg-green-500 text-black" : "bg-white text-black"
  }`;

  if (locked && val !== "" && val !== null) {
    return (
     <span
  key={idx}
  className={`${baseClass} opacity-100 font-bold cursor-not-allowed`}
  title="Locked"
>
  {val}
</span>

    );
  }

  return (
    <input
      key={idx}
      type="number"
      value={val === null ? "" : val}
      min={0}
      onChange={(e) => {
        const rawValue = e.target.value;
        const value = rawValue.replace(/^0+(?!$)/, "");
        setCleanJerk(cleanJerk.map((s, i) => (i === idx ? value : s)));
      }}
      className={baseClass}
      disabled={locked}
    />
  );
})}




    </div>
  </div>

  <div className="flex justify-center gap-6 mt-6">
    <button
      onClick={saveScores}
      className="glow-button px-6 py-3 rounded text-lg font-bold"
    >
      Save
    </button>
    <button
  onClick={() => setModalOpen(false)}
  className="cancel-button border border-red-500 px-6 py-3 rounded text-lg hover:bg-gray-400 hover:text-black transition-all"
>
  Cancel
</button>


  </div>
</Modal>
{leaderboardVisible && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-8 overflow-auto">
  <div className="relative w-full max-w-5xl p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 bg-gradient-to-br from-black via-red-900 to-black animate-zoom-out">


    <div className="relative">
      <h2 className="text-4xl font-orbitron mb-6 text-yellow-300 text-center glow-text">
        🏆 Leaderboard
      </h2>
     <button
  onClick={() => setLeaderboardVisible(false)}
  className="absolute top-0 right-0 bg-red-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-700 transition"
  aria-label="Close Leaderboard"
>
  ✖
</button>

    </div>
    <table className="w-full table-auto text-center text-white">
      <thead>
        <tr className="text-yellow-300 text-lg">
          <th className="p-3">Position</th>
          <th className="p-3">Player Name</th>
          <th className="p-3">Total Weight</th>
        </tr>
      </thead>
      <tbody>
        {topFour.map((p, i) => {
          const rankStyle =
            i === 0
              ? "bg-yellow-300 text-black font-extrabold animate-pop"
              : i === 1
              ? "bg-gray-300 text-black font-bold animate-pop"
              : i === 2
              ? "bg-[#cd7f32] text-black font-bold animate-pop"
              : "bg-black";

          return (
            <tr key={p.id} className={`${rankStyle} border-t border-red-500`}>
              <td className="p-3 text-xl">
                {i === 0 ? "🥇 1" : i === 1 ? "🥈 2" : i === 2 ? "🥉 3" : i + 1}
              </td>

              <td className="p-3 text-xl">{p.name}</td>
              <td className="p-3 text-xl">{p.total}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  </div>
)}


<div className="flex justify-end gap-4 mt-10">
  <button
    onClick={finishCompetition}
    className="glow-button px-6 py-3 rounded text-lg font-bold"
  >
    Finish
  </button>
  <button
  onClick={() => router.push("/men")}
  className="cancel-button border border-red-500 px-6 py-3 rounded text-lg hover:bg-gray-400 hover:text-black transition-all"
>
  Back to Men Categories
</button>

</div>

    </main>
  );
}