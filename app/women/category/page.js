"use client";

import { useState, useEffect } from "react";

export default function CategoryPage({ params }) {
  const category = params.category;

  return (
    <div>
      <h1>Women - {category.replace("kg", " kg").replace("plus", "+")} Category</h1>
      {/* Your code to add players for this category */}
    </div>
  );
}
