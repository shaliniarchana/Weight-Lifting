"use client";

import { useState, useEffect } from "react";

export default function CategoryPage({ params }) {
  const category = params?.category || "";  // default to empty string if undefined

  return (
    <div>
      <h1>Men - {category.replace("kg", " kg").replace("plus", "+")} Category</h1>
      {/* Your code to add players for this category */}
    </div>
  );
}
