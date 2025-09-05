// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import Properties from "./components/Properties"; // ✅ import Properties


function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
  <Routes>
    <Route path="/" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/properties" element={<Properties />} /> {/* ✅ new route */}

    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <>
            <Navbar />
            <Dashboard />
          </>
        </PrivateRoute>
      }
    />
  </Routes>
</Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
