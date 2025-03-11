import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./components/firebase"; // Firebase setup

import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import LCD from "./components/lcd"; // Import LCD component

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null); // Set initial value of user to null

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser); // Set user when authentication state changes
    });

    return () => {
      unsubscribe(); // Clean up listener on component unmount
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              {/* Redirect user to Profile if logged in, otherwise show Login */}
              <Route
                path="/"
                element={user ? <Navigate to="/profile" /> : <Login />}
              />
              {/* Other routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route
                path="/profile"
                element={user ? <Profile /> : <Navigate to="/login" />}
              />
              {/* Add route for LCD page */}
              <Route path="/lcd" element={user ? <LCD /> : <Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
