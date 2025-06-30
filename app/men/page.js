"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    async function initCategories() {
      try {
        const matchId = localStorage.getItem("currentMatchId");
        const gender = "men";
        let genderDocId = localStorage.getItem(`currentGenderDocId_${gender}`);

        if (!matchId) {
          setLoading(false);
          return;
        }

        
        await removeSharedGenderDocId(matchId);

        const alreadyInitializedKey = `categories_initialized_${matchId}_${gender}`;
        if (localStorage.getItem(alreadyInitializedKey)) {
          setLoading(false);
          return;
        }

        const genderRef = collection(db, "matches", matchId, gender);

        // Get or create gender document
        if (!genderDocId) {
          const docs = await getDocs(query(genderRef, limit(1)));
          if (!docs.empty) {
            genderDocId = docs.docs[0].id;
          } else {
            const newGenderDoc = await addDoc(genderRef, { createdAt: new Date() });
            genderDocId = newGenderDoc.id;
          }
          localStorage.setItem(`currentGenderDocId_${gender}`, genderDocId);
          localStorage.setItem("selectedGender", gender);
        }

        const categoryRef = collection(
          db,
          "matches",
          matchId,
          gender,
          genderDocId,
          "categories"
        );

        await cleanDuplicateCategoryDocs(categoryRef);

        const snapshot = await getDocs(categoryRef);
        const categoryMap = {};
        const existingNames = new Set();

        snapshot.forEach((docSnap) => {
          const { name } = docSnap.data();
          if (name) {
            existingNames.add(name);
            categoryMap[name] = docSnap.id;
          }
        });

        if (existingNames.size >= 8) {
          localStorage.setItem(
            `categoryDocIds_${matchId}_${gender}`,
            JSON.stringify(categoryMap)
          );
          localStorage.setItem(alreadyInitializedKey, "true");
          setLoading(false);
          return;
        }

        for (const cat of menCategories) {
          if (!existingNames.has(cat.value)) {
            const docRef = await addDoc(categoryRef, {
              name: cat.value,
              createdAt: new Date(),
            });
            categoryMap[cat.value] = docRef.id;
          }
        }

        localStorage.setItem(
          `categoryDocIds_${matchId}_${gender}`,
          JSON.stringify(categoryMap)
        );
        localStorage.setItem(alreadyInitializedKey, "true");
        setLoading(false);
      } catch (error) {
        console.error("Error initializing categories:", error);
        setLoading(false);
      }
    }

    initCategories();
  }, []);

  async function removeSharedGenderDocId(matchId) {
    const menRef = collection(db, "matches", matchId, "men");
    const womenRef = collection(db, "matches", matchId, "women");

    const [menSnap, womenSnap] = await Promise.all([
      getDocs(menRef),
      getDocs(womenRef),
    ]);

    const womenIds = new Set(womenSnap.docs.map((doc) => doc.id));

    for (const docSnap of menSnap.docs) {
      if (womenIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "matches", matchId, "men", docSnap.id));
        console.log(`🗑️ Removed duplicate gender doc '${docSnap.id}' from 'men'`);
      }
    }
  }

  async function cleanDuplicateCategoryDocs(categoryRef) {
    const snapshot = await getDocs(categoryRef);
    const nameGroups = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const name = data?.name;
      if (!name) return;

      if (!nameGroups[name]) nameGroups[name] = [];
      nameGroups[name].push(docSnap.id);
    });

    const pathSegments = categoryRef.path.split("/");

    for (const name in nameGroups) {
      const ids = nameGroups[name];
      if (ids.length > 1) {
        const [keepId, ...duplicates] = ids;
        for (const duplicateId of duplicates) {
          const duplicateDocRef = doc(db, ...pathSegments, duplicateId);
          await deleteDoc(duplicateDocRef);
          console.log(`🗑️ Deleted duplicate category '${name}' – ID: ${duplicateId}`);
        }
      }
    }
  }

 if (loading) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white animate-fade-in">
      <div className="loader mb-6"></div>
      <p className="text-3xl md:text-4xl font-orbitron text-red-500 glow-text tracking-wider animate-pulse">
        Preparing the Arena... 
      </p>

      <style jsx>{`
        .loader {
          border: 6px solid #2c2c2c;
          border-top: 6px solid #ff1a1a;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .glow-text {
          text-shadow: 0 0 8px #ff1a1a, 0 0 20px #ff1a1a, 0 0 40px #ff1a1a;
        }
      `}</style>
    </main>
  );
}

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black">
      <div className="absolute top-4 right-4 z-20">
  <Link
    href="/category-selection"
    className="relative px-6 py-3 font-orbitron text-lg text-red-500 border-2 border-red-600 rounded-xl tracking-wide overflow-hidden shadow-lg group hover:bg-red-700 hover:text-black transition-all duration-300"
  >
    <span className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-red-900 opacity-20 group-hover:opacity-40"></span>
    <span className="relative z-10">Back to Categories</span>
  </Link>

  <style jsx>{`
    .font-orbitron {
      font-family: 'Orbitron', sans-serif;
    }

    .group:hover {
      box-shadow: 0 0 15px #ff1a1a, 0 0 30px #ff1a1a;
    }
  `}</style>
</div>


      <div className="absolute inset-0 z-0">
        <img
          src="/bg-weightlifting.jpg"
          alt="Weightlifting Background"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

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
                ${mounted ? `animate-fade-in delay-${idx * 100}` : "opacity-0"}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
