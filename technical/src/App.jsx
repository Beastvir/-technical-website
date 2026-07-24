import React, { useEffect, useRef, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import GalleryPage from "./gallery.jsx"
import { Link } from "react-router-dom";
import TechnicalClub from "./Home.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<TechnicalClub />} />
      <Route path="/gallery" element={<GalleryPage />} />
     
    </Routes>
  );
}

export default App;