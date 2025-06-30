"use client";

import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function CategorySelection() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  
async function removeSharedGenderDocId(matchId) {
  const menRef = collection(db, "matches", matchId, "men");
  const womenRef = collection(db, "matches", matchId, "women");

  const menDocs = await getDocs(menRef);
  const womenDocs = await getDocs(womenRef);

  const menIds = new Set(menDocs.docs.map(doc => doc.id));

  for (const docSnap of womenDocs.docs) {
    if (menIds.has(docSnap.id)) {
      await deleteDoc(doc(db, "matches", matchId, "women", docSnap.id));
      console.log(`🗑️ Removed shared ID (${docSnap.id}) from women`);
    }
  }
}


  async function handleCategorySelect(gender) {
  setError(null);
  setLoading(true);

  const matchId = localStorage.getItem("currentMatchId");
  if (!matchId) {
    setError("No match found.");
    setLoading(false);
    return;
  }

  try {
  
    const genderRef = collection(db, "matches", matchId, gender);

   
    let genderDocId = localStorage.getItem(`currentGenderDocId_${gender}`);

  
    if (!genderDocId) {
      // Query for any existing gender doc
      const existingDocs = await getDocs(query(genderRef, limit(1)));

      if (!existingDocs.empty) {
        // Use the first existing gender doc id
        genderDocId = existingDocs.docs[0].id;
      } else {
        // No gender doc exists — create one unique gender doc
        const newDocRef = await addDoc(genderRef, { createdAt: new Date() });
        genderDocId = newDocRef.id;
      }

      // Save this unique gender doc id in localStorage
      localStorage.setItem(`currentGenderDocId_${gender}`, genderDocId);
      localStorage.setItem("selectedGender", gender);
    }

    // Ensure categories exist once inside the gender doc
    await ensureCategoryDocsOnce(matchId, gender, genderDocId);

    setLoading(false);
    router.push(`/${gender}`);
  } catch (err) {
    console.error("Failed to set up gender document:", err);
    setError("Something went wrong. Please try again.");
    setLoading(false);
  }
}



  async function cleanDuplicateGenderDocs(matchId, gender) {
    const genderRef = collection(db, "matches", matchId, gender);
    const genderDocsSnapshot = await getDocs(genderRef);

    for (const genderDocSnap of genderDocsSnapshot.docs) {
      const genderDocId = genderDocSnap.id;
      const categoriesRef = collection(
        db,
        "matches",
        matchId,
        gender,
        genderDocId,
        "categories"
      );
      const categoriesSnapshot = await getDocs(categoriesRef);

      if (categoriesSnapshot.empty) {
        await deleteDoc(doc(db, "matches", matchId, gender, genderDocId));
        console.log(`Deleted duplicate gender doc: ${genderDocId}`);
      }
    }
  }

  async function ensureCategoryDocsOnce(matchId, gender, genderDocId) {
  const categoriesRef = collection(
    db,
    "matches",
    matchId,
    gender,
    genderDocId,
    "categories"
  );

  const existingCategories = await getDocs(categoriesRef);
  if (existingCategories.size >= 8) {
    // Categories already exist, no need to create again
    return;
  }

  // Define category names per gender
  const menWeights = ["60kg", "65kg", "71kg", "79kg", "88kg", "94kg", "110kg", "110plus"];
  const womenWeights = ["48kg", "53kg", "58kg", "63kg", "69kg", "77kg", "86kg", "86plus"];

  const weights = gender === "men" ? menWeights : womenWeights;

  const categoryIds = {};

  // Create categories for the gender doc
  for (const weight of weights) {
    const docRef = await addDoc(categoriesRef, {
      name: weight,
      createdAt: new Date(),
    });
    categoryIds[weight] = docRef.id;
  }

  localStorage.setItem(
    `categoryDocIds_${matchId}_${gender}`,
    JSON.stringify(categoryIds)
  );
}



  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden font-bold tracking-widest">
  
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-800 bg-opacity-75 text-white rounded-md shadow-md hover:bg-gray-700 transition"
        disabled={loading}
      >
        Home
      </button>
      

   
      <div
        className="absolute top-0 left-0 w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-weightlifting-women.jpg')" }}
      >
        <div className="w-full h-full bg-black bg-opacity-70" />
      </div>
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/right-background.jpg')" }}
      >
        <div className="w-full h-full bg-black bg-opacity-70" />
      </div>

     
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
          <button
            disabled={loading}
            onClick={() => handleCategorySelect("men")}
            className="relative group bg-gradient-to-br from-red-900 via-red-700 to-red-900 rounded-3xl px-16 py-8 text-4xl shadow-lg text-white font-extrabold tracking-wide transition disabled:opacity-50 hover:from-red-600 hover:via-red-500 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-500 active:scale-95"
          >
            Men
            <span className="absolute bottom-4 left-0 w-full h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            disabled={loading}
            onClick={() => handleCategorySelect("women")}
            className="relative group bg-gradient-to-br from-black via-blue-900 to-black rounded-3xl px-16 py-8 text-4xl shadow-lg text-white font-extrabold tracking-wide transition disabled:opacity-50 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600 active:scale-95"
          >
            Women
            <span className="absolute bottom-4 left-0 w-full h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Orbitron Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap");
        .font-orbitron {
          font-family: "Orbitron", sans-serif;
        }
      `}</style>
    </main>
  );
}
