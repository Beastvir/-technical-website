import React, { useEffect, useRef, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import GalleryPage from "./gallery.jsx"
import GalleryComingSoon from "./GalleryComingSoon.jsx";
import { Link } from "react-router-dom";
import TechnicalClub from "./Home.jsx";
import Registration from "./Registration.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<TechnicalClub />} />
      <Route path="/gallery" element={<GalleryComingSoon />} />
       <Route path="/join" element={<Registration />}></Route>
    </Routes>
  );
}

export default App;