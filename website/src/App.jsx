import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* This is the route for your actual application after login */}
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
